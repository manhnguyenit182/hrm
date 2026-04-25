import { z } from "zod";

// =============================================
// Employee Schemas
// =============================================

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "Họ không được để trống").max(100),
  lastName: z.string().min(1, "Tên không được để trống").max(100),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  gender: z.string().nullable().optional(),
  birthday: z.coerce.date().nullable().optional(),
  maritalStatus: z.string().nullable().optional(),
  nationality: z.string().max(100).nullable().optional(),
  departmentId: z.string().cuid().nullable().optional(),
  positionId: z.string().cuid().nullable().optional(),
  jobId: z.string().cuid().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  type: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),

  user: z.object({
    employeeId: z.string(),
    email: z.string().email("Email tài khoản không hợp lệ"),
    firstName: z.string().min(1, "Tên tài khoản không được để trống"),
    lastName: z.string().min(1, "Họ tài khoản không được để trống"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .max(128, "Mật khẩu quá dài"),
  }),

  documents: z
    .array(
      z.object({
        fileName: z.string().min(1),
        fileUrl: z.string().url(),
        publicId: z.string(),
        fileSize: z.number().positive(),
        documentType: z.string().min(1),
        description: z.string().optional(),
        mimeType: z.string().optional(),
      })
    )
    .optional(),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  gender: z.string().nullable().optional(),
  birthday: z.coerce.date().nullable().optional(),
  maritalStatus: z.string().nullable().optional(),
  nationality: z.string().max(100).nullable().optional(),
  departmentId: z.string().cuid().nullable().optional(),
  positionId: z.string().cuid().nullable().optional(),
  jobId: z.string().cuid().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  type: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),
  deduction: z.number().nullable().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Email không hợp lệ").optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(128).optional(),
});

// =============================================
// Department Schemas
// =============================================

export const createDepartmentSchema = z.object({
  name: z.string().min(1, "Tên phòng ban không được để trống").max(200),
  location: z.string().max(500).nullable().optional(),
});

// =============================================
// Job Schemas
// =============================================

export const jobFormSchema = z.object({
  job: z.string().min(1, "Tên công việc không được để trống").max(200).nullable(),
  salary: z.number().min(0, "Lương phải lớn hơn hoặc bằng 0").nullable(),
  type: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  departmentId: z.string().cuid("ID phòng ban không hợp lệ").nullable().optional(),
});

export const jobStatusSchema = z.object({
  status: z.enum(["Active", "Ended", "Completed"], {
    errorMap: () => ({ message: "Trạng thái không hợp lệ" }),
  }),
});

// =============================================
// Holiday Schemas
// =============================================

export const holidaySchema = z.object({
  name: z.string().min(1, "Tên ngày lễ không được để trống").max(200).nullable(),
  date: z.coerce.date({ errorMap: () => ({ message: "Ngày không hợp lệ" }) }),
  day: z.string().nullable().optional(),
});

// =============================================
// Payroll Schemas
// =============================================

export const payrollStatusSchema = z.object({
  employeeId: z.string().cuid("ID nhân viên không hợp lệ"),
  status: z.string().min(1, "Trạng thái không được để trống"),
});

// =============================================
// Common Schemas
// =============================================

export const idSchema = z.string().cuid("ID không hợp lệ");
