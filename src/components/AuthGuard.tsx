"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side auth guard component
 * Redirects to login if user is not authenticated
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in cookies
    const hasToken = document.cookie.includes("token=");

    if (!hasToken) {
      router.push("/login");
      return;
    }

    // Optionally, you can also check token validity by calling /api/auth/me
    // This will be handled by the useAuth hook
  }, [router]);

  // You can show a loading state while checking auth
  if (fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for pages that require authentication
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard fallback={<div>Loading...</div>}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
