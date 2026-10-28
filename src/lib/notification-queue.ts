// =============================================================================
// Landora Real Estate Platform
// Reliable Event-Driven Notification Queue & Automation Engine
// Handles Asynchronous Non-Blocking Dispatch, Deduplication, and Retries
// =============================================================================

import { DataAccess } from "./data-access";
import { NotificationService, PropertyNotificationParams } from "./notification-service";
import { normalizePhoneNumber, sendTransactionalSms } from "./sms";
import { sendTransactionalWhatsApp, WhatsAppEventType } from "./whatsapp";
import { 
  sendAdminNewPropertyNotificationEmail, 
  sendListingSubmittedEmail, 
  sendListingModerationEmail 
} from "./email";
import { INITIAL_ADMIN_EMAIL } from "./constants";
import { PropertyItem } from "@/types";

export interface NotificationRetryResult {
  logId: string;
  channel: string;
  recipient: string;
  success: boolean;
  error?: string;
}

export const NotificationQueue = {
  /**
   * Dispatches a background task safely without blocking the caller.
   * Catches and isolates errors so primary transactions are never affected.
   */
  dispatchAsync(taskName: string, taskFn: () => Promise<any>): void {
    const runner = async () => {
      try {
        await taskFn();
      } catch (err: any) {
        console.error(`[NOTIFICATION-QUEUE ERROR] Task "${taskName}" failed:`, err?.message || err);
      }
    };

    if (typeof setImmediate === "function") {
      setImmediate(runner);
    } else {
      setTimeout(runner, 0);
    }
  },

  /**
   * Event 1: New property submitted for review.
   * Notifies:
   * 1. Admin team (In-app, Admin Email, Admin SMS/WhatsApp alert).
   * 2. Property Owner (In-app, Confirmation Email, SMS/WhatsApp per consent).
   */
  handleNewPropertySubmitted(params: {
    property: PropertyItem;
    sellerUser?: { id: string; name?: string; email?: string; phoneNumber?: string } | null;
  }): void {
    const { property, sellerUser } = params;
    const propertyId = property.id;
    const referenceCode = property.referenceNumber || property.slug || property.id;
    const sellerPhone = property.sellerPhone || sellerUser?.phoneNumber || "";
    const sellerEmail = property.sellerEmail || sellerUser?.email || "";
    const sellerName = property.sellerName || sellerUser?.name || "Seller";

    this.dispatchAsync(`NewPropertySubmitted-${propertyId}`, async () => {
      console.log(`[NOTIFICATION-QUEUE] Processing New Property Submitted for #${referenceCode}`);

      const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || INITIAL_ADMIN_EMAIL).toLowerCase().trim();
      const adminPhone = process.env.ADMIN_ALERT_PHONE || "+919842212345";
      const ownerUserId = property.sellerId || sellerUser?.id;

      await Promise.allSettled([
        // A. Admin In-App Notification
        (async () => {
          try {
            const adminUser = await DataAccess.findUserByEmail(adminEmail);
            if (adminUser) {
              const existingInApp = await DataAccess.findExistingDeliveryLog({
                propertyId,
                eventType: "ADMIN_MODERATION_PENDING",
                channel: "IN_APP",
              });

              if (!existingInApp) {
                await DataAccess.createNotification({
                  userId: adminUser.id,
                  title: "New Property Submitted for Moderation",
                  message: `${sellerName} submitted "${property.title}" in ${property.city} for review (Ref #${referenceCode}).`,
                  type: "ADMIN_MODERATION_PENDING",
                  link: "/admin/properties",
                  entityType: "PROPERTY",
                  entityId: propertyId,
                });

                await DataAccess.logNotificationDelivery({
                  userId: adminUser.id,
                  propertyId,
                  recipientPhone: adminEmail,
                  channel: "EMAIL",
                  eventType: "ADMIN_MODERATION_PENDING",
                  messageBody: `Admin in-app notification: New property submitted: ${property.title}`,
                  status: "DELIVERED",
                  sentAt: new Date(),
                  deliveredAt: new Date(),
                });
              }
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] Admin in-app error:", err.message);
          }
        })(),

        // B. Admin Email Notification (with Deduplication check)
        (async () => {
          try {
            const existingAdminEmail = await DataAccess.findExistingDeliveryLog({
              propertyId,
              eventType: "ADMIN_NEW_PROPERTY_SUBMITTED",
              channel: "EMAIL",
            });

            if (!existingAdminEmail) {
              const emailRes = await sendAdminNewPropertyNotificationEmail(
                adminEmail,
                property.title,
                sellerName,
                sellerEmail,
                property.city,
                Number(property.price),
                propertyId
              );

              await DataAccess.logNotificationDelivery({
                propertyId,
                recipientPhone: adminEmail,
                channel: "EMAIL",
                eventType: "ADMIN_NEW_PROPERTY_SUBMITTED",
                messageBody: `Admin email alert for ${property.title}`,
                status: emailRes.success ? "SENT" : "FAILED",
                provider: emailRes.providerConfigured ? "RESEND" : "MOCK",
                providerMessageId: emailRes.messageId,
                errorInfo: emailRes.error,
                sentAt: emailRes.success ? new Date() : undefined,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] Admin email error:", err.message);
          }
        })(),

        // C. Admin SMS / WhatsApp Alert to Ops Phone
        (async () => {
          try {
            const existingAdminSms = await DataAccess.findExistingDeliveryLog({
              propertyId,
              eventType: "ADMIN_NEW_PROPERTY_ALERT",
              channel: "SMS",
              recipientPhone: adminPhone,
            });

            if (!existingAdminSms) {
              const alertText = `Landora Ops Alert: New property "${property.title.slice(0, 30)}" in ${property.city} (₹${Number(property.price).toLocaleString("en-IN")}) submitted by ${sellerName} (Ref #${referenceCode}). Review in admin desk.`;
              const smsRes = await sendTransactionalSms(adminPhone, alertText);

              await DataAccess.logNotificationDelivery({
                propertyId,
                recipientPhone: adminPhone,
                channel: "SMS",
                eventType: "ADMIN_NEW_PROPERTY_ALERT",
                messageBody: alertText,
                status: smsRes.success ? "SENT" : "FAILED",
                provider: smsRes.provider,
                providerMessageId: smsRes.messageId,
                errorInfo: smsRes.error,
                sentAt: smsRes.success ? new Date() : undefined,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] Admin SMS error:", err.message);
          }
        })(),

        // D. Owner In-App Notification
        (async () => {
          try {
            if (ownerUserId) {
              await DataAccess.createNotification({
                userId: ownerUserId,
                title: "Listing Under Review",
                message: `Your property "${property.title}" was submitted for review (Ref #${referenceCode}). Our moderation team will verify documentation within 24 hours.`,
                type: "LISTING_SUBMITTED",
                link: "/dashboard/seller/listings",
                entityType: "PROPERTY",
                entityId: propertyId,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] Owner in-app error:", err.message);
          }
        })(),

        // E. Owner Confirmation Email
        (async () => {
          try {
            if (sellerEmail) {
              const existingOwnerEmail = await DataAccess.findExistingDeliveryLog({
                propertyId,
                eventType: "LISTING_SUBMITTED",
                channel: "EMAIL",
              });

              if (!existingOwnerEmail) {
                const emailRes = await sendListingSubmittedEmail(
                  sellerEmail,
                  sellerName,
                  property.title,
                  propertyId
                );

                await DataAccess.logNotificationDelivery({
                  userId: ownerUserId,
                  propertyId,
                  recipientPhone: sellerEmail,
                  channel: "EMAIL",
                  eventType: "LISTING_SUBMITTED",
                  messageBody: `Owner listing submitted confirmation email for ${property.title}`,
                  status: emailRes.success ? "SENT" : "FAILED",
                  provider: emailRes.providerConfigured ? "RESEND" : "MOCK",
                  providerMessageId: emailRes.messageId,
                  errorInfo: emailRes.error,
                  sentAt: emailRes.success ? new Date() : undefined,
                });
              }
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] Owner email error:", err.message);
          }
        })(),

        // F. Owner Transactional WhatsApp & SMS (per DPDP / TRAI consent)
        (async () => {
          try {
            if (sellerPhone) {
              await NotificationService.notifyPropertySubmitted({
                userId: ownerUserId,
                phone: sellerPhone,
                propertyId,
                propertyTitle: property.title,
                referenceCode,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] Owner SMS/WhatsApp error:", err.message);
          }
        })(),
      ]);
    });
  },

  /**
   * Event 2: Additional information requested by admin (NEEDS_MORE_INFORMATION).
   * Notifies the owner through enabled channels (In-app, SMS, WhatsApp, Email).
   */
  handleAdditionalDetailsRequired(params: {
    property: PropertyItem;
    reason: string;
    adminName?: string;
  }): void {
    const { property, reason } = params;
    const propertyId = property.id;
    const referenceCode = property.referenceNumber || property.slug || property.id;
    const sellerPhone = property.sellerPhone;
    const sellerEmail = property.sellerEmail;
    const sellerName = property.sellerName;
    const ownerUserId = property.sellerId;

    this.dispatchAsync(`DetailsRequired-${propertyId}`, async () => {
      console.log(`[NOTIFICATION-QUEUE] Processing Details Required for #${referenceCode}`);

      await Promise.allSettled([
        // 1. In-App Notification
        (async () => {
          try {
            if (ownerUserId) {
              await DataAccess.createNotification({
                userId: ownerUserId,
                title: "Additional Details Required for Listing",
                message: `Our moderation team requested additional details for "${property.title}": ${reason}`,
                type: "LISTING_INFO_REQUIRED",
                link: "/dashboard/seller/listings",
                entityType: "PROPERTY",
                entityId: propertyId,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] In-app details required error:", err.message);
          }
        })(),

        // 2. Email Notification
        (async () => {
          try {
            if (sellerEmail) {
              const existingEmail = await DataAccess.findExistingDeliveryLog({
                propertyId,
                eventType: "DETAILS_REQUIRED",
                channel: "EMAIL",
              });

              if (!existingEmail) {
                const emailRes = await sendListingModerationEmail(
                  sellerEmail,
                  sellerName,
                  property.title,
                  "NEEDS_MORE_INFORMATION",
                  property.slug,
                  reason
                );

                await DataAccess.logNotificationDelivery({
                  userId: ownerUserId,
                  propertyId,
                  recipientPhone: sellerEmail,
                  channel: "EMAIL",
                  eventType: "DETAILS_REQUIRED",
                  messageBody: `Additional information requested: ${reason}`,
                  status: emailRes.success ? "SENT" : "FAILED",
                  provider: emailRes.providerConfigured ? "RESEND" : "MOCK",
                  providerMessageId: emailRes.messageId,
                  errorInfo: emailRes.error,
                  sentAt: emailRes.success ? new Date() : undefined,
                });
              }
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] Email details required error:", err.message);
          }
        })(),

        // 3. Automated WhatsApp & SMS Notification
        (async () => {
          try {
            if (sellerPhone) {
              await NotificationService.notifyDetailsRequired({
                userId: ownerUserId,
                phone: sellerPhone,
                propertyId,
                propertyTitle: property.title,
                referenceCode,
                reason,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] WhatsApp/SMS details required error:", err.message);
          }
        })(),
      ]);
    });
  },

  /**
   * Event 3: Property approved by admin.
   * Notifies the owner through enabled channels (In-app, SMS, WhatsApp, Email).
   */
  handlePropertyApproved(params: {
    property: PropertyItem;
    adminName?: string;
  }): void {
    const { property } = params;
    const propertyId = property.id;
    const referenceCode = property.referenceNumber || property.slug || property.id;
    const sellerPhone = property.sellerPhone;
    const sellerEmail = property.sellerEmail;
    const sellerName = property.sellerName;
    const ownerUserId = property.sellerId;

    this.dispatchAsync(`PropertyApproved-${propertyId}`, async () => {
      console.log(`[NOTIFICATION-QUEUE] Processing Property Approved for #${referenceCode}`);

      await Promise.allSettled([
        // 1. In-App Notification
        (async () => {
          try {
            if (ownerUserId) {
              await DataAccess.createNotification({
                userId: ownerUserId,
                title: "Listing Approved & Live",
                message: `Your property "${property.title}" has been approved and is now live on Landora!`,
                type: "LISTING_APPROVED",
                link: `/properties/${property.slug}`,
                entityType: "PROPERTY",
                entityId: propertyId,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] In-app approved error:", err.message);
          }
        })(),

        // 2. Email Notification
        (async () => {
          try {
            if (sellerEmail) {
              const existingEmail = await DataAccess.findExistingDeliveryLog({
                propertyId,
                eventType: "PROPERTY_APPROVED",
                channel: "EMAIL",
              });

              if (!existingEmail) {
                const emailRes = await sendListingModerationEmail(
                  sellerEmail,
                  sellerName,
                  property.title,
                  "ACTIVE",
                  property.slug
                );

                await DataAccess.logNotificationDelivery({
                  userId: ownerUserId,
                  propertyId,
                  recipientPhone: sellerEmail,
                  channel: "EMAIL",
                  eventType: "PROPERTY_APPROVED",
                  messageBody: `Listing Approved notification for ${property.title}`,
                  status: emailRes.success ? "SENT" : "FAILED",
                  provider: emailRes.providerConfigured ? "RESEND" : "MOCK",
                  providerMessageId: emailRes.messageId,
                  errorInfo: emailRes.error,
                  sentAt: emailRes.success ? new Date() : undefined,
                });
              }
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] Email approved error:", err.message);
          }
        })(),

        // 3. Automated WhatsApp & SMS Notification
        (async () => {
          try {
            if (sellerPhone) {
              await NotificationService.notifyPropertyApproved({
                userId: ownerUserId,
                phone: sellerPhone,
                propertyId,
                propertyTitle: property.title,
                referenceCode,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] WhatsApp/SMS approved error:", err.message);
          }
        })(),
      ]);
    });
  },

  /**
   * Event 4: Property published live to search results.
   * Notifies the owner through enabled channels (In-app, SMS, WhatsApp).
   */
  handlePropertyPublished(params: {
    property: PropertyItem;
  }): void {
    const { property } = params;
    const propertyId = property.id;
    const referenceCode = property.referenceNumber || property.slug || property.id;
    const sellerPhone = property.sellerPhone;
    const ownerUserId = property.sellerId;

    this.dispatchAsync(`PropertyPublished-${propertyId}`, async () => {
      console.log(`[NOTIFICATION-QUEUE] Processing Property Published for #${referenceCode}`);

      await Promise.allSettled([
        // 1. In-App Notification
        (async () => {
          try {
            if (ownerUserId) {
              await DataAccess.createNotification({
                userId: ownerUserId,
                title: "Property Live on Marketplace",
                message: `Your listing "${property.title}" is now published live. Buyer inquiries will reach your dashboard and phone.`,
                type: "LISTING_PUBLISHED",
                link: `/properties/${property.slug}`,
                entityType: "PROPERTY",
                entityId: propertyId,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] In-app published error:", err.message);
          }
        })(),

        // 2. Automated WhatsApp & SMS Notification
        (async () => {
          try {
            if (sellerPhone) {
              await NotificationService.notifyPropertyPublished({
                userId: ownerUserId,
                phone: sellerPhone,
                propertyId,
                propertyTitle: property.title,
                referenceCode,
              });
            }
          } catch (err: any) {
            console.error("[NOTIFICATION-QUEUE] WhatsApp/SMS published error:", err.message);
          }
        })(),
      ]);
    });
  },

  /**
   * Retry Engine: Retries a specific failed notification delivery log.
   * Re-evaluates delivery and updates log status to SENT or FAILED.
   */
  async retryDeliveryLog(logId: string): Promise<NotificationRetryResult> {
    const log = await DataAccess.getNotificationLogById(logId);
    if (!log) {
      return {
        logId,
        channel: "UNKNOWN",
        recipient: "UNKNOWN",
        success: false,
        error: "Notification log record not found.",
      };
    }

    const { channel, recipientPhone, eventType, messageBody, propertyId, userId } = log;

    try {
      if (channel === "SMS") {
        const norm = normalizePhoneNumber(recipientPhone);
        if (!norm.isValid) {
          throw new Error(`Invalid recipient phone: ${recipientPhone}`);
        }

        const smsRes = await sendTransactionalSms(norm.e164, messageBody);
        await DataAccess.updateNotificationDeliveryLog(logId, {
          status: smsRes.success ? "SENT" : "FAILED",
          provider: smsRes.provider,
          providerMessageId: smsRes.messageId,
          errorInfo: smsRes.error || null,
          sentAt: smsRes.success ? new Date() : undefined,
        });

        return {
          logId,
          channel,
          recipient: recipientPhone,
          success: smsRes.success,
          error: smsRes.error,
        };
      }

      if (channel === "WHATSAPP") {
        const norm = normalizePhoneNumber(recipientPhone);
        if (!norm.isValid) {
          throw new Error(`Invalid recipient phone: ${recipientPhone}`);
        }

        let parsedParams: Record<string, string> = {};
        try {
          parsedParams = JSON.parse(messageBody);
        } catch {
          parsedParams = { property_title: "Landora Property", reference_code: propertyId || "REF" };
        }

        const waRes = await sendTransactionalWhatsApp(
          norm.e164,
          (eventType as WhatsAppEventType) || "PROPERTY_SUBMITTED",
          parsedParams
        );

        await DataAccess.updateNotificationDeliveryLog(logId, {
          status: waRes.status as any,
          provider: waRes.provider,
          providerMessageId: waRes.messageId,
          deliveryResult: waRes.deliveryResult,
          errorInfo: waRes.error || null,
          sentAt: waRes.success ? new Date() : undefined,
        });

        return {
          logId,
          channel,
          recipient: recipientPhone,
          success: waRes.success,
          error: waRes.error,
        };
      }

      if (channel === "EMAIL") {
        // Retry email dispatch
        const emailRes = await sendListingModerationEmail(
          recipientPhone, // recipient email stored in recipientPhone field for EMAIL channel
          "Property Owner",
          messageBody.slice(0, 40),
          eventType === "PROPERTY_APPROVED" ? "ACTIVE" : "NEEDS_MORE_INFORMATION",
          undefined,
          messageBody
        );

        await DataAccess.updateNotificationDeliveryLog(logId, {
          status: emailRes.success ? "SENT" : "FAILED",
          provider: emailRes.providerConfigured ? "RESEND" : "MOCK",
          providerMessageId: emailRes.messageId,
          errorInfo: emailRes.error || null,
          sentAt: emailRes.success ? new Date() : undefined,
        });

        return {
          logId,
          channel,
          recipient: recipientPhone,
          success: emailRes.success,
          error: emailRes.error,
        };
      }

      return {
        logId,
        channel,
        recipient: recipientPhone,
        success: false,
        error: `Unsupported retry channel: ${channel}`,
      };
    } catch (err: any) {
      await DataAccess.updateNotificationDeliveryLog(logId, {
        status: "FAILED",
        errorInfo: `Retry error: ${err.message}`,
      });

      return {
        logId,
        channel,
        recipient: recipientPhone,
        success: false,
        error: err.message,
      };
    }
  },

  /**
   * Retries all failed notification delivery logs for a given property.
   */
  async retryFailedForProperty(propertyId: string): Promise<NotificationRetryResult[]> {
    const logs = await DataAccess.getPropertyNotificationHistory(propertyId);
    const failedLogs = logs.filter(l => l.status === "FAILED");
    const results: NotificationRetryResult[] = [];

    for (const log of failedLogs) {
      const res = await this.retryDeliveryLog(log.id);
      results.push(res);
    }

    return results;
  },

  /**
   * Retries all failed notifications across the platform.
   */
  async retryAllFailed(limit = 25): Promise<NotificationRetryResult[]> {
    const { data: logs } = await DataAccess.getNotificationDeliveryLogs({
      status: "FAILED",
      limit,
    });

    const results: NotificationRetryResult[] = [];
    for (const log of logs) {
      const res = await this.retryDeliveryLog(log.id);
      results.push(res);
    }

    return results;
  },
};
