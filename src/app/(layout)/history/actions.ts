"use server";
import { PrismaClient } from "@/db/prisma";
import { EmployeesLeaveRequest } from "./types";

const prisma = new PrismaClient();

export const getEmployeeByIdLeaveRequests = async (
  id: string
): Promise<EmployeesLeaveRequest | null> => {
  try {
    const employee = await prisma.employees.findUnique({
      where: { id },
      include: {
        LeaveRequests: true,
      },
    });
    return employee;
  } catch (error) {
    console.error("Error fetching employee by ID:", error);
    throw new Error("Failed to fetch employee");
  }
};
