import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/metrics - Overview statistics for the Admin Dashboard
export async function GET() {
  try {
    await requireAdminSession();
    const metrics = await DataAccess.getAdminMetrics();

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admin metrics." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
