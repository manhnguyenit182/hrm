import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { Employees } from "@/db/prisma";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  employee?: Employees | null;
}

/**
 * Verify token and get user data from server components or API routes
 */
export async function verifyAuth(): Promise<{
  isValid: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        isValid: false,
        error: "No session found",
      };
    }

    return {
      isValid: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        role: session.user.role,
        employee: session.user.employee,
      },
    };
  } catch (error) {
    console.error("Session verification error:", error);
    return {
      isValid: false,
      error: "Invalid session",
    };
  }
}

/**
 * Get user from request (for API routes)
 * @deprecated Use verifyAuth() directly in API routes
 */
export async function getUserFromRequest(): Promise<{
  isValid: boolean;
  user?: AuthUser;
  error?: string;
}> {
  // For API routes, we can use the same verifyAuth function
  // since getServerSession works in API routes too
  return await verifyAuth();
}

/**
 * Require authentication for server components/pages
 * Throws error if not authenticated (should be caught by error boundary)
 */
export async function requireAuth(): Promise<AuthUser> {
  const { isValid, user } = await verifyAuth();

  if (!isValid || !user) {
    throw new Error("Authentication required");
  }

  return user;
}
