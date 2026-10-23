import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/user/notifications - Get notifications for authenticated user
export async function GET() {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const notifications = await DataAccess.getUserNotifications(sessionUser.id);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[API ERROR] GET /api/user/notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}

// PUT /api/user/notifications - Mark notification(s) as read
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await DataAccess.markAllNotificationsRead(sessionUser.id);
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read.",
      });
    }

    if (notificationId) {
      await DataAccess.markNotificationRead(notificationId, sessionUser.id);
      return NextResponse.json({
        success: true,
        message: "Notification marked as read.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Missing notificationId or markAll flag." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API ERROR] PUT /api/user/notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification." },
      { status: 500 }
    );
  }
}
