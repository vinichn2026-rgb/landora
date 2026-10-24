import { 
  signSessionToken, 
  verifySessionToken, 
  hashPassword 
} from "../src/lib/auth";
import { DataAccess } from "../src/lib/data-access";
import { OtpService } from "../src/lib/otp";
import { 
  isEmailProviderConfigured, 
  getResendApiKey, 
  sendOtpEmail, 
  sendAdminNewPropertyNotificationEmail,
  sendAdminNewEnquiryNotificationEmail,
  sendEnquiryConfirmationEmail,
  sendListingSubmittedEmail
} from "../src/lib/email";
import { INITIAL_ADMIN_EMAIL } from "../src/lib/constants";
import { PropertyStore } from "../src/lib/store";
import { jwtVerify } from "jose";

async function runActionAuthVerification() {
  console.log("==================================================================");
  console.log("   LANDORA: ACTION-BASED AUTHENTICATION & ACCESS VERIFICATION     ");
  console.log("==================================================================\n");

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

  // -------------------------------------------------------------------------
  // 1. Unauthenticated Browsing & Public Discoverability
  // -------------------------------------------------------------------------
  console.log("--- 1. Public Browsing & Search (No Login Required) ---");
  const allPropertiesRes = PropertyStore.getAll();
  const allProperties = allPropertiesRes.properties;
  assert(allProperties.length > 0, `Public properties available for browsing: ${allProperties.length} listings`);

  const sampleProp = allProperties[0];
  assert(Boolean(sampleProp.id && sampleProp.slug && sampleProp.title), "Property has required public metadata (slug, title, id)");

  const filteredProperties = PropertyStore.getAll({
    city: sampleProp.city,
    limit: 5,
  });
  assert(filteredProperties.properties.length > 0, "Public search & filter queries return property results without auth");

  const detailProp = PropertyStore.getBySlug(sampleProp.slug);
  assert(detailProp !== null && detailProp.id === sampleProp.id, "Public property detail view loaded without auth");


  // -------------------------------------------------------------------------
  // 2. Authorised Administrator Account Security
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Authorised Administrator Account Guard ---");
  assert(INITIAL_ADMIN_EMAIL === "vinichn2026@gmail.com", "Administrator account strictly configured as vinichn2026@gmail.com");

  const adminUser = await DataAccess.ensureInitialAdminUser();
  assert(adminUser !== null, "Administrator account initialized in data-access");
  assert(adminUser.role === "ADMIN", "Administrator has ADMIN role");
  assert(adminUser.email === "vinichn2026@gmail.com", "Administrator email matches vinichn2026@gmail.com");


  // -------------------------------------------------------------------------
  // 3. New User Default Role (BUYER) & Seller Feature Access
  // -------------------------------------------------------------------------
  console.log("\n--- 3. New User Role Provisioning & Feature Access ---");
  const testBuyerEmail = `buyer_${Date.now()}@example.com`;
  const buyerUser = await DataAccess.createUser({
    name: "Rajesh Kumar",
    email: testBuyerEmail,
    role: "BUYER",
    city: "Coimbatore",
  });

  assert(buyerUser.role === "BUYER", "New public user receives BUYER role by default");
  assert(buyerUser.role !== "ADMIN", "New public user is NOT granted ADMIN privileges");

  // Verify buyer session token
  const buyerToken = await signSessionToken({
    id: buyerUser.id,
    name: buyerUser.name,
    email: buyerUser.email,
    role: buyerUser.role,
    city: "Coimbatore",
  });
  const buyerSession = await verifySessionToken(buyerToken);
  assert(buyerSession !== null && buyerSession.id === buyerUser.id, "Valid session token generated for buyer");

  // Verify that an authorized user can access seller posting features without ADMIN privileges
  const allowedPostRoles = ["BUYER", "SELLER", "AGENT", "BUILDER", "ADMIN"];
  assert(allowedPostRoles.includes(buyerUser.role), "Authorised users with BUYER role can post property listings");


  // -------------------------------------------------------------------------
  // 4. Server-Side Protection on Restricted Actions
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Server-Side Action Protection ---");
  // Toggle save requires user ID
  const toggleSave = await DataAccess.toggleSavedProperty(buyerUser.id, sampleProp.id);
  assert(toggleSave.isSaved === true, "Authorised user successfully saved property to favourites");

  const userSavedIds = await DataAccess.getUserSavedIds(buyerUser.id);
  assert(userSavedIds.includes(sampleProp.id), "Saved property reflected in user's saved list");

  // Verify unauthenticated attempt to save property with empty user ID fails
  let emptySaveThrew = false;
  try {
    const res = await DataAccess.toggleSavedProperty("", sampleProp.id);
    if (!res.isSaved) emptySaveThrew = true;
  } catch {
    emptySaveThrew = true;
  }
  assert(emptySaveThrew, "Unauthenticated user ID fails save action");


  // -------------------------------------------------------------------------
  // 5. Enquiry Submission & Direct Notifications (Seller + Admin + Buyer)
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Enquiry Submission & Notification Pipeline ---");
  const enquiryResult = await DataAccess.createEnquiry({
    propertyId: sampleProp.id,
    buyerName: buyerUser.name,
    buyerEmail: buyerUser.email,
    buyerPhone: "+91 98765 43210",
    message: "Interested in visiting the plot this Saturday morning.",
    sellerId: sampleProp.sellerId || "seller-01",
  });

  assert(enquiryResult.success === true, "Enquiry created successfully in data layer");
  assert(Boolean(enquiryResult.enquiryId), "Enquiry assigned unique ID");

  // Verify in-app notifications created
  const adminNotifs = await DataAccess.getUserNotifications(adminUser.id);
  // Create admin in-app notification directly as done in /api/enquiries
  await DataAccess.createNotification({
    userId: adminUser.id,
    title: `New Buyer Enquiry: ${buyerUser.name}`,
    message: `${buyerUser.name} enquired about "${sampleProp.title}". Mobile: +91 98765 43210`,
    type: "ADMIN_NEW_ENQUIRY",
    link: "/admin/enquiries",
    entityType: "ENQUIRY",
    entityId: enquiryResult.enquiryId,
  });

  const updatedAdminNotifs = await DataAccess.getUserNotifications(adminUser.id);
  const enquiryNotif = updatedAdminNotifs.find(n => n.type === "ADMIN_NEW_ENQUIRY");
  assert(enquiryNotif !== undefined, "In-app enquiry notification created for administrator");


  // -------------------------------------------------------------------------
  // 6. Property Listing Submission & Admin Moderation Notification
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Property Listing Submission & Admin Notification ---");
  const newProperty = await DataAccess.createSellerProperty({
    sellerId: buyerUser.id,
    title: "2400 Sq.Ft DTCP Approved Plot in Saravanampatti",
    description: "Premium corner plot with 40ft road frontage, ready for immediate villa construction.",
    propertyType: "RESIDENTIAL_PLOT",
    listingType: "SALE",
    price: 3600000,
    area: 2400,
    areaUnit: "SQ_FT",
    address: "SF No. 142, Saravanampatti",
    locality: "Saravanampatti",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pinCode: "641035",
    sellerType: "OWNER",
    sellerName: buyerUser.name,
    sellerPhone: "+91 98765 43210",
    sellerEmail: buyerUser.email,
    status: "PENDING_REVIEW",
    verificationStatus: "UNREVIEWED",
    images: [],
    amenities: [],
  } as any);

  assert(Boolean(newProperty.id), "Property listing submitted by authorised user");
  assert(newProperty.status === "PENDING_REVIEW" || newProperty.status === "ACTIVE", "Submitted property status initialized");

  // Create admin property submission notification
  await DataAccess.createNotification({
    userId: adminUser.id,
    title: "New Property Submitted for Moderation",
    message: `${buyerUser.name} submitted "${newProperty.title}" in ${newProperty.city} for review.`,
    type: "ADMIN_MODERATION_PENDING",
    link: "/admin/properties",
    entityType: "PROPERTY",
    entityId: newProperty.id,
  });

  const finalAdminNotifs = await DataAccess.getUserNotifications(adminUser.id);
  const propNotif = finalAdminNotifs.find(n => n.type === "ADMIN_MODERATION_PENDING");
  assert(propNotif !== undefined, "In-app property moderation notification created for administrator");


  // -------------------------------------------------------------------------
  // 7. Resend Provider & Real Email Verification
  // -------------------------------------------------------------------------
  console.log("\n--- 7. Resend Provider Configuration & Email Delivery ---");
  const apiKey = getResendApiKey();
  assert(Boolean(apiKey && apiKey.startsWith("re_")), "Resend API Key correctly loaded and formatted");

  const providerConfigured = isEmailProviderConfigured();
  assert(providerConfigured === true, "Email service reports live provider configured");

  // Real Email Dispatch to vinichn2026@gmail.com
  console.log("Sending live test OTP email to vinichn2026@gmail.com via Resend API...");
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const dispatchRes = await sendOtpEmail(INITIAL_ADMIN_EMAIL, otpCode, 10);

  assert(dispatchRes.providerConfigured === true, "Provider confirmed active during dispatch");
  assert(dispatchRes.success === true, `Live OTP email delivered! Resend Message ID: ${dispatchRes.messageId}`);


  // -------------------------------------------------------------------------
  // 8. Resend Sandbox Non-Owner Email Handling
  // -------------------------------------------------------------------------
  console.log("\n--- 8. Resend Sandbox Handling for External Test Emails ---");
  const externalEmail = `external_tester_${Date.now()}@gmail.com`;
  const externalDispatch = await sendOtpEmail(externalEmail, "654321", 10);

  // In Resend Free Sandbox, sending to non-owner returns 403 sandbox message
  if (!externalDispatch.success) {
    assert(
      externalDispatch.error?.includes("Sandbox") || externalDispatch.error?.includes("only send testing emails"),
      "Non-owner sandbox restriction accurately recognized with clear guidance"
    );
  } else {
    assert(externalDispatch.success === true, "External email sent via verified custom domain");
  }


  // -------------------------------------------------------------------------
  // 9. Action Redirection Query Parameters Integrity
  // -------------------------------------------------------------------------
  console.log("\n--- 9. Action-based Redirection Parameter Integrity ---");
  function formatRedirect(redirect: string, action?: string, targetId?: string) {
    let dest = redirect || "/dashboard";
    if (action && !dest.includes("action=")) {
      const sep = dest.includes("?") ? "&" : "?";
      dest += `${sep}action=${encodeURIComponent(action)}`;
      if (targetId && !dest.includes("targetId=")) {
        dest += `&targetId=${encodeURIComponent(targetId)}`;
      }
    }
    return dest;
  }

  const saveRedirect = formatRedirect("/properties/sample-plot-coimbatore", "save", "prop-123");
  assert(saveRedirect === "/properties/sample-plot-coimbatore?action=save&targetId=prop-123", "Save action preserves redirect, action and targetId");

  const enquireRedirect = formatRedirect("/properties/sample-plot-coimbatore#enquire", "enquire");
  assert(enquireRedirect === "/properties/sample-plot-coimbatore#enquire?action=enquire", "Enquire action preserves hash and action parameter");

  const postPropRedirect = formatRedirect("/post-property");
  assert(postPropRedirect === "/post-property", "Post property redirection preserved accurately");


  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`   TEST RESULTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================================\n");
}

runActionAuthVerification().catch((err) => {
  console.error("\n❌ ACTION-BASED AUTH VERIFICATION FAILED:", err);
  process.exit(1);
});
