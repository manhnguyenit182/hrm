import { Employees, LeaveRequests } from "@/db/prisma";

export type { LeaveRequests };

export type EmployeesLeaveRequest = Employees & {
  LeaveRequests: LeaveRequests[];
};
