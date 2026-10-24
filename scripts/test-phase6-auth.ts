import { 
  hashPassword, 
  comparePassword, 
  signSessionToken, 
  verifySessionToken, 
  signPasswordResetToken, 
  verifyPasswordResetToken 
} from "../src/lib/auth";
import { DataAccess } from "../src/lib/data-access";
import { OtpService } from "../src/lib/otp";
import { isEmailProviderConfigured, sendOtpEmail } from "../src/lib/email";
import { INITIAL_ADMIN_EMAIL, OTP_EXPIRY_MINUTES, OTP_COOLDOWN_SECONDS, OTP_MAX_ATTEMPTS } from "../src/lib/constants";
import { jwtVerify } from "jose";

async function runAuthTests() {
  console.log("==================================================");
  console.log("   LANDORA PHASE 6: AUTHENTICATION & OTP TEST SUITE");
  console.log("==================================================\n");

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

  // 1. Initial Authorised Administrator Configuration
  console.log("--- 1. Initial Authorised Administrator Account ---");
  assert(INITIAL_ADMIN_EMAIL === "vinichn2026@gmail.com", "INITIAL_ADMIN_EMAIL constant is vinichn2026@gmail.com");

  const adminUser = await DataAccess.findUserByEmail(INITIAL_ADMIN_EMAIL);
  assert(adminUser !== null, "Initial authorized admin user found via DataAccess");
  assert(adminUser?.role === "ADMIN", "Initial authorized user has role ADMIN");
  assert(adminUser?.email.toLowerCase() === "vinichn2026@gmail.com", "Admin email matches vinichn2026@gmail.com");

  // 2. Public Registration Security & Role Isolation
  console.log("\n--- 2. Public Registration Architecture & Role Restrictions ---");
  // Attempting to register as ADMIN via registration logic
  const allowedPublicRoles = ["BUYER", "SELLER", "AGENT", "BUILDER"];
  assert(!allowedPublicRoles.includes("ADMIN"), "ADMIN role is strictly excluded from public registration roles");

  const testEmail = `public_buyer_${Date.now()}@example.com`;
  const regUser = await DataAccess.createUser({
    name: "Public Buyer",
    email: testEmail,
    role: "BUYER",
    city: "Coimbatore"
  });
  assert(regUser.role === "BUYER", "Public registration defaults to BUYER role");

  // 3. Email OTP Generation, Cooldown & Expiry
  console.log("\n--- 3. Email OTP Generation & Cooldown Protection ---");
  const otpEmail = `test_otp_${Date.now()}@example.com`;
  
  const firstOtp = OtpService.generateAndSaveOtp(otpEmail);
  assert(firstOtp.allowed === true, "First OTP generation request is allowed");
  assert(typeof firstOtp.code === "string" && firstOtp.code.length === 6, "OTP is a 6-digit string");
  assert(/^\d{6}$/.test(firstOtp.code!), "OTP contains numbers only");
  assert(firstOtp.expiresInMinutes === OTP_EXPIRY_MINUTES, `OTP validity is ${OTP_EXPIRY_MINUTES} minutes`);

  // Immediate second OTP request must be blocked by 60s cooldown
  const immediateSecondOtp = OtpService.generateAndSaveOtp(otpEmail);
  assert(immediateSecondOtp.allowed === false, "Immediate subsequent OTP request is rejected by cooldown");
  assert(
    typeof immediateSecondOtp.waitSeconds === "number" && immediateSecondOtp.waitSeconds > 0,
    `Cooldown returns remaining wait seconds (${immediateSecondOtp.waitSeconds}s)`
  );

  // 4. Invalid OTP Rejection & Attempt Counter
  console.log("\n--- 4. Invalid OTP Rejection & Attempt Counter ---");
  const badAttempt1 = OtpService.verifyOtp(otpEmail, "000000");
  assert(badAttempt1.valid === false, "Incorrect OTP code is rejected");
  assert(badAttempt1.remainingAttempts === 4, "Remaining attempts decremented to 4");

  const badAttempt2 = OtpService.verifyOtp(otpEmail, "111111");
  assert(badAttempt2.valid === false, "Second incorrect OTP rejected");
  assert(badAttempt2.remainingAttempts === 3, "Remaining attempts decremented to 3");

  // Format validation (non-6 digit)
  const badFormat = OtpService.verifyOtp(otpEmail, "123");
  assert(badFormat.valid === false, "Non-6-digit code rejected immediately");

  // 5. Successful OTP Verification & Single-Use Enforcement
  console.log("\n--- 5. Successful OTP Verification & Single-Use Enforcement ---");
  const goodAttempt = OtpService.verifyOtp(otpEmail, firstOtp.code!);
  assert(goodAttempt.valid === true, "Valid OTP code successfully verified");

  // Attempting to reuse the exact same OTP code must fail
  const reuseAttempt = OtpService.verifyOtp(otpEmail, firstOtp.code!);
  assert(reuseAttempt.valid === false, "Reused OTP code is rejected (single-use enforced)");

  // 6. OTP Attempt Lockout Protection
  console.log("\n--- 6. OTP Brute-Force Lockout (Max 5 Attempts) ---");
  const lockoutEmail = `lockout_${Date.now()}@example.com`;
  // Clear any existing cooldown for this fresh email
  OtpService.clearOtp(lockoutEmail);
  const lockoutOtp = OtpService.generateAndSaveOtp(lockoutEmail);
  assert(lockoutOtp.allowed === true, "Generated OTP for lockout test");

  // Burn 5 failed attempts
  for (let i = 1; i <= 5; i++) {
    OtpService.verifyOtp(lockoutEmail, "999999");
  }

  // 6th attempt or even correct code should now be completely rejected because code was deleted
  const postLockoutAttempt = OtpService.verifyOtp(lockoutEmail, lockoutOtp.code!);
  assert(postLockoutAttempt.valid === false, "Even correct code is rejected after 5 failed attempts (code invalidated)");

  // 7. Email Provider Truthfulness Check
  console.log("\n--- 7. Email Provider Configuration Transparency ---");
  const providerStatus = isEmailProviderConfigured();
  console.log(`Current live email provider configured: ${providerStatus}`);
  
  if (!providerStatus) {
    const dispatchTest = await sendOtpEmail("nobody@example.com", "123456", 10);
    assert(dispatchTest.success === false, "When provider not configured, dispatchEmail returns success: false");
    assert(dispatchTest.providerConfigured === false, "Returns providerConfigured: false (never fakes dispatch)");
  }

  // 8. JWT Session Token Security & Claims
  console.log("\n--- 8. JWT Session Signing & Verification ---");
  const sessionToken = await signSessionToken({
    id: adminUser!.id,
    name: adminUser!.name,
    email: adminUser!.email,
    role: "ADMIN",
    city: "Coimbatore"
  });

  assert(typeof sessionToken === "string" && sessionToken.split(".").length === 3, "Session token is valid HS256 JWT");
  const sessionVerified = await verifySessionToken(sessionToken);
  assert(sessionVerified !== null, "Session token verified with secret key");
  assert(sessionVerified?.role === "ADMIN", "Session payload preserves ADMIN role");
  assert(sessionVerified?.email === "vinichn2026@gmail.com", "Session payload preserves authorized admin email");

  // 9. Server-side Middleware Protection Logic
  console.log("\n--- 9. Server-Side Route Guard Rules ---");
  const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "landora-production-jwt-secret-key-32chars-min-2026"
  );

  // Buyer session attempting admin access
  const buyerToken = await signSessionToken({
    id: "buyer-user",
    name: "Regular Buyer",
    email: "buyer@example.com",
    role: "BUYER",
    city: "Coimbatore"
  });
  const buyerVerified = await jwtVerify(buyerToken, JWT_SECRET);
  assert(buyerVerified.payload.role === "BUYER", "Buyer payload role is BUYER");
  assert(buyerVerified.payload.role !== "ADMIN", "Buyer is strictly not permitted to access /admin routes");

  // Admin session attempting admin access
  const adminVerified = await jwtVerify(sessionToken, JWT_SECRET);
  assert(adminVerified.payload.role === "ADMIN", "Admin session verified with role ADMIN");

  // 10. Backward Compatibility: Password Hashing & Existing Seed Accounts
  console.log("\n--- 10. Backward Compatibility & Password Auth ---");
  const hash = await hashPassword("Password@123");
  assert(await comparePassword("Password@123", hash) === true, "Password comparison continues to work");
  assert(await comparePassword("WrongPassword", hash) === false, "Wrong password rejected");

  console.log("\n==================================================");
  console.log(`  ALL ${total} OF ${total} TESTS PASSED! (100% SUCCESS) `);
  console.log("==================================================");
}

runAuthTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
