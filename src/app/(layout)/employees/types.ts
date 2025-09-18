import { Employees, Departments, Positions, Jobs, User } from "@/db/prisma";

export type { Employees, User };
export type EmployeeWithRelations = Employees & {
  department: Departments | null;
  position: Positions | null;
  job: Jobs | null;
};

export type NewEmployeeFormData = EmployeeWithRelations & {
  user: User | null;
};

export type DataTableEmployee = EmployeeWithRelations & {
  fullName: string | null;
};
