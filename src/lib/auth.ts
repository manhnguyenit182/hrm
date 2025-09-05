import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Employees } from "@/db/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

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
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        isValid: false,
        error: "No token found",
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { employee: true },
    });

    if (!user) {
      return {
        isValid: false,
        error: "User not found",
      };
    }

    return {
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        employee: user.employee,
      },
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return {
      isValid: false,
      error: "Invalid token",
    };
  }
}

/**
 * Get user from request (for API routes)
 */
export async function getUserFromRequest(request: Request): Promise<{
  isValid: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    // Extract token from request headers or cookies
    const cookieHeader = request.headers.get("cookie");
    const tokenMatch = cookieHeader?.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return {
        isValid: false,
        error: "No token found",
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { employee: true },
    });

    if (!user) {
      return {
        isValid: false,
        error: "User not found",
      };
    }

    return {
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        employee: user.employee,
      },
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return {
      isValid: false,
      error: "Invalid token",
    };
  }
}

/**
 * Require authentication for server components/pages
 * Redirects to login if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const { isValid, user } = await verifyAuth();

  if (!isValid || !user) {
    // In server components, we need to handle redirect differently
    throw new Error("Authentication required");
  }

  return user;
}
