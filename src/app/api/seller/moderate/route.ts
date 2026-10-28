import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";
import { NotificationQueue } from "@/lib/notification-queue";

// POST /api/seller/moderate - Moderate property listing (Approve, Request Info, or Reject)
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
        { success: false, error: "Missing propertyId or action (APPROVE/REJECT/REQUEST_INFO)." },
        { status: 400 }
      );
    }

    let newStatus: any = "PENDING";
    const actUpper = action.toUpperCase();

    if (actUpper === "APPROVE") {
      newStatus = "ACTIVE";
    } else if (actUpper === "REQUEST_INFO" || actUpper === "NEEDS_MORE_INFORMATION" || actUpper === "DETAILS_REQUIRED") {
      newStatus = "NEEDS_MORE_INFORMATION";
    } else if (actUpper === "REJECT") {
      newStatus = "REJECTED";
    } else if (actUpper === "VERIFY" || actUpper === "VERIFICATION_PENDING") {
      newStatus = "PENDING";
    }

    const updated = await DataAccess.setListingStatus(
      propertyId,
      user.id,
      newStatus,
      user.role,
      (actUpper === "REJECT" || actUpper === "REQUEST_INFO" || actUpper === "NEEDS_MORE_INFORMATION" || actUpper === "DETAILS_REQUIRED")
        ? (rejectionReason || "Listing details or documentation incomplete.")
        : undefined
    );

    // Reliable Event-Driven Notification & Admin Automation (Decoupled & Non-blocking)
    if (updated) {
      if (actUpper === "APPROVE") {
        NotificationQueue.handlePropertyApproved({ property: updated, adminName: user.name });
        NotificationQueue.handlePropertyPublished({ property: updated });
      } else if (actUpper === "REQUEST_INFO" || actUpper === "NEEDS_MORE_INFORMATION" || actUpper === "DETAILS_REQUIRED") {
        NotificationQueue.handleAdditionalDetailsRequired({
          property: updated,
          reason: rejectionReason || "Additional documentation or details required by moderation desk.",
          adminName: user.name,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: newStatus === "ACTIVE" 
        ? "Property listing approved! It is now published live on search results." 
        : newStatus === "NEEDS_MORE_INFORMATION"
        ? "Requested additional information from seller. Notification dispatched."
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
