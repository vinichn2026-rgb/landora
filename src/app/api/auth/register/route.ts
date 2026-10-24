import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";
import { hashPassword, signSessionToken, setServerSessionCookie } from "@/lib/auth";
import { UserRole } from "@/types";
import { sendRegistrationVerificationEmail, sendAdminNewUserRegistrationEmail } from "@/lib/email";
import { applyRateLimit } from "@/lib/rate-limit";
import { INITIAL_ADMIN_EMAIL } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Abuse protection: max 10 registrations per 10 minutes per IP
    const rateLimited = applyRateLimit(request, "auth_register", 10, 600000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { name, email, phoneNumber, role, password, city } = body;

    // Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Public registration allowed roles: BUYER, SELLER, AGENT, BUILDER
    // Under no circumstances can a public registration grant ADMIN privileges
    const allowedPublicRoles: UserRole[] = ["BUYER", "SELLER", "AGENT", "BUILDER"];
    const userRole: UserRole = allowedPublicRoles.includes(role) ? role : "BUYER";

    const normalizedEmail = email.trim().toLowerCase();

    // Prevent public registration overriding initial authorized administrator
    if (normalizedEmail === (process.env.INITIAL_ADMIN_EMAIL || "vinichn2026@gmail.com").toLowerCase().trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: "This authorized administrator account is reserved. Please sign in with OTP at /login." 
        },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existing = await DataAccess.findUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Hash password securely with bcrypt
    const passwordHash = await hashPassword(password);

    // Create user record
    const user = await DataAccess.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
      passwordHash,
      role: userRole,
      city: city || "Coimbatore",
    });

    // Create signed session token and set HTTP-only cookie
    const sessionToken = await signSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      city: user.profile?.city || city || "Coimbatore",
    });

    await setServerSessionCookie(sessionToken);

    // Phase 9: Welcome in-app notification & Registration Verification Email
    await DataAccess.createNotification({
      userId: user.id,
      title: "Welcome to Landora",
      message: "Your account has been created. Start exploring DTCP/CMDA verified plots and residential lands.",
      type: "ACCOUNT_WELCOME",
      link: "/properties",
      entityType: "USER",
      entityId: user.id,
    });

    await sendRegistrationVerificationEmail(
      user.email,
      user.name,
      `vfy_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    );

    // Send email alert to administrator for new user registration
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || INITIAL_ADMIN_EMAIL).toLowerCase().trim();
    sendAdminNewUserRegistrationEmail(adminEmail, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: city || "Coimbatore",
      phoneNumber: user.phoneNumber,
    }).catch(err => console.error("[AUTH] sendAdminNewUserRegistrationEmail error:", err));

    // Create in-app notification for administrator
    const adminUser = await DataAccess.findUserByEmail(adminEmail);
    if (adminUser) {
      DataAccess.createNotification({
        userId: adminUser.id,
        title: `New User Registered: ${user.name}`,
        message: `${user.name} (${user.email}) registered as ${user.role}.`,
        type: "ADMIN_NEW_USER",
        link: "/admin/users",
        entityType: "USER",
        entityId: user.id,
      }).catch(() => {});
    }

    // Record initial registration login activity
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || undefined;

    await DataAccess.recordSuccessfulLogin({
      userId: user.id,
      email: user.email,
      userName: user.name,
      role: user.role,
      eventType: "REGISTER_INITIAL",
      ipAddress,
      userAgent,
      details: "New account registered & authenticated",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        city: user.profile?.city || city || "Coimbatore",
      },
      message: "Account registered successfully.",
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/register:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error registering account." },
      { status: 500 }
    );
  }
}
