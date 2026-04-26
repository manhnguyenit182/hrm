import React from "react";
import { getHolidays } from "./actions";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { HolidaysClient } from "./components/HolidaysClient";

export default async function HolidaysPage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.HOLIDAYS.VIEW);
  if (!check.authorized) {
    notFound();
  }

  // Fetch initial data on the server
  const initialHolidays = await getHolidays();

  return <HolidaysClient initialHolidays={initialHolidays} />;
}
