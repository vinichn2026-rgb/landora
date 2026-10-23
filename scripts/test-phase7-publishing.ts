import { 
  hashPassword, 
  signSessionToken 
} from "../src/lib/auth";
import { DataAccess } from "../src/lib/data-access";
import { PropertyItem } from "../src/types";

async function runPublishingTests() {
  console.log("===============================================================");
  console.log("   LANDORA PHASE 7: PROPERTY PUBLISHING & MODERATION SUITE    ");
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

  // 1. Owner Registration
  console.log("--- 1. Owner / Seller Account Registration ---");
  const ownerEmail = `owner_phase7_${Date.now()}@landora.in`;
  const ownerPasswordHash = await hashPassword("OwnerPass@2026");
  const ownerUser = await DataAccess.createUser({
    name: "K. R. Sivakumar",
    email: ownerEmail,
    passwordHash: ownerPasswordHash,
    role: "SELLER",
    phoneNumber: "+91 94433 99881",
    city: "Coimbatore"
  });

  assert(ownerUser.id.length > 0, "Owner registered with unique user ID");
  assert(ownerUser.role === "SELLER", "Owner assigned SELLER role");

  const sessionToken = await signSessionToken({
    id: ownerUser.id,
    name: ownerUser.name,
    email: ownerUser.email,
    phoneNumber: ownerUser.phoneNumber,
    role: ownerUser.role,
    city: "Coimbatore"
  });
  assert(typeof sessionToken === "string", "Owner session JWT token created");

  // 2. Draft Listing Creation
  console.log("\n--- 2. Save Listing as Draft ---");
  const draftProp = await DataAccess.createSellerProperty({
    title: "Draft 2 Acres Farmland near Pollachi Canal",
    description: "Initial draft recording land details and borewell specifications.",
    listingType: "SALE",
    propertyType: "AGRICULTURAL_LAND",
    price: 3500000,
    pricePerUnit: "₹17.5 Lac/acre",
    area: 2,
    areaUnit: "acre",
    address: "SF No 245, Pollachi Road",
    locality: "Pollachi",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pinCode: "642001",
    approvalStatus: "Seller Declared",
    status: "DRAFT",
    isFeatured: false,
    verificationStatus: "UNREVIEWED",
    sellerId: ownerUser.id,
    sellerName: ownerUser.name,
    sellerType: "OWNER",
    sellerPhone: "+91 94433 99881",
    sellerEmail: ownerUser.email,
    amenities: ["Borewell with Submersible Pump", "Tar Road Access"],
    images: [
      { id: "img-1", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef", isPrimary: true }
    ]
  });

  assert(draftProp.status === "DRAFT", "Property created with DRAFT status");
  const sellerListingsInitial = await DataAccess.getSellerProperties(ownerUser.id);
  assert(sellerListingsInitial.some(p => p.id === draftProp.id), "Draft listing visible in seller's inventory");

  // Check public search
  const publicSearch1 = await DataAccess.getProperties({ city: "Coimbatore" });
  assert(!publicSearch1.data.some(p => p.id === draftProp.id), "DRAFT listing is NOT visible in public search results");

  // 3. Multi-Step Submission for Moderation
  console.log("\n--- 3. Property Submission for Moderation (Status: PENDING) ---");
  const moderationProp = await DataAccess.createSellerProperty({
    title: "1,950 Sq.Ft DTCP Approved Corner Plot in Saravanampatti IT Corridor",
    description: "East facing premium residential corner plot located 500m from Saravanampatti IT Park. Clear title, 30ft tar road, underground drainage, and immediate patta transfer.",
    listingType: "SALE",
    propertyType: "RESIDENTIAL_PLOT",
    price: 5200000,
    pricePerUnit: "₹2,666/sqft",
    area: 1950,
    areaUnit: "sqft",
    roadWidthFt: 30,
    plotDimensions: "30 x 65 ft",
    facing: "East",
    surveyNumber: "SF 188/3B",
    landClassification: "DTCP Approved",
    documentStatus: "Clear Title / Single Owner",
    approvalStatus: "DTCP Approved Layout No 44/2021",
    address: "Plot 12, Green Avenue, Saravanampatti",
    locality: "Saravanampatti",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pinCode: "641035",
    status: "PENDING",
    isFeatured: false,
    verificationStatus: "UNREVIEWED",
    sellerId: ownerUser.id,
    sellerName: ownerUser.name,
    sellerType: "OWNER",
    sellerPhone: "+91 94433 99881",
    sellerEmail: ownerUser.email,
    amenities: ["30ft Tar Road", "EB Power Supply", "Athikadavu Water", "Street Lights"],
    images: [
      { id: "img-corner-1", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef", isPrimary: true, caption: "Front View Corner" },
      { id: "img-corner-2", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f", isPrimary: false, caption: "30ft Tar Road" }
    ]
  });

  assert(moderationProp.status === "PENDING", "Submitted listing created with PENDING moderation status");
  assert(moderationProp.images.length === 2, "Multiple images persisted on property record");

  // Verify that unmoderated/pending listings NEVER show up in public search results
  const publicSearch2 = await DataAccess.getProperties({ city: "Coimbatore" });
  assert(!publicSearch2.data.some(p => p.id === moderationProp.id), "PENDING listing is NOT visible in public search results prior to approval");

  // 4. Duplicate Submission Prevention
  console.log("\n--- 4. Duplicate Submission Protection ---");
  try {
    await DataAccess.createSellerProperty({
      title: "1,950 Sq.Ft DTCP Approved Corner Plot in Saravanampatti IT Corridor",
      description: "East facing premium residential corner plot.",
      listingType: "SALE",
      propertyType: "RESIDENTIAL_PLOT",
      price: 5200000,
      pricePerUnit: "₹2,666/sqft",
      area: 1950,
      areaUnit: "sqft",
      address: "Plot 12, Green Avenue, Saravanampatti",
      locality: "Saravanampatti",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pinCode: "641035",
      approvalStatus: "Seller Declared",
      status: "PENDING",
      isFeatured: false,
      verificationStatus: "UNREVIEWED",
      sellerId: ownerUser.id,
      sellerName: ownerUser.name,
      sellerType: "OWNER",
      sellerPhone: "+91 94433 99881",
      sellerEmail: ownerUser.email,
      amenities: [],
      images: []
    });
    assert(false, "Duplicate submission should have thrown an error");
  } catch (err: any) {
    assert(err.message.includes("Duplicate listing detected"), "Duplicate submission correctly prevented with clear message");
  }

  // 5. Ownership Enforcement in Backend
  console.log("\n--- 5. Ownership Enforcement in Backend ---");
  const anotherUser = "intruder-user-999";
  try {
    await DataAccess.updateSellerProperty(moderationProp.id, anotherUser, {
      price: 1000000
    });
    assert(false, "Unauthorized user update should have thrown");
  } catch (err: any) {
    assert(err.message.includes("Unauthorized"), "Unauthorized edit attempt rejected with 403 / security error");
  }

  // 6. Owner Modifies Listing Details
  console.log("\n--- 6. Owner Listing Modification ---");
  const updatedProp = await DataAccess.updateSellerProperty(moderationProp.id, ownerUser.id, {
    price: 5100000,
    pricePerUnit: "₹2,615/sqft",
    roadWidthFt: 40,
    description: "Updated: 40ft Tar Road widened by Coimbatore Corporation. Immediate site visit available."
  });
  assert(updatedProp.price === 5100000, "Owner successfully updated property price");
  assert(updatedProp.roadWidthFt === 40, "Owner successfully updated road width");

  // 7. Moderation Approval Workflow
  console.log("\n--- 7. Moderation Approval by Administrator ---");
  const adminUser = await DataAccess.findUserByEmail("admin@landora.in");
  assert(adminUser !== null && adminUser.role === "ADMIN", "Admin moderation account exists");

  const approvedProp = await DataAccess.setListingStatus(
    moderationProp.id,
    adminUser!.id,
    "ACTIVE",
    adminUser!.role
  );
  assert(approvedProp.status === "ACTIVE", "Administrator successfully approved listing to ACTIVE");

  // 8. Public Search Verification (Property Now Appears in Search)
  console.log("\n--- 8. Public Search Results Verification ---");
  const publicSearchAfterApproval = await DataAccess.getProperties({ city: "Coimbatore", limit: 50 });
  const foundInPublicSearch = publicSearchAfterApproval.data.find(p => p.id === moderationProp.id);
  assert(Boolean(foundInPublicSearch), "Approved property immediately appears in public search results");
  assert(foundInPublicSearch?.title.includes("Saravanampatti") === true, "Property title matches in public search");
  assert(foundInPublicSearch?.price === 5100000, "Updated property price reflected in public search");

  // 9. Deactivation & Reactivation Workflow
  console.log("\n--- 9. Owner Deactivates & Reactivates Listing ---");
  const deactivatedProp = await DataAccess.setListingStatus(
    moderationProp.id,
    ownerUser.id,
    "DEACTIVATED",
    ownerUser.role
  );
  assert(deactivatedProp.status === "DEACTIVATED", "Listing marked as DEACTIVATED");

  const publicSearchDeactivated = await DataAccess.getProperties({ city: "Coimbatore", limit: 50 });
  assert(!publicSearchDeactivated.data.some(p => p.id === moderationProp.id), "Deactivated property immediately hidden from public search");

  // Reactivate
  const reactivatedProp = await DataAccess.setListingStatus(
    moderationProp.id,
    ownerUser.id,
    "ACTIVE",
    adminUser!.role
  );
  assert(reactivatedProp.status === "ACTIVE", "Listing restored to ACTIVE");

  // 10. Buyer Enquiry & Seller Response Workflow
  console.log("\n--- 10. Buyer Enquiry & Seller Response Workflow ---");
  const enquiryResult = await DataAccess.createEnquiry({
    propertyId: moderationProp.id,
    buyerName: "V. Anandhan",
    buyerEmail: "anandhan.v@gmail.com",
    buyerPhone: "+91 98422 11223",
    message: "I am interested in this Saravanampatti corner plot. Is the DTCP approval number 44/2021 verified? Can we visit this Sunday morning?",
    sellerId: ownerUser.id
  });
  assert(enquiryResult.success === true, "Buyer submitted enquiry on seller's property");

  const sellerEnquiries = await DataAccess.getSellerEnquiries(ownerUser.id);
  assert(sellerEnquiries.length > 0, "Enquiry received in seller's inbox");
  assert(sellerEnquiries[0].buyerName === "V. Anandhan", "Enquiry buyer name matches");

  // Seller responds
  const respondResult = await DataAccess.respondToSellerEnquiry(
    sellerEnquiries[0].id,
    ownerUser.id,
    "Yes, DTCP approval is clear and verified. We can meet at the Saravanampatti site on Sunday at 10:30 AM. My contact is +91 94433 99881."
  );
  assert(respondResult.status === "CONTACTED", "Enquiry status updated to CONTACTED");
  assert(respondResult.sellerReply.includes("Sunday at 10:30 AM"), "Seller response recorded");

  // 11. Seller Metrics Calculation
  console.log("\n--- 11. Seller Metrics Calculation ---");
  const metrics = await DataAccess.getSellerMetrics(ownerUser.id);
  assert(metrics.total >= 2, "Seller metrics count total listings (draft + published)");
  assert(metrics.active >= 1, "Seller metrics count active listings");
  assert(metrics.enquiriesCount >= 1, "Seller metrics count incoming buyer enquiries");

  console.log("\n===============================================================");
  console.log(`  ALL ${total} OF ${total} TESTS PASSED! (100% SUCCESS) `);
  console.log("===============================================================");
}

runPublishingTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
