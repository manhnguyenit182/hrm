"use server";
// import { PrismaClient, Employees } from "@/db/prisma";
import { PrismaClient } from "@/db/prisma";
import { EmployeeWithRelations, Employees } from "./types";

const prisma = new PrismaClient();

const getEmployees = async (
  query?: string
): Promise<EmployeeWithRelations[]> => {
  try {
    const whereCondition = query
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

    const employees = await prisma.employees.findMany({
      where: whereCondition,
      include: {
        department: true,
        position: true,
        job: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return employees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees");
  }
};

const getPosition = async () => {
  try {
    const positions = await prisma.positions.findMany();
    return positions;
  } catch (error) {
    console.error("Error fetching positions:", error);
    throw new Error("Failed to fetch positions");
  }
};

const createEmployee = async (
  data: Employees
): Promise<{ employee: Employees; success: boolean; error?: string }> => {
  try {
    const newEmployee = await prisma.employees.create({
      data,
    });
    return {
      employee: newEmployee,
      success: true,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return {
      employee: {} as Employees,
      success: false,
      error: error.message || "Failed to create employee",
    };
  }
};

const deleteEmployee = async (
  id: string
): Promise<{ success: boolean; employee: Employees | null }> => {
  try {
    const employee = await prisma.employees.delete({
      where: { id },
    });
    return { success: true, employee: employee };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, employee: null };
  }
};

const getEmployeeById = async (
  id: string
): Promise<EmployeeWithRelations | null> => {
  try {
    const employee = await prisma.employees.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        job: true,
      },
    });
    return employee;
  } catch (error) {
    console.error("Error fetching employee by ID:", error);
    throw new Error("Failed to fetch employee");
  }
};

export {
  getEmployees,
  getEmployeeById,
  createEmployee,
  deleteEmployee,
  getPosition,
};
