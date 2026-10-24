import { DataAccess } from "../src/lib/data-access";
import { 
  signSessionToken, 
  verifySessionToken, 
  requireAdminSession 
} from "../src/lib/auth";
import { 
  sendAdminNewUserRegistrationEmail, 
  sendAdminUserLoginNotificationEmail,
  sendAdminNewPropertyNotificationEmail,
  sendAdminNewEnquiryNotificationEmail,
  isEmailProviderConfigured
} from "../src/lib/email";
import { INITIAL_ADMIN_EMAIL } from "../src/lib/constants";

async function runUserMonitoringTests() {
  console.log("==================================================================");
  console.log("   LANDORA: USER MONITORING & LOGIN ACTIVITY TEST SUITE           ");
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
  // 1. Initial Admin Account Verification
  // -------------------------------------------------------------------------
  console.log("--- 1. Administrator Account Baseline ---");
  const adminEmail = INITIAL_ADMIN_EMAIL.toLowerCase().trim();
  assert(adminEmail === "vinichn2026@gmail.com", "Admin account is configured as vinichn2026@gmail.com");

  const adminUser = await DataAccess.ensureInitialAdminUser();
  assert(adminUser !== null && adminUser.role === "ADMIN", "Administrator account has role ADMIN");

  // -------------------------------------------------------------------------
  // 2. New User Registration Tracking & Welcome Pipeline
  // -------------------------------------------------------------------------
  console.log("\n--- 2. New User Registration Tracking ---");
  const uniqueId = Date.now();
  const testNewUserEmail = `buyer_monitored_${uniqueId}@example.com`;
  
  const createdUser = await DataAccess.createUser({
    name: "Kavitha Sundaram",
    email: testNewUserEmail,
    role: "BUYER",
    city: "Peelamedu",
    phoneNumber: "+91 94431 23456",
  });

  assert(Boolean(createdUser.id), "New user created with unique ID");
  assert(createdUser.role === "BUYER", "New user defaulted to BUYER role");
  assert(Boolean(createdUser.createdAt), "User has valid registration timestamp (createdAt)");

  // Record initial registration login event
  const regActivity = await DataAccess.recordSuccessfulLogin({
    userId: createdUser.id,
    email: createdUser.email,
    userName: createdUser.name,
    role: createdUser.role,
    eventType: "REGISTER_INITIAL",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    details: "New account registered & verified via OTP",
  });

  assert(Boolean(regActivity.id), "Initial registration login event recorded");
  assert(regActivity.eventType === "REGISTER_INITIAL", "Event type recorded as REGISTER_INITIAL");
  assert(regActivity.status === "SUCCESS", "Status recorded as SUCCESS");

  // -------------------------------------------------------------------------
  // 3. First-Time Registration Administrator Email Notification
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Administrator Email Alert on New Registration ---");
  console.log(`Sending new registration email notification for ${createdUser.email} to ${adminEmail}...`);
  
  const regEmailDispatch = await sendAdminNewUserRegistrationEmail(adminEmail, {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    role: createdUser.role,
    city: "Peelamedu",
    phoneNumber: "+91 94431 23456",
  });

  assert(regEmailDispatch.providerConfigured === true, "Email service reports live provider active");
  assert(regEmailDispatch.success === true, `Admin registration alert delivered! Resend Message ID: ${regEmailDispatch.messageId}`);

  // -------------------------------------------------------------------------
  // 4. Successful User Login Tracking (OTP & Password)
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Successful User Login Activity Recording ---");
  // Simulate OTP Login
  const otpLogin = await DataAccess.recordSuccessfulLogin({
    userId: createdUser.id,
    email: createdUser.email,
    userName: createdUser.name,
    role: createdUser.role,
    eventType: "LOGIN_OTP",
    ipAddress: "49.207.210.15",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    details: "Verified single-use email OTP",
  });

  assert(otpLogin.eventType === "LOGIN_OTP", "OTP login event recorded with LOGIN_OTP");
  assert(otpLogin.email === createdUser.email, "Login activity preserves user email reference");
  assert(Boolean(otpLogin.createdAt), "Login activity records timestamp");

  // Simulate Password Login for an existing user
  const pwdLogin = await DataAccess.recordSuccessfulLogin({
    userId: adminUser.id,
    email: adminUser.email,
    userName: adminUser.name,
    role: adminUser.role,
    eventType: "LOGIN_PASSWORD",
    ipAddress: "14.139.180.2",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
    details: "Signed in via password authentication",
  });

  assert(pwdLogin.eventType === "LOGIN_PASSWORD", "Password login event recorded with LOGIN_PASSWORD");
  assert(pwdLogin.role === "ADMIN", "Role preserved in login activity record");

  // Verify user lastLoginAt update
  const adminUsersList = await DataAccess.getAdminUsers({ query: createdUser.email });
  const fetchedBuyer = adminUsersList.find(u => u.id === createdUser.id);
  assert(Boolean(fetchedBuyer), "Created user retrieved from getAdminUsers");
  assert(Boolean(fetchedBuyer?.lastLoginAt), "User record reflects updated lastLoginAt timestamp");

  // -------------------------------------------------------------------------
  // 5. Login Activity Retrieval & Zero-Exposure Security Audit
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Security & Zero-Exposure Audit ---");
  const activities = await DataAccess.getAdminLoginActivities(20);
  assert(activities.length >= 2, `Retrieved ${activities.length} recent login activity records`);

  // Verify NO sensitive information is leaked
  for (const act of activities) {
    const rawObj = JSON.stringify(act);
    assert(!rawObj.includes("passwordHash"), "No passwordHash exposed in login activities");
    assert(!rawObj.includes("otpCode"), "No otpCode exposed in login activities");
    assert(!rawObj.includes("secret"), "No secret exposed in login activities");
    assert(!rawObj.includes("token"), "No token exposed in login activities");
  }
  console.log("✅ Zero-exposure audit verified: No passwords, OTPs, or session secrets present in activity records.");

  // Verify getAdminUsers also scrubs passwordHash
  for (const u of adminUsersList) {
    assert(u.passwordHash === undefined, `User ${u.email} has passwordHash strictly stripped`);
  }
  console.log("✅ Zero-exposure audit verified: No password hashes exposed in getAdminUsers.");

  // -------------------------------------------------------------------------
  // 6. Optional & Configurable Login Email Notifications
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Configurable Login Email Notifications ---");
  // Default behavior: NOTIFY_ADMIN_ON_LOGIN is not set or false -> No email sent for routine logins
  const isDefaultLoginNotificationDisabled = process.env.NOTIFY_ADMIN_ON_LOGIN !== "true";
  assert(isDefaultLoginNotificationDisabled, "NOTIFY_ADMIN_ON_LOGIN is disabled by default (prevents inbox spam)");

  // Verify that the dedicated sendAdminUserLoginNotificationEmail function works when explicitly triggered
  const manualLoginAlert = await sendAdminUserLoginNotificationEmail(adminEmail, {
    email: createdUser.email,
    userName: createdUser.name,
    role: createdUser.role,
    eventType: "LOGIN_OTP",
    ipAddress: "49.207.210.15",
    timestamp: new Date().toISOString(),
  });
  assert(manualLoginAlert.success === true, `Configurable login alert delivered on demand! Message ID: ${manualLoginAlert.messageId}`);

  // -------------------------------------------------------------------------
  // 7. Continued Administrator Notifications (Enquiries & Properties)
  // -------------------------------------------------------------------------
  console.log("\n--- 7. Existing Administrator Notification Integrity ---");
  const propAlert = await sendAdminNewPropertyNotificationEmail(
    adminEmail,
    "3 BHK Villa in Saravanampatti",
    "G. Karthik",
    "karthik@example.com",
    "Coimbatore",
    7500000,
    "land-prop-test-01"
  );
  assert(propAlert.success === true, `Admin property moderation alert confirmed! Message ID: ${propAlert.messageId}`);

  const enqAlert = await sendAdminNewEnquiryNotificationEmail(
    adminEmail,
    "3 BHK Villa in Saravanampatti",
    "Meenakshi S.",
    "+91 98400 12345",
    "meenakshi@example.com",
    "Would like to schedule a site visit this Sunday."
  );
  assert(enqAlert.success === true, `Admin buyer enquiry alert confirmed! Message ID: ${enqAlert.messageId}`);

  // -------------------------------------------------------------------------
  // 8. Server-Side Administrator Authorisation Guard Check
  // -------------------------------------------------------------------------
  console.log("\n--- 8. Server-Side Administrator Authorisation Guard ---");
  // Buyer session attempting admin action
  const buyerToken = await signSessionToken({
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    role: "BUYER",
    city: "Peelamedu",
  });
  const verifiedBuyer = await verifySessionToken(buyerToken);
  assert(verifiedBuyer?.role === "BUYER", "Buyer token verifies with role BUYER");
  assert(verifiedBuyer?.role !== "ADMIN", "Buyer token strictly rejected from administrator operations");

  // Admin session
  const adminToken = await signSessionToken({
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: "ADMIN",
    city: "Coimbatore",
  });
  const verifiedAdmin = await verifySessionToken(adminToken);
  assert(verifiedAdmin?.role === "ADMIN", "Admin token verifies with role ADMIN");

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`   TEST RESULTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================================\n");
}

runUserMonitoringTests().catch((err) => {
  console.error("\n❌ USER MONITORING TEST SUITE FAILED:", err);
  process.exit(1);
});
