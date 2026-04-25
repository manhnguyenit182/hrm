"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";

export async function getLeaveRequestsByDepartment(departmentId: string) {
  return prisma.leaveRequests.findMany({
    where: { departmentId },
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLeaveRequestsByDepartmentById(employeeId: string) {
  return prisma.leaveRequests.findMany({
    where: { employeeId },
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateLeaveRequestStatus(
  leaveRequestId: string,
  status: "approved" | "rejected"
) {
  try {
    const authCheck = await requirePermission(PERMISSIONS.LEAVES.APPROVE);
    if (!authCheck.authorized) return { success: false, error: authCheck.error };

    const updatedRequest = await prisma.leaveRequests.update({
      where: { id: leaveRequestId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: { employee: true },
    });
    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error("Error updating leave request status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái đơn nghỉ phép",
    };
  }
}
