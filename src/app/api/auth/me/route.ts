import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

export async function GET() {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Load full profile details from data-access layer
    const fullUser = await DataAccess.findUserById(sessionUser.id);
    if (!fullUser) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        phoneNumber: fullUser.phoneNumber,
        role: fullUser.role,
        profile: fullUser.profile,
        createdAt: fullUser.createdAt,
      },
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/me:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to resolve session." },
      { status: 500 }
    );
  }
}
