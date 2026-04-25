"use server";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
