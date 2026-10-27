// =============================================================================
// Landora Real Estate & Land-Selling Marketplace
// Secure One-Time Verification Code (OTP) Service (Email & Mobile Phone)
// =============================================================================

import crypto from "crypto";
import { 
  OTP_EXPIRY_MINUTES, 
  OTP_COOLDOWN_SECONDS, 
  OTP_MAX_ATTEMPTS,
  INITIAL_ADMIN_EMAIL
} from "./constants";
import { isEmailProviderConfigured } from "./email";
import { normalizePhoneNumber } from "./sms";

export interface OtpRecord {
  identifier: string;      // email e.g. "email:senthil@gmail.com" or phone e.g. "phone:+919842212345"
  hashedCode: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  createdAt: number;
}

declare global {
  var __landora_otps: Map<string, OtpRecord> | undefined;
}

if (!globalThis.__landora_otps) {
  globalThis.__landora_otps = new Map<string, OtpRecord>();
}

const getStore = (): Map<string, OtpRecord> => {
  if (!globalThis.__landora_otps) {
    globalThis.__landora_otps = new Map<string, OtpRecord>();
  }
  return globalThis.__landora_otps;
};

const OTP_SECRET_SALT = process.env.AUTH_SECRET || "landora-secure-otp-hash-salt-2026";
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const OTP_COOLDOWN_MS = OTP_COOLDOWN_SECONDS * 1000;

// Internal SHA-256 hash generator for OTP code + identifier
function hashOtpCode(code: string, identifier: string): string {
  return crypto
    .createHash("sha256")
    .update(`${identifier.toLowerCase().trim()}:${code}:${OTP_SECRET_SALT}`)
    .digest("hex");
}

export const OtpService = {
  // ===========================================================================
  // EMAIL OTP METHODS
  // ===========================================================================

  getRemainingCooldown(email: string): number {
    const key = `email:${email.toLowerCase().trim()}`;
    const store = getStore();
    const record = store.get(key) || store.get(email.toLowerCase().trim());
    if (!record) return 0;

    const elapsed = Date.now() - record.lastSentAt;
    if (elapsed < OTP_COOLDOWN_MS) {
      return Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
    }
    return 0;
  },

  generateAndSaveOtp(email: string): { 
    code?: string; 
    allowed: boolean; 
    waitSeconds?: number; 
    error?: string;
    expiresInMinutes: number;
  } {
    const key = `email:${email.toLowerCase().trim()}`;
    const store = getStore();
    const existing = store.get(key) || store.get(email.toLowerCase().trim());

    if (existing) {
      const elapsed = Date.now() - existing.lastSentAt;
      if (elapsed < OTP_COOLDOWN_MS) {
        const wait = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
        return {
          allowed: false,
          waitSeconds: wait,
          error: `Please wait ${wait} second${wait === 1 ? "" : "s"} before requesting another verification code.`,
          expiresInMinutes: OTP_EXPIRY_MINUTES,
        };
      }
    }

    const numericCode = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = hashOtpCode(numericCode, key);
    const now = Date.now();

    store.set(key, {
      identifier: key,
      hashedCode,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      lastSentAt: now,
      createdAt: now,
    });

    return {
      code: numericCode,
      allowed: true,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    };
  },

  verifyOtp(email: string, inputCode: string): { 
    valid: boolean; 
    error?: string;
    remainingAttempts?: number;
  } {
    const key = `email:${email.toLowerCase().trim()}`;
    const sanitizedCode = inputCode.trim().replace(/\D/g, "");

    if (sanitizedCode.length !== 6) {
      return {
        valid: false,
        error: "Verification code must be exactly 6 digits.",
      };
    }

    const store = getStore();
    const record = store.get(key) || store.get(email.toLowerCase().trim());

    // Initial administrator development passkey when live email provider is unconfigured
    const isUnconfigured = !isEmailProviderConfigured();
    const isInitialAdmin = email.toLowerCase().trim() === INITIAL_ADMIN_EMAIL.toLowerCase().trim();
    const adminDevCode = process.env.INITIAL_ADMIN_OTP || "123456";
    const isDevAdminMatch = isUnconfigured && isInitialAdmin && sanitizedCode === adminDevCode;

    if (isDevAdminMatch) {
      if (record) {
        store.delete(key);
        store.delete(email.toLowerCase().trim());
      }
      return { valid: true };
    }

    if (!record) {
      return {
        valid: false,
        error: "No active verification code found for this email, or it has already been used. Please request a new code.",
      };
    }

    if (Date.now() > record.expiresAt) {
      store.delete(key);
      store.delete(email.toLowerCase().trim());
      return {
        valid: false,
        error: "Verification code has expired. Please request a new code.",
      };
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      store.delete(key);
      store.delete(email.toLowerCase().trim());
      return {
        valid: false,
        error: "Too many failed attempts. For your security, this verification code has been cancelled. Please request a new code.",
      };
    }

    const inputHash = hashOtpCode(sanitizedCode, key);
    const bufferExpected = Buffer.from(record.hashedCode, "hex");
    const bufferActual = Buffer.from(inputHash, "hex");

    const isMatch = 
      bufferExpected.length === bufferActual.length &&
      crypto.timingSafeEqual(bufferExpected, bufferActual);

    if (isMatch) {
      store.delete(key);
      store.delete(email.toLowerCase().trim());
      return { valid: true };
    }

    record.attempts += 1;
    const remaining = OTP_MAX_ATTEMPTS - record.attempts;

    if (remaining <= 0) {
      store.delete(key);
      store.delete(email.toLowerCase().trim());
      return {
        valid: false,
        error: "Maximum verification attempts exceeded. Please request a new code.",
        remainingAttempts: 0,
      };
    }

    return {
      valid: false,
      error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      remainingAttempts: remaining,
    };
  },

  clearOtp(email: string): void {
    const store = getStore();
    store.delete(`email:${email.toLowerCase().trim()}`);
    store.delete(email.toLowerCase().trim());
  },

  // ===========================================================================
  // MOBILE NUMBER OTP METHODS (Phase 3 Secure Mobile Auth)
  // ===========================================================================

  getRemainingPhoneCooldown(phone: string): number {
    const norm = normalizePhoneNumber(phone);
    if (!norm.isValid) return 0;

    const key = `phone:${norm.e164}`;
    const store = getStore();
    const record = store.get(key);
    if (!record) return 0;

    const elapsed = Date.now() - record.lastSentAt;
    if (elapsed < OTP_COOLDOWN_MS) {
      return Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
    }
    return 0;
  },

  generateAndSavePhoneOtp(phone: string): { 
    code?: string; 
    allowed: boolean; 
    waitSeconds?: number; 
    error?: string;
    expiresInMinutes: number;
    normalizedPhone?: string;
  } {
    const norm = normalizePhoneNumber(phone);
    if (!norm.isValid) {
      return {
        allowed: false,
        error: "Please enter a valid 10-digit mobile number.",
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      };
    }

    const key = `phone:${norm.e164}`;
    const store = getStore();
    const existing = store.get(key);

    if (existing) {
      const elapsed = Date.now() - existing.lastSentAt;
      if (elapsed < OTP_COOLDOWN_MS) {
        const wait = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
        return {
          allowed: false,
          waitSeconds: wait,
          error: `Please wait ${wait} second${wait === 1 ? "" : "s"} before requesting another OTP.`,
          expiresInMinutes: OTP_EXPIRY_MINUTES,
          normalizedPhone: norm.e164,
        };
      }
    }

    // Cryptographically strong 6-digit numeric OTP
    const numericCode = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = hashOtpCode(numericCode, key);
    const now = Date.now();

    store.set(key, {
      identifier: key,
      hashedCode,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      lastSentAt: now,
      createdAt: now,
    });

    return {
      code: numericCode,
      allowed: true,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      normalizedPhone: norm.e164,
    };
  },

  verifyPhoneOtp(phone: string, inputCode: string): { 
    valid: boolean; 
    error?: string;
    remainingAttempts?: number;
    normalizedPhone?: string;
  } {
    const norm = normalizePhoneNumber(phone);
    if (!norm.isValid) {
      return {
        valid: false,
        error: "Invalid phone number.",
      };
    }

    const sanitizedCode = inputCode.trim().replace(/\D/g, "");
    if (sanitizedCode.length !== 6) {
      return {
        valid: false,
        error: "Verification code must be exactly 6 digits.",
      };
    }

    const key = `phone:${norm.e164}`;
    const store = getStore();
    const record = store.get(key);

    // Initial admin or dev test passkey support if provider unconfigured in test
    const devTestCode = process.env.TEST_MOBILE_OTP || "123456";
    const isMockPasskey = process.env.NODE_ENV !== "production" && sanitizedCode === devTestCode && !record;
    if (isMockPasskey) {
      return { valid: true, normalizedPhone: norm.e164 };
    }

    if (!record) {
      return {
        valid: false,
        error: "No active verification code found for this mobile number, or it has expired. Please request a new code.",
      };
    }

    if (Date.now() > record.expiresAt) {
      store.delete(key);
      return {
        valid: false,
        error: "Verification code has expired. Please request a new code.",
      };
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      store.delete(key);
      return {
        valid: false,
        error: "Too many failed attempts. For your security, this verification code has been cancelled. Please request a new code.",
      };
    }

    const inputHash = hashOtpCode(sanitizedCode, key);
    const bufferExpected = Buffer.from(record.hashedCode, "hex");
    const bufferActual = Buffer.from(inputHash, "hex");

    const isMatch = 
      bufferExpected.length === bufferActual.length &&
      crypto.timingSafeEqual(bufferExpected, bufferActual);

    if (isMatch) {
      // SINGLE-USE: Code is destroyed immediately
      store.delete(key);
      return { valid: true, normalizedPhone: norm.e164 };
    }

    record.attempts += 1;
    const remaining = OTP_MAX_ATTEMPTS - record.attempts;

    if (remaining <= 0) {
      store.delete(key);
      return {
        valid: false,
        error: "Maximum verification attempts exceeded. Please request a new code.",
        remainingAttempts: 0,
      };
    }

    return {
      valid: false,
      error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      remainingAttempts: remaining,
    };
  },

  clearPhoneOtp(phone: string): void {
    const norm = normalizePhoneNumber(phone);
    if (norm.isValid) {
      const store = getStore();
      store.delete(`phone:${norm.e164}`);
    }
  },
};
