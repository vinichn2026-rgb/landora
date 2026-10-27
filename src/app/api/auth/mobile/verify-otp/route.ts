import { NextRequest, NextResponse } from "next/server";
import { OtpService } from "@/lib/otp";
import { normalizePhoneNumber } from "@/lib/sms";
import { DataAccess } from "@/lib/data-access";
import { signSessionToken, setServerSessionCookie } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";
import { UserRole } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // 1. IP rate limiting: max 20 verify attempts per minute
    const rateLimited = applyRateLimit(request, "auth_mobile_otp_verify", 20, 60000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const phoneInput = (body?.phone || body?.phoneNumber) ? String(body.phone || body.phoneNumber).trim() : "";
    const code = body?.code ? String(body.code).trim() : "";
    const role: UserRole = body?.role || "BUYER";
    const name = body?.name ? String(body.name).trim() : "";
    const pendingPropertyId = body?.pendingPropertyId ? String(body.pendingPropertyId).trim() : "";

    // 2. Validate input
    const norm = normalizePhoneNumber(phoneInput);
    if (!norm.isValid) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid mobile number." },
        { status: 400 }
      );
    }

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Please enter the 6-digit verification code." },
        { status: 400 }
      );
    }

    // 3. Verify OTP code (single-use, expires in 10 mins, max 5 attempts)
    const verification = OtpService.verifyPhoneOtp(norm.e164, code);
    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error || "Invalid verification code.",
          remainingAttempts: verification.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // 4. Retrieve or Provision User Account only AFTER successful cryptographic OTP verification
    let isNewUser = false;
    let user = await DataAccess.findUserByPhone(norm.e164);

    if (!user) {
      isNewUser = true;
      const defaultName = name || `User ${norm.national.slice(-4)}`;
      const placeholderEmail = `phone_${norm.national}@landora.in`;

      user = await DataAccess.createUser({
        name: defaultName,
        email: placeholderEmail,
        phoneNumber: norm.e164,
        role,
        city: "Coimbatore",
      });
    }

    // Mark phone as verified
    await DataAccess.markPhoneVerified(user.id, norm.e164);

    // 5. Associate any guest / pending property submission with the verified account
    if (pendingPropertyId) {
      try {
        await DataAccess.associatePropertyToUser(pendingPropertyId, user.id, norm.e164);
      } catch (err) {
        console.warn("[AUTH] Failed to associate pending property:", err);
      }
    }

    // 6. Sign JWT session and set HTTP-only cookie
    const userRole: UserRole = user.role || "BUYER";
    const userCity = user.profile?.city || "Coimbatore";

    const sessionToken = await signSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: norm.e164,
      role: userRole,
      city: userCity,
    });

    await setServerSessionCookie(sessionToken);

    // Record login activity
    await DataAccess.recordSuccessfulLogin({
      userId: user.id,
      email: user.email,
      userName: user.name,
      role: userRole,
      eventType: isNewUser ? "REGISTER_MOBILE_OTP" : "LOGIN_MOBILE_OTP",
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: request.headers.get("user-agent") || undefined,
      details: `Authenticated via Mobile Number OTP (${norm.e164})`,
    });

    return NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: norm.e164,
        role: userRole,
        isPhoneVerified: true,
      },
      message: isNewUser
        ? "Account created and mobile verified successfully."
        : "Welcome back! Mobile verified and signed in.",
    });
  } catch (error: any) {
    console.error("[API ERROR] /api/auth/mobile/verify-otp:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please retry." },
      { status: 500 }
    );
  }
}
