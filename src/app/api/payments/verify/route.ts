import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendPaymentStatusEmail } from "@/lib/email";

// POST /api/payments/verify - Server-side payment signature verification
export async function POST(request: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment verification parameters (order_id, payment_id, signature).",
        },
        { status: 400 }
      );
    }

    // Strict Server-side HMAC SHA256 Signature Verification
    // Never trust frontend responses without mathematical cryptographic check!
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      await DataAccess.failPayment(
        razorpay_order_id,
        "Cryptographic signature verification mismatch."
      );

      // Attempt failure notification
      const failedAttempt = await DataAccess.getPaymentByOrderId(razorpay_order_id);
      if (failedAttempt) {
        await sendPaymentStatusEmail(
          user.email,
          user.name,
          "FAILED",
          failedAttempt.packageName || "Listing Boost",
          failedAttempt.amount,
          razorpay_payment_id,
          "Payment signature could not be verified by Landora server."
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed: Digital signature mismatch. Transaction not authorized.",
        },
        { status: 400 }
      );
    }

    // Complete Payment & Activate Benefits (Idempotent)
    const { payment, alreadyProcessed } = await DataAccess.completePayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    // Send payment confirmation email if first time confirmed
    if (!alreadyProcessed) {
      await sendPaymentStatusEmail(
        user.email,
        user.name,
        "SUCCESS",
        payment.packageName || "Listing Package Tier",
        payment.amount,
        razorpay_payment_id
      );
    }

    return NextResponse.json({
      success: true,
      message: alreadyProcessed
        ? "Payment was already confirmed and benefits are active."
        : "Payment verified successfully! Package benefits have been activated.",
      payment,
    });
  } catch (error: any) {
    console.error("[API ERROR] POST /api/payments/verify:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
