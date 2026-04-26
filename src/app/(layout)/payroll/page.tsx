import React from "react";
import { getEmployees } from "../employees/actions";
import { employeesTableMapping } from "../employees/helpers";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { PayrollClient } from "./components/PayrollClient";

export default async function PayrollPage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.PAYROLL.VIEW);
  if (!check.authorized) {
    notFound();
  }

  // Fetch initial data on the server
  const data = await getEmployees();
  const initialEmployees = employeesTableMapping(data);

  return <PayrollClient initialEmployees={initialEmployees} />;
}
