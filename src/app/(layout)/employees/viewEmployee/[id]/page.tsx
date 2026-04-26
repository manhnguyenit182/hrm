import React from "react";
import { getEmployeeById, getPosition, getUser } from "../../actions";
import { getDepartments } from "../../../departments/actions";
import { getJobs } from "../../../jobs/actions";
import { getEmployeeDocuments } from "../../documentActions";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { ViewEmployeeClient } from "./components/ViewEmployeeClient";

interface EditEmployeePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewEmployeePage({ params }: EditEmployeePageProps): Promise<React.JSX.Element> {
  // Wait for params to resolve
  const resolvedParams = await params;
  const employeeId = resolvedParams.id;

  const check = await requirePermission(PERMISSIONS.EMPLOYEES.VIEW);
  if (!check.authorized) {
    notFound();
  }

  // Fetch initial data on the server in parallel where possible
  const [
    foundEmployee,
    user,
    documentEmployee,
    departmentsData,
    jobsData,
    positionsData,
  ] = await Promise.all([
    getEmployeeById(employeeId),
    getUser(employeeId),
    getEmployeeDocuments(employeeId),
    getDepartments(),
    getJobs(),
    getPosition(),
  ]);

  return (
    <ViewEmployeeClient
      initialEmployee={foundEmployee}
      initialUserAccount={user}
      initialDocuments={documentEmployee.documents || []}
      departments={departmentsData}
      jobs={jobsData}
      positions={positionsData}
    />
  );
}
