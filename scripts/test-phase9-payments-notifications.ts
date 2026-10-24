import { DataAccess } from "../src/lib/data-access";
import { 
  createRazorpayOrder, 
  verifyPaymentSignature, 
  verifyWebhookSignature,
  generateTestSignature,
  generateTestWebhookSignature,
  isRazorpayConfigured
} from "../src/lib/razorpay";
import {
  sendRegistrationVerificationEmail,
  sendPasswordResetEmail,
  sendListingSubmittedEmail,
  sendListingModerationEmail,
  sendNewEnquiryEmail,
  sendEnquiryConfirmationEmail,
  sendListingExpiryReminderEmail,
  sendPaymentStatusEmail,
  isEmailProviderConfigured
} from "../src/lib/email";
import { sendSmsNotification, isSmsProviderConfigured } from "../src/lib/sms";
import { UserRole } from "../src/types";

async function runPhase9Tests() {
  console.log("===============================================================");
  console.log("  LANDORA PHASE 9: PAYMENTS, PACKAGES & NOTIFICATIONS SUITE    ");
  console.log("===============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Assertion failed for: ${testName}`);
    }
  }

  // =========================================================================
  // 1. LISTING PACKAGES CONFIGURATION
  // =========================================================================
  console.log("--- 1. Listing Packages & Admin Configuration ---");
  const packages = await DataAccess.getAdminPackages();
  assert(packages.length >= 3, `Found ${packages.length} listing packages`);

  const basicPkg = packages.find((p) => p.price === 0);
  assert(basicPkg !== undefined, "Standard Free basic listing package exists (₹0)");

  const featuredPkg = packages.find((p) => p.isFeatured && p.price > 0);
  assert(featuredPkg !== undefined, "Featured Boost listing package exists");

  const agentPkg = packages.find((p) => p.listingLimit >= 10);
  assert(agentPkg !== undefined, "Agent & Builder Pro listing package exists");

  // Administrator configuration update
  const updatedPkg = await DataAccess.updateAdminPackage(
    featuredPkg!.id,
    { durationDays: 75 },
    "Admin Master"
  );
  assert(updatedPkg?.durationDays === 75, "Admin successfully updated package duration to 75 days");

  // =========================================================================
  // 2. SERVER-SIDE RAZORPAY ORDER CREATION
  // =========================================================================
  console.log("\n--- 2. Server-side Payment Order Creation ---");
  const order = await createRazorpayOrder({
    amountInInr: 1499,
    receipt: "rcpt_test_001",
    notes: { packageId: featuredPkg!.id, userId: "user-seller-01" },
  });

  assert(Boolean(order.id && order.id.startsWith("order_")), `Generated server order ID: ${order.id}`);
  assert(order.amount === 149900, "Amount converted to paise (1499 * 100 = 149900)");
  assert(order.currency === "INR", "Order currency is INR");

  // Save payment attempt with PENDING status
  const paymentAttempt = await DataAccess.createPaymentAttempt({
    userId: "user-seller-01",
    userName: "K. R. Sivakumar",
    userEmail: "seller@landora.in",
    packageId: featuredPkg!.id,
    packageName: featuredPkg!.name,
    amount: 1499,
    currency: "INR",
    orderId: order.id,
    propertyId: "land-cbe-001",
  });
  assert(paymentAttempt.status === "PENDING", "Payment attempt initialized with PENDING status");

  // =========================================================================
  // 3. CRYPTOGRAPHIC SIGNATURE VERIFICATION (SECURITY)
  // =========================================================================
  console.log("\n--- 3. Cryptographic Signature Verification & Anti-Tampering ---");

  // 3a. Reject tampered signature
  const fakeSignature = "tampered_fake_signature_hex_1234567890abcdef";
  const isFakeValid = verifyPaymentSignature(order.id, "pay_fake_9999", fakeSignature);
  assert(isFakeValid === false, "Strictly rejected invalid/tampered payment signature");

  // 3b. Verify legitimate signature
  const validPaymentId = `pay_rzp_${Date.now()}`;
  const validSignature = generateTestSignature(order.id, validPaymentId);
  const isValid = verifyPaymentSignature(order.id, validPaymentId, validSignature);
  assert(isValid === true, "Verified legitimate HMAC SHA256 payment signature");

  // 3c. Complete payment and activate benefits
  const completionResult = await DataAccess.completePayment(
    order.id,
    validPaymentId,
    validSignature
  );
  assert(completionResult.payment.status === "SUCCESS", "Payment status updated to SUCCESS");
  assert(completionResult.alreadyProcessed === false, "Initial completion marked as not previously processed");

  // Verify property was boosted to featured
  const boostedProperty = await DataAccess.getPropertyById("land-cbe-001");
  assert(boostedProperty?.isFeatured === true, "Property boosted to Featured upon verified payment");

  // =========================================================================
  // 4. IDEMPOTENT PAYMENT PROCESSING
  // =========================================================================
  console.log("\n--- 4. Payment Idempotency & Duplicate Prevention ---");
  const secondAttempt = await DataAccess.completePayment(
    order.id,
    validPaymentId,
    validSignature
  );
  assert(secondAttempt.alreadyProcessed === true, "Duplicate payment completion is idempotent (alreadyProcessed: true)");
  assert(secondAttempt.payment.status === "SUCCESS", "Status remains SUCCESS without duplicate mutations");

  // =========================================================================
  // 5. WEBHOOK AUTHENTICITY & IDEMPOTENT EVENT HANDLING
  // =========================================================================
  console.log("\n--- 5. Webhook Validation & Event Handling ---");

  // 5a. Tampered webhook signature rejected
  const webhookPayload = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_wh_test_101",
          order_id: "order_wh_001",
          amount: 299900,
        },
      },
    },
  });
  const badWebhookSig = "invalid_webhook_signature";
  assert(
    verifyWebhookSignature(webhookPayload, badWebhookSig) === false,
    "Webhook rejected with invalid HMAC signature"
  );

  // 5b. Valid webhook signature accepted
  const goodWebhookSig = generateTestWebhookSignature(webhookPayload);
  assert(
    verifyWebhookSignature(webhookPayload, goodWebhookSig) === true,
    "Webhook authenticated with valid HMAC SHA256 signature"
  );

  // 5c. Payment failure handling
  const failedOrderId = `order_failed_${Date.now()}`;
  await DataAccess.createPaymentAttempt({
    userId: "user-seller-01",
    userName: "K. R. Sivakumar",
    userEmail: "seller@landora.in",
    packageId: featuredPkg!.id,
    packageName: featuredPkg!.name,
    amount: 1499,
    currency: "INR",
    orderId: failedOrderId,
  });
  const failedPayment = await DataAccess.failPayment(failedOrderId, "Card declined by issuing bank (insufficient funds)");
  assert(failedPayment?.status === "FAILED", "Payment marked as FAILED with descriptive error reason");

  // 5d. Refund processing
  const refundOrderId = `order_refund_${Date.now()}`;
  await DataAccess.createPaymentAttempt({
    userId: "user-seller-01",
    userName: "K. R. Sivakumar",
    userEmail: "seller@landora.in",
    packageId: featuredPkg!.id,
    packageName: featuredPkg!.name,
    amount: 1499,
    currency: "INR",
    orderId: refundOrderId,
    propertyId: "land-cbe-001",
  });
  await DataAccess.completePayment(refundOrderId, `pay_ref_${Date.now()}`, "valid_sig");
  const refundedPayment = await DataAccess.refundPayment(refundOrderId, "Accidental duplicate boost purchase");
  assert(refundedPayment?.status === "REFUNDED", "Payment successfully transitioned to REFUNDED");

  // =========================================================================
  // 6. FREE / BASIC LISTING FLOW RESILIENCE
  // =========================================================================
  console.log("\n--- 6. Free / Basic Listing Flow Resilience ---");
  const freeProperty = await DataAccess.createSellerProperty({
    title: "Free Tier Organic Coconut Grove near Pollachi",
    description: "Individual landowner selling 1 acre fertile agricultural land.",
    listingType: "SALE",
    propertyType: "AGRICULTURAL_LAND",
    price: 3200000,
    area: 43560,
    areaUnit: "SQ_FT",
    address: "SF 88, Pollachi Main Road",
    city: "Pollachi",
    locality: "Anaimalai",
    state: "Tamil Nadu",
    pinCode: "642104",
    sellerId: "user-seller-01",
    sellerName: "K. R. Sivakumar",
    sellerPhone: "+91 94433 99881",
    sellerType: "OWNER",
    status: "PENDING",
    packageId: "pkg-basic",
  } as any);

  assert(freeProperty.id.length > 0, "Free listing created without payment gateway charges");
  assert(freeProperty.status === "PENDING", "Free listing entered moderation workflow successfully");

  // =========================================================================
  // 7. EMAIL NOTIFICATION SYSTEM (ALL 8 TRIGGERS)
  // =========================================================================
  console.log("\n--- 7. Email Notification System (All 8 Triggers) ---");

  // Trigger 1: Registration Verification
  const email1 = await sendRegistrationVerificationEmail("test.user@landora.in", "Ramesh Kumar", "vfy_token_123");
  assert(email1.event === "REGISTRATION_VERIFICATION", "Trigger 1: Registration verification email template generated");
  assert(typeof email1.providerConfigured === "boolean", "Trigger 1: Transparently reports email provider configured status");

  // Trigger 2: Password Reset
  const email2 = await sendPasswordResetEmail("test.user@landora.in", "Ramesh Kumar", "rst_token_456");
  assert(email2.event === "PASSWORD_RESET", "Trigger 2: Password reset security email generated");

  // Trigger 3: Listing Submitted
  const email3 = await sendListingSubmittedEmail("seller@landora.in", "K. R. Sivakumar", "1,800 Sq.Ft Plot in Peelamedu", "prop-101");
  assert(email3.event === "LISTING_SUBMITTED", "Trigger 3: Listing submitted acknowledgment email generated");

  // Trigger 4: Listing Approved & Rejected
  const email4a = await sendListingModerationEmail("seller@landora.in", "K. R. Sivakumar", "1,800 Sq.Ft Plot in Peelamedu", "ACTIVE", "plot-peelamedu");
  assert(email4a.event === "LISTING_APPROVED", "Trigger 4a: Listing approved publication email generated");

  const email4b = await sendListingModerationEmail("seller@landora.in", "K. R. Sivakumar", "Incomplete Plot", "REJECTED", undefined, "Missing EC document");
  assert(email4b.event === "LISTING_REJECTED", "Trigger 4b: Listing rejection notice with reason generated");

  // Trigger 5: New Property Enquiry (To Seller)
  const email5 = await sendNewEnquiryEmail(
    "seller@landora.in",
    "K. R. Sivakumar",
    "4.5 Acres Coconut Farmland",
    "M. Rajesh",
    "+91 98421 99887",
    "rajesh@gmail.com",
    "Please send survey sketch and title documents.",
    "enq-001"
  );
  assert(email5.event === "NEW_ENQUIRY", "Trigger 5: New lead inquiry email to seller generated");

  // Trigger 6: Enquiry Confirmation (To Buyer)
  const email6 = await sendEnquiryConfirmationEmail("rajesh@gmail.com", "M. Rajesh", "4.5 Acres Coconut Farmland", "K. R. Sivakumar");
  assert(email6.event === "ENQUIRY_CONFIRMATION", "Trigger 6: Buyer enquiry confirmation copy generated");

  // Trigger 7: Listing Expiry Reminder
  const email7 = await sendListingExpiryReminderEmail("seller@landora.in", "K. R. Sivakumar", "Commercial Plot near Avinashi Road", 7, "prop-102");
  assert(email7.event === "LISTING_EXPIRY_REMINDER", "Trigger 7: Listing expiry countdown reminder email generated");

  // Trigger 8: Payment Confirmation & Failure
  const email8a = await sendPaymentStatusEmail("seller@landora.in", "K. R. Sivakumar", "SUCCESS", "Featured Plot Boost", 1499, "pay_rzp_9999");
  assert(email8a.event === "PAYMENT_CONFIRMATION", "Trigger 8a: Payment receipt & confirmation email generated");

  const email8b = await sendPaymentStatusEmail("seller@landora.in", "K. R. Sivakumar", "FAILED", "Featured Plot Boost", 1499, "pay_failed_1111", "Declined by bank");
  assert(email8b.event === "PAYMENT_FAILED", "Trigger 8b: Payment failure notice email generated");

  // =========================================================================
  // 8. IN-APP NOTIFICATIONS & MARK AS READ
  // =========================================================================
  console.log("\n--- 8. In-App Notifications & Unread Counts ---");
  const testUserId = `user_test_${Date.now()}`;

  const notif1 = await DataAccess.createNotification({
    userId: testUserId,
    title: "New Enquiry Received",
    message: "Buyer Rajesh Kumar enquired about your Peelamedu Villa Plot.",
    type: "NEW_ENQUIRY",
    link: "/dashboard/seller/enquiries",
    entityType: "ENQUIRY",
    entityId: "enq-99",
  });
  assert(notif1.isRead === false, "New notification created with unread status (isRead: false)");
  assert(Boolean(notif1.link), "Notification has valid deep navigation link");

  const notif2 = await DataAccess.createNotification({
    userId: testUserId,
    title: "Package Activated",
    message: "Featured Plot Package is now active on your account.",
    type: "PAYMENT_SUCCESS",
    link: "/dashboard/packages",
  });

  const userNotifs = await DataAccess.getUserNotifications(testUserId);
  assert(userNotifs.length === 2, `Retrieved ${userNotifs.length} notifications for user`);

  const unreadBefore = userNotifs.filter((n) => !n.isRead).length;
  assert(unreadBefore === 2, "Unread count accurately calculates 2 unread notifications");

  // Mark single as read
  await DataAccess.markNotificationRead(notif1.id, testUserId);
  const afterSingle = await DataAccess.getUserNotifications(testUserId);
  const readItem = afterSingle.find((n) => n.id === notif1.id);
  assert(readItem?.isRead === true, "Single notification marked as read");
  assert(afterSingle.filter((n) => !n.isRead).length === 1, "Unread count decremented to 1");

  // Mark all as read
  await DataAccess.markAllNotificationsRead(testUserId);
  const afterAll = await DataAccess.getUserNotifications(testUserId);
  assert(afterAll.every((n) => n.isRead), "All notifications successfully marked as read (unread count = 0)");

  // =========================================================================
  // 9. SMS & WHATSAPP NOTIFICATION DISPATCH
  // =========================================================================
  console.log("\n--- 9. Optional SMS / WhatsApp Dispatch ---");
  const smsResult = await sendSmsNotification("+919842199887", "Your Landora listing has been approved!");
  assert(
    typeof smsResult.providerConfigured === "boolean",
    "SMS service transparently reports provider configured status without pretending"
  );

  console.log("\n===============================================================");
  console.log(` ALL ${passed} / ${total} TESTS PASSED FOR PHASE 9 (PAYMENTS & NOTIFICATIONS)`);
  console.log("===============================================================");
}

runPhase9Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
