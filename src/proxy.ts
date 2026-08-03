// ─────────────────────────────────────────────────────────────────────────────
// Proxy (formerly middleware) — Route Protection
// Runs on the Edge Runtime before every matched request.
// Next.js 16+ uses "proxy" convention instead of "middleware".
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

// Routes that require authentication (any role)
const AUTH_REQUIRED_PREFIXES = ["/user", "/api/cart", "/api/orders", "/api/me"];

// Routes that require admin role
const ADMIN_REQUIRED_PREFIXES = ["/admin", "/api/admin"];

// Routes that redirect to dashboard if already logged in
const GUEST_ONLY_PATHS = ["/login", "/register"];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const user = await getUserFromRequest(request);

  // ── Redirect logged-in users away from guest-only pages ─────────────────
  if (GUEST_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    if (user) {
      const redirectTo = user.role === "admin" ? "/admin" : "/user/profile";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

  // ── Admin routes ─────────────────────────────────────────────────────────
  if (ADMIN_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/user/profile", request.url));
    }

    return NextResponse.next();
  }

  // ── Auth-required routes ─────────────────────────────────────────────────
  if (AUTH_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!user) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public/).*)",
  ],
};
