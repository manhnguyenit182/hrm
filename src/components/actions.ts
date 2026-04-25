"use server";

import { prisma } from "@/lib/prisma";


export const getOrganizationChart = async () => {
  try {
    // Single query to fetch all employees with their relations
    const allEmployees = await prisma.employees.findMany({
      include: {
        position: true,
        job: true,
        department: true,
      },
    });

    // Group in application layer
    const ceo = allEmployees.find((e) => e.position?.title === "CEO") || null;

    const executiveTitles = ["COO", "CTO", "CFO", "CPO"];
    const executives = allEmployees.filter((e) =>
      executiveTitles.includes(e.position?.title || "")
    );

    const departmentHeads = allEmployees.filter(
      (e) =>
        e.position?.title === "Trưởng Phòng" &&
        e.department?.name !== "Ban Giám Đốc"
    );

    const excludedTitles = [...executiveTitles, "CEO", "Trưởng Phòng"];
    const otherEmployees = allEmployees.filter(
      (e) => !excludedTitles.includes(e.position?.title || "")
    );

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
