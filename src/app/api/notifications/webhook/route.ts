// =============================================================================
// Landora Real Estate Platform
// Provider Delivery Webhook Callback Endpoint (Meta WhatsApp & Twilio SMS)
// Enforces: "Do not mark a message as delivered unless the provider confirms delivery"
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";

// GET /api/notifications/webhook - Verification challenge for Meta WhatsApp Cloud API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "landora_whatsapp_verify_token_2026";

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

// POST /api/notifications/webhook - Processes delivery receipts
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Twilio Webhook (application/x-www-form-urlencoded)
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      const messageSid = formData.get("MessageSid") ? String(formData.get("MessageSid")) : "";
      const messageStatus = formData.get("MessageStatus") ? String(formData.get("MessageStatus")).toLowerCase() : "";
      const errorCode = formData.get("ErrorCode") ? String(formData.get("ErrorCode")) : null;

      if (messageSid) {
        if (messageStatus === "delivered") {
          await DataAccess.updateNotificationDeliveryStatus(messageSid, "DELIVERED", {
            deliveredAt: new Date(),
            deliveryResult: "Confirmed delivered by Twilio carrier callback",
          });
        } else if (messageStatus === "undelivered" || messageStatus === "failed") {
          await DataAccess.updateNotificationDeliveryStatus(messageSid, "FAILED", {
            errorInfo: errorCode ? `Twilio Error Code: ${errorCode}` : "Undelivered by carrier",
          });
        }
      }

      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // 2. Meta WhatsApp Cloud API Webhook (application/json)
    const body = await request.json();

    if (body.object === "whatsapp_business_account" && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            const value = change.value;
            if (value && Array.isArray(value.statuses)) {
              for (const statusObj of value.statuses) {
                const messageId = statusObj.id;
                const statusStr = String(statusObj.status).toLowerCase();
                const timestampSec = statusObj.timestamp ? parseInt(statusObj.timestamp, 10) : null;
                const eventDate = timestampSec ? new Date(timestampSec * 1000) : new Date();

                if (statusStr === "delivered") {
                  // Provider confirms delivery!
                  await DataAccess.updateNotificationDeliveryStatus(messageId, "DELIVERED", {
                    deliveredAt: eventDate,
                    deliveryResult: "Confirmed delivered by Meta WhatsApp Cloud API",
                  });
                } else if (statusStr === "read") {
                  // Message has been read by recipient
                  await DataAccess.updateNotificationDeliveryStatus(messageId, "DELIVERED", {
                    deliveredAt: eventDate,
                    deliveryResult: "Confirmed delivered and read by recipient on WhatsApp",
                  });
                } else if (statusStr === "failed") {
                  const errorMsg = statusObj.errors?.[0]?.message || statusObj.errors?.[0]?.title || "WhatsApp delivery failed";
                  await DataAccess.updateNotificationDeliveryStatus(messageId, "FAILED", {
                    errorInfo: `Meta WhatsApp Error: ${errorMsg}`,
                  });
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("[WEBHOOK ERROR] /api/notifications/webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
