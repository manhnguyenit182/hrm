"use server";
import { PrismaClient } from "@/db/prisma";
import { Departments, CreateDepartment, DepartmentWithEmployees } from "./type";
const prisma = new PrismaClient();

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
    const department = await prisma.departments.create({
      data,
    });
    return department;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};
