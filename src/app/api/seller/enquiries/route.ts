import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/seller/enquiries - Retrieve buyer enquiries for the seller's properties
export async function GET() {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const enquiries = await DataAccess.getSellerEnquiries(user.id);

    return NextResponse.json({
      success: true,
      enquiries,
      count: enquiries.length,
    });
  } catch (error: any) {
    console.error("[API ERROR] GET /api/seller/enquiries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enquiries." },
      { status: 500 }
    );
  }
}

// POST /api/seller/enquiries - Respond to an enquiry or update its workflow status
export async function POST(request: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { enquiryId, replyMessage, status } = body;

    if (!enquiryId) {
      return NextResponse.json(
        { success: false, error: "Missing enquiry ID." },
        { status: 400 }
      );
    }

    if (!replyMessage || replyMessage.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter a response message for the buyer." },
        { status: 400 }
      );
    }

    const updated = await DataAccess.respondToSellerEnquiry(
      enquiryId,
      user.id,
      replyMessage.trim(),
      status || "CONTACTED"
    );

    return NextResponse.json({
      success: true,
      message: "Response sent to buyer and enquiry marked as contacted.",
      enquiry: updated,
    });
  } catch (error: any) {
    console.error("[API ERROR] POST /api/seller/enquiries:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to respond to enquiry." },
      { status: 500 }
    );
  }
}
