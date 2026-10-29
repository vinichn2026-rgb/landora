import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";
import { applyRateLimit } from "@/lib/rate-limit";
import { getServerSessionUser } from "@/lib/auth";
import { INITIAL_ADMIN_EMAIL } from "@/lib/constants";
import { sendAdminNewEnquiryNotificationEmail } from "@/lib/email";
import { NotificationService } from "@/lib/notification-service";

export async function POST(request: NextRequest) {
  try {
    // 1. Server-side Authentication Guard: Require signed-in session
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication required. Please sign in to contact sellers or submit enquiries.",
          requiresAuth: true 
        },
        { status: 401 }
      );
    }

    // 2. Lead spam protection: max 10 enquiries per 5 minutes per IP
    const rateLimited = applyRateLimit(request, "property_enquiry", 10, 300000);
    if (rateLimited) return rateLimited;

    const body = await request.json();

    const { propertyId, buyerName, buyerEmail, buyerPhone, message, sellerId } = body;

    const effectiveBuyerName = (buyerName || sessionUser.name || "Buyer").trim();
    const effectiveBuyerEmail = (buyerEmail || sessionUser.email).trim().toLowerCase();
    const effectiveBuyerPhone = (buyerPhone || sessionUser.phoneNumber || "").trim();

    // Validation
    if (!propertyId || !effectiveBuyerName || !effectiveBuyerEmail || !message) {
      return NextResponse.json(
        { success: false, error: "Please provide your name, email, and inquiry message." },
        { status: 400 }
      );
    }

    const cleanPhone = String(effectiveBuyerPhone).replace(/\D/g, "");
    if (cleanPhone.length > 0 && cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Verify property exists and bind inquiry to authentic seller
    const targetProperty = await DataAccess.getPropertyById(propertyId);
    if (!targetProperty) {
      return NextResponse.json(
        { success: false, error: "The requested property listing could not be found." },
        { status: 404 }
      );
    }

    const result = await DataAccess.createEnquiry({
      propertyId,
      buyerName: effectiveBuyerName,
      buyerEmail: effectiveBuyerEmail,
      buyerPhone: effectiveBuyerPhone || "Not specified",
      message: message.trim(),
      sellerId: targetProperty.sellerId,
    });

    if (result.success) {
      // Phase 6 Action-Auth: Notify Administrator of new buyer enquiry
      const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || INITIAL_ADMIN_EMAIL).toLowerCase().trim();
      const adminUser = await DataAccess.findUserByEmail(adminEmail);
      const propTitle = targetProperty?.title || "Property Listing";

      if (adminUser) {
        await DataAccess.createNotification({
          userId: adminUser.id,
          title: `New Buyer Enquiry: ${effectiveBuyerName}`,
          message: `${effectiveBuyerName} enquired about "${propTitle}". Mobile: ${effectiveBuyerPhone || "N/A"}`,
          type: "ADMIN_NEW_ENQUIRY",
          link: "/admin/enquiries",
          entityType: "ENQUIRY",
          entityId: result.enquiryId,
        });
      }

      // Automated Transactional Notification to Seller (SMS & WhatsApp per consent)
      if (targetProperty?.sellerPhone) {
        NotificationService.notifyNewInquiry({
          userId: targetProperty.sellerId,
          phone: targetProperty.sellerPhone,
          propertyId,
          propertyTitle: propTitle,
          extraInfo: `${effectiveBuyerName} requested callback. Message: "${message.slice(0, 50)}"`,
        }).catch(err => console.error("[NOTIF] notifyNewInquiry error:", err));
      }

      // Dispatch administrator notification email
      await sendAdminNewEnquiryNotificationEmail(
        adminEmail,
        propTitle,
        effectiveBuyerName,
        effectiveBuyerPhone || "N/A",
        effectiveBuyerEmail,
        message.trim()
      );

      return NextResponse.json({
        success: true,
        enquiryId: result.enquiryId,
        message: "Enquiry delivered to seller successfully. Confirmation sent to your email.",
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to submit enquiry." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[API ERROR] /api/enquiries:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error submitting enquiry" },
      { status: 500 }
    );
  }
}
