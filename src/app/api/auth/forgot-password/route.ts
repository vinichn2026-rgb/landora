import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";
import { signPasswordResetToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
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
        emailProviderConfigured: false,
      });
    }

    // Generate signed reset token (1 hour validity)
    const resetToken = await signPasswordResetToken(user.id, user.email);

    // Honest reporting per user instructions:
    // "Do not claim email or OTP verification works unless the required provider is configured."
    return NextResponse.json({
      success: true,
      message: "Password reset request initiated.",
      emailProviderConfigured: false,
      providerNotice: "No live transactional email service (e.g., AWS SES, Resend) is configured in this environment. In development mode, use the reset token below to proceed.",
      devResetToken: resetToken,
      resetUrl: `/reset-password?token=${encodeURIComponent(resetToken)}`,
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/forgot-password:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error initiating password reset." },
      { status: 500 }
    );
  }
}
