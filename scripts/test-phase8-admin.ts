import { 
  hashPassword, 
  signSessionToken,
  verifySessionToken
} from "../src/lib/auth";
import { DataAccess } from "../src/lib/data-access";
import { UserRole } from "../src/types";

async function runAdminDashboardTests() {
  console.log("===============================================================");
  console.log("     LANDORA PHASE 8: ADMINISTRATOR DASHBOARD SUITE           ");
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

  // --- 1. Access Control & Admin Role Verification ---
  console.log("--- 1. Access Control & Role Enforcement ---");

  // Non-admin session check
  const buyerUser = {
    id: "buyer-test-01",
    name: "Regular Buyer",
    email: "regular.buyer@gmail.com",
    role: "BUYER" as UserRole,
  };
  const buyerToken = await signSessionToken(buyerUser);
  const buyerVerified = await verifySessionToken(buyerToken);
  assert(buyerVerified !== null, "Buyer session token signs & verifies properly");
  assert(buyerVerified?.role !== "ADMIN", "Buyer is strictly NOT an ADMIN (role = BUYER)");

  // Admin session check
  const adminUser = {
    id: "admin-master-01",
    name: "Landora Super Admin",
    email: "admin@landora.in",
    role: "ADMIN" as UserRole,
  };
  const adminToken = await signSessionToken(adminUser);
  const adminVerified = await verifySessionToken(adminToken);
  assert(adminVerified !== null && adminVerified.role === "ADMIN", "Admin session token has valid ADMIN role");

  // --- 2. Dashboard Overview Metrics ---
  console.log("\n--- 2. Dashboard Overview Metrics ---");
  const metrics = await DataAccess.getAdminMetrics();
  assert(typeof metrics.totalUsers === "number" && metrics.totalUsers >= 0, "Metrics returns valid totalUsers count");
  assert(typeof metrics.activeListings === "number", "Metrics returns activeListings count");
  assert(typeof metrics.pendingApprovals === "number", "Metrics returns pendingApprovals count");
  assert(typeof metrics.rejectedListings === "number", "Metrics returns rejectedListings count");
  assert(typeof metrics.reportedListings === "number", "Metrics returns reportedListings count");
  assert(typeof metrics.recentEnquiries === "number", "Metrics returns recentEnquiries count");
  assert(typeof metrics.paymentMetrics?.totalAmount === "number", "Metrics returns paymentMetrics with totalAmount");

  // --- 3. Property Moderation Workflow ---
  console.log("\n--- 3. Property Moderation Workflow ---");
  // 3a. Create a PENDING property
  const pendingProperty = await DataAccess.createSellerProperty({
    title: "15 Cents Residential Plot near Saravanampatti IT Corridor",
    description: "Clear title residential land ready for immediate villa construction.",
    listingType: "SALE",
    propertyType: "RESIDENTIAL_PLOT",
    price: 4500000,
    area: 6534,
    areaUnit: "SQ_FT",
    address: "SF 142, Sathy Road",
    city: "Coimbatore",
    locality: "Saravanampatti",
    state: "Tamil Nadu",
    pinCode: "641035",
    sellerId: "user-seller-01",
    sellerName: "K. R. Sivakumar",
    sellerPhone: "+91 94433 99881",
    sellerType: "OWNER",
    status: "PENDING",
  } as any);
  assert(pendingProperty.status === "PENDING", "Property created in PENDING moderation status");

  // 3b. Approve listing
  const approvedProperty = await DataAccess.moderateProperty(
    pendingProperty.id,
    "APPROVE",
    undefined,
    adminUser.name
  );
  assert(approvedProperty?.status === "ACTIVE", "Moderator successfully approved property to ACTIVE status");

  // 3c. Toggle featured on homepage
  const featuredProperty = await DataAccess.togglePropertyFeatured(
    pendingProperty.id,
    true,
    adminUser.name
  );
  assert(featuredProperty?.isFeatured === true, "Admin successfully promoted property to Featured");

  // 3d. Create another property and reject with reason
  const rejectTargetProp = await DataAccess.createSellerProperty({
    title: "Incomplete Encroached Plot on Highway",
    description: "Land without clear parent documents.",
    listingType: "SALE",
    propertyType: "COMMERCIAL_PLOT",
    price: 8000000,
    area: 5000,
    areaUnit: "SQ_FT",
    address: "NH 544",
    city: "Salem",
    locality: "Kandhampatti",
    state: "Tamil Nadu",
    pinCode: "636005",
    sellerId: "user-seller-02",
    sellerName: "Dubious Seller",
    sellerPhone: "+91 98989 00000",
    sellerType: "OWNER",
    status: "PENDING",
  } as any);
  const rejectionReason = "Missing parent deed encumbrance certificate (EC) from sub-registrar.";
  const rejectedProperty = await DataAccess.moderateProperty(
    rejectTargetProp.id,
    "REJECT",
    rejectionReason,
    adminUser.name
  );
  assert(rejectedProperty?.status === "REJECTED", "Property status changed to REJECTED");
  assert(rejectedProperty?.rejectionReason === rejectionReason, "Rejection reason saved correctly");

  // 3e. Deactivate listing
  const deactivatedProperty = await DataAccess.moderateProperty(
    pendingProperty.id,
    "DEACTIVATE",
    undefined,
    adminUser.name
  );
  assert(deactivatedProperty?.status === "DEACTIVATED", "Listing successfully deactivated by admin");

  // --- 4. User Management & Governance ---
  console.log("\n--- 4. User Governance (Roles & Suspension) ---");
  const testUser = await DataAccess.createUser({
    name: "M. Thangavel",
    email: `thangavel_${Date.now()}@gmail.com`,
    passwordHash: await hashPassword("UserPass@123"),
    role: "BUYER",
    city: "Tiruppur",
  });
  assert(testUser.role === "BUYER", "Created test buyer account");

  // 4a. Update role to AGENT
  const updatedUserRole = await DataAccess.updateUserRole(
    testUser.id,
    "AGENT",
    adminUser.name
  );
  assert(updatedUserRole?.role === "AGENT", "Admin successfully promoted user role to AGENT");

  // 4b. Suspend account
  const suspendedUser = await DataAccess.toggleUserSuspension(
    testUser.id,
    true,
    adminUser.name
  );
  assert(suspendedUser?.isSuspended === true, "Admin successfully suspended user account");

  // 4c. Reactivate account
  const reactivatedUser = await DataAccess.toggleUserSuspension(
    testUser.id,
    false,
    adminUser.name
  );
  assert(reactivatedUser?.isSuspended === false, "Admin successfully reactivated suspended user");

  // --- 5. Location Hubs Management ---
  console.log("\n--- 5. Location Hubs Management ---");
  const newLoc = await DataAccess.createAdminLocation(
    {
      city: "Tiruchirappalli",
      state: "Tamil Nadu",
      popularLocalities: ["Thillai Nagar", "KK Nagar", "Srirangam", "Cantonment"],
      count: 75,
      isActive: true,
    },
    adminUser.name
  );
  assert(newLoc.city === "Tiruchirappalli", "Created new location hub Tiruchirappalli");

  const updatedLoc = await DataAccess.updateAdminLocation(
    newLoc.id,
    { count: 120 },
    adminUser.name
  );
  assert(updatedLoc?.count === 120, "Updated location listing count");

  const deletedLoc = await DataAccess.deleteAdminLocation(newLoc.id, adminUser.name);
  assert(deletedLoc === true, "Successfully deleted test location hub");

  // --- 6. Listing Packages Configuration ---
  console.log("\n--- 6. Listing Packages Configuration ---");
  const packages = await DataAccess.getAdminPackages();
  assert(packages.length > 0, `Loaded ${packages.length} listing packages`);

  const targetPkg = packages[0];
  const originalPrice = targetPkg.price;
  const updatedPkg = await DataAccess.updateAdminPackage(
    targetPkg.id,
    { price: originalPrice === 0 ? 0 : originalPrice + 100 },
    adminUser.name
  );
  assert(updatedPkg !== null, "Admin updated package configuration successfully");

  // --- 7. Content & Copy Management ---
  console.log("\n--- 7. Content & Copy Management ---");
  const contentList = await DataAccess.getAdminContent();
  assert(contentList.length > 0, `Loaded ${contentList.length} content banners`);

  const updatedHero = await DataAccess.updateAdminContent(
    "hero_headline",
    { title: "Find the Right Property. Build Your Future in Tamil Nadu." },
    adminUser.name
  );
  assert(Boolean(updatedHero?.title.includes("Tamil Nadu")), "Admin updated homepage hero title");

  // --- 8. Payment Records & Gateway Disclosure ---
  console.log("\n--- 8. Payments Ledger & Gateway Disclosure ---");
  const paymentData = await DataAccess.getAdminPayments();
  assert(Array.isArray(paymentData.payments), "Payments ledger returns array of records");
  assert(paymentData.metrics.currency === "INR", "Payments metric reports INR currency");
  assert(
    paymentData.metrics.gatewayStatus.includes("Sandbox") ||
    paymentData.metrics.gatewayStatus.includes("Test"),
    "Transparently reports Sandbox / Test Mode per user instructions"
  );

  // --- 9. Audit Trail Verification ---
  console.log("\n--- 9. Administrative Audit Trail Verification ---");
  const auditLogs = await DataAccess.getAdminAuditLogs();
  assert(auditLogs.length > 0, `Audit store contains ${auditLogs.length} audit records`);

  const approveLog = auditLogs.find((l) => l.action.includes("APPROVE"));
  assert(approveLog !== undefined, "Audit log recorded APPROVE event");

  const rejectLog = auditLogs.find((l) => l.action.includes("REJECT"));
  assert(rejectLog !== undefined, "Audit log recorded REJECT event with reason");

  const roleLog = auditLogs.find((l) => l.action.includes("ROLE"));
  assert(roleLog !== undefined, "Audit log recorded UPDATE_ROLE event");

  const suspendLog = auditLogs.find((l) => l.action.includes("SUSPEND"));
  assert(suspendLog !== undefined, "Audit log recorded SUSPEND_USER event");

  const locLog = auditLogs.find((l) => l.action.includes("LOCATION"));
  assert(locLog !== undefined, "Audit log recorded LOCATION event");

  console.log("\n===============================================================");
  console.log(`  ALL ${passed} / ${total} TESTS PASSED FOR PHASE 8 (ADMIN DASHBOARD)`);
  console.log("===============================================================");
}

runAdminDashboardTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
