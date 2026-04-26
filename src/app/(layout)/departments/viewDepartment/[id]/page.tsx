import React from "react";
import { getDepartmentsById } from "../../actions";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { ViewDepartmentClient } from "./components/ViewDepartmentClient";

export default async function ViewDepartmentPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}): Promise<React.JSX.Element> {
  // Wait for params to resolve
  const resolvedParams = await params;
  const departmentId = resolvedParams.id;

  const check = await requirePermission(PERMISSIONS.DEPARTMENTS.VIEW_MEMBERS);
  if (!check.authorized) {
    notFound();
  }

  // Fetch initial data on the server
  const data = await getDepartmentsById(departmentId, "");

  return (
    <ViewDepartmentClient
      departmentId={departmentId}
      initialEmployees={data ? data.Employees : []}
    />
  );
}
