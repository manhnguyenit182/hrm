"use server";

import { PrismaClient } from "@/db/prisma";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Cập nhật trạng thái lương của nhân viên
export async function updatePayrollStatus(employeeId: string, status: string) {
  try {
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
