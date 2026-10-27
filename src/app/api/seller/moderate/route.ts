import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";
import { NotificationService } from "@/lib/notification-service";

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

    let newStatus: any = "PENDING";
    const actUpper = action.toUpperCase();

    if (actUpper === "APPROVE") {
      newStatus = "ACTIVE";
    } else if (actUpper === "REJECT" || actUpper === "DETAILS_REQUIRED") {
      newStatus = "REJECTED";
    } else if (actUpper === "VERIFY" || actUpper === "VERIFICATION_PENDING") {
      newStatus = "PENDING";
    }

    const updated = await DataAccess.setListingStatus(
      propertyId,
      user.id,
      newStatus,
      user.role,
      (actUpper === "REJECT" || actUpper === "DETAILS_REQUIRED")
        ? (rejectionReason || "Listing details or documentation incomplete.")
        : undefined
    );

    // Automated Transactional Notification (SMS & WhatsApp per consent)
    if (updated?.sellerPhone) {
      if (actUpper === "APPROVE") {
        NotificationService.notifyPropertyApproved({
          userId: updated.sellerId,
          phone: updated.sellerPhone,
          propertyId: updated.id,
          propertyTitle: updated.title,
        }).catch(err => console.error("[NOTIF] notifyPropertyApproved error:", err));

        NotificationService.notifyPropertyPublished({
          userId: updated.sellerId,
          phone: updated.sellerPhone,
          propertyId: updated.id,
          propertyTitle: updated.title,
        }).catch(err => console.error("[NOTIF] notifyPropertyPublished error:", err));
      } else if (actUpper === "VERIFY" || actUpper === "VERIFICATION_PENDING") {
        NotificationService.notifyVerificationPending({
          userId: updated.sellerId,
          phone: updated.sellerPhone,
          propertyId: updated.id,
          propertyTitle: updated.title,
        }).catch(err => console.error("[NOTIF] notifyVerificationPending error:", err));
      } else {
        NotificationService.notifyDetailsRequired({
          userId: updated.sellerId,
          phone: updated.sellerPhone,
          propertyId: updated.id,
          propertyTitle: updated.title,
          reason: rejectionReason || "Additional details required",
        }).catch(err => console.error("[NOTIF] notifyDetailsRequired error:", err));
      }
    }

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
