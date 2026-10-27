// =============================================================================
// Landora Real Estate Platform
// Secure SMS Authentication & Transactional Messaging Service
// Compliant with TRAI DLT and Indian Messaging Regulations
// =============================================================================

export interface NormalizedPhone {
  raw: string;
  national: string;       // 10-digit Indian number e.g. "9842212345"
  e164: string;           // E.164 formatted number e.g. "+919842212345"
  countryCode: string;    // e.g. "+91"
  isValid: boolean;
  isIndian: boolean;
}

/**
 * Validates and normalizes Indian and international phone numbers.
 * Indian mobile numbers: 10 digits starting with 6, 7, 8, or 9.
 * International formats: E.164 format (+[country code][number], 8-15 digits total).
 */
export function normalizePhoneNumber(input: string): NormalizedPhone {
  if (!input) {
    return { raw: "", national: "", e164: "", countryCode: "+91", isValid: false, isIndian: false };
  }

  const trimmed = input.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");

  // 1. Check Indian Mobile Number formats:
  // e.g. "9842212345" (10 digits)
  // e.g. "09842212345" (11 digits with leading 0)
  // e.g. "919842212345" (12 digits with country code 91)
  // e.g. "+91 98422 12345"
  if (digitsOnly.length === 10 && /^[6-9]\d{9}$/.test(digitsOnly)) {
    return {
      raw: trimmed,
      national: digitsOnly,
      e164: `+91${digitsOnly}`,
      countryCode: "+91",
      isValid: true,
      isIndian: true,
    };
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    const national = digitsOnly.slice(1);
    if (/^[6-9]\d{9}$/.test(national)) {
      return {
        raw: trimmed,
        national,
        e164: `+91${national}`,
        countryCode: "+91",
        isValid: true,
        isIndian: true,
      };
    }
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    const national = digitsOnly.slice(2);
    if (/^[6-9]\d{9}$/.test(national)) {
      return {
        raw: trimmed,
        national,
        e164: `+91${national}`,
        countryCode: "+91",
        isValid: true,
        isIndian: true,
      };
    }
  }

  // 2. International E.164 Format:
  if (trimmed.startsWith("+") && /^\+[1-9]\d{7,14}$/.test(trimmed.replace(/\s+/g, ""))) {
    const e164Clean = trimmed.replace(/\s+/g, "");
    return {
      raw: trimmed,
      national: digitsOnly,
      e164: e164Clean,
      countryCode: `+${e164Clean.slice(1, 3)}`,
      isValid: true,
      isIndian: e164Clean.startsWith("+91"),
    };
  }

  return {
    raw: trimmed,
    national: digitsOnly,
    e164: "",
    countryCode: "+91",
    isValid: false,
    isIndian: false,
  };
}

/**
 * Checks whether any live SMS gateway is configured in environment variables.
 */
export function isSmsProviderConfigured(): boolean {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return true;
  }
  if (process.env.FAST2SMS_API_KEY) {
    return true;
  }
  if (process.env.MSG91_AUTH_KEY) {
    return true;
  }
  return false;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
  unconfigured?: boolean;
}

export interface SmsDispatchResult {
  sent: boolean;
  providerConfigured: boolean;
  channel: "SMS" | "WHATSAPP";
  recipient: string;
  messageId?: string;
  error?: string;
}

/**
 * Dispatches a verification OTP SMS using the configured SMS provider.
 * Complies with TRAI DLT template rules (OTP valid for 10 minutes).
 */
export async function sendSmsOtp(
  phone: string,
  code: string,
  expiresInMinutes: number = 10
): Promise<SmsSendResult> {
  const norm = normalizePhoneNumber(phone);
  if (!norm.isValid) {
    return { success: false, error: "Invalid mobile number format." };
  }

  // Approved DLT OTP template text:
  const messageText = `${code} is your Landora verification code. Valid for ${expiresInMinutes} minutes. Do not share this OTP with anyone. Landora Real Estate.`;

  // 1. Twilio SMS
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

      const authString = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const bodyParams = new URLSearchParams();
      bodyParams.append("To", norm.e164);
      bodyParams.append("Body", messageText);
      if (messagingServiceSid) {
        bodyParams.append("MessagingServiceSid", messagingServiceSid);
      } else if (fromNumber) {
        bodyParams.append("From", fromNumber);
      }

      const twilioRes = await fetch(
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

      const twilioData = await twilioRes.json();
      if (twilioRes.ok && twilioData.sid) {
        return {
          success: true,
          messageId: twilioData.sid,
          provider: "TWILIO",
        };
      } else {
        console.error("[SMS ERROR] Twilio dispatch failed:", twilioData);
        return {
          success: false,
          provider: "TWILIO",
          error: twilioData.message || "Twilio delivery failure",
        };
      }
    } catch (err: any) {
      console.error("[SMS ERROR] Twilio network error:", err);
      return { success: false, provider: "TWILIO", error: err.message };
    }
  }

  // 2. Fast2SMS (Indian DLT SMS Gateway)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const f2sRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: code,
          numbers: norm.national,
        }),
      });

      const f2sData = await f2sRes.json();
      if (f2sData.return) {
        return {
          success: true,
          messageId: f2sData.request_id,
          provider: "FAST2SMS",
        };
      } else {
        return {
          success: false,
          provider: "FAST2SMS",
          error: f2sData.message || "Fast2SMS delivery failure",
        };
      }
    } catch (err: any) {
      return { success: false, provider: "FAST2SMS", error: err.message };
    }
  }

  // 3. MSG91 (Indian Enterprise SMS)
  if (process.env.MSG91_AUTH_KEY) {
    try {
      const templateId = process.env.MSG91_OTP_TEMPLATE_ID || "landora_auth_otp";
      const msg91Res = await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: templateId,
          mobile: norm.national,
          otp: code,
          expiry: expiresInMinutes,
        }),
      });

      const msg91Data = await msg91Res.json();
      if (msg91Data.type === "success") {
        return {
          success: true,
          messageId: msg91Data.message,
          provider: "MSG91",
        };
      } else {
        return {
          success: false,
          provider: "MSG91",
          error: msg91Data.message || "MSG91 delivery failure",
        };
      }
    } catch (err: any) {
      return { success: false, provider: "MSG91", error: err.message };
    }
  }

  // 4. Secure Development/Test Console Fallback (Never leaks in HTTP responses or URLs!)
  console.log("============================================================");
  console.log(`[LANDORA SMS AUTHENTICATION - OTP CODE]`);
  console.log(`Target Phone: ${norm.e164} (${norm.national})`);
  console.log(`Security Code: ${code}`);
  console.log(`Valid Duration: ${expiresInMinutes} minutes`);
  console.log(`Status: Simulated locally. Live SMS provider (Twilio/Fast2SMS/MSG91) not configured in .env.`);
  console.log("============================================================");

  return {
    success: true,
    provider: "MOCK",
    unconfigured: true,
    messageId: `mock-sms-${Date.now()}`,
  };
}

/**
 * Dispatches a transactional SMS message (for approved property submissions, inquiries, etc.).
 */
export async function sendTransactionalSms(
  phone: string,
  message: string
): Promise<SmsSendResult> {
  const norm = normalizePhoneNumber(phone);
  if (!norm.isValid) {
    return { success: false, error: "Invalid mobile number format." };
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const authString = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const bodyParams = new URLSearchParams();
      bodyParams.append("To", norm.e164);
      bodyParams.append("Body", message);
      if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
        bodyParams.append("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
      } else if (process.env.TWILIO_PHONE_NUMBER) {
        bodyParams.append("From", process.env.TWILIO_PHONE_NUMBER);
      }

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
      return {
        success: res.ok,
        messageId: data.sid,
        provider: "TWILIO",
        error: res.ok ? undefined : data.message,
      };
    } catch (err: any) {
      return { success: false, provider: "TWILIO", error: err.message };
    }
  }

  console.log(`[LANDORA TRANSACTIONAL SMS] to ${norm.e164}: "${message}"`);
  return {
    success: true,
    provider: "MOCK",
    unconfigured: true,
    messageId: `mock-tx-sms-${Date.now()}`,
  };
}

/**
 * Legacy wrapper for general SMS notification dispatch.
 */
export async function sendSmsNotification(
  toPhoneNumber: string,
  message: string,
  channel: "SMS" | "WHATSAPP" = "SMS"
): Promise<SmsDispatchResult> {
  const res = await sendTransactionalSms(toPhoneNumber, message);
  return {
    sent: res.success,
    providerConfigured: !res.unconfigured,
    channel,
    recipient: toPhoneNumber,
    messageId: res.messageId,
    error: res.error,
  };
}
