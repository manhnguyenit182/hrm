"use server";

import { PrismaClient } from "@/db/prisma";
import { Holidays } from "./types";

const prisma = new PrismaClient();

export const addHoliday = async (holidayData: Holidays) => {
  try {
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
