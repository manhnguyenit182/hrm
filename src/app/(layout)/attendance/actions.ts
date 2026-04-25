"use server";

import { prisma } from "@/lib/prisma";

export const getAttendance = async (
  page: number = 1,
  pageSize: number = 50,
  dateRange?: { from: Date; to: Date }
) => {
  try {
    const where = dateRange
      ? { date: { gte: dateRange.from, lte: dateRange.to } }
      : {};

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.attendance.count({ where }),
    ]);

    return { data, total, page, pageSize };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw new Error("Failed to fetch attendance");
  }
};
