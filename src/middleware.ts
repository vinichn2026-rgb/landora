import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "landora-production-jwt-secret-key-32chars-min-2026"
);

const SESSION_COOKIE_NAME = "landora_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard and /admin routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isDashboardRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // 1. Missing session cookie -> redirect to /login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 2. Verify JWT token with HS256 secret
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload || !payload.id) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // 3. Admin Route Protection: Strict role enforcement
    if (isAdminRoute) {
      if (payload.role !== "ADMIN") {
        // Non-admin attempting to access /admin -> redirect to user dashboard with alert
        const dashboardUrl = new URL("/dashboard", request.url);
        dashboardUrl.searchParams.set("error", "unauthorized_admin");
        return NextResponse.redirect(dashboardUrl);
      }
    }

    return NextResponse.next();
  } catch {
    // Expired or tampered session
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
