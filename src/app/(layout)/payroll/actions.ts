"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { payrollStatusSchema } from "@/lib/validations";

// Cập nhật trạng thái lương của nhân viên
export async function updatePayrollStatus(employeeId: string, status: string) {
  try {
    const parsed = payrollStatusSchema.safeParse({ employeeId, status });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((e: any) => e.message).join(", ") };
    }

    const authCheck = await requirePermission(PERMISSIONS.PAYROLL.UPDATE);
    if (!authCheck.authorized) return { success: false, error: authCheck.error };

    const updatedEmployee = await prisma.employees.update({
      where: {
        id: employeeId,
      },
      data: {
        status: status,
      },
    });

    revalidatePath("/payroll");
    return { success: true, employee: updatedEmployee };
  } catch (error) {
    console.error("Error updating payroll status:", error);
    return { success: false, error: "Không thể cập nhật trạng thái lương" };
  }
}

// Lấy thông tin chi tiết của nhân viên theo ID
export async function getEmployeeById(employeeId: string) {
  try {
    const employee = await prisma.employees.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        department: true,
        position: true,
        job: true,
      },
    });

    return employee;
  } catch (error) {
    console.error("Error fetching employee:", error);
    return null;
  }
}
