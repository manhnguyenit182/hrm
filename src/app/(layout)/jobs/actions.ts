"use server";

import { PrismaClient } from "@/db/prisma";
import { JobFormData, Jobs } from "./types";
const prisma = new PrismaClient();

export async function createJob(data: JobFormData) {
  try {
    const newJob = await prisma.jobs.create({
      data: {
        job: data.job,
        salary: data.salary,
        type: data.type,
        status: data.status,
        departmentId: data.departmentId,
      },
    });
    return { success: true, job: newJob };
  } catch (error) {
    console.error("Error creating job:", error);
    return { success: false, error: "Failed to create job" };
  }
}

export async function getJobs(): Promise<Jobs[]> {
  try {
    const jobs = await prisma.jobs.findMany({
      orderBy: { createdAt: "desc" },
    });

    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}
