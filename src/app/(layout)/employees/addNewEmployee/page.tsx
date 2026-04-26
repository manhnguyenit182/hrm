import React from "react";
import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getDepartmentOptions, getPositionOptions, getJobOptions } from "./helper";
import { EmployeeFormContainer } from "./components/EmployeeFormContainer";

export default async function AddNewEmployeePage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.EMPLOYEES.CREATE);
  if (!check.authorized) {
    notFound();
  }

  // Fetch initial data on the server
  const [departmentOptions, positionOptions, jobOptions] = await Promise.all([
    getDepartmentOptions(),
    getPositionOptions(),
    getJobOptions(),
  ]);

  return (
    <EmployeeFormContainer
      departmentOptions={departmentOptions}
      positionOptions={positionOptions}
      jobOptions={jobOptions}
    />
  );
}
