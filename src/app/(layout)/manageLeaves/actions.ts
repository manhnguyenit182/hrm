"use server";
import { PrismaClient } from "@/db/prisma";
const prisma = new PrismaClient();

export async function getLeaveRequestsByDepartment(departmentId: string) {
  return prisma.leaveRequests.findMany({
    where: { departmentId },
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateLeaveRequestStatus(
  leaveRequestId: string,
  status: "approved" | "rejected"
) {
  try {
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
