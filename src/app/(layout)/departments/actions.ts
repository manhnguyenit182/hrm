"use server";
import { PrismaClient, Departments } from "@/db/prisma";

const prisma = new PrismaClient();

export type DepartmentType = Departments;

const getDepartments = async (): Promise<DepartmentType[]> => {
  try {
    const departments = await prisma.departments.findMany();
    return departments;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

const createDepartment = async (
  data: Omit<DepartmentType, "id" | "createdAt" | "updatedAt">
): Promise<DepartmentType> => {
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

export { getDepartments, createDepartment };
