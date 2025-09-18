"use client";

import React from "react";
import {
  usePermission,
  useAnyPermission,
  useAllPermissions,
} from "@/hooks/usePermission";
import {
  PermissionLoadingScreen,
  RedirectingScreen,
} from "@/components/LoadingScreen";

interface WithPermissionOptions {
  /** Đường dẫn redirect khi không có permission. Mặc định là "/" */
  redirectTo?: string;
  /** Nếu true, sẽ redirect đến trang 404 thay vì trang chủ */
  redirectToNotFound?: boolean;
  /** Custom loading component */
  LoadingComponent?: React.ComponentType;
  /** Custom redirect component */
  RedirectComponent?: React.ComponentType;
}

/**
 * HOC để bảo vệ component với single permission
 */
export function withPermission(
  requiredPermission: string,
  options: WithPermissionOptions = {}
) {
  return function <T extends object>(WrappedComponent: React.ComponentType<T>) {
    const ProtectedComponent = (props: T) => {
      const {
        redirectTo = "/",
        redirectToNotFound = true,
        LoadingComponent = PermissionLoadingScreen,
        RedirectComponent = RedirectingScreen,
      } = options;

      const { loading, hasPermission } = usePermission(requiredPermission, {
        redirectOnFail: true,
        redirectTo,
        redirectToNotFound,
      });

      if (loading) {
        return <LoadingComponent />;
      }

      if (!hasPermission) {
        return <RedirectComponent />;
      }

      return <WrappedComponent {...props} />;
    };

    ProtectedComponent.displayName = `withPermission(${
      WrappedComponent.displayName || WrappedComponent.name
    })`;

    return ProtectedComponent;
  };
}

/**
 * HOC để bảo vệ component với multiple permissions (cần ít nhất một)
 */
export function withAnyPermission(
  requiredPermissions: string[],
  options: WithPermissionOptions = {}
) {
  return function <T extends object>(WrappedComponent: React.ComponentType<T>) {
    const ProtectedComponent = (props: T) => {
      const {
        redirectTo = "/",
        redirectToNotFound = true,
        LoadingComponent = PermissionLoadingScreen,
        RedirectComponent = RedirectingScreen,
      } = options;

      const { loading, hasPermission } = useAnyPermission(requiredPermissions, {
        redirectOnFail: true,
        redirectTo,
        redirectToNotFound,
      });

      if (loading) {
        return <LoadingComponent />;
      }

      if (!hasPermission) {
        return <RedirectComponent />;
      }

      return <WrappedComponent {...props} />;
    };

    ProtectedComponent.displayName = `withAnyPermission(${
      WrappedComponent.displayName || WrappedComponent.name
    })`;

    return ProtectedComponent;
  };
}

/**
 * HOC để bảo vệ component với multiple permissions (cần tất cả)
 */
export function withAllPermissions(
  requiredPermissions: string[],
  options: WithPermissionOptions = {}
) {
  return function <T extends object>(WrappedComponent: React.ComponentType<T>) {
    const ProtectedComponent = (props: T) => {
      const {
        redirectTo = "/",
        redirectToNotFound = true,
        LoadingComponent = PermissionLoadingScreen,
        RedirectComponent = RedirectingScreen,
      } = options;

      const { loading, hasPermission } = useAllPermissions(
        requiredPermissions,
        {
          redirectOnFail: true,
          redirectTo,
          redirectToNotFound,
        }
      );

      if (loading) {
        return <LoadingComponent />;
      }

      if (!hasPermission) {
        return <RedirectComponent />;
      }

      return <WrappedComponent {...props} />;
    };

    ProtectedComponent.displayName = `withAllPermissions(${
      WrappedComponent.displayName || WrappedComponent.name
    })`;

    return ProtectedComponent;
  };
}

/**
 * Component để bảo vệ children với permission check
 */
interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectOnFail?: boolean;
  redirectTo?: string;
  redirectToNotFound?: boolean;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
  redirectOnFail = false,
  redirectTo = "/",
  redirectToNotFound = false,
}: PermissionGuardProps) {
  const { loading, hasPermission } = usePermission(permission, {
    redirectOnFail,
    redirectTo,
    redirectToNotFound,
  });

  if (loading) {
    return <PermissionLoadingScreen />;
  }

  if (!hasPermission) {
    if (redirectOnFail) {
      return <RedirectingScreen />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component để bảo vệ children với multiple permissions (ít nhất một)
 */
interface AnyPermissionGuardProps {
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectOnFail?: boolean;
  redirectTo?: string;
  redirectToNotFound?: boolean;
}

export function AnyPermissionGuard({
  permissions,
  children,
  fallback = null,
  redirectOnFail = false,
  redirectTo = "/",
  redirectToNotFound = false,
}: AnyPermissionGuardProps) {
  const { loading, hasPermission } = useAnyPermission(permissions, {
    redirectOnFail,
    redirectTo,
    redirectToNotFound,
  });

  if (loading) {
    return <PermissionLoadingScreen />;
  }

  if (!hasPermission) {
    if (redirectOnFail) {
      return <RedirectingScreen />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
