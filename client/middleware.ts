// middleware.ts
import { NextResponse } from "next/server";

// The JWT lives only in localStorage (never a cookie), so server middleware
// has no way to see it — auth-gating is handled client-side instead, in
// DashboardLayout.tsx and PartnerLayout.tsx. This is a deliberate no-op, not
// a placeholder: a cookie-based check here would redirect every hard
// navigation/refresh straight to /login regardless of a valid session.
export function middleware() {
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