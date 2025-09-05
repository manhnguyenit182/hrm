"use server";

import { PrismaClient } from "@/db/prisma";

const prisma = new PrismaClient();

export const getOrganizationChart = async () => {
  try {
    // Lấy CEO
    const ceo = await prisma.employees.findFirst({
      where: {
        position: {
          title: "CEO",
        },
      },
      include: {
        position: true,
        job: true,
        department: true,
      },
    });

    // Lấy các C-level executives (COO, CTO, CFO)
    const executives = await prisma.employees.findMany({
      where: {
        position: {
          title: {
            in: ["COO", "CTO", "CFO", "CPO"],
          },
        },
      },
      include: {
        position: true,
        job: true,
        department: true,
      },
    });

    // Lấy các trưởng phòng
    const departmentHeads = await prisma.employees.findMany({
      where: {
        position: {
          title: "Trưởng Phòng",
        },
        NOT: {
          department: {
            name: "Ban Giám Đốc",
          },
        },
      },
      include: {
        position: true,
        job: true,
        department: true,
      },
    });

    // Lấy nhân viên khác
    const otherEmployees = await prisma.employees.findMany({
      where: {
        position: {
          title: {
            notIn: ["CEO", "COO", "CTO", "CFO", "CPO", "Trưởng Phòng"],
          },
        },
      },
      include: {
        position: true,
        job: true,
        department: true,
      },
    });

    return {
      ceo,
      executives,
      departmentHeads,
      otherEmployees,
    };
  } catch (error) {
    console.error("Error fetching organization chart:", error);
    throw new Error("Failed to fetch organization chart");
  }
};

export async function getJobById(id: string) {
  return prisma.jobs.findUnique({
    where: { id },
  });
}
