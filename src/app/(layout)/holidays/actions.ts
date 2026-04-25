"use server";

import { prisma } from "@/lib/prisma";
import { Holidays } from "./types";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { holidaySchema } from "@/lib/validations";

export const addHoliday = async (holidayData: Holidays) => {
  try {
    const parsed = holidaySchema.safeParse(holidayData);
    if (!parsed.success) {
      throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const authCheck = await requirePermission(PERMISSIONS.HOLIDAYS.CREATE);
    if (!authCheck.authorized) throw new Error(authCheck.error);

    const holiday = await prisma.holidays.create({
      data: holidayData,
    });
    return holiday;
  } catch (error) {
    console.error("Error adding holiday:", error);
    throw new Error("Could not add holiday");
  }
};

export const getHolidays = async (): Promise<Holidays[]> => {
  try {
    const holidays = await prisma.holidays.findMany({
      orderBy: {
        date: "asc",
      },
    });
    return holidays;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    throw new Error("Could not fetch holidays");
  }
};
