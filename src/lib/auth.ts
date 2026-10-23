// =============================================================================
// Landora Real Estate & Land-Selling Marketplace
// Secure Authentication & Session Management (jose + bcryptjs)
// =============================================================================

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { UserRole } from "@/types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  city?: string | null;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "landora-production-jwt-secret-key-32chars-min-2026"
);

const SESSION_COOKIE_NAME = "landora_session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

// Hash password with bcryptjs
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare plain password with bcrypt hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create signed JWT session
export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    city: user.city,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verify signed JWT session
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      phoneNumber: (payload.phoneNumber as string) || null,
      role: (payload.role as UserRole) || "BUYER",
      city: (payload.city as string) || null,
    };
  } catch {
    return null;
  }
}

// Generate signed password reset token (1 hour expiry)
export async function signPasswordResetToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email, purpose: "password_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.purpose !== "password_reset") return null;
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

// Set HTTP-Only Session Cookie on server
export async function setServerSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

// Clear Session Cookie on server
export async function clearServerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Get Authenticated User from server cookies
export async function getServerSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
