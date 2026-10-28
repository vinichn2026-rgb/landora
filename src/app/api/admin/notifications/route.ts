import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/notifications - Retrieve notification delivery logs with status/channel filters
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const channel = searchParams.get("channel") || "ALL";
    const eventType = searchParams.get("eventType") || "ALL";
    const propertyId = searchParams.get("propertyId") || undefined;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const result = await DataAccess.getNotificationDeliveryLogs({
      status,
      channel,
      eventType,
      propertyId,
      page,
      limit,
    });

    // Compute metrics counts for dashboard
    const allRecent = await DataAccess.getNotificationDeliveryLogs({ limit: 1000 });
    const stats = {
      total: allRecent.total,
      sent: allRecent.data.filter(l => l.status === "SENT").length,
      delivered: allRecent.data.filter(l => l.status === "DELIVERED").length,
      failed: allRecent.data.filter(l => l.status === "FAILED").length,
      pending: allRecent.data.filter(l => l.status === "PENDING" || l.status === "QUEUED").length,
    };

    return NextResponse.json({
      success: true,
      logs: result.data,
      total: result.total,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      stats,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notification logs." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
