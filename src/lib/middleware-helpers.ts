import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Helper function to clear invalid token cookie
 */
export function clearTokenCookie(response: NextResponse): NextResponse {
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}

/**
 * Helper function to create a redirect response with cleared cookie
 */
export function redirectWithClearedToken(
  request: NextRequest,
  redirectPath: string
): NextResponse {
  const response = NextResponse.redirect(new URL(redirectPath, request.url));
  return clearTokenCookie(response);
}

/**
 * Helper function to check if a path should be protected
 */
export function isProtectedPath(pathname: string): boolean {
  const protectedRoutes = [
    "/",
    "/employees",
    "/departments",
    "/jobs",
    "/attendance",
    "/holidays",
    "/payroll",
  ];

  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/**
 * Helper function to check if a path is public
 */
export function isPublicPath(pathname: string): boolean {
  const publicRoutes = ["/login"];
  return publicRoutes.some((route) => pathname.startsWith(route));
}
