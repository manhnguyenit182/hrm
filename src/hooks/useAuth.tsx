"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Employees } from "@/db/prisma";
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  employee?: Employees | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 401) {
        // Token is invalid, clear it
        await fetch("/api/auth/clear-token", { method: "POST" });
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // On error, also clear token
      await fetch("/api/auth/clear-token", { method: "POST" });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log("=== LOGIN FUNCTION CALLED ===");
    console.log("Email:", email);
    console.log("Making API call to /api/auth/login");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("API Response status:", response.status);
    console.log("API Response ok:", response.ok);

    const data = await response.json();
    console.log("API Response data:", data);

    if (!response.ok) {
      console.error("Login failed with error:", data.error);
      throw new Error(data.error || "Đã có lỗi xảy ra");
    }

    console.log("Login successful, setting user data");
    setUser(data.user);

    // Small delay to ensure cookie is set, then redirect
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
