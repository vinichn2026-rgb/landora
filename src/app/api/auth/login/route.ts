import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";
import { comparePassword, signSessionToken, setServerSessionCookie } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Brute-force protection: max 10 login attempts per minute per IP
    const rateLimited = applyRateLimit(request, "auth_login", 10, 60000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both email address and password." },
        { status: 400 }
      );
    }

    // Look up user by email
    const user = await DataAccess.findUserByEmail(email.trim());
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // Validate password with bcrypt
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // Sign session and set HTTP-only cookie
    const sessionToken = await signSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      city: user.profile?.city || "Coimbatore",
    });

    await setServerSessionCookie(sessionToken);

    // Record Successful User Login Activity on the Server
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || undefined;

    await DataAccess.recordSuccessfulLogin({
      userId: user.id,
      email: user.email,
      userName: user.name,
      role: user.role,
      eventType: "LOGIN_PASSWORD",
      ipAddress,
      userAgent,
      details: "Signed in via password authentication",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        city: user.profile?.city || "Coimbatore",
      },
      message: "Signed in successfully.",
    });
  } catch (error) {
    console.error("[API ERROR] /api/auth/login:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during sign in." },
      { status: 500 }
    );
  }
}
