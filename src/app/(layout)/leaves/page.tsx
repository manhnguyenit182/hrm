import React from "react";
import { getLeaveRequestsByEmployeeId } from "./actions";
import { requirePermission, verifyAuth } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { LeavesClient } from "./components/LeavesClient";
import { LeaveRequests } from "@/db/prisma";

export default async function LeavesPage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.LEAVES.VIEW_OWN);
  if (!check.authorized) {
    notFound();
  }

  const auth = await verifyAuth();
  let initialLeaveRequests: LeaveRequests[] = [];
  if (auth.user?.employee?.id) {
    initialLeaveRequests = await getLeaveRequestsByEmployeeId(auth.user.employee.id);
  }

  return <LeavesClient initialLeaveRequests={initialLeaveRequests} />;
}
