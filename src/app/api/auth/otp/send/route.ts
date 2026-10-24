import { NextRequest, NextResponse } from "next/server";
import { OtpService } from "@/lib/otp";
import { sendOtpEmail, isEmailProviderConfigured } from "@/lib/email";
import { applyRateLimit } from "@/lib/rate-limit";
import { DataAccess } from "@/lib/data-access";
import { INITIAL_ADMIN_EMAIL } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // 1. IP-level rate limiting: max 10 requests per minute
    const rateLimited = applyRateLimit(request, "auth_otp_send", 10, 60000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const email = body?.email ? String(body.email).trim().toLowerCase() : "";

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 3. Ensure Initial Authorised Admin account is initialized if this is the admin email
    if (email === INITIAL_ADMIN_EMAIL.toLowerCase().trim()) {
      await DataAccess.ensureInitialAdminUser();
    }

    // 4. Generate & Save OTP with cooldown protection
    const otpResult = OtpService.generateAndSaveOtp(email);
    if (!otpResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: otpResult.error, 
          waitSeconds: otpResult.waitSeconds 
        },
        { status: 429 }
      );
    }

    // 5. Check Email Provider Configuration
    const providerReady = isEmailProviderConfigured();

    if (providerReady) {
      const dispatch = await sendOtpEmail(email, otpResult.code!, otpResult.expiresInMinutes);
      if (dispatch.success) {
        return NextResponse.json({
          success: true,
          emailSent: true,
          providerConfigured: true,
          message: `Verification code sent to ${email}.`,
          expiresInMinutes: otpResult.expiresInMinutes,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            emailSent: false,
            providerConfigured: true,
            error: dispatch.error || "Failed to dispatch email. Please check your provider configuration.",
          },
          { status: 502 }
        );
      }
    }

    // 6. If email provider is unconfigured:
    // Strictly do not pretend an email was sent!
    console.log("============================================================");
    console.log(`[LANDORA AUTH - OTP]`);
    console.log(`Recipient: ${email}`);
    console.log(`Verification Code: ${otpResult.code}`);
    console.log(`Expires In: ${otpResult.expiresInMinutes} minutes`);
    console.log(`Note: Live email provider is not configured in .env. Code logged to server console.`);
    console.log("============================================================");

    const isInitialAdmin = email === INITIAL_ADMIN_EMAIL.toLowerCase().trim();

    return NextResponse.json({
      success: true,
      emailSent: false,
      providerConfigured: false,
      message: "Notice: Live email delivery service (RESEND_API_KEY / SMTP) is not configured in environment.",
      devNotice: isInitialAdmin
        ? "Live email provider is unconfigured. For this authorized account, use setup code 123456 or check server runtime logs."
        : "Live email provider is unconfigured. Set RESEND_API_KEY or SMTP in environment variables to deliver emails.",
      expiresInMinutes: otpResult.expiresInMinutes,
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/otp/send:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while preparing your verification code." },
      { status: 500 }
    );
  }
}
