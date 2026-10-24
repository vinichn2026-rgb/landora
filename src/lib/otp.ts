// =============================================================================
// Landora Real Estate & Land-Selling Marketplace
// Secure One-Time Verification Code (OTP) Service
// =============================================================================

import crypto from "crypto";
import { 
  OTP_EXPIRY_MINUTES, 
  OTP_COOLDOWN_SECONDS, 
  OTP_MAX_ATTEMPTS,
  INITIAL_ADMIN_EMAIL
} from "./constants";
import { isEmailProviderConfigured } from "./email";

export interface OtpRecord {
  email: string;
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

// Internal SHA-256 hash generator for OTP code + email
function hashOtpCode(code: string, email: string): string {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase().trim()}:${code}:${OTP_SECRET_SALT}`)
    .digest("hex");
}

export const OtpService = {
  /**
   * Get remaining seconds before a new OTP can be sent to this email
   */
  getRemainingCooldown(email: string): number {
    const store = getStore();
    const record = store.get(email.toLowerCase().trim());
    if (!record) return 0;

    const elapsed = Date.now() - record.lastSentAt;
    if (elapsed < OTP_COOLDOWN_MS) {
      return Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
    }
    return 0;
  },

  /**
   * Generates a cryptographically strong 6-digit numeric OTP.
   * Enforces 60-second cooldown protection.
   */
  generateAndSaveOtp(email: string): { 
    code?: string; 
    allowed: boolean; 
    waitSeconds?: number; 
    error?: string;
    expiresInMinutes: number;
  } {
    const normalizedEmail = email.toLowerCase().trim();
    const store = getStore();
    const existing = store.get(normalizedEmail);

    // 1. Resend Cooldown Check
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

    // 2. Generate cryptographically secure 6-digit integer (100000 - 999999)
    const numericCode = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = hashOtpCode(numericCode, normalizedEmail);
    const now = Date.now();

    // 3. Store hashed OTP with expiration timestamp
    store.set(normalizedEmail, {
      email: normalizedEmail,
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

  /**
   * Verifies an OTP code against stored hash using constant-time comparison.
   * Single-use: Deletes code immediately upon success.
   * Limits failed attempts to 5 before permanently locking the code.
   */
  verifyOtp(email: string, inputCode: string): { 
    valid: boolean; 
    error?: string;
    remainingAttempts?: number;
  } {
    const normalizedEmail = email.toLowerCase().trim();
    const sanitizedCode = inputCode.trim().replace(/\D/g, "");

    if (sanitizedCode.length !== 6) {
      return {
        valid: false,
        error: "Verification code must be exactly 6 digits.",
      };
    }

    const store = getStore();
    const record = store.get(normalizedEmail);

    // 1. Check if record exists
    if (!record) {
      return {
        valid: false,
        error: "No active verification code found for this email, or it has already been used. Please request a new code.",
      };
    }

    // 2. Check if expired
    if (Date.now() > record.expiresAt) {
      store.delete(normalizedEmail);
      return {
        valid: false,
        error: "Verification code has expired. Please request a new code.",
      };
    }

    // 3. Check attempt limit (brute force protection)
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      store.delete(normalizedEmail);
      return {
        valid: false,
        error: "Too many failed attempts. For your security, this verification code has been cancelled. Please request a new code.",
      };
    }

    // 4. Constant-time hash comparison
    const inputHash = hashOtpCode(sanitizedCode, normalizedEmail);
    const bufferExpected = Buffer.from(record.hashedCode, "hex");
    const bufferActual = Buffer.from(inputHash, "hex");

    const isMatch = 
      bufferExpected.length === bufferActual.length &&
      crypto.timingSafeEqual(bufferExpected, bufferActual);

    // Initial administrator development passkey when live email provider is unconfigured
    const isUnconfigured = !isEmailProviderConfigured();
    const isInitialAdmin = normalizedEmail === INITIAL_ADMIN_EMAIL.toLowerCase().trim();
    const adminDevCode = process.env.INITIAL_ADMIN_OTP || "123456";
    const isDevAdminMatch = isUnconfigured && isInitialAdmin && sanitizedCode === adminDevCode;

    if (isMatch || isDevAdminMatch) {
      // SINGLE-USE: Code is destroyed immediately
      store.delete(normalizedEmail);
      return { valid: true };
    }

    // Increment failed attempt counter
    record.attempts += 1;
    const remaining = OTP_MAX_ATTEMPTS - record.attempts;

    if (remaining <= 0) {
      store.delete(normalizedEmail);
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

  /**
   * Explicitly purge an OTP record
   */
  clearOtp(email: string): void {
    const store = getStore();
    store.delete(email.toLowerCase().trim());
  },
};
