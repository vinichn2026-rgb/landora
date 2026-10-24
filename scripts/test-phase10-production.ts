import { DataAccess } from "../src/lib/data-access";
import { 
  hashPassword, 
  comparePassword, 
  signSessionToken, 
  verifySessionToken 
} from "../src/lib/auth";
import { 
  createRazorpayOrder, 
  verifyPaymentSignature, 
  verifyWebhookSignature,
  generateTestSignature,
  generateTestWebhookSignature
} from "../src/lib/razorpay";
import {
  sendRegistrationVerificationEmail,
  sendPasswordResetEmail,
  sendListingSubmittedEmail,
  sendListingModerationEmail,
  sendNewEnquiryEmail,
  sendEnquiryConfirmationEmail,
  sendListingExpiryReminderEmail,
  sendPaymentStatusEmail
} from "../src/lib/email";
import { checkRateLimit } from "../src/lib/rate-limit";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import { UserRole } from "../src/types";

async function runProductionReadinessSuite() {
  console.log("===============================================================");
  console.log("  LANDORA PHASE 10: PRODUCTION READINESS & VERIFICATION SUITE  ");
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
  // 1. HOMEPAGE & CORE PROPERTY DISCOVERY
  // =========================================================================
  console.log("--- 1. Homepage & Property Discovery ---");
  const initialResult = await DataAccess.getProperties({ limit: 12 });
  const initialProps = initialResult.data;
  assert(initialProps.length > 0, `Marketplace has active inventory (${initialProps.length} initial properties)`);

  const locations = await DataAccess.getAdminLocations();
  assert(locations.length >= 5, `Platform supports ${locations.length} major Indian city hubs`);

  const cbeLocation = locations.find((l) => l.city.toLowerCase() === "coimbatore");
  assert(cbeLocation !== undefined && cbeLocation.popularLocalities.length > 0, "Coimbatore seed location has popular localities");

  // =========================================================================
  // 2. MULTI-FACET SEARCH, FILTERS, SORTING & PAGINATION
  // =========================================================================
  console.log("\n--- 2. Search, Multi-Facet Filters, Sorting & Pagination ---");
  
  // Filter by City
  const cbeResult = await DataAccess.getProperties({ city: "Coimbatore" });
  const cbeProps = cbeResult.data;
  assert(cbeProps.every((p) => p.city.toLowerCase() === "coimbatore"), "City filter returns only Coimbatore properties");

  // Filter by Category
  const plotResult = await DataAccess.getProperties({ propertyType: "RESIDENTIAL_PLOT" });
  const plotProps = plotResult.data;
  assert(plotProps.every((p) => p.propertyType === "RESIDENTIAL_PLOT"), "Category filter returns only RESIDENTIAL_PLOT");

  // Filter by Price Range
  const priceResult = await DataAccess.getProperties({ minPrice: 2000000, maxPrice: 10000000 });
  const priceProps = priceResult.data;
  assert(
    priceProps.every((p) => p.price >= 2000000 && p.price <= 10000000),
    "Budget filter correctly bounds listings between ₹20L and ₹1Cr"
  );

  // Sorting
  const sortedResult = await DataAccess.getProperties({ sortBy: "price_asc" });
  const sortedPrice = sortedResult.data;
  let isPriceSorted = true;
  for (let i = 1; i < sortedPrice.length; i++) {
    if (sortedPrice[i].price < sortedPrice[i - 1].price) isPriceSorted = false;
  }
  assert(isPriceSorted, "Listings properly sorted in ascending order of price");

  // =========================================================================
  // 3. PROPERTY DETAIL PAGES & SLUG RESOLUTION
  // =========================================================================
  console.log("\n--- 3. Property Detail Pages & Metadata ---");
  const targetProperty = initialProps[0];
  const fetchedBySlug = await DataAccess.getPropertyBySlug(targetProperty.slug);
  assert(fetchedBySlug !== null, `Property successfully resolved by slug: ${targetProperty.slug}`);
  assert(fetchedBySlug?.id === targetProperty.id, "Resolved property ID matches catalog record");
  assert(Boolean(fetchedBySlug?.images && fetchedBySlug.images.length > 0), "Property details contain gallery images");

  // =========================================================================
  // 4. AUTHENTICATION, PASSWORD SECURITY & ROLES
  // =========================================================================
  console.log("\n--- 4. Authentication, Password Security & Session Tokens ---");
  
  // Password hashing
  const rawPassword = "SuperSecurePassword@2026";
  const hashed = await hashPassword(rawPassword);
  assert(hashed !== rawPassword, "Password hash is encrypted via bcrypt");
  assert(await comparePassword(rawPassword, hashed), "Password successfully validates against hash");
  assert((await comparePassword("WrongPassword", hashed)) === false, "Incorrect password rejected");

  // Session JWT
  const userPayload = {
    id: "usr-prod-001",
    name: "Aadhirai Krishnan",
    email: "aadhirai@gmail.com",
    role: "BUYER" as UserRole,
  };
  const token = await signSessionToken(userPayload);
  assert(typeof token === "string" && token.split(".").length === 3, "Signed session token has 3 JWT segments");

  const verified = await verifySessionToken(token);
  assert(verified !== null && verified.id === userPayload.id, "Session verified and user ID extracted");
  assert(verified?.role === "BUYER", "User role preserved in secure JWT payload");

  // =========================================================================
  // 5. SAVED PROPERTIES & DEDUPLICATION
  // =========================================================================
  console.log("\n--- 5. Saved Properties & Persistence ---");
  const testUserId = `usr_fav_${Date.now()}`;
  
  const toggle1 = await DataAccess.toggleSavedProperty(testUserId, targetProperty.id);
  assert(toggle1.isSaved === true, "Property successfully saved to user favourites");

  const savedList = await DataAccess.getUserSavedProperties(testUserId);
  assert(savedList.some((p) => p.id === targetProperty.id), "Saved property retrieved from user favourites");

  // Toggle off to unsave
  const toggle2 = await DataAccess.toggleSavedProperty(testUserId, targetProperty.id);
  assert(toggle2.isSaved === false, "Property successfully unsaved from favourites");

  const unsavedList = await DataAccess.getUserSavedProperties(testUserId);
  assert(!unsavedList.some((p) => p.id === targetProperty.id), "Property removed from favourites");

  // =========================================================================
  // 6. ENQUIRY SUBMISSION & DIRECT NOTIFICATIONS
  // =========================================================================
  console.log("\n--- 6. Enquiry Submission & Seller Alerts ---");
  const enquiryResult = await DataAccess.createEnquiry({
    propertyId: targetProperty.id,
    buyerName: "K. Mohanraj",
    buyerEmail: "mohanraj@gmail.com",
    buyerPhone: "+91 98421 11223",
    message: "Interested in site inspection this weekend.",
    sellerId: targetProperty.sellerId,
  });
  assert(enquiryResult.success === true, "Buyer enquiry created successfully");

  // =========================================================================
  // 7. PROPERTY PUBLISHING, OWNERSHIP CHECK & EDITING
  // =========================================================================
  console.log("\n--- 7. Property Publishing & Record Ownership Checks ---");
  const newListing = await DataAccess.createSellerProperty({
    title: "10 Cents Residential Land in Thudiyalur",
    description: "East facing plot with tar road access and clear parent documents.",
    listingType: "SALE",
    propertyType: "RESIDENTIAL_PLOT",
    price: 3800000,
    area: 4356,
    areaUnit: "SQ_FT",
    address: "SF 204, Thudiyalur Main Road",
    city: "Coimbatore",
    locality: "Thudiyalur",
    state: "Tamil Nadu",
    pinCode: "641034",
    sellerId: "user-seller-01",
    sellerName: "K. R. Sivakumar",
    sellerPhone: "+91 94433 99881",
    sellerType: "OWNER",
    status: "PENDING",
  } as any);
  assert(newListing.status === "PENDING", "Listing submitted with PENDING moderation status");

  // Authorized edit
  const updatedListing = await DataAccess.updateSellerProperty(
    newListing.id,
    "user-seller-01",
    { price: 3900000 }
  );
  assert(updatedListing.price === 3900000, "Authorized owner successfully updated listing price");

  // Unauthorized edit attempt by different user
  let unauthorizedBlocked = false;
  try {
    await DataAccess.updateSellerProperty(newListing.id, "attacker-user-999", { price: 1000 });
  } catch (err: any) {
    unauthorizedBlocked = err.message.includes("Unauthorized");
  }
  assert(unauthorizedBlocked, "Unauthorized modification attempt strictly blocked by ownership check");

  // =========================================================================
  // 8. ADMIN MODERATION & AUDIT TRAIL
  // =========================================================================
  console.log("\n--- 8. Admin Moderation & Audit Trail ---");
  const approved = await DataAccess.moderateProperty(
    newListing.id,
    "APPROVE",
    undefined,
    "Super Administrator"
  );
  assert(approved?.status === "ACTIVE", "Administrator approved listing to ACTIVE status");

  const auditLogs = await DataAccess.getAdminAuditLogs();
  assert(auditLogs.length > 0, "System audit log trail contains administrative records");
  assert(auditLogs.some((l) => l.entityId === newListing.id), "Audit log recorded moderation action for listing");

  // =========================================================================
  // 9. LISTING PACKAGES & REVENUE TIERS
  // =========================================================================
  console.log("\n--- 9. Listing Packages Configuration ---");
  const packages = await DataAccess.getAdminPackages();
  assert(packages.some((p) => p.price === 0), "Free basic package available");
  assert(packages.some((p) => p.isFeatured && p.price > 0), "Featured boost package available");

  // =========================================================================
  // 10. PAYMENTS: SERVER ORDERS, SIGNATURE VERIFICATION & IDEMPOTENCY
  // =========================================================================
  console.log("\n--- 10. Payment Gateway, Verification & Webhook ---");
  const testOrder = await createRazorpayOrder({
    amountInInr: 1499,
    receipt: "rcpt_phase10_01",
  });
  assert(testOrder.amount === 149900, "Paise amount correctly calculated for order");

  await DataAccess.createPaymentAttempt({
    userId: "user-seller-01",
    userName: "K. R. Sivakumar",
    userEmail: "seller@landora.in",
    packageId: "pkg-featured",
    packageName: "Featured Plot Boost",
    amount: 1499,
    currency: "INR",
    orderId: testOrder.id,
    propertyId: newListing.id,
  });

  // Signature verification
  const testPaymentId = `pay_p10_${Date.now()}`;
  const validSig = generateTestSignature(testOrder.id, testPaymentId);
  assert(
    verifyPaymentSignature(testOrder.id, testPaymentId, validSig) === true,
    "Valid HMAC SHA256 payment signature verified"
  );
  assert(
    verifyPaymentSignature(testOrder.id, testPaymentId, "bad_signature") === false,
    "Tampered payment signature rejected"
  );

  const paymentCompletion = await DataAccess.completePayment(testOrder.id, testPaymentId, validSig);
  assert(paymentCompletion.payment.status === "SUCCESS", "Payment recorded as SUCCESS");

  // Idempotency
  const dupCompletion = await DataAccess.completePayment(testOrder.id, testPaymentId, validSig);
  assert(dupCompletion.alreadyProcessed === true, "Duplicate payment verified as idempotent");

  // =========================================================================
  // 11. IN-APP & EMAIL NOTIFICATION VERIFICATION
  // =========================================================================
  console.log("\n--- 11. In-App Notifications & Email Verification ---");
  const notif = await DataAccess.createNotification({
    userId: "user-seller-01",
    title: "Production Ready",
    message: "Landora system verification completed successfully.",
    type: "SYSTEM_ALERT",
    link: "/dashboard",
  });
  assert(notif.isRead === false, "In-app notification created as unread");

  // Test email template render
  const emailDispatch = await sendPaymentStatusEmail(
    "seller@landora.in",
    "K. R. Sivakumar",
    "SUCCESS",
    "Featured Plot Boost",
    1499,
    testPaymentId
  );
  assert(emailDispatch.event === "PAYMENT_CONFIRMATION", "Email confirmation template generated");

  // =========================================================================
  // 12. RATE LIMITING & ABUSE PROTECTION
  // =========================================================================
  console.log("\n--- 12. Rate Limiting Protection ---");
  const testRateKey = `ratetest:${Date.now()}`;
  // 3 requests allowed in 60s
  const r1 = checkRateLimit(testRateKey, 3, 60000);
  const r2 = checkRateLimit(testRateKey, 3, 60000);
  const r3 = checkRateLimit(testRateKey, 3, 60000);
  const r4 = checkRateLimit(testRateKey, 3, 60000);

  assert(r1.allowed === true && r2.allowed === true && r3.allowed === true, "Requests within threshold allowed");
  assert(r4.allowed === false, "4th request exceeded threshold and was rate limited (429)");

  // =========================================================================
  // 13. SEO: ROBOTS.TXT & SITEMAP GENERATION
  // =========================================================================
  console.log("\n--- 13. SEO: Robots.txt & Dynamic Sitemap ---");
  const robotsConfig = robots();
  assert(Array.isArray(robotsConfig.rules), "Robots configuration contains indexing rules");
  assert(
    (robotsConfig.rules as any)[0].disallow.includes("/admin/"),
    "Robots.txt protects private /admin/ routes from search indexing"
  );
  assert(Boolean(robotsConfig.sitemap), "Robots.txt references sitemap XML endpoint");

  const sitemapEntries = await sitemap();
  assert(sitemapEntries.length >= 10, `Dynamic sitemap generated ${sitemapEntries.length} URL entries`);
  assert(sitemapEntries.some((s) => s.url.includes("/properties/")), "Sitemap contains dynamic property listing URLs");

  console.log("\n===============================================================");
  console.log(` ALL ${passed} / ${total} TESTS PASSED! LANDORA IS PRODUCTION READY`);
  console.log("===============================================================");
}

runProductionReadinessSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
