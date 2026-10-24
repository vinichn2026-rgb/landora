/**
 * Landora Real Estate Platform - SMS & WhatsApp Notification Service
 * Dispatches alerts only when supported provider credentials (e.g. Twilio) are present.
 */

export interface SmsDispatchResult {
  sent: boolean;
  providerConfigured: boolean;
  channel: "SMS" | "WHATSAPP";
  recipient: string;
  messageId?: string;
  error?: string;
}

export const isSmsProviderConfigured = (): boolean => {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
};

export async function sendSmsNotification(
  toPhoneNumber: string,
  message: string,
  channel: "SMS" | "WHATSAPP" = "SMS"
): Promise<SmsDispatchResult> {
  const configured = isSmsProviderConfigured();

  if (!configured) {
    console.log(`[SMS/WHATSAPP] Provider not configured. Simulated ${channel} to ${toPhoneNumber}: "${message.slice(0, 40)}..."`);
    return {
      sent: false,
      providerConfigured: false,
      channel,
      recipient: toPhoneNumber,
      error: "Twilio credentials not configured in environment.",
    };
  }

  try {
    const authHeader = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const from = channel === "WHATSAPP"
      ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER}`
      : process.env.TWILIO_PHONE_NUMBER;
    const to = channel === "WHATSAPP" ? `whatsapp:${toPhoneNumber}` : toPhoneNumber;

    const bodyParams = new URLSearchParams({
      From: from || "",
      To: to,
      Body: message,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        sent: true,
        providerConfigured: true,
        channel,
        recipient: toPhoneNumber,
        messageId: data.sid,
      };
    } else {
      const err = await response.text();
      return {
        sent: false,
        providerConfigured: true,
        channel,
        recipient: toPhoneNumber,
        error: `Twilio error: ${err}`,
      };
    }
  } catch (err: any) {
    return {
      sent: false,
      providerConfigured: true,
      channel,
      recipient: toPhoneNumber,
      error: err.message || "Failed to reach SMS gateway",
    };
  }
}
