import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/login-activity - Query recent successful login events (Admin strictly guarded)
export async function GET(request: NextRequest) {
  try {
    // 1. Strict Server-Side Administrator Authorisation Guard
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), 200) : 50;

    const activities = await DataAccess.getAdminLoginActivities(limit);

    // 2. Strict Zero-Exposure Security Sanitization:
    // Ensure no passwords, tokens, or OTP codes can ever leak into the response
    const sanitizedActivities = activities.map(a => ({
      id: a.id,
      userId: a.userId,
      userName: a.userName,
      email: a.email,
      role: a.role,
      eventType: a.eventType,
      status: a.status,
      ipAddress: a.ipAddress ? (a.ipAddress.includes(":") ? a.ipAddress.split(",")[0].trim() : a.ipAddress) : null,
      userAgent: a.userAgent ? a.userAgent.slice(0, 120) : null,
      details: a.details,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      success: true,
      activities: sanitizedActivities,
      count: sanitizedActivities.length,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch login activities." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
