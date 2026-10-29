import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";
import { signPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail, isEmailProviderConfigured } from "@/lib/email";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Password reset spam protection: max 5 requests per 15 minutes per IP
    const rateLimited = applyRateLimit(request, "auth_forgot_password", 5, 900000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const user = await DataAccess.findUserByEmail(email.trim());

    if (!user) {
      // Do not leak account existence; return standard message
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive password reset instructions.",
        emailProviderConfigured: isEmailProviderConfigured(),
      });
    }

    // Generate signed reset token (1 hour validity)
    const resetToken = await signPasswordResetToken(user.id, user.email);

    // Phase 9: Dispatch password reset email
    const dispatchResult = await sendPasswordResetEmail(user.email, user.name, resetToken);

    const isProd = process.env.NODE_ENV === "production";

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, password reset instructions have been sent.",
      emailProviderConfigured: dispatchResult.providerConfigured,
      providerNotice: dispatchResult.providerConfigured
        ? "Password reset email dispatched to your inbox."
        : isProd
        ? "Password reset email dispatched."
        : "Live email provider not configured. For development/testing, use the direct reset link below.",
      ...(isProd ? {} : {
        devResetToken: resetToken,
        resetUrl: `/reset-password?token=${encodeURIComponent(resetToken)}`,
      }),
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/forgot-password:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error initiating password reset." },
      { status: 500 }
    );
  }
}
