"use client";

import React from "react";
import { Button } from "primereact/button";
import { PERMISSIONS } from "@/constants/permissions";
import {
  useCheckPermission,
  useCheckAnyPermission,
  useCheckAllPermissions,
} from "@/hooks/usePermission";

/**
 * Component demo cách sử dụng permission hooks
 */
export function PermissionExample() {
  // Kiểm tra permission đơn lẻ để enable/disable button
  const canCreateEmployee = useCheckPermission(PERMISSIONS.EMPLOYEES.CREATE);
  const canViewEmployees = useCheckPermission(PERMISSIONS.EMPLOYEES.VIEW);
  const canDeleteEmployee = useCheckPermission(PERMISSIONS.EMPLOYEES.DELETE);

  // Kiểm tra nhiều permissions (ít nhất một cái)
  const canManageEmployees = useCheckAnyPermission([
    PERMISSIONS.EMPLOYEES.CREATE,
    PERMISSIONS.EMPLOYEES.UPDATE,
    PERMISSIONS.EMPLOYEES.DELETE,
  ]);

  // Kiểm tra nhiều permissions (tất cả)
  const canFullyManageEmployees = useCheckAllPermissions([
    PERMISSIONS.EMPLOYEES.VIEW,
    PERMISSIONS.EMPLOYEES.CREATE,
    PERMISSIONS.EMPLOYEES.UPDATE,
    PERMISSIONS.EMPLOYEES.DELETE,
  ]);

  return (
    <div className="p-4 space-y-4">
      <h3>Permission Demo</h3>

      {/* Button chỉ hiện khi có permission */}
      {canCreateEmployee && (
        <Button label="Tạo nhân viên mới" className="p-button-success" />
      )}

      {/* Button disabled khi không có permission */}
      <Button
        label="Xem danh sách nhân viên"
        disabled={!canViewEmployees}
        className={!canViewEmployees ? "p-button-secondary" : ""}
      />

      {/* Button với logic phức tạp */}
      <Button
        label="Xóa nhân viên"
        disabled={!canDeleteEmployee}
        severity={canDeleteEmployee ? "danger" : "secondary"}
        tooltip={!canDeleteEmployee ? "Bạn không có quyền xóa nhân viên" : ""}
      />

      {/* Hiện section khi có ít nhất một permission quản lý */}
      {canManageEmployees && (
        <div className="border p-3 rounded">
          <h4>Quản lý nhân viên</h4>
          <p>Bạn có thể thực hiện một số thao tác quản lý nhân viên.</p>
        </div>
      )}

      {/* Hiện section đặc biệt khi có đầy đủ permissions */}
      {canFullyManageEmployees && (
        <div className="border p-3 rounded bg-green-50">
          <h4>Quản lý toàn quyền</h4>
          <p>Bạn có đầy đủ quyền quản lý nhân viên.</p>
        </div>
      )}

      {/* Debug info */}
      <div className="text-sm text-gray-600">
        <p>canCreateEmployee: {canCreateEmployee.toString()}</p>
        <p>canViewEmployees: {canViewEmployees.toString()}</p>
        <p>canManageEmployees: {canManageEmployees.toString()}</p>
        <p>canFullyManageEmployees: {canFullyManageEmployees.toString()}</p>
      </div>
    </div>
  );
}
