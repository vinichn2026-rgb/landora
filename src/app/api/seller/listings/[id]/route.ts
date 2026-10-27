import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";
import { NotificationService } from "@/lib/notification-service";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/seller/listings/[id] - Get listing for editing
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const property = await DataAccess.getPropertyById(id);

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property listing not found." },
        { status: 404 }
      );
    }

    // Ownership check: users may view only their own listings unless admin
    if (property.sellerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not authorized to view or edit this listing." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: property,
    });
  } catch (error: any) {
    console.error("[API ERROR] GET /api/seller/listings/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve listing." },
      { status: 500 }
    );
  }
}

// PUT /api/seller/listings/[id] - Update property listing
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existing = await DataAccess.getPropertyById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Property listing not found." },
        { status: 404 }
      );
    }

    if (existing.sellerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot modify listings owned by another account." },
        { status: 403 }
      );
    }

    // Update property
    const updated = await DataAccess.updateSellerProperty(id, user.id, body, user.role);

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully.",
      listing: updated,
    });
  } catch (error: any) {
    console.error("[API ERROR] PUT /api/seller/listings/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update property listing." },
      { status: 500 }
    );
  }
}

// PATCH /api/seller/listings/[id] - Deactivate, activate, or update status
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    const updated = await DataAccess.setListingStatus(
      id,
      user.id,
      status,
      user.role,
      rejectionReason
    );

    // Automated Transactional Notification (SMS & WhatsApp per consent)
    if (updated?.sellerPhone) {
      if (status === "ACTIVE") {
        NotificationService.notifyPropertyPublished({
          userId: updated.sellerId,
          phone: updated.sellerPhone,
          propertyId: updated.id,
          propertyTitle: updated.title,
        }).catch(err => console.error("[NOTIF] notifyPropertyPublished error:", err));
      } else {
        NotificationService.notifyStatusChanged({
          userId: updated.sellerId,
          phone: updated.sellerPhone,
          propertyId: updated.id,
          propertyTitle: updated.title,
          extraInfo: status,
        }).catch(err => console.error("[NOTIF] notifyStatusChanged error:", err));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Listing status updated to ${status}.`,
      listing: updated,
    });
  } catch (error: any) {
    console.error("[API ERROR] PATCH /api/seller/listings/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update listing status." },
      { status: 500 }
    );
  }
}
