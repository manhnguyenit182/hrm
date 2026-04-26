import React from "react";
import { getDepartments } from "./actions";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { DepartmentsClient } from "./components/DepartmentsClient";

export default async function DepartmentsPage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.DEPARTMENTS.VIEW);
  if (!check.authorized) {
    notFound();
  }

  // Fetch initial data on the server
  const initialDepartments = await getDepartments();

  return <DepartmentsClient initialDepartments={initialDepartments} />;
}
