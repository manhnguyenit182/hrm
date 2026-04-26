import React from "react";
import { getJobData } from "./component/helper";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { notFound } from "next/navigation";
import { JobsClient } from "./component/JobsClient";

export default async function JobsPage(): Promise<React.JSX.Element> {
  const check = await requirePermission(PERMISSIONS.JOBS.VIEW);
  if (!check.authorized) {
    notFound();
  }

  // Fetch initial data on the server
  const initialJobData = await getJobData();

  return <JobsClient initialJobData={initialJobData} />;
}
