"use server";
import { PrismaClient, Employees } from "@/db/prisma";
import { EmployeeWithRelations } from "@/types/types";

const prisma = new PrismaClient();

const getEmployees = async (): Promise<EmployeeWithRelations[]> => {
  const employees = await prisma.employees.findMany({
    include: {
      department: true,
      position: true,
    },
  });
  return employees;
};

const createEmployee = async (data: Employees): Promise<Employees> => {
  const employee = await prisma.employees.create({
    data,
  });
  return employee;
};

const updateEmployee = async (
  id: string,
  data: Employees
): Promise<Employees> => {
  const employee = await prisma.employees.update({
    where: { id },
    data,
  });
  return employee;
};

const deleteEmployee = async (id: string): Promise<Employees> => {
  const employee = await prisma.employees.delete({
    where: { id },
  });
  return employee;
};

export { getEmployees, createEmployee, updateEmployee, deleteEmployee };
