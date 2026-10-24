import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/locations - Get all locations
export async function GET() {
  try {
    await requireAdminSession();
    const locations = await DataAccess.getAdminLocations();

    return NextResponse.json({
      success: true,
      locations,
      count: locations.length,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch locations." },
      { status: isAuth ? 403 : 500 }
    );
  }
}

// POST /api/admin/locations - Add location
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const { city, state, popularLocalities, count, isActive } = body;

    if (!city || !state) {
      return NextResponse.json(
        { success: false, error: "City and State are required." },
        { status: 400 }
      );
    }

    const created = await DataAccess.createAdminLocation({
      city: city.trim(),
      state: state.trim(),
      popularLocalities: Array.isArray(popularLocalities) ? popularLocalities : [],
      count: Number(count) || 0,
      isActive: isActive ?? true,
    }, admin.name);

    return NextResponse.json({
      success: true,
      message: `Location hub ${city} added successfully.`,
      location: created,
    }, { status: 201 });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create location." },
      { status: isAuth ? 403 : 500 }
    );
  }
}

// PUT /api/admin/locations - Update location
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing location ID." },
        { status: 400 }
      );
    }

    const updated = await DataAccess.updateAdminLocation(id, updates, admin.name);

    return NextResponse.json({
      success: true,
      message: "Location hub updated successfully.",
      location: updated,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update location." },
      { status: isAuth ? 403 : 500 }
    );
  }
}

// DELETE /api/admin/locations - Delete location
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing location ID." },
        { status: 400 }
      );
    }

    const deleted = await DataAccess.deleteAdminLocation(id, admin.name);

    return NextResponse.json({
      success: true,
      message: "Location hub removed from registry.",
      deleted,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete location." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
