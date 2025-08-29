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
            phone: true,
            status: true,
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
      ? {
          OR: [
            // Search trong firstName
            { firstName: { contains: query, mode: "insensitive" as const } },
            // Search trong lastName
            { lastName: { contains: query, mode: "insensitive" as const } },
            // Search trong phone
            { phone: { contains: query, mode: "insensitive" as const } },
            ...(query.includes(" ")
              ? (() => {
                  const nameParts = query.trim().split(/\s+/);
                  if (nameParts.length >= 2) {
                    return [
                      // Trường hợp "firstName lastName"
                      {
                        AND: [
                          {
                            firstName: {
                              contains: nameParts[0],
                              mode: "insensitive" as const,
                            },
                          },
                          {
                            lastName: {
                              contains: nameParts[1],
                              mode: "insensitive" as const,
                            },
                          },
                        ],
                      },
                      // Trường hợp "lastName firstName"
                      {
                        AND: [
                          {
                            lastName: {
                              contains: nameParts[0],
                              mode: "insensitive" as const,
                            },
                          },
                          {
                            firstName: {
                              contains: nameParts[1],
                              mode: "insensitive" as const,
                            },
                          },
                        ],
                      },
                    ];
                  }
                  return [];
                })()
              : []),
          ],
        }
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
            status: true,
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
