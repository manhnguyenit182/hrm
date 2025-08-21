import { Employees, Departments, Positions } from "@/db/prisma";

export type { Employees };
export type EmployeeWithRelations = Employees & {
  department: Departments | null;
  position: Positions | null;
};

export type DataTableEmployee = EmployeeWithRelations & { fullName: string };
