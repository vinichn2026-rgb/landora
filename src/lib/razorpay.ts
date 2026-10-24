import crypto from "crypto";

export interface CreateOrderParams {
  amountInInr: number;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  isSandbox: boolean;
}

export const isRazorpayConfigured = (): boolean => {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

export const getRazorpayKeyId = (): string => {
  return process.env.RAZORPAY_KEY_ID || "rzp_test_landora_sandbox";
};

const getRazorpayKeySecret = (): string => {
  return process.env.RAZORPAY_KEY_SECRET || "landora_test_secret_sandbox";
};

const getRazorpayWebhookSecret = (): string => {
  return process.env.RAZORPAY_WEBHOOK_SECRET || "landora_webhook_sandbox_secret";
};

/**
 * Server-Side Razorpay Order Creation
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
  const amountInPaise = Math.round(params.amountInInr * 100);

  if (isRazorpayConfigured()) {
    try {
      const auth = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString("base64");

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: params.receipt,
          notes: params.notes || {},
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Razorpay order API error: ${errorText}`);
      }

      const orderData = await response.json();
      return {
        id: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
        status: orderData.status,
        isSandbox: false,
      };
    } catch (err: any) {
      console.warn("[PAYMENTS WARNING] Live Razorpay order creation failed, falling back to Sandbox simulation:", err.message);
    }
  }

  // Sandbox / Test Mode Server Order
  const sandboxOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    id: sandboxOrderId,
    amount: amountInPaise,
    currency: "INR",
    receipt: params.receipt,
    status: "created",
    isSandbox: true,
  };
}

/**
 * Server-Side Signature Verification
 * razorpay_signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const secret = getRazorpayKeySecret();
  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(text)
    .digest("hex");

  // Constant-time buffer comparison to prevent timing attacks
  try {
    const a = Buffer.from(generatedSignature);
    const b = Buffer.from(signature);
    if (a.length !== b.length) {
      // Also allow test simulation token if in explicit sandbox mode
      if (!isRazorpayConfigured() && signature.startsWith("sig_sandbox_valid")) {
        return true;
      }
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Server-Side Webhook Signature Validation
 * Validates x-razorpay-signature header against raw webhook payload
 */
export function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string
): boolean {
  if (!rawBody || !receivedSignature) {
    return false;
  }

  const webhookSecret = getRazorpayWebhookSecret();
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    const a = Buffer.from(expectedSignature);
    const b = Buffer.from(receivedSignature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Helper to generate sandbox signature for tests
 */
export function generateTestSignature(orderId: string, paymentId: string): string {
  const secret = getRazorpayKeySecret();
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

/**
 * Helper to generate test webhook signature
 */
export function generateTestWebhookSignature(payload: string): string {
  const secret = getRazorpayWebhookSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}
