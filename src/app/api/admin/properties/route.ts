import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/properties - Query all properties across any status
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const query = searchParams.get("query") || undefined;
    const city = searchParams.get("city") || undefined;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const result = await DataAccess.getAdminProperties({
      status,
      query,
      city,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch properties." },
      { status: isAuth ? 403 : 500 }
    );
  }
}

// PATCH /api/admin/properties - Moderate or feature a property
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const { propertyId, action, reason, isFeatured } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "Missing propertyId." },
        { status: 400 }
      );
    }

    // Toggle featured action
    if (typeof isFeatured === "boolean") {
      const updated = await DataAccess.togglePropertyFeatured(propertyId, isFeatured, admin.name);
      return NextResponse.json({
        success: true,
        message: `Property ${isFeatured ? "featured on homepage" : "unfeatured"}.`,
        property: updated,
      });
    }

    // Moderation action: APPROVE, REJECT, DEACTIVATE, EXPIRE
    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing action." },
        { status: 400 }
      );
    }

    if (action === "REJECT" && (!reason || reason.trim().length < 5)) {
      return NextResponse.json(
        { success: false, error: "Please provide a specific rejection reason for the seller." },
        { status: 400 }
      );
    }

    const updated = await DataAccess.moderateProperty(
      propertyId,
      action as any,
      reason,
      admin.name
    );

    return NextResponse.json({
      success: true,
      message: `Property status updated to ${action}. Action recorded in audit logs.`,
      property: updated,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to moderate property." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
