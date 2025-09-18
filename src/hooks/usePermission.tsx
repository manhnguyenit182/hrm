"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/constants/permissions";
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

interface UsePermissionOptions {
  /** Nếu true, sẽ redirect khi không có permission */
  redirectOnFail?: boolean;
  /** Đường dẫn redirect khi không có permission. Mặc định là "/" */
  redirectTo?: string;
  /** Nếu true, sẽ redirect đến trang 404 thay vì trang chủ */
  redirectToNotFound?: boolean;
}

interface UsePermissionReturn {
  /** Có permission hay không */
  hasPermission: boolean;
  /** Đang loading hay không */
  loading: boolean;
  /** User hiện tại */
  user: User | null;
}

/**
 * Hook kiểm tra permission cho một permission cụ thể
 */
export function usePermission(
  requiredPermission: string,
  options: UsePermissionOptions = {}
): UsePermissionReturn {
  const { user, loading } = useAuth();
  const router = useRouter();

  const {
    redirectOnFail = false,
    redirectTo = "/",
    redirectToNotFound = false,
  } = options;

  const hasRequiredPermission = useMemo(() => {
    // Nếu đang loading, không có quyền nào
    if (loading) return false;

    // Nếu không có user, không có quyền nào
    if (!user) return false;

    // Nếu user không có permissions array, không có quyền nào
    if (!user.permissions || !Array.isArray(user.permissions)) return false;

    // Kiểm tra permission
    return hasPermission(user.permissions, requiredPermission);
  }, [user, requiredPermission, loading]);

  useEffect(() => {
    // Chỉ kiểm tra redirect khi:
    // 1. Không đang loading
    // 2. Có user data
    // 3. Được config redirect
    // 4. Không có permission cần thiết
    if (!loading && user && redirectOnFail && !hasRequiredPermission) {
      // Delay redirect một chút để tránh flash
      const timeoutId = setTimeout(() => {
        if (redirectToNotFound) {
          router.push("/404");
        } else {
          router.push(redirectTo);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    loading,
    user,
    hasRequiredPermission,
    redirectOnFail,
    redirectTo,
    redirectToNotFound,
    router,
  ]);

  return {
    hasPermission: hasRequiredPermission,
    loading: loading || !user, // Show loading until we have user data
    user,
  };
}

/**
 * Hook kiểm tra permission cho nhiều permissions (chỉ cần một trong số đó)
 */
export function useAnyPermission(
  requiredPermissions: string[],
  options: UsePermissionOptions = {}
): UsePermissionReturn {
  const { user, loading } = useAuth();
  const router = useRouter();

  const {
    redirectOnFail = false,
    redirectTo = "/",
    redirectToNotFound = false,
  } = options;

  const hasRequiredPermissions = useMemo(() => {
    if (loading || !user) return false; // Return false while loading
    if (!user.permissions) return false;
    return hasAnyPermission(user.permissions, requiredPermissions);
  }, [user, requiredPermissions, loading]);

  useEffect(() => {
    if (!loading && user && redirectOnFail && !hasRequiredPermissions) {
      if (redirectToNotFound) {
        router.push("/404");
      } else {
        router.push(redirectTo);
      }
    }
  }, [
    loading,
    user,
    hasRequiredPermissions,
    redirectOnFail,
    redirectTo,
    redirectToNotFound,
    router,
  ]);

  return {
    hasPermission: hasRequiredPermissions,
    loading: loading || (!user && !loading), // Show loading until we have user data
    user,
  };
}

/**
 * Hook kiểm tra permission cho nhiều permissions (cần tất cả)
 */
export function useAllPermissions(
  requiredPermissions: string[],
  options: UsePermissionOptions = {}
): UsePermissionReturn {
  const { user, loading } = useAuth();
  const router = useRouter();

  const {
    redirectOnFail = false,
    redirectTo = "/",
    redirectToNotFound = false,
  } = options;

  const hasRequiredPermissions = useMemo(() => {
    if (loading || !user) return false; // Return false while loading
    if (!user.permissions) return false;
    return hasAllPermissions(user.permissions, requiredPermissions);
  }, [user, requiredPermissions, loading]);

  useEffect(() => {
    if (!loading && user && redirectOnFail && !hasRequiredPermissions) {
      if (redirectToNotFound) {
        router.push("/404");
      } else {
        router.push(redirectTo);
      }
    }
  }, [
    loading,
    user,
    hasRequiredPermissions,
    redirectOnFail,
    redirectTo,
    redirectToNotFound,
    router,
  ]);

  return {
    hasPermission: hasRequiredPermissions,
    loading: loading || (!user && !loading), // Show loading until we have user data
    user,
  };
}

/**
 * Hook để kiểm tra permissions mà không redirect, chỉ trả về boolean
 * Dùng để enable/disable buttons, components, etc.
 */
export function useCheckPermission(requiredPermission: string): boolean {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.permissions) return false;
    return hasPermission(user.permissions, requiredPermission);
  }, [user, requiredPermission]);
}

/**
 * Hook để kiểm tra nhiều permissions (ít nhất một cái) mà không redirect
 */
export function useCheckAnyPermission(requiredPermissions: string[]): boolean {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.permissions) return false;
    return hasAnyPermission(user.permissions, requiredPermissions);
  }, [user, requiredPermissions]);
}

/**
 * Hook để kiểm tra nhiều permissions (tất cả) mà không redirect
 */
export function useCheckAllPermissions(requiredPermissions: string[]): boolean {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.permissions) return false;
    return hasAllPermissions(user.permissions, requiredPermissions);
  }, [user, requiredPermissions]);
}
