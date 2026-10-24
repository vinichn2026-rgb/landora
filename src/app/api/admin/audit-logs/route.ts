import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/audit-logs - View system administrative audit log trail
export async function GET() {
  try {
    await requireAdminSession();
    const logs = await DataAccess.getAdminAuditLogs();

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch audit logs." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
