import { Employees, Departments, Positions, Jobs } from "@/db/prisma";

export type { Employees };
export type EmployeeWithRelations = Employees & {
  department: Departments | null;
  position: Positions | null;
};

export type DataTableEmployee = EmployeeWithRelations & { fullName: string };

export type EmployeesFormValues = EmployeeWithRelations & {
  job: Jobs | null;
};
