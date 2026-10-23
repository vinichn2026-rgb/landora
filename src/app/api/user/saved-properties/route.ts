import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/user/saved-properties - List saved properties for authenticated user
export async function GET() {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to view your saved properties." },
        { status: 401 }
      );
    }

    const properties = await DataAccess.getUserSavedProperties(sessionUser.id);
    const savedIds = await DataAccess.getUserSavedIds(sessionUser.id);

    return NextResponse.json({
      success: true,
      properties,
      savedIds,
      count: properties.length,
    });
  } catch (error) {
    console.error("[API ERROR] GET /api/user/saved-properties:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching saved properties." },
      { status: 500 }
    );
  }
}

// POST /api/user/saved-properties - Toggle save/unsave property for authenticated user
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Please sign in to save or shortlist properties." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "Property ID is required." },
        { status: 400 }
      );
    }

    const result = await DataAccess.toggleSavedProperty(sessionUser.id, propertyId);

    return NextResponse.json({
      success: true,
      isSaved: result.isSaved,
      count: result.count,
      message: result.isSaved
        ? "Property added to your shortlist."
        : "Property removed from your shortlist.",
    });
  } catch (error) {
    console.error("[API ERROR] POST /api/user/saved-properties:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update saved properties." },
      { status: 500 }
    );
  }
}
