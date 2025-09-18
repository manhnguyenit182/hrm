"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Employees } from "@/db/prisma";

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  employee?: Employees | null;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthContextType {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("Session data:", session);
  const login = async (email: string, password: string) => {
    console.log("=== LOGIN FUNCTION CALLED ===");
    console.log("Email:", email);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("Login failed with error:", result.error);
        throw new Error(result.error);
      }

      if (result?.ok) {
        console.log("Login successful, redirecting...");
        // Small delay to ensure session is updated, then redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    }
  };

  return {
    user: session?.user || null,
    loading: status === "loading",
    login,
    logout,
  };
}

// For backward compatibility, export a provider component that does nothing
// since SessionProvider is now used directly in layout
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
