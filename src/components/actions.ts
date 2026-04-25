"use server";

import { prisma } from "@/lib/prisma";
import { getHierarchyLevel } from "@/constants/org-chart";

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

    // Group in application layer using centralized hierarchy mapping
    const ceo = allEmployees.find((e) => getHierarchyLevel(e.position?.title) === 1) || null;

    const executives = allEmployees.filter(
      (e) => getHierarchyLevel(e.position?.title) === 2
    );

    const departmentHeads = allEmployees.filter(
      (e) =>
        getHierarchyLevel(e.position?.title) === 3 &&
        e.department?.name !== "Ban Giám Đốc" // Optional: preserve existing business rule
    );

    const otherEmployees = allEmployees.filter(
      (e) => getHierarchyLevel(e.position?.title) === 4
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
