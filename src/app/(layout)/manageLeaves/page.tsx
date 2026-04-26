import React from "react";
import { getLeaveRequestsByDepartment, getLeaveRequestsByDepartmentById } from "./actions";
import { requirePermission, verifyAuth } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { ManageLeavesClient } from "./components/ManageLeavesClient";
import { LeaveRequests, Employees } from "@/db/prisma";

type LeaveRequestWithEmployee = LeaveRequests & {
  employee: Employees | null;
};

export default async function ManageLeavesPage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.LEAVES.APPROVE);
  if (!check.authorized) {
    notFound();
  }

  const auth = await verifyAuth();
  let initialLeaveRequests: LeaveRequestWithEmployee[] = [];
  
  if (auth.user?.employee?.email === "ceo@company.com") {
    initialLeaveRequests = await getLeaveRequestsByDepartmentById("cmg28h7vp0045iaea6zy5fjev");
  } else if (auth.user?.employee?.departmentId) {
    initialLeaveRequests = await getLeaveRequestsByDepartment(auth.user.employee.departmentId);
  }

  return <ManageLeavesClient initialLeaveRequests={initialLeaveRequests} />;
}
