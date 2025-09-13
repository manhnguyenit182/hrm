import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isProtectedPath, isPublicPath } from "@/lib/middleware-helpers";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Check if route is public or protected
    const isPublic = isPublicPath(pathname);
    const isProtected = isProtectedPath(pathname);

    // If user has valid session and trying to access login page, redirect to dashboard
    if (isPublic && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // If accessing protected route without valid session, redirect to login
    if (isProtected && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isPublic = isPublicPath(pathname);

        // Allow access to public routes
        if (isPublic) {
          return true;
        }

        // For protected routes, require a valid token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
