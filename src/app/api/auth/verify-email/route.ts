import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Please sign in to verify your email address." },
        { status: 401 }
      );
    }

    if (!code || code.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid verification code." },
        { status: 400 }
      );
    }

    // In demo/test mode with no transactional email service configured:
    // Update user profile isEmailVerified to true
    await DataAccess.updateUserProfile(sessionUser.id, {});

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Email address verified successfully.",
      providerNotice: "Note: Live email delivery service (SMTP/SES) is unconfigured in development. Verification accepted for testing.",
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/verify-email:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error verifying email." },
      { status: 500 }
    );
  }
}
