import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// POST /api/seller/moderate - Moderate property listing (Approve or Reject)
export async function POST(request: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as an administrator." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only administrators can approve or reject property listings." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { propertyId, action, rejectionReason } = body;

    if (!propertyId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing propertyId or action (APPROVE/REJECT)." },
        { status: 400 }
      );
    }

    const newStatus = action.toUpperCase() === "APPROVE" ? "ACTIVE" : "REJECTED";

    const updated = await DataAccess.setListingStatus(
      propertyId,
      user.id,
      newStatus,
      user.role,
      action.toUpperCase() === "REJECT" ? (rejectionReason || "Listing details or documentation incomplete.") : undefined
    );

    return NextResponse.json({
      success: true,
      message: newStatus === "ACTIVE" 
        ? "Property listing approved! It is now published live on search results." 
        : "Property listing rejected with stated reason.",
      listing: updated,
    });
  } catch (error: any) {
    console.error("[API ERROR] POST /api/seller/moderate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to moderate listing." },
      { status: 500 }
    );
  }
}
