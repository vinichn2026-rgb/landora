import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";
import { verifyPasswordResetToken, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid password reset token." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Verify cryptographic token
    const tokenPayload = await verifyPasswordResetToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: "Password reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password and update record
    const passwordHash = await hashPassword(newPassword);
    const updated = await DataAccess.updateUserPassword(tokenPayload.userId, passwordHash);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update password. User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/reset-password:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error resetting password." },
      { status: 500 }
    );
  }
}
