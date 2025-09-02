"use server";

import { PrismaClient } from "@/db/prisma";

const prisma = new PrismaClient();
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
