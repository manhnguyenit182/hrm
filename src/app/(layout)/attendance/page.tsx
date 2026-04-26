import React from "react";
import { getAttendance } from "./actions";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { AttendanceClient } from "./components/AttendanceClient";

export default async function AttendancePage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.ATTENDANCE.CREATE);
  if (!check.authorized) {
    notFound();
  }

  // Fetch initial data on the server
  const result = await getAttendance();

  return <AttendanceClient initialAttendance={result.data} />;
}
