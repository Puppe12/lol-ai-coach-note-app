import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login"];

// Protect all app pages by default (except PUBLIC_PATHS). Exclude static assets and API routes.
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Allow public paths to continue
  const isPublic = PUBLIC_PATHS.some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  );
  if (isPublic) return NextResponse.next();

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const cookieName = process.env.USERS_COOKIE_SESSION_STORAGE ?? "";
  const userCookie = cookieName ? req.cookies.get(cookieName) : null;

  // Redirect unauthenticated users to login, preserving intended destination
  if (!userCookie?.value) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/login") {
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Apply to all routes except static assets and API endpoints
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|api).*)",
  ],
};
