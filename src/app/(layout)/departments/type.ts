import { Departments, Jobs } from "@/db/prisma";

export type { Departments };
export type CreateDepartment = Omit<
  Departments,
  "id" | "createdAt" | "updatedAt"
>;
export type DepartmentList = Array<Departments>;

// Type cho department với employees
export type DepartmentWithEmployees = Departments & {
  Employees: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
    phone: string | null;
    email: string | null;
    type: string | null;
    image: string | null;
    job: Jobs | null;
  }>;
};
