import { NextResponse } from "next/server";
import { clearServerSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearServerSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Signed out successfully.",
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/logout:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign out." },
      { status: 500 }
    );
  }
}
