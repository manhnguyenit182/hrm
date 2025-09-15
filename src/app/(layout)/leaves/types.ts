import { LeaveRequests } from "@/db/prisma";

export type { LeaveRequests };

export type CreateLeaveRequest = Omit<
  LeaveRequests,
  "createdAt" | "updatedAt" | "id"
>;

export type FormLeaveRequestType = Omit<
  LeaveRequests,
  "id" | "employeeId" | "createdAt" | "updatedAt" | "startDate" | "endDate"
> & {
  dateRange: Array<Date>;
};
