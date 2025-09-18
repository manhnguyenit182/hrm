// Permission constants for HRM application
export const PERMISSIONS = {
  // Employee Management
  EMPLOYEES: {
    VIEW: "employees:view",
    CREATE: "employees:create",
    UPDATE: "employees:update",
    DELETE: "employees:delete",
    VIEW_PROFILE: "employees:view_profile",
    UPDATE_PROFILE: "employees:update_profile",
    VIEW_SALARY: "employees:view_salary",
    UPDATE_SALARY: "employees:update_salary",
  },

  // Department Management
  DEPARTMENTS: {
    VIEW: "departments:view",
    CREATE: "departments:create",
    UPDATE: "departments:update",
    DELETE: "departments:delete",
    ASSIGN_EMPLOYEES: "departments:assign_employees",
    VIEW_MEMBERS: "departments:view_members",
  },

  // Attendance Management
  ATTENDANCE: {
    VIEW: "attendance:view",
    CREATE: "attendance:create",
    UPDATE: "attendance:update",
    DELETE: "attendance:delete",
    VIEW_OWN: "attendance:view_own",
    UPDATE_OWN: "attendance:update_own",
    VIEW_REPORTS: "attendance:view_reports",
    APPROVE: "attendance:approve",
  },

  // Holiday Management
  HOLIDAYS: {
    VIEW: "holidays:view",
    CREATE: "holidays:create",
    UPDATE: "holidays:update",
    DELETE: "holidays:delete",
    MANAGE: "holidays:manage",
  },

  // Leave Management
  LEAVES: {
    VIEW: "leaves:view",
    CREATE: "leaves:create",
    UPDATE: "leaves:update",
    DELETE: "leaves:delete",
    VIEW_OWN: "leaves:view_own",
    CREATE_OWN: "leaves:create_own",
    UPDATE_OWN: "leaves:update_own",
    APPROVE: "leaves:approve",
    REJECT: "leaves:reject",
    VIEW_REPORTS: "leaves:view_reports",
  },

  // Payroll Management
  PAYROLL: {
    VIEW: "payroll:view",
    CREATE: "payroll:create",
    UPDATE: "payroll:update",
    DELETE: "payroll:delete",
    VIEW_OWN: "payroll:view_own",
    PROCESS: "payroll:process",
    APPROVE: "payroll:approve",
    VIEW_REPORTS: "payroll:view_reports",
  },

  // Job Management
  JOBS: {
    VIEW: "jobs:view",
    CREATE: "jobs:create",
    UPDATE: "jobs:update",
    DELETE: "jobs:delete",
    ASSIGN: "jobs:assign",
    MANAGE: "jobs:manage",
  },

  // History/Audit Management
  HISTORY: {
    VIEW: "history:view",
    VIEW_ALL: "history:view_all",
    EXPORT: "history:export",
  },

  // System Management
  SYSTEM: {
    ADMIN: "system:admin",
    MANAGE_USERS: "system:manage_users",
    MANAGE_ROLES: "system:manage_roles",
    MANAGE_PERMISSIONS: "system:manage_permissions",
    VIEW_SYSTEM_LOGS: "system:view_logs",
    BACKUP: "system:backup",
    RESTORE: "system:restore",
  },

  // Report Management
  REPORTS: {
    VIEW: "reports:view",
    CREATE: "reports:create",
    EXPORT: "reports:export",
    VIEW_EMPLOYEE_REPORTS: "reports:view_employee",
    VIEW_DEPARTMENT_REPORTS: "reports:view_department",
    VIEW_ATTENDANCE_REPORTS: "reports:view_attendance",
    VIEW_PAYROLL_REPORTS: "reports:view_payroll",
    VIEW_LEAVE_REPORTS: "reports:view_leave",
  },
} as const;

// Permission groups for easier role assignment
export const PERMISSION_GROUPS = {
  SUPER_ADMIN: [
    ...Object.values(PERMISSIONS.EMPLOYEES),
    ...Object.values(PERMISSIONS.DEPARTMENTS),
    ...Object.values(PERMISSIONS.ATTENDANCE),
    ...Object.values(PERMISSIONS.HOLIDAYS),
    ...Object.values(PERMISSIONS.LEAVES),
    ...Object.values(PERMISSIONS.PAYROLL),
    ...Object.values(PERMISSIONS.JOBS),
    ...Object.values(PERMISSIONS.HISTORY),
    ...Object.values(PERMISSIONS.SYSTEM),
    ...Object.values(PERMISSIONS.REPORTS),
  ],

  HR_MANAGER: [
    ...Object.values(PERMISSIONS.EMPLOYEES),
    ...Object.values(PERMISSIONS.DEPARTMENTS),
    PERMISSIONS.ATTENDANCE.VIEW,
    PERMISSIONS.ATTENDANCE.VIEW_REPORTS,
    PERMISSIONS.ATTENDANCE.APPROVE,
    ...Object.values(PERMISSIONS.HOLIDAYS),
    ...Object.values(PERMISSIONS.LEAVES),
    PERMISSIONS.PAYROLL.VIEW,
    PERMISSIONS.PAYROLL.VIEW_REPORTS,
    ...Object.values(PERMISSIONS.JOBS),
    PERMISSIONS.HISTORY.VIEW,
    PERMISSIONS.HISTORY.VIEW_ALL,
    ...Object.values(PERMISSIONS.REPORTS),
  ],

  DEPARTMENT_MANAGER: [
    PERMISSIONS.EMPLOYEES.VIEW,
    PERMISSIONS.EMPLOYEES.VIEW_PROFILE,
    PERMISSIONS.DEPARTMENTS.VIEW,
    PERMISSIONS.DEPARTMENTS.VIEW_MEMBERS,
    PERMISSIONS.ATTENDANCE.VIEW,
    PERMISSIONS.ATTENDANCE.VIEW_REPORTS,
    PERMISSIONS.ATTENDANCE.APPROVE,
    PERMISSIONS.HOLIDAYS.VIEW,
    PERMISSIONS.LEAVES.VIEW_OWN,
    PERMISSIONS.LEAVES.CREATE_OWN,
    PERMISSIONS.LEAVES.APPROVE,
    PERMISSIONS.LEAVES.REJECT,
    PERMISSIONS.LEAVES.VIEW_REPORTS,
    PERMISSIONS.PAYROLL.VIEW_REPORTS,
    PERMISSIONS.HISTORY.VIEW,
    PERMISSIONS.REPORTS.VIEW,
    PERMISSIONS.REPORTS.VIEW_EMPLOYEE_REPORTS,
    PERMISSIONS.REPORTS.VIEW_DEPARTMENT_REPORTS,
    PERMISSIONS.REPORTS.VIEW_ATTENDANCE_REPORTS,
    PERMISSIONS.REPORTS.VIEW_LEAVE_REPORTS,
  ],

  EMPLOYEE: [
    PERMISSIONS.EMPLOYEES.VIEW_PROFILE,
    PERMISSIONS.EMPLOYEES.UPDATE_PROFILE,
    PERMISSIONS.ATTENDANCE.VIEW_OWN,
    PERMISSIONS.ATTENDANCE.UPDATE_OWN,
    PERMISSIONS.HOLIDAYS.VIEW,
    PERMISSIONS.HISTORY.VIEW,
    PERMISSIONS.LEAVES.VIEW_OWN,
    PERMISSIONS.LEAVES.CREATE_OWN,
    PERMISSIONS.LEAVES.UPDATE_OWN,
    PERMISSIONS.PAYROLL.VIEW_OWN,
  ],
} as const;

// Helper function to check if user has specific permission
export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  return (
    userPermissions.includes(requiredPermission) ||
    userPermissions.includes(PERMISSIONS.SYSTEM.ADMIN)
  );
};

// Helper function to check if user has any of the required permissions
export const hasAnyPermission = (
  userPermissions: string[],
  requiredPermissions: string[]
): boolean => {
  return requiredPermissions.some((permission) =>
    hasPermission(userPermissions, permission)
  );
};

// Helper function to check if user has all required permissions
export const hasAllPermissions = (
  userPermissions: string[],
  requiredPermissions: string[]
): boolean => {
  return requiredPermissions.every((permission) =>
    hasPermission(userPermissions, permission)
  );
};

// Get all permissions as a flat array
export const getAllPermissions = (): string[] => {
  const allPermissions: string[] = [];
  Object.values(PERMISSIONS).forEach((module) => {
    Object.values(module).forEach((permission) => {
      allPermissions.push(permission);
    });
  });
  return allPermissions;
};

// Permission descriptions for UI display
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.EMPLOYEES.VIEW]: "Xem danh sách nhân viên",
  [PERMISSIONS.EMPLOYEES.CREATE]: "Tạo nhân viên mới",
  [PERMISSIONS.EMPLOYEES.UPDATE]: "Cập nhật thông tin nhân viên",
  [PERMISSIONS.EMPLOYEES.DELETE]: "Xóa nhân viên",
  [PERMISSIONS.EMPLOYEES.VIEW_PROFILE]: "Xem hồ sơ nhân viên",
  [PERMISSIONS.EMPLOYEES.UPDATE_PROFILE]: "Cập nhật hồ sơ cá nhân",
  [PERMISSIONS.EMPLOYEES.VIEW_SALARY]: "Xem thông tin lương",
  [PERMISSIONS.EMPLOYEES.UPDATE_SALARY]: "Cập nhật thông tin lương",

  [PERMISSIONS.DEPARTMENTS.VIEW]: "Xem danh sách phòng ban",
  [PERMISSIONS.DEPARTMENTS.CREATE]: "Tạo phòng ban mới",
  [PERMISSIONS.DEPARTMENTS.UPDATE]: "Cập nhật phòng ban",
  [PERMISSIONS.DEPARTMENTS.DELETE]: "Xóa phòng ban",
  [PERMISSIONS.DEPARTMENTS.ASSIGN_EMPLOYEES]:
    "Phân công nhân viên vào phòng ban",
  [PERMISSIONS.DEPARTMENTS.VIEW_MEMBERS]: "Xem thành viên phòng ban",

  [PERMISSIONS.ATTENDANCE.VIEW]: "Xem chấm công",
  [PERMISSIONS.ATTENDANCE.CREATE]: "Tạo bản ghi chấm công",
  [PERMISSIONS.ATTENDANCE.UPDATE]: "Cập nhật chấm công",
  [PERMISSIONS.ATTENDANCE.DELETE]: "Xóa bản ghi chấm công",
  [PERMISSIONS.ATTENDANCE.VIEW_OWN]: "Xem chấm công cá nhân",
  [PERMISSIONS.ATTENDANCE.UPDATE_OWN]: "Cập nhật chấm công cá nhân",
  [PERMISSIONS.ATTENDANCE.VIEW_REPORTS]: "Xem báo cáo chấm công",
  [PERMISSIONS.ATTENDANCE.APPROVE]: "Duyệt chấm công",

  [PERMISSIONS.HOLIDAYS.VIEW]: "Xem danh sách ngày lễ",
  [PERMISSIONS.HOLIDAYS.CREATE]: "Tạo ngày lễ mới",
  [PERMISSIONS.HOLIDAYS.UPDATE]: "Cập nhật ngày lễ",
  [PERMISSIONS.HOLIDAYS.DELETE]: "Xóa ngày lễ",
  [PERMISSIONS.HOLIDAYS.MANAGE]: "Quản lý ngày lễ",

  [PERMISSIONS.LEAVES.VIEW]: "Xem đơn xin nghỉ",
  [PERMISSIONS.LEAVES.CREATE]: "Tạo đơn xin nghỉ",
  [PERMISSIONS.LEAVES.UPDATE]: "Cập nhật đơn xin nghỉ",
  [PERMISSIONS.LEAVES.DELETE]: "Xóa đơn xin nghỉ",
  [PERMISSIONS.LEAVES.VIEW_OWN]: "Xem đơn xin nghỉ cá nhân",
  [PERMISSIONS.LEAVES.CREATE_OWN]: "Tạo đơn xin nghỉ cá nhân",
  [PERMISSIONS.LEAVES.UPDATE_OWN]: "Cập nhật đơn xin nghỉ cá nhân",
  [PERMISSIONS.LEAVES.APPROVE]: "Duyệt đơn xin nghỉ",
  [PERMISSIONS.LEAVES.REJECT]: "Từ chối đơn xin nghỉ",
  [PERMISSIONS.LEAVES.VIEW_REPORTS]: "Xem báo cáo nghỉ phép",

  [PERMISSIONS.PAYROLL.VIEW]: "Xem bảng lương",
  [PERMISSIONS.PAYROLL.CREATE]: "Tạo bảng lương",
  [PERMISSIONS.PAYROLL.UPDATE]: "Cập nhật bảng lương",
  [PERMISSIONS.PAYROLL.DELETE]: "Xóa bảng lương",
  [PERMISSIONS.PAYROLL.VIEW_OWN]: "Xem lương cá nhân",
  [PERMISSIONS.PAYROLL.PROCESS]: "Xử lý bảng lương",
  [PERMISSIONS.PAYROLL.APPROVE]: "Duyệt bảng lương",
  [PERMISSIONS.PAYROLL.VIEW_REPORTS]: "Xem báo cáo lương",

  [PERMISSIONS.JOBS.VIEW]: "Xem danh sách công việc",
  [PERMISSIONS.JOBS.CREATE]: "Tạo công việc mới",
  [PERMISSIONS.JOBS.UPDATE]: "Cập nhật công việc",
  [PERMISSIONS.JOBS.DELETE]: "Xóa công việc",
  [PERMISSIONS.JOBS.ASSIGN]: "Phân công công việc",
  [PERMISSIONS.JOBS.MANAGE]: "Quản lý công việc",

  [PERMISSIONS.HISTORY.VIEW]: "Xem lịch sử",
  [PERMISSIONS.HISTORY.VIEW_ALL]: "Xem toàn bộ lịch sử",
  [PERMISSIONS.HISTORY.EXPORT]: "Xuất lịch sử",

  [PERMISSIONS.SYSTEM.ADMIN]: "Quản trị hệ thống",
  [PERMISSIONS.SYSTEM.MANAGE_USERS]: "Quản lý người dùng",
  [PERMISSIONS.SYSTEM.MANAGE_ROLES]: "Quản lý vai trò",
  [PERMISSIONS.SYSTEM.MANAGE_PERMISSIONS]: "Quản lý quyền",
  [PERMISSIONS.SYSTEM.VIEW_SYSTEM_LOGS]: "Xem nhật ký hệ thống",
  [PERMISSIONS.SYSTEM.BACKUP]: "Sao lưu dữ liệu",
  [PERMISSIONS.SYSTEM.RESTORE]: "Khôi phục dữ liệu",

  [PERMISSIONS.REPORTS.VIEW]: "Xem báo cáo",
  [PERMISSIONS.REPORTS.CREATE]: "Tạo báo cáo",
  [PERMISSIONS.REPORTS.EXPORT]: "Xuất báo cáo",
  [PERMISSIONS.REPORTS.VIEW_EMPLOYEE_REPORTS]: "Xem báo cáo nhân viên",
  [PERMISSIONS.REPORTS.VIEW_DEPARTMENT_REPORTS]: "Xem báo cáo phòng ban",
  [PERMISSIONS.REPORTS.VIEW_ATTENDANCE_REPORTS]: "Xem báo cáo chấm công",
  [PERMISSIONS.REPORTS.VIEW_PAYROLL_REPORTS]: "Xem báo cáo lương",
  [PERMISSIONS.REPORTS.VIEW_LEAVE_REPORTS]: "Xem báo cáo nghỉ phép",
} as const;

// Export types for TypeScript
export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]];
export type PermissionGroup = keyof typeof PERMISSION_GROUPS;
