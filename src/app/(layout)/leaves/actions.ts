"use server";
import { prisma } from "@/lib/prisma";

export async function createLeaveRequest(data: any) {
  const leaveRequest = await prisma.leaveRequests.create({ data });
  return leaveRequest;
}

export async function getLeaveRequestsByEmployeeId(employeeId: string) {
  const leaveRequests = await prisma.leaveRequests.findMany({
    where: { employeeId },
    orderBy: { startDate: "desc" },
  });
  return leaveRequests;
}
