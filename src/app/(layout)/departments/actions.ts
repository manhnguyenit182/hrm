"use server";
import { prisma } from "@/lib/prisma";
import { Departments, CreateDepartment, DepartmentWithEmployees } from "./type";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { buildNameSearchCondition } from "@/lib/search-helpers";
import { createDepartmentSchema } from "@/lib/validations";

export const getDepartments = async (): Promise<DepartmentWithEmployees[]> => {
  try {
    const departments = await prisma.departments.findMany({
      include: {
        Employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            phone: true,
            email: true,
            type: true,
            image: true,
            job: true,
          },
          orderBy: {
            createdAt: "asc", // Sắp xếp employees theo createdAt từ mới nhất
          },
        },
      },
      orderBy: {
        name: "asc", // Sắp xếp departments theo tên A-Z
      },
    });
    return departments;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const createDepartment = async (
  data: CreateDepartment
): Promise<Departments> => {
  try {
    const parsed = createDepartmentSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const authCheck = await requirePermission(PERMISSIONS.DEPARTMENTS.CREATE);
    if (!authCheck.authorized) {
      throw new Error(authCheck.error);
    }

    const department = await prisma.departments.create({
      data,
    });
    return department;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};

export const getDepartmentsById = async (
  id: string,
  query?: string
): Promise<DepartmentWithEmployees | null> => {
  try {
    // Build where condition for employees search
    const employeesWhere = query
      ? buildNameSearchCondition(query)
      : {};

    const department = await prisma.departments.findUnique({
      where: { id },
      include: {
        Employees: {
          where: employeesWhere, // Apply search filter to employees
          select: {
            id: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            phone: true,
            email: true,
            type: true,
            image: true,
            job: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    return department;
  } catch (error) {
    console.error("Error fetching department by ID:", error);
    throw error;
  }
};
