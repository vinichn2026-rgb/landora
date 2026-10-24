import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay";
import { PackageStore } from "@/lib/store";
import { applyRateLimit } from "@/lib/rate-limit";

// POST /api/payments/create-order - Create Razorpay payment order on server
export async function POST(request: NextRequest) {
  try {
    // Order flooding protection: max 15 orders per 5 minutes per IP
    const rateLimited = applyRateLimit(request, "payments_create_order", 15, 300000);
    if (rateLimited) return rateLimited;

    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to purchase listing packages." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { packageId, propertyId } = body;

    if (!packageId) {
      return NextResponse.json(
        { success: false, error: "Please select a listing package." },
        { status: 400 }
      );
    }

    const packages = await DataAccess.getAdminPackages();
    const pkg = packages.find((p) => p.id === packageId);

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "Selected listing package does not exist." },
        { status: 404 }
      );
    }

    if (!pkg.isActive) {
      return NextResponse.json(
        { success: false, error: "This listing package is currently unavailable." },
        { status: 400 }
      );
    }

    // Free Basic Listing Flow (0 INR)
    if (pkg.price === 0) {
      const freeOrderId = `order_free_${Date.now()}`;
      const payment = await DataAccess.createPaymentAttempt({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        packageId: pkg.id,
        packageName: pkg.name,
        amount: 0,
        currency: "INR",
        orderId: freeOrderId,
        propertyId,
      });

      await DataAccess.completePayment(freeOrderId, `free_pay_${Date.now()}`, "free_tier_granted");

      return NextResponse.json({
        success: true,
        isFree: true,
        message: "Free listing package activated successfully!",
        package: pkg,
      });
    }

    // Paid Listing Package Flow - Create Order on Server
    const receipt = `rcpt_${user.id.slice(-4)}_${Date.now().toString().slice(-6)}`;
    const razorpayOrder = await createRazorpayOrder({
      amountInInr: pkg.price,
      receipt,
      notes: {
        userId: user.id,
        packageId: pkg.id,
        packageName: pkg.name,
        propertyId: propertyId || "",
      },
    });

    // Save payment attempt with status PENDING in database
    await DataAccess.createPaymentAttempt({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      packageId: pkg.id,
      packageName: pkg.name,
      amount: pkg.price,
      currency: "INR",
      orderId: razorpayOrder.id,
      propertyId,
    });

    return NextResponse.json({
      success: true,
      isFree: false,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: getRazorpayKeyId(),
      package: {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        durationDays: pkg.durationDays,
      },
      isSandbox: razorpayOrder.isSandbox,
      isConfigured: isRazorpayConfigured(),
    });
  } catch (error: any) {
    console.error("[API ERROR] POST /api/payments/create-order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment order." },
      { status: 500 }
    );
  }
}
