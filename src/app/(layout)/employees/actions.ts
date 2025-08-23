"use server";
// import { PrismaClient, Employees } from "@/db/prisma";
import { PrismaClient } from "@/db/prisma";
import { EmployeeWithRelations, Employees } from "./types";

const prisma = new PrismaClient();

const getEmployees = async (): Promise<EmployeeWithRelations[]> => {
  try {
    const employees = await prisma.employees.findMany({
      include: {
        department: true,
        position: true,
      },
    });
    return employees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees");
  }
};

const createEmployee = async (
  data: Employees
): Promise<EmployeeWithRelations> => {
  try {
    const employee = await prisma.employees.create({
      data,
      include: {
        department: true,
        position: true,
      },
    });
    return employee;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw new Error("Failed to create employee");
  }
};

const updateEmployee = async (
  id: string,
  data: Employees
): Promise<Employees> => {
  try {
    const employee = await prisma.employees.update({
      where: { id },
      data,
    });
    return employee;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw new Error("Failed to update employee");
  }
};

const deleteEmployee = async (id: string): Promise<Employees> => {
  try {
    const employee = await prisma.employees.delete({
      where: { id },
    });
    return employee;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw new Error("Failed to delete employee");
  }
};

export { getEmployees, createEmployee, updateEmployee, deleteEmployee };
