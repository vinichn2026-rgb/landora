import { 
  hashPassword, 
  comparePassword, 
  signSessionToken, 
  verifySessionToken, 
  signPasswordResetToken, 
  verifyPasswordResetToken 
} from "../src/lib/auth";
import { DataAccess } from "../src/lib/data-access";

async function runAuthTests() {
  console.log("==================================================");
  console.log("   LANDORA PHASE 6: AUTH & DASHBOARD TEST SUITE   ");
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

  // 1. Password Hashing & Comparison
  console.log("--- 1. Password Hashing Security ---");
  const plainPass = "SecureP@ssw0rd2026";
  const hashed = await hashPassword(plainPass);
  assert(hashed !== plainPass, "Password is encrypted (not plaintext)");
  assert(hashed.startsWith("$2"), "Password hash uses bcrypt format ($2a / $2b)");
  
  const matchSuccess = await comparePassword(plainPass, hashed);
  assert(matchSuccess === true, "Password matches hash successfully");

  const matchFail = await comparePassword("WrongPassword123", hashed);
  assert(matchFail === false, "Incorrect password correctly rejected");

  // 2. JWT Session Creation & Verification
  console.log("\n--- 2. JWT Session Security ---");
  const testPayload = {
    id: "test-user-buyer",
    email: "buyer.test@landora.in",
    role: "BUYER" as const,
    name: "Aadhirai Krishnan",
    city: "Coimbatore"
  };

  const token = await signSessionToken(testPayload);
  assert(typeof token === "string" && token.split(".").length === 3, "JWT token generated with 3 segments (header.payload.signature)");

  const verified = await verifySessionToken(token);
  assert(verified !== null && verified.id === testPayload.id, "JWT signature verified and user payload extracted");
  assert(verified?.role === "BUYER", "User role preserved in secure JWT");

  const invalidTokenResult = await verifySessionToken("invalid.tampered.token");
  assert(invalidTokenResult === null, "Tampered/invalid JWT correctly returns null");

  // 3. User Seed Accounts Verification
  console.log("\n--- 3. Pre-configured Seed Role Accounts ---");
  const roles = [
    { role: "BUYER", email: "buyer@landora.in" },
    { role: "SELLER", email: "seller@landora.in" },
    { role: "AGENT", email: "agent@landora.in" },
    { role: "BUILDER", email: "builder@landora.in" },
    { role: "ADMIN", email: "admin@landora.in" },
  ];

  for (const { role, email } of roles) {
    const user = await DataAccess.findUserByEmail(email);
    assert(user !== null, `Seed account exists for role: ${role} (${email})`);
    assert(user?.role === role, `Seed account role is verified as ${role}`);
    assert(Boolean(user?.passwordHash), `Password hash exists for ${email}`);
    const passCheck = await comparePassword("Password@123", user!.passwordHash!);
    assert(passCheck === true, `Seed password authenticates with bcrypt for ${email}`);
  }

  // 4. User Registration Flow
  console.log("\n--- 4. Registration Flow ---");
  const regEmail = `newbuyer_${Date.now()}@test.landora.in`;
  const regPassHash = await hashPassword("StrongPassword!2026");
  const regUser = await DataAccess.createUser({
    name: "Sundar Rajan",
    email: regEmail,
    passwordHash: regPassHash,
    role: "BUYER",
    phoneNumber: "+91 9876543210",
    city: "Coimbatore"
  });

  assert(regUser.id.length > 0, "New user registered with distinct ID");
  assert(regUser.email === regEmail, "Registered email matches input");
  assert(regUser.role === "BUYER", "Registered role is assigned");

  // 5. Saved Properties Persistence
  console.log("\n--- 5. Saved Properties Persistence ---");
  const samplePropId = "land-cbe-001";
  
  // Initially check saved list
  const initialSaved = await DataAccess.getUserSavedIds(regUser.id);
  assert(initialSaved.length === 0, "New user starts with 0 saved properties");

  // Toggle Save (Add)
  const saveResult = await DataAccess.toggleSavedProperty(regUser.id, samplePropId);
  assert(saveResult.isSaved === true, "Property successfully saved/favourited");

  const savedListAfterAdd = await DataAccess.getUserSavedIds(regUser.id);
  assert(savedListAfterAdd.includes(samplePropId), "Saved property ID is persisted in store");

  const savedFullProps = await DataAccess.getUserSavedProperties(regUser.id);
  assert(savedFullProps.length === 1 && savedFullProps[0].id === samplePropId, "Saved property full details retrieved");

  // Toggle Save (Remove)
  const unsaveResult = await DataAccess.toggleSavedProperty(regUser.id, samplePropId);
  assert(unsaveResult.isSaved === false, "Property successfully unsaved/removed");

  const savedListAfterRemove = await DataAccess.getUserSavedIds(regUser.id);
  assert(!savedListAfterRemove.includes(samplePropId), "Saved property ID removed from persistence");

  // 6. User Profile Update
  console.log("\n--- 6. User Profile Updates ---");
  const updatedUser = await DataAccess.updateUserProfile(regUser.id, {
    name: "Sundar Rajan, M.E.",
    phoneNumber: "+91 98422 99887",
    city: "Pollachi",
    state: "Tamil Nadu",
    bio: "Looking for agricultural farmland in Pollachi and residential plot in Saravanampatti."
  });

  assert(updatedUser !== null, "User profile update response returned");
  assert(updatedUser?.name === "Sundar Rajan, M.E.", "User profile name updated");
  assert(updatedUser?.profile?.city === "Pollachi", "User city updated");
  assert(updatedUser?.profile?.bio?.includes("agricultural farmland") === true, "User bio updated");

  // 7. Password Reset Flow
  console.log("\n--- 7. Password Reset & Verification Token ---");
  const resetToken = await signPasswordResetToken(regUser.id, regUser.email);
  assert(typeof resetToken === "string", "Secure password reset token generated");

  const resetVerified = await verifyPasswordResetToken(resetToken);
  assert(resetVerified !== null && resetVerified.userId === regUser.id, "Password reset token securely verified");

  const newPlainPass = "BrandNewP@ssword2026!";
  const newPassHash = await hashPassword(newPlainPass);
  await DataAccess.updateUserPassword(regUser.id, newPassHash);

  const fetchUser = await DataAccess.findUserById(regUser.id);
  assert(Boolean(fetchUser?.passwordHash), "Updated user has password hash");
  const newPassCheck = await comparePassword(newPlainPass, fetchUser!.passwordHash!);
  assert(newPassCheck === true, "New password successfully authenticates");

  const oldPassCheck = await comparePassword("StrongPassword!2026", fetchUser!.passwordHash!);
  assert(oldPassCheck === false, "Old password rejected after password reset");

  // 8. Notifications and Enquiries
  console.log("\n--- 8. Notifications and User Enquiries ---");
  const buyerSeed = await DataAccess.findUserByEmail("buyer@landora.in");
  if (buyerSeed) {
    const notifications = await DataAccess.getUserNotifications(buyerSeed.id);
    assert(notifications.length > 0, "Seed buyer has initial system notifications");
    
    const unreadBefore = notifications.filter(n => !n.isRead).length;
    if (unreadBefore > 0) {
      await DataAccess.markNotificationRead(notifications[0].id, buyerSeed.id);
      const afterNotifs = await DataAccess.getUserNotifications(buyerSeed.id);
      const targeted = afterNotifs.find(n => n.id === notifications[0].id);
      assert(targeted?.isRead === true, "Notification marked as read");
    }

    const enquiries = await DataAccess.getUserEnquiries(buyerSeed.id, buyerSeed.email);
    assert(Array.isArray(enquiries), "User enquiries list returned as array");
  }

  console.log("\n==================================================");
  console.log(`  ALL ${total} OF ${total} TESTS PASSED! (100% SUCCESS) `);
  console.log("==================================================");
}

runAuthTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
