import React from "react";
import { getEmployees } from "./actions";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { EmployeesClient } from "./components/EmployeesClient";
import { employeesTableMapping } from "./helpers";

export default async function EmployeesPage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.EMPLOYEES.CREATE); // Keeps original permission
  if (!check.authorized) {
    notFound();
  }

  // Fetch initial data on the server
  const rawEmployees = await getEmployees();
  const initialEmployees = employeesTableMapping(rawEmployees);

  return <EmployeesClient initialEmployees={initialEmployees} />;
}
