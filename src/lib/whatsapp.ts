// =============================================================================
// Landora Real Estate Platform
// Automated WhatsApp Business Platform Integration (Meta Cloud API & Twilio)
// Note: This is automated API messaging, separate from manual wa.me links.
// =============================================================================

import { normalizePhoneNumber } from "./sms";

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  status: "PENDING" | "QUEUED" | "SENT" | "DELIVERED" | "FAILED";
  deliveryResult?: string;
  error?: string;
  unconfigured?: boolean;
}

export type WhatsAppEventType =
  | "PROPERTY_SUBMITTED"
  | "VERIFICATION_PENDING"
  | "DETAILS_REQUIRED"
  | "PROPERTY_APPROVED"
  | "PROPERTY_PUBLISHED"
  | "STATUS_CHANGED"
  | "NEW_INQUIRY";

/**
 * Checks whether automated WhatsApp Business API is configured.
 */
export function isWhatsAppConfigured(): boolean {
  if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return true;
  }
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM
  ) {
    return true;
  }
  return false;
}

/**
 * Maps system event to approved Meta WhatsApp Business Template name.
 */
function getTemplateForEvent(eventType: WhatsAppEventType): string {
  switch (eventType) {
    case "PROPERTY_SUBMITTED":
      return process.env.WA_TEMPLATE_PROPERTY_SUBMITTED || "landora_property_submitted";
    case "VERIFICATION_PENDING":
      return process.env.WA_TEMPLATE_VERIFICATION_PENDING || "landora_verification_pending";
    case "DETAILS_REQUIRED":
      return process.env.WA_TEMPLATE_DETAILS_REQUIRED || "landora_details_required";
    case "PROPERTY_APPROVED":
      return process.env.WA_TEMPLATE_PROPERTY_APPROVED || "landora_property_approved";
    case "PROPERTY_PUBLISHED":
      return process.env.WA_TEMPLATE_PROPERTY_PUBLISHED || "landora_property_published";
    case "STATUS_CHANGED":
      return process.env.WA_TEMPLATE_STATUS_CHANGED || "landora_status_changed";
    case "NEW_INQUIRY":
      return process.env.WA_TEMPLATE_NEW_INQUIRY || "landora_new_inquiry_alert";
    default:
      return "landora_generic_update";
  }
}

/**
 * Dispatches an automated transactional WhatsApp message using approved templates.
 */
export async function sendTransactionalWhatsApp(
  phone: string,
  eventType: WhatsAppEventType,
  params: Record<string, string>,
  languageCode: string = "en"
): Promise<WhatsAppSendResult> {
  const norm = normalizePhoneNumber(phone);
  if (!norm.isValid) {
    return {
      success: false,
      status: "FAILED",
      error: "Invalid phone number format for WhatsApp delivery.",
    };
  }

  const templateName = getTemplateForEvent(eventType);

  // 1. Meta WhatsApp Business Cloud API Integration
  if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const apiToken = process.env.WHATSAPP_API_TOKEN;

      // Format template body components
      const bodyParameters = Object.values(params).map(val => ({
        type: "text",
        text: String(val),
      }));

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: norm.national, // Meta takes digits without leading +
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode === "ta" ? "ta" : "en_US" },
          components: [
            {
              type: "body",
              parameters: bodyParameters,
            },
          ],
        },
      };

      const res = await fetch(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok && data.messages?.[0]?.id) {
        return {
          success: true,
          status: "SENT",
          provider: "META_WHATSAPP",
          messageId: data.messages[0].id,
          deliveryResult: "Accepted by Meta WhatsApp Graph API",
        };
      } else {
        console.error("[WHATSAPP API ERROR] Meta dispatch failed:", data);
        return {
          success: false,
          status: "FAILED",
          provider: "META_WHATSAPP",
          error: data.error?.message || "WhatsApp delivery failed",
        };
      }
    } catch (err: any) {
      console.error("[WHATSAPP API ERROR] Network error:", err);
      return {
        success: false,
        status: "FAILED",
        provider: "META_WHATSAPP",
        error: err.message,
      };
    }
  }

  // 2. Twilio WhatsApp Integration
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM
  ) {
    try {
      const authString = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const bodyParams = new URLSearchParams();
      bodyParams.append("From", `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`);
      bodyParams.append("To", `whatsapp:${norm.e164}`);

      // Compose human-readable text for Twilio sandbox / template
      const formattedText = `[Landora Property Update - ${eventType.replace(/_/g, " ")}]\n${Object.entries(params)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}`;

      bodyParams.append("Body", formattedText);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        }
      );

      const data = await res.json();
      if (res.ok && data.sid) {
        return {
          success: true,
          status: "QUEUED",
          provider: "TWILIO_WHATSAPP",
          messageId: data.sid,
          deliveryResult: data.status,
        };
      } else {
        return {
          success: false,
          status: "FAILED",
          provider: "TWILIO_WHATSAPP",
          error: data.message || "Twilio WhatsApp delivery failed",
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: "FAILED",
        provider: "TWILIO_WHATSAPP",
        error: err.message,
      };
    }
  }

  // 3. Simulated/Development Fallback (When automated provider credentials are not in .env)
  console.log("============================================================");
  console.log(`[AUTOMATED WHATSAPP NOTIFICATION - SIMULATED]`);
  console.log(`Recipient: ${norm.e164}`);
  console.log(`Event: ${eventType}`);
  console.log(`Template: ${templateName}`);
  console.log(`Parameters:`, JSON.stringify(params, null, 2));
  console.log(`Status: QUEUED (Simulated). Meta WhatsApp API credentials not configured in .env.`);
  console.log("============================================================");

  return {
    success: true,
    status: "SENT",
    provider: "MOCK_WHATSAPP",
    unconfigured: true,
    messageId: `mock-wa-${Date.now()}`,
    deliveryResult: "Simulated in local environment",
  };
}
