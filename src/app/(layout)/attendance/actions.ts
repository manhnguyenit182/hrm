"use server";

import { prisma } from "@/lib/prisma";
export const getAttendance = async () => {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        employee: {
          include: {
            position: true,
            job: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    return attendance;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw new Error("Failed to fetch attendance");
  }
};
