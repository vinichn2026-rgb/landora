import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/reports - Query all property abuse/dispute reports
export async function GET() {
  try {
    await requireAdminSession();
    const reports = await DataAccess.getAdminReports();

    return NextResponse.json({
      success: true,
      reports,
      count: reports.length,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reports." },
      { status: isAuth ? 403 : 500 }
    );
  }
}

// PATCH /api/admin/reports - Update report status and resolution notes
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const { reportId, status, resolutionNotes } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing reportId or status." },
        { status: 400 }
      );
    }

    const updated = await DataAccess.updateReportStatus(
      reportId,
      status,
      resolutionNotes,
      admin.name
    );

    return NextResponse.json({
      success: true,
      message: `Report marked as ${status}.`,
      updated,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update report status." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
