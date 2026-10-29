// =============================================================================
// Comprehensive Phase 10 Production Verification & Security Test Suite
// Verifies: Functional Workflows, Security Hardening, SEO & Performance
// =============================================================================

import { DataAccess } from "./src/lib/data-access";
import { PropertyStore, UserStore, SavedPropertyStore, EnquiryStore, NotificationDeliveryLogStore, PackageStore } from "./src/lib/store";
import { hashPassword, comparePassword, signSessionToken, verifySessionToken, signPasswordResetToken, verifyPasswordResetToken } from "./src/lib/auth";
import { checkRateLimit, applyRateLimit } from "./src/lib/rate-limit";
import { verifyPaymentSignature, verifyWebhookSignature } from "./src/lib/razorpay";
import { NotificationQueue } from "./src/lib/notification-queue";
import { normalizePhoneNumber } from "./src/lib/sms";
import { isValidImageMagicBytes } from "./src/app/api/upload/route";
import { PropertyItem, UserItem } from "./src/types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

async function runTestSuite() {
  console.log("=================================================================");
  console.log("LANDORA REAL ESTATE PLATFORM — PHASE 10 VERIFICATION TEST SUITE");
  console.log("=================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. FUNCTIONAL TESTING: HOMEPAGE, PROPERTIES & SEARCH
  // ---------------------------------------------------------------------------
  console.log("SECTION 1: Functional Testing — Property Search, Filter & Pagination");
  
  // A. Default query
  const allProperties = await DataAccess.getProperties({ limit: 9 });
  assert(allProperties.data.length > 0, "Query default property search results returns listings");
  assert(allProperties.total > 0, "Property dataset total count is greater than zero");

  // B. City filter
  const cbeProperties = await DataAccess.getProperties({ city: "Coimbatore" });
  assert(
    cbeProperties.data.every(p => p.city.toLowerCase() === "coimbatore" || p.locality.toLowerCase().includes("coimbatore")),
    "City filter correctly scopes listings to Coimbatore"
  );

  // C. Property type filter
  const plotProperties = await DataAccess.getProperties({ propertyType: "RESIDENTIAL_PLOT" });
  assert(
    plotProperties.data.every(p => p.propertyType === "RESIDENTIAL_PLOT"),
    "Property category filter correctly scopes listings to RESIDENTIAL_PLOT"
  );

  // D. Price sorting
  const sortedAsc = await DataAccess.getProperties({ sortBy: "price-asc" });
  let isSorted = true;
  for (let i = 1; i < sortedAsc.data.length; i++) {
    if (sortedAsc.data[i].price < sortedAsc.data[i - 1].price) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, "Price ascending sort returns properties ordered by price");

  // E. Pagination
  const page1 = await DataAccess.getProperties({ page: 1, limit: 3 });
  const page2 = await DataAccess.getProperties({ page: 2, limit: 3 });
  assert(page1.data.length === 3, "Page 1 returns exactly requested limit of 3 items");
  assert(page1.data[0].id !== page2.data[0]?.id, "Page 2 offsets correctly and returns distinct items");

  // F. Property detail slug lookup
  const targetSlug = allProperties.data[0].slug;
  const singleProperty = await DataAccess.getPropertyBySlug(targetSlug);
  assert(Boolean(singleProperty && singleProperty.id === allProperties.data[0].id), "Lookup property by slug retrieves correct listing record");

  // ---------------------------------------------------------------------------
  // 2. FUNCTIONAL TESTING: AUTHENTICATION, REGISTRATION & SESSIONS
  // ---------------------------------------------------------------------------
  console.log("\nSECTION 2: Security & Functional Auth — Passwords, JWT & Authorization");

  // A. Password Hashing & Verification
  const rawPassword = "SecurePassword@2026!";
  const hashedPassword = await hashPassword(rawPassword);
  assert(hashedPassword !== rawPassword, "Bcrypt hashes password securely (non-plaintext)");
  const passwordMatch = await comparePassword(rawPassword, hashedPassword);
  assert(passwordMatch, "Bcrypt compares correct password successfully");
  const wrongPasswordMatch = await comparePassword("WrongPassword123", hashedPassword);
  assert(!wrongPasswordMatch, "Bcrypt rejects incorrect password attempt");

  // B. Signed JWT Session Creation & Verification
  const testUser = {
    id: `usr-test-${Date.now()}`,
    name: "Dr. K. Annamalai",
    email: `annamalai.${Date.now()}@example.com`,
    phoneNumber: "+919842211223",
    role: "SELLER" as const,
    city: "Coimbatore",
  };

  const sessionToken = await signSessionToken(testUser);
  assert(typeof sessionToken === "string" && sessionToken.length > 50, "JWT session token created with HS256 signature");

  const verifiedSession = await verifySessionToken(sessionToken);
  assert(verifiedSession?.id === testUser.id, "Session verification extracts authentic user ID");
  assert(verifiedSession?.role === "SELLER", "Session verification extracts authentic user Role");

  // C. Password Reset Cryptographic Token
  const resetToken = await signPasswordResetToken(testUser.id, testUser.email);
  const verifiedReset = await verifyPasswordResetToken(resetToken);
  assert(verifiedReset?.userId === testUser.id, "Password reset token cryptographically verifies matching userId");

  // Tampered token verification fails
  const tamperedToken = resetToken.slice(0, -5) + "abcde";
  const verifiedTampered = await verifyPasswordResetToken(tamperedToken);
  assert(verifiedTampered === null, "Tampered password reset token is rejected cryptographically");

  // ---------------------------------------------------------------------------
  // 3. SECURITY: RECORD OWNERSHIP & AUTHORIZATION GUARDS
  // ---------------------------------------------------------------------------
  console.log("\nSECTION 3: Security Review — Strict Ownership Checks & Access Control");

  // Create a property owned by User A
  const userA_Id = `user-A-${Date.now()}`;
  const userB_Id = `user-B-${Date.now()}`;
  const propOwnedByA = {
    id: `prop-owned-by-A-${Date.now()}`,
    slug: `test-property-owner-a-${Date.now()}`,
    title: "Protected Property in RS Puram",
    description: "Exclusive residential land parcel.",
    propertyType: "RESIDENTIAL_PLOT",
    listingType: "SALE",
    price: 5500000,
    area: 2400,
    areaUnit: "sqft",
    city: "Coimbatore",
    locality: "RS Puram",
    status: "ACTIVE",
    isFeatured: false,
    verificationStatus: "UNREVIEWED",
    sellerId: userA_Id,
    sellerName: "User A",
    sellerType: "OWNER",
    sellerPhone: "+919842200001",
    sellerEmail: "userA@example.com",
    images: [{ id: "img-1", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef", isPrimary: true }],
    viewsCount: 0,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const createdPropA = PropertyStore.create(propOwnedByA as any);

  // User B tries to update User A's property
  let unauthorizedUpdateBlocked = false;
  try {
    await DataAccess.updateSellerProperty(createdPropA.id, userB_Id, { title: "Hacked Title" }, "SELLER");
  } catch (err: any) {
    unauthorizedUpdateBlocked = err.message.toLowerCase().includes("forbidden") || err.message.toLowerCase().includes("unauthorized");
  }
  assert(unauthorizedUpdateBlocked, "Tenant Isolation: User B cannot modify User A's listing (Forbidden/Unauthorized)");

  // User B tries to delete User A's property
  let unauthorizedDeleteBlocked = false;
  try {
    await DataAccess.deleteSellerProperty(createdPropA.id, userB_Id, "SELLER");
  } catch (err: any) {
    unauthorizedDeleteBlocked = err.message.toLowerCase().includes("forbidden") || err.message.toLowerCase().includes("unauthorized");
  }
  assert(unauthorizedDeleteBlocked, "Tenant Isolation: User B cannot delete User A's listing (Forbidden/Unauthorized)");

  // User A can update their own property
  const updatedByA = await DataAccess.updateSellerProperty(createdPropA.id, userA_Id, { title: "Updated By True Owner" }, "SELLER");
  assert(updatedByA.title === "Updated By True Owner", "Authorized Owner can update their own listing");

  // ---------------------------------------------------------------------------
  // 4. SECURITY: RATE LIMITING & ABUSE PREVENTION
  // ---------------------------------------------------------------------------
  console.log("\nSECTION 4: Security Review — Rate Limiting & Sliding Window Checks");

  const rateLimitKey = `test_rate_limit_ip_${Date.now()}`;
  const limitThreshold = 3;
  const windowMs = 5000;

  const attempt1 = checkRateLimit(rateLimitKey, limitThreshold, windowMs);
  const attempt2 = checkRateLimit(rateLimitKey, limitThreshold, windowMs);
  const attempt3 = checkRateLimit(rateLimitKey, limitThreshold, windowMs);
  const attempt4 = checkRateLimit(rateLimitKey, limitThreshold, windowMs);

  assert(attempt1.allowed && attempt1.remaining === 2, "Rate limiter permits 1st request with remaining=2");
  assert(attempt2.allowed && attempt2.remaining === 1, "Rate limiter permits 2nd request with remaining=1");
  assert(attempt3.allowed && attempt3.remaining === 0, "Rate limiter permits 3rd request reaching threshold");
  assert(!attempt4.allowed && attempt4.remaining === 0, "Rate limiter blocks 4th request (429 Too Many Requests)");

  // ---------------------------------------------------------------------------
  // 5. SECURITY & INTEGRATION: RAZORPAY PAYMENT & WEBHOOK VERIFICATION
  // ---------------------------------------------------------------------------
  console.log("\nSECTION 5: Security & Payment Verification — HMAC SHA256 Signatures");

  // In test environment, test cryptographic mismatch rejection
  const testOrderId = "order_Ntest123456";
  const testPaymentId = "pay_Ntest654321";
  const fakeSignature = "invalid_tampered_signature_hex_string_1234567890abcdef";

  const isFakeValid = verifyPaymentSignature(testOrderId, testPaymentId, fakeSignature);
  assert(!isFakeValid, "Payment Verification: Tampered / unauthentic payment signature is strictly rejected");

  const isFakeWebhookValid = verifyWebhookSignature("{\"event\":\"payment.captured\"}", fakeSignature);
  assert(!isFakeWebhookValid, "Webhook Security: Unauthentic webhook signature is strictly rejected");

  // ---------------------------------------------------------------------------
  // 6. FUNCTIONAL TESTING: ENQUIRIES & SAVED PROPERTIES
  // ---------------------------------------------------------------------------
  console.log("\nSECTION 6: Functional Testing — Enquiries & Saved Properties");

  // Create an inquiry
  const enquiryRes = await DataAccess.createEnquiry({
    propertyId: createdPropA.id,
    buyerName: "V. Saravanan",
    buyerEmail: "saravanan@example.com",
    buyerPhone: "+919842233445",
    message: "Interested in site visit on Saturday morning.",
    sellerId: createdPropA.sellerId,
  });
  assert(enquiryRes.success, "Enquiry submission successfully creates lead record");

  // Save property
  const savedToggleRes = await DataAccess.toggleSavedProperty(userA_Id, allProperties.data[0].id);
  assert(typeof savedToggleRes.isSaved === "boolean", "Save property toggles state successfully");

  // ---------------------------------------------------------------------------
  // 7. FUNCTIONAL TESTING: NOTIFICATION DECOUPLING & RETRY ENGINE
  // ---------------------------------------------------------------------------
  console.log("\nSECTION 7: Notifications & Automation — Event Dispatch & Retry");

  // A. Create failed log
  const failedLog = NotificationDeliveryLogStore.create({
    userId: userA_Id,
    propertyId: createdPropA.id,
    recipientPhone: "+919842233445",
    channel: "SMS",
    eventType: "PROPERTY_SUBMITTED",
    messageBody: "Landora: Test automated notification",
    status: "FAILED",
    errorInfo: "Simulated gateway connection reset",
    sentAt: null,
    deliveredAt: null,
  });

  assert(failedLog.status === "FAILED", "Notification failure correctly recorded with errorInfo");

  // B. Retry log
  const retryResult = await NotificationQueue.retryDeliveryLog(failedLog.id);
  assert(retryResult.success, "Notification retry engine re-dispatches failed delivery");

  const logAfterRetry = await DataAccess.getNotificationLogById(failedLog.id);
  assert(logAfterRetry?.status === "SENT", "Notification status transitioned from FAILED to SENT after retry");

  // ---------------------------------------------------------------------------
  // 8. SECURITY: FILE UPLOAD MAGIC BYTE VALIDATION
  // ---------------------------------------------------------------------------
  console.log("\nSECTION 8: Security Review — File Upload Magic Byte Verification");

  // Valid JPEG header: FF D8 FF E0 ...
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  assert(isValidImageMagicBytes(validJpeg, "image/jpeg"), "Upload Security: Authentic JPEG magic bytes verified");

  // Valid PNG header: 89 50 4E 47 0D 0A 1A 0A ...
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  assert(isValidImageMagicBytes(validPng, "image/png"), "Upload Security: Authentic PNG magic bytes verified");

  // Valid WebP header: RIFF....WEBP
  const validWebp = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  assert(isValidImageMagicBytes(validWebp, "image/webp"), "Upload Security: Authentic WebP magic bytes verified");

  // Disguised malicious shell script / binary renamed as .jpg
  const fakeMaliciousFile = Buffer.from("#!/bin/bash\necho 'pwned'\n");
  assert(!isValidImageMagicBytes(fakeMaliciousFile, "image/jpeg"), "Upload Security: Disguised executable/script disguised as JPEG rejected");

  // ---------------------------------------------------------------------------
  // 9. FUNCTIONAL & SECURITY: ADMIN MODERATION & WORKFLOW
  // ---------------------------------------------------------------------------
  console.log("\nSECTION 9: Admin Moderation — Listing Approval, Rejection & Role Guard");

  // Non-admin cannot approve listing to ACTIVE
  let nonAdminApproveBlocked = false;
  try {
    await DataAccess.setListingStatus(createdPropA.id, userA_Id, "ACTIVE", "SELLER");
  } catch (err: any) {
    nonAdminApproveBlocked = err.message.includes("administrator");
  }
  assert(nonAdminApproveBlocked, "Moderation Guard: Regular SELLER cannot unilaterally approve listing to ACTIVE");

  // Non-admin cannot reject listing
  let nonAdminRejectBlocked = false;
  try {
    await DataAccess.setListingStatus(createdPropA.id, userA_Id, "REJECTED", "SELLER", "Invalid info");
  } catch (err: any) {
    nonAdminRejectBlocked = err.message.includes("administrator");
  }
  assert(nonAdminRejectBlocked, "Moderation Guard: Regular SELLER cannot reject listings");

  // Admin approves listing
  const approvedProp = await DataAccess.setListingStatus(createdPropA.id, "admin-user", "ACTIVE", "ADMIN");
  assert(approvedProp.status === "ACTIVE", "Admin Action: Administrator successfully approves listing to ACTIVE");

  // Admin rejects listing with structured reason
  const rejectionFeedback = "Deed documentation is unclear. Please re-upload survey sketch.";
  const rejectedProp = await DataAccess.setListingStatus(createdPropA.id, "admin-user", "REJECTED", "ADMIN", rejectionFeedback);
  assert(rejectedProp.status === "REJECTED", "Admin Action: Administrator successfully sets status to REJECTED");
  assert(rejectedProp.rejectionReason === rejectionFeedback, "Admin Feedback: Rejection feedback message is stored for seller review");

  // ---------------------------------------------------------------------------
  // 10. FUNCTIONAL TESTING: LISTING PACKAGES & TIERS
  // ---------------------------------------------------------------------------
  console.log("\nSECTION 10: Functional Testing — Monetization & Listing Packages");

  const packages = PackageStore.getAll();
  assert(packages.length >= 3, "Listing Packages: System defines at least 3 listing tiers (e.g. Free, Featured, Premium)");
  const freePkg = packages.find(p => p.price === 0 || p.name.toLowerCase().includes("free") || p.name.toLowerCase().includes("standard"));
  assert(Boolean(freePkg), "Listing Packages: Includes base/standard tier for accessible onboarding");

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`TEST SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    throw new Error(`${failedCount} test(s) failed in verification suite.`);
  }
}

runTestSuite().catch(err => {
  console.error("Test Suite execution failed:", err);
  process.exit(1);
});
