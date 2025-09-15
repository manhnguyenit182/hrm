"use server";
import { PrismaClient } from "@/db/prisma";
import { CreateLeaveRequest } from "./types";

const prisma = new PrismaClient();

export async function createLeaveRequest(data: CreateLeaveRequest) {
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
