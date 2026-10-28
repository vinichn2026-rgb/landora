// =============================================================================
// Landora Real Estate Platform
// Unified Notification Service (SMS, WhatsApp, Email)
// Enforces User Communication Consent (DPDP & TRAI DLT Compliant)
// =============================================================================

import { DataAccess } from "./data-access";
import { normalizePhoneNumber, sendTransactionalSms } from "./sms";
import { sendTransactionalWhatsApp, WhatsAppEventType } from "./whatsapp";

export interface PropertyNotificationParams {
  userId?: string | null;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  referenceCode?: string;
  reason?: string;
  extraInfo?: string;
  language?: "en" | "ta";
}

export const NotificationService = {
  /**
   * Dispatches a notification across permitted channels based on user consent.
   */
  async dispatchEventNotification(
    eventType: WhatsAppEventType,
    params: PropertyNotificationParams,
    options?: { forceRetry?: boolean }
  ): Promise<{ smsSent: boolean; whatsappSent: boolean; errors: string[] }> {
    const errors: string[] = [];
    const norm = normalizePhoneNumber(params.phone);
    if (!norm.isValid) {
      return { smsSent: false, whatsappSent: false, errors: ["Invalid phone number"] };
    }

    // 1. Fetch user communication consent
    const consent = await DataAccess.getCommunicationConsent(params.userId || norm.e164);

    // Strictly respect opt-out / consent withdrawal
    if (consent?.optOutTimestamp) {
      return {
        smsSent: false,
        whatsappSent: false,
        errors: ["Notification skipped: Recipient has withdrawn communication consent (Opted out)."],
      };
    }

    const allowSms = consent ? consent.transactionalSms : true; // Default true for critical transactional
    const allowWhatsapp = consent ? consent.transactionalWhatsapp : true;

    let smsSuccess = false;
    let waSuccess = false;

    // Compose message texts
    const titleTrunc = params.propertyTitle.length > 35 
      ? params.propertyTitle.slice(0, 32) + "..." 
      : params.propertyTitle;

    let smsText = "";
    const waParams: Record<string, string> = {
      property_title: titleTrunc,
      reference_code: params.referenceCode || params.propertyId,
    };

    switch (eventType) {
      case "PROPERTY_SUBMITTED":
        smsText = `Landora: Your property "${titleTrunc}" has been received for review (Ref #${params.referenceCode || params.propertyId}). We will verify details within 15-30 minutes.`;
        waParams.status = "Under Review";
        break;

      case "VERIFICATION_PENDING":
        smsText = `Landora: Verification is in progress for "${titleTrunc}". Our team is checking layout approval and ownership documentation.`;
        waParams.status = "Verification in Progress";
        break;

      case "DETAILS_REQUIRED":
        smsText = `Landora: Additional details needed for listing "${titleTrunc}". ${params.reason || "Please upload property photos or clarify boundary details."}`;
        waParams.reason = params.reason || "Additional details needed";
        break;

      case "PROPERTY_APPROVED":
        smsText = `Landora: Congratulations! Your listing "${titleTrunc}" is APPROVED and published live to thousands of verified buyers!`;
        waParams.status = "Approved & Live";
        break;

      case "PROPERTY_PUBLISHED":
        smsText = `Landora: Your property "${titleTrunc}" is now LIVE on Landora marketplace! Direct buyer calls will reach your number.`;
        waParams.status = "Live on Marketplace";
        break;

      case "STATUS_CHANGED":
        smsText = `Landora: Status for "${titleTrunc}" changed to ${params.extraInfo || "Updated"}.`;
        waParams.new_status = params.extraInfo || "Updated";
        break;

      case "NEW_INQUIRY":
        smsText = `Landora: New genuine buyer inquiry received for "${titleTrunc}"! Check your seller dashboard or phone for details.`;
        waParams.inquiry_details = params.extraInfo || "Buyer requested callback";
        break;
    }

    // 2. Dispatch Automated WhatsApp if permitted (with Deduplication check)
    if (allowWhatsapp) {
      const existingWa = !options?.forceRetry
        ? await DataAccess.findExistingDeliveryLog({
            propertyId: params.propertyId,
            eventType,
            channel: "WHATSAPP",
            recipientPhone: norm.e164,
          })
        : null;

      if (existingWa) {
        console.log(`[NOTIFICATION] Suppressing duplicate WhatsApp for ${eventType} to ${norm.e164} (Already delivered).`);
        waSuccess = true;
      } else {
        try {
          const waRes = await sendTransactionalWhatsApp(
            norm.e164,
            eventType,
            waParams,
            params.language || "en"
          );

          await DataAccess.logNotificationDelivery({
            userId: params.userId,
            propertyId: params.propertyId,
            recipientPhone: norm.e164,
            channel: "WHATSAPP",
            eventType,
            templateName: `landora_${eventType.toLowerCase()}`,
            messageBody: JSON.stringify(waParams),
            status: waRes.status,
            provider: waRes.provider,
            providerMessageId: waRes.messageId,
            deliveryResult: waRes.deliveryResult,
            errorInfo: waRes.error,
            sentAt: waRes.success ? new Date() : undefined,
          });

          waSuccess = waRes.success;
          if (!waRes.success && waRes.error) errors.push(waRes.error);
        } catch (err: any) {
          errors.push(`WhatsApp error: ${err.message}`);
        }
      }
    }

    // 3. Dispatch Transactional SMS if permitted (with Deduplication check)
    if (allowSms && smsText) {
      const existingSms = !options?.forceRetry
        ? await DataAccess.findExistingDeliveryLog({
            propertyId: params.propertyId,
            eventType,
            channel: "SMS",
            recipientPhone: norm.e164,
          })
        : null;

      if (existingSms) {
        console.log(`[NOTIFICATION] Suppressing duplicate SMS for ${eventType} to ${norm.e164} (Already delivered).`);
        smsSuccess = true;
      } else {
        try {
          const smsRes = await sendTransactionalSms(norm.e164, smsText);

          await DataAccess.logNotificationDelivery({
            userId: params.userId,
            propertyId: params.propertyId,
            recipientPhone: norm.e164,
            channel: "SMS",
            eventType,
            messageBody: smsText,
            status: smsRes.success ? "SENT" : "FAILED",
            provider: smsRes.provider,
            providerMessageId: smsRes.messageId,
            errorInfo: smsRes.error,
            sentAt: smsRes.success ? new Date() : undefined,
          });

          smsSuccess = smsRes.success;
          if (!smsRes.success && smsRes.error) errors.push(smsRes.error);
        } catch (err: any) {
          errors.push(`SMS error: ${err.message}`);
        }
      }
    }

    return {
      smsSent: smsSuccess,
      whatsappSent: waSuccess,
      errors,
    };
  },

  /**
   * Helper: Property submission received event
   */
  async notifyPropertySubmitted(params: PropertyNotificationParams) {
    return this.dispatchEventNotification("PROPERTY_SUBMITTED", params);
  },

  /**
   * Helper: Verification pending event
   */
  async notifyVerificationPending(params: PropertyNotificationParams) {
    return this.dispatchEventNotification("VERIFICATION_PENDING", params);
  },

  /**
   * Helper: Additional details required event
   */
  async notifyDetailsRequired(params: PropertyNotificationParams) {
    return this.dispatchEventNotification("DETAILS_REQUIRED", params);
  },

  /**
   * Helper: Property approved event
   */
  async notifyPropertyApproved(params: PropertyNotificationParams) {
    return this.dispatchEventNotification("PROPERTY_APPROVED", params);
  },

  /**
   * Helper: Property published event
   */
  async notifyPropertyPublished(params: PropertyNotificationParams) {
    return this.dispatchEventNotification("PROPERTY_PUBLISHED", params);
  },

  /**
   * Helper: Listing status changed event
   */
  async notifyStatusChanged(params: PropertyNotificationParams) {
    return this.dispatchEventNotification("STATUS_CHANGED", params);
  },

  /**
   * Helper: New inquiry received event
   */
  async notifyNewInquiry(params: PropertyNotificationParams) {
    return this.dispatchEventNotification("NEW_INQUIRY", params);
  },

  /**
   * Helper: Promotional Property Offers & Announcements
   * Strictly requires explicit promotional consent!
   */
  async notifyPromotionalOffer(params: {
    userId?: string | null;
    phone: string;
    offerTitle: string;
    offerMessage: string;
  }): Promise<{ sent: boolean; reason?: string }> {
    const norm = normalizePhoneNumber(params.phone);
    if (!norm.isValid) return { sent: false, reason: "Invalid phone number" };

    const consent = await DataAccess.getCommunicationConsent(params.userId || norm.e164);

    // Strictly check promotional consent - NEVER send without explicit opt-in
    if (!consent?.promotionalOffers) {
      return {
        sent: false,
        reason: "Suppressed: User has not opted in to promotional communications (DPDP Act Compliance).",
      };
    }

    if (consent.optOutTimestamp) {
      return { sent: false, reason: "Suppressed: User has withdrawn communication consent." };
    }

    const message = `Landora Special Offer: ${params.offerTitle} - ${params.offerMessage}`;
    const smsRes = await sendTransactionalSms(norm.e164, message);

    await DataAccess.logNotificationDelivery({
      userId: params.userId,
      recipientPhone: norm.e164,
      channel: "SMS",
      eventType: "PROMOTIONAL_OFFER",
      messageBody: message,
      status: smsRes.success ? "SENT" : "FAILED",
      provider: smsRes.provider,
      providerMessageId: smsRes.messageId,
      errorInfo: smsRes.error,
      sentAt: smsRes.success ? new Date() : undefined,
    });

    return { sent: smsRes.success };
  },
};
