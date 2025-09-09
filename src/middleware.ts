import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isProtectedPath, isPublicPath } from "@/lib/middleware-helpers";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public or protected
  const isPublic = isPublicPath(pathname);
  const isProtected = isProtectedPath(pathname);

  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  // If accessing protected route without token, redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user has token and trying to access login page, redirect to dashboard
  // Note: Token validation will be done in the API routes/server components
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
