import React from "react";
import { PERMISSIONS } from "@/constants/permissions";
import { withPermission } from "@/components/PermissionGuard";
import { getDepartmentOptions, getPositionOptions, getJobOptions } from "./helper";
import { EmployeeFormContainer } from "./components/EmployeeFormContainer";

async function AddNewEmployeePageComponent(): Promise<React.JSX.Element> {
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

const AddNewEmployeePage = withPermission(PERMISSIONS.EMPLOYEES.CREATE, {
  redirectToNotFound: true,
})(AddNewEmployeePageComponent);

export default AddNewEmployeePage;
