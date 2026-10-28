import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { NotificationQueue } from "@/lib/notification-queue";

// POST /api/admin/notifications/retry - Retries failed notification deliveries
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();

    const body = await request.json().catch(() => ({}));
    const { logId, propertyId, allFailed } = body;

    if (logId) {
      const result = await NotificationQueue.retryDeliveryLog(logId);
      return NextResponse.json({
        success: result.success,
        retriedCount: 1,
        results: [result],
        message: result.success 
          ? "Notification retried and delivered successfully." 
          : `Retry attempt failed: ${result.error || "Unknown error"}`,
      });
    }

    if (propertyId) {
      const results = await NotificationQueue.retryFailedForProperty(propertyId);
      const successCount = results.filter(r => r.success).length;
      return NextResponse.json({
        success: true,
        retriedCount: results.length,
        successCount,
        results,
        message: `Retried ${results.length} notifications (${successCount} succeeded).`,
      });
    }

    if (allFailed) {
      const results = await NotificationQueue.retryAllFailed(50);
      const successCount = results.filter(r => r.success).length;
      return NextResponse.json({
        success: true,
        retriedCount: results.length,
        successCount,
        results,
        message: `Retried ${results.length} failed notifications (${successCount} succeeded).`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Please specify logId, propertyId, or allFailed: true." },
      { status: 400 }
    );
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retry notification delivery." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
