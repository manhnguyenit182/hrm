import { DataTableEmployee, EmployeeWithRelations } from "./types";

export const employeesTableMapping = (
  data: EmployeeWithRelations[]
): DataTableEmployee[] => {
  return data.map((employee) => ({
    ...employee,
    fullName: employee.lastName + " " + employee.firstName,
  }));
};
