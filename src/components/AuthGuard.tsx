"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
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
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  // Show loading state while checking auth
  if (status === "loading") {
    return fallback ? <>{fallback}</> : <div>Loading...</div>;
  }

  // If not authenticated, don't render children (redirect will happen)
  if (status === "unauthenticated") {
    return null;
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
