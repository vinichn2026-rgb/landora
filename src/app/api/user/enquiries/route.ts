import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/user/enquiries - Get enquiries submitted by authenticated user
export async function GET() {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to view enquiries." },
        { status: 401 }
      );
    }

    const enquiries = await DataAccess.getUserEnquiries(sessionUser.id, sessionUser.email);

    return NextResponse.json({
      success: true,
      enquiries,
      count: enquiries.length,
    });
  } catch (error) {
    console.error("[API ERROR] GET /api/user/enquiries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enquiries." },
      { status: 500 }
    );
  }
}
