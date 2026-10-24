import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/content - View content banners and copy
export async function GET() {
  try {
    await requireAdminSession();
    const content = await DataAccess.getAdminContent();

    return NextResponse.json({
      success: true,
      content,
      count: content.length,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch content." },
      { status: isAuth ? 403 : 500 }
    );
  }
}

// PUT /api/admin/content - Update content banner copy
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const { key, ...updates } = body;

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Missing content key." },
        { status: 400 }
      );
    }

    const updated = await DataAccess.updateAdminContent(key, updates, admin.name);

    return NextResponse.json({
      success: true,
      message: "Content copy updated successfully.",
      content: updated,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update content." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
