import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Lead spam protection: max 10 enquiries per 5 minutes per IP
    const rateLimited = applyRateLimit(request, "property_enquiry", 10, 300000);
    if (rateLimited) return rateLimited;

    const body = await request.json();

    const { propertyId, buyerName, buyerEmail, buyerPhone, message, sellerId } = body;

    // Validation
    if (!propertyId || !buyerName || !buyerEmail || !buyerPhone || !message) {
      return NextResponse.json(
        { success: false, error: "All enquiry fields are required." },
        { status: 400 }
      );
    }

    const cleanPhone = String(buyerPhone).replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const result = await DataAccess.createEnquiry({
      propertyId,
      buyerName,
      buyerEmail,
      buyerPhone,
      message,
      sellerId: sellerId || "owner-01",
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        enquiryId: result.enquiryId,
        message: "Enquiry delivered to seller successfully.",
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
