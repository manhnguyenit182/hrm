import { Employees, Departments, Positions } from "@/db/prisma";

export type EmployeeWithRelations = Employees & {
  department: Departments | null;
  position: Positions | null;
};
