import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/enquiries - Overview of all buyer enquiries across Landora
export async function GET() {
  try {
    await requireAdminSession();
    const enquiries = await DataAccess.getAllEnquiriesPlatform();

    return NextResponse.json({
      success: true,
      enquiries,
      count: enquiries.length,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch platform enquiries." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
