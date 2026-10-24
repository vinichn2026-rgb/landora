import { NextRequest, NextResponse } from "next/server";
import { OtpService } from "@/lib/otp";
import { DataAccess } from "@/lib/data-access";
import { signSessionToken, setServerSessionCookie } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";
import { INITIAL_ADMIN_EMAIL } from "@/lib/constants";
import { UserRole } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // 1. IP rate limiting: max 20 verify attempts per minute
    const rateLimited = applyRateLimit(request, "auth_otp_verify", 20, 60000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const email = body?.email ? String(body.email).trim().toLowerCase() : "";
    const code = body?.code ? String(body.code).trim() : "";

    // 2. Input validation
    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Please provide both email address and verification code." },
        { status: 400 }
      );
    }

    // 3. Verify OTP code (single-use, expires in 10 mins, max 5 attempts)
    const verification = OtpService.verifyOtp(email, code);
    if (!verification.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: verification.error || "Invalid verification code.",
          remainingAttempts: verification.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // 4. Authenticate or Provision User Account
    const isInitialAdmin = email === INITIAL_ADMIN_EMAIL.toLowerCase().trim();
    let user = await DataAccess.findUserByEmail(email);

    if (!user) {
      if (isInitialAdmin) {
        user = await DataAccess.ensureInitialAdminUser();
      } else {
        // Automatically provision registered public user with default role BUYER
        const displayName = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ").trim();
        user = await DataAccess.createUser({
          name: displayName.charAt(0).toUpperCase() + displayName.slice(1) || "Landora User",
          email,
          role: "BUYER",
          city: "Coimbatore",
        });
      }
    } else if (isInitialAdmin && user.role !== "ADMIN") {
      // Ensure initial admin email is strictly updated to ADMIN role
      user = await DataAccess.ensureInitialAdminUser();
    }

    // 5. Generate secure signed JWT session token
    const userRole: UserRole = user.role || "BUYER";
    const userCity = user.profile?.city || "Coimbatore";

    const sessionToken = await signSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: userRole,
      city: userCity,
    });

    // 6. Set HTTP-Only Secure Cookie
    await setServerSessionCookie(sessionToken);

    // 7. Route redirection target based on role
    let defaultRedirect = "/dashboard";
    if (userRole === "ADMIN") {
      defaultRedirect = "/admin/dashboard";
    } else if (userRole === "SELLER" || userRole === "AGENT" || userRole === "BUILDER") {
      defaultRedirect = "/dashboard/seller";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: userRole,
        city: userCity,
      },
      redirectTo: defaultRedirect,
      message: "Authenticated successfully.",
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/otp/verify:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during verification." },
      { status: 500 }
    );
  }
}
