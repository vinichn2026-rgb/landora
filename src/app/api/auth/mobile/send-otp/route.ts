import { NextRequest, NextResponse } from "next/server";
import { OtpService } from "@/lib/otp";
import { normalizePhoneNumber, sendSmsOtp, isSmsProviderConfigured } from "@/lib/sms";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 1. IP-level rate limiting: max 10 requests per minute
    const rateLimited = applyRateLimit(request, "auth_mobile_otp_send", 10, 60000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const phoneInput = (body?.phone || body?.phoneNumber) ? String(body.phone || body.phoneNumber).trim() : "";

    // 2. Validate Indian & International Phone number
    const norm = normalizePhoneNumber(phoneInput);
    if (!norm.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Please enter a valid 10-digit Indian mobile number (e.g. 98422 12345) or international number with country code." 
        },
        { status: 400 }
      );
    }

    // 3. Generate & Save secure hashed OTP (enforces 60-second cooldown protection & attempt limit)
    const otpResult = OtpService.generateAndSavePhoneOtp(norm.e164);
    if (!otpResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: otpResult.error,
          waitSeconds: otpResult.waitSeconds,
        },
        { status: 429 }
      );
    }

    // 4. Send SMS through configured gateway (Twilio / Fast2SMS / MSG91)
    const smsDispatch = await sendSmsOtp(norm.e164, otpResult.code!, otpResult.expiresInMinutes);

    // 5. Response: Never expose the OTP code in response payload, URLs, or client-accessible logs!
    // Does not reveal whether user already has an account (prevents user enumeration).
    return NextResponse.json({
      success: true,
      providerConfigured: isSmsProviderConfigured(),
      message: `A 6-digit verification code has been sent to +91 ******${norm.national.slice(-4)}.`,
      expiresInMinutes: otpResult.expiresInMinutes,
      waitSeconds: 60,
    });
  } catch (error: any) {
    console.error("[API ERROR] /api/auth/mobile/send-otp:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification SMS. Please check your connection and retry." },
      { status: 500 }
    );
  }
}
