"use client";

import React from "react";
import { PERMISSIONS } from "@/constants/permissions";
import {
  withPermission,
  PermissionGuard,
  AnyPermissionGuard,
} from "@/components/PermissionGuard";

// Example 1: Sử dụng HOC để bảo vệ component
function _CreateEmployeeComponent() {
  return (
    <div className="p-4">
      <h1>Tạo nhân viên mới</h1>
      <p>Chỉ user có permission CREATE_EMPLOYEE mới thấy được component này.</p>
    </div>
  );
}

// Wrap component với HOC
export const CreateEmployeeComponent = withPermission(
  PERMISSIONS.EMPLOYEES.CREATE,
  {
    redirectToNotFound: true, // Redirect về 404 nếu không có permission
  }
)(_CreateEmployeeComponent);

// Example 2: Sử dụng PermissionGuard để bảo vệ một phần của component
export function EmployeeManagementComponent() {
  return (
    <div className="p-4">
      <h1>Quản lý nhân viên</h1>

      {/* Phần này ai cũng thấy được */}
      <div className="mb-4">
        <p>Thông tin chung về nhân viên</p>
      </div>

      {/* Chỉ user có quyền CREATE mới thấy được */}
      <PermissionGuard
        permission={PERMISSIONS.EMPLOYEES.CREATE}
        fallback={
          <p className="text-gray-500">Bạn không có quyền tạo nhân viên</p>
        }
      >
        <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Tạo nhân viên mới
        </button>
      </PermissionGuard>

      {/* Chỉ user có ít nhất một trong các quyền quản lý mới thấy được */}
      <AnyPermissionGuard
        permissions={[
          PERMISSIONS.EMPLOYEES.UPDATE,
          PERMISSIONS.EMPLOYEES.DELETE,
        ]}
        fallback={
          <p className="text-gray-500">Bạn không có quyền quản lý nhân viên</p>
        }
      >
        <div className="mt-4 p-4 border rounded">
          <h3>Công cụ quản lý</h3>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
            Chỉnh sửa
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Xóa
          </button>
        </div>
      </AnyPermissionGuard>
    </div>
  );
}

// Example 3: Component với redirect tự động
function _AdminPanelComponent() {
  return (
    <div className="p-4">
      <h1>Panel quản trị</h1>
      <p>Chỉ admin mới vào được đây</p>
    </div>
  );
}

export const AdminPanelComponent = withPermission(PERMISSIONS.SYSTEM.ADMIN, {
  redirectToNotFound: true,
})(_AdminPanelComponent);
