"use client";

import React from "react";
import { PERMISSIONS } from "@/constants/permissions";
import {
  withPermission,
  withAnyPermission,
  withAllPermissions,
  PermissionGuard,
} from "@/components/PermissionGuard";
import { useCheckPermission } from "@/hooks/usePermission";

// Example 1: Component được bảo vệ bằng HOC với single permission
function _EmployeeListComponent() {
  return (
    <div className="p-4">
      <h1>Danh sách nhân viên</h1>
      <p>Trang này chỉ dành cho user có quyền xem nhân viên.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Employee cards would go here */}
        <div className="border p-4 rounded">Employee 1</div>
        <div className="border p-4 rounded">Employee 2</div>
        <div className="border p-4 rounded">Employee 3</div>
      </div>
    </div>
  );
}

// Wrap với HOC - chỉ user có permission VIEW_EMPLOYEES mới vào được
export const EmployeeListPage = withPermission(PERMISSIONS.EMPLOYEES.VIEW, {
  redirectToNotFound: true,
})(_EmployeeListComponent);

// Example 2: Component cần ít nhất một trong nhiều permissions
function EmployeeManagementComponent() {
  const canDelete = useCheckPermission(PERMISSIONS.EMPLOYEES.DELETE);
  const canUpdate = useCheckPermission(PERMISSIONS.EMPLOYEES.UPDATE);

  return (
    <div className="p-4">
      <h1>Quản lý nhân viên</h1>
      <p>Trang này dành cho user có ít nhất một quyền quản lý nhân viên.</p>

      <div className="flex gap-4 mt-4">
        {canUpdate && (
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Chỉnh sửa nhân viên
          </button>
        )}

        {canDelete && (
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Xóa nhân viên
          </button>
        )}
      </div>
    </div>
  );
}

// User cần ít nhất một trong các quyền CREATE, UPDATE, DELETE
export const EmployeeManagementPage = withAnyPermission(
  [
    PERMISSIONS.EMPLOYEES.CREATE,
    PERMISSIONS.EMPLOYEES.UPDATE,
    PERMISSIONS.EMPLOYEES.DELETE,
  ],
  {
    redirectToNotFound: true,
  }
)(EmployeeManagementComponent);

// Example 3: Component cần tất cả permissions
function _EmployeeAdminComponent() {
  return (
    <div className="p-4">
      <h1>Admin Panel - Nhân viên</h1>
      <p>Trang này cần đầy đủ quyền quản lý nhân viên.</p>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Tạo nhân viên
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Xem danh sách
        </button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">
          Chỉnh sửa
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded">
          Xóa nhân viên
        </button>
      </div>
    </div>
  );
}

// User cần TẤT CẢ các quyền về nhân viên
export const EmployeeAdminPage = withAllPermissions(
  [
    PERMISSIONS.EMPLOYEES.VIEW,
    PERMISSIONS.EMPLOYEES.CREATE,
    PERMISSIONS.EMPLOYEES.UPDATE,
    PERMISSIONS.EMPLOYEES.DELETE,
  ],
  {
    redirectToNotFound: true,
  }
)(_EmployeeAdminComponent);

// Example 4: Component sử dụng PermissionGuard bên trong
export function EmployeeDashboard() {
  return (
    <div className="p-4">
      <h1>Dashboard Nhân viên</h1>

      {/* Phần này ai cũng thấy được */}
      <div className="mb-6">
        <h2>Thông tin chung</h2>
        <p>Đây là thông tin công khai cho tất cả user.</p>
      </div>

      {/* Chỉ user có quyền tạo nhân viên mới thấy */}
      <PermissionGuard
        permission={PERMISSIONS.EMPLOYEES.CREATE}
        fallback={
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-600">
              Bạn không có quyền tạo nhân viên mới.
            </p>
          </div>
        }
      >
        <div className="bg-green-50 p-4 rounded mb-4">
          <h3>Tạo nhân viên mới</h3>
          <button className="bg-green-500 text-white px-4 py-2 rounded mt-2">
            Thêm nhân viên
          </button>
        </div>
      </PermissionGuard>

      {/* Section cho các quyền quản lý */}
      <PermissionGuard
        permission={PERMISSIONS.EMPLOYEES.UPDATE}
        fallback={
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-600">
              Bạn không có quyền chỉnh sửa nhân viên.
            </p>
          </div>
        }
      >
        <div className="bg-blue-50 p-4 rounded">
          <h3>Quản lý nhân viên</h3>
          <div className="flex gap-2 mt-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Chỉnh sửa
            </button>

            <PermissionGuard
              permission={PERMISSIONS.EMPLOYEES.DELETE}
              fallback={
                <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed">
                  Xóa (Không có quyền)
                </button>
              }
            >
              <button className="bg-red-500 text-white px-4 py-2 rounded">
                Xóa nhân viên
              </button>
            </PermissionGuard>
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
}
