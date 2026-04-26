import React from "react";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { HistoryClient } from "./components/HistoryClient";

export default async function HistoryPage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.EMPLOYEES.VIEW);
  if (!check.authorized) {
    notFound();
  }

  return <HistoryClient />;
}
