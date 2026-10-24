import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendPaymentStatusEmail } from "@/lib/email";

// POST /api/payments/webhook - Idempotent Razorpay Webhook Handler
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    // Authenticate Webhook using HMAC SHA256
    const isAuthentic = verifyWebhookSignature(rawBody, signature);
    if (!isAuthentic) {
      console.warn("[WEBHOOK SECURITY WARNING] Webhook signature verification failed!");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    let eventData: any = {};
    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const event = eventData.event;
    const payload = eventData.payload;

    console.log(`[PAYMENTS WEBHOOK] Received authentic event: ${event}`);

    // 1. Payment Captured / Order Paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId && paymentId) {
        // Complete payment idempotently
        const { payment, alreadyProcessed } = await DataAccess.completePayment(
          orderId,
          paymentId,
          signature
        );

        if (!alreadyProcessed) {
          await sendPaymentStatusEmail(
            payment.userEmail,
            payment.userName,
            "SUCCESS",
            payment.packageName || "Listing Package Tier",
            payment.amount,
            paymentId
          );
        }
      }
    }

    // 2. Payment Failed
    else if (event === "payment.failed") {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const reason = paymentEntity?.error_description || "Payment failed via gateway";

      if (orderId) {
        await DataAccess.failPayment(orderId, reason);
      }
    }

    // 3. Refund Processed
    else if (event === "refund.processed") {
      const refundEntity = payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;
      const reason = refundEntity?.notes?.reason || "Refund issued to customer";

      const allPayments = await DataAccess.getAdminPayments();
      const match = allPayments.payments.find((p) => p.gatewayPaymentId === paymentId);

      if (match?.orderId) {
        await DataAccess.refundPayment(match.orderId, reason);
      }
    }

    // Always acknowledge authentic webhook with 200 OK
    return NextResponse.json({
      success: true,
      received: true,
      event,
    });
  } catch (error: any) {
    console.error("[API ERROR] POST /api/payments/webhook:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Webhook processing error." },
      { status: 500 }
    );
  }
}
