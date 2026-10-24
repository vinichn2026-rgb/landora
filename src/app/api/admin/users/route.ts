import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";
import { UserRole } from "@/types";

// GET /api/admin/users - Query users
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const query = searchParams.get("query") || undefined;

    const users = await DataAccess.getAdminUsers({ role, query });

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users." },
      { status: isAuth ? 403 : 500 }
    );
  }
}

// PATCH /api/admin/users - Update user role or suspension status
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const { userId, role, isSuspended } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId." },
        { status: 400 }
      );
    }

    if (role) {
      const validRoles: UserRole[] = ["BUYER", "SELLER", "AGENT", "BUILDER", "ADMIN"];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: "Invalid user role specified." },
          { status: 400 }
        );
      }
      const updated = await DataAccess.updateUserRole(userId, role, admin.name);
      return NextResponse.json({
        success: true,
        message: `User role updated to ${role}.`,
        user: updated,
      });
    }

    if (typeof isSuspended === "boolean") {
      const updated = await DataAccess.toggleUserSuspension(userId, isSuspended, admin.name);
      return NextResponse.json({
        success: true,
        message: `User account ${isSuspended ? "suspended" : "reactivated"}.`,
        user: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: "No update parameters provided (role or isSuspended)." },
      { status: 400 }
    );
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
