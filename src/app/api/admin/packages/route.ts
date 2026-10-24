import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/packages - Get all listing packages
export async function GET() {
  try {
    await requireAdminSession();
    const packages = await DataAccess.getAdminPackages();

    return NextResponse.json({
      success: true,
      packages,
      count: packages.length,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch packages." },
      { status: isAuth ? 403 : 500 }
    );
  }
}

// PUT /api/admin/packages - Update listing package
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing package ID." },
        { status: 400 }
      );
    }

    const updated = await DataAccess.updateAdminPackage(id, updates, admin.name);

    return NextResponse.json({
      success: true,
      message: "Package configuration updated.",
      package: updated,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update package." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
