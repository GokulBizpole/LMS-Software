// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public auth pages and Next.js internals through
  if (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files (favicon, images, etc.)
  ) {
    return NextResponse.next();
  }

  // Read token from cookies
  // NOTE: if your app currently stores the JWT only in localStorage
  // (not cookies), middleware CANNOT read it — localStorage is
  // client-side only and invisible to server middleware.
  // In that case, either:
  //   1) also set the token as a cookie at login time, or
  //   2) handle the redirect client-side (e.g. in a root layout/AuthContext)
  //      instead of here, and simplify this file to just:
  //      export function middleware() { return NextResponse.next(); }
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next/static, _next/image
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};