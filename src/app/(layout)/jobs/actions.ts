"use server";

import { prisma } from "@/lib/prisma";
import { JobFormData, Jobs } from "./types";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { jobFormSchema, jobStatusSchema, idSchema } from "@/lib/validations";

export async function createJob(data: JobFormData) {
  try {
    const parsed = jobFormSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
    }

    const authCheck = await requirePermission(PERMISSIONS.JOBS.CREATE);
    if (!authCheck.authorized) return { success: false, error: authCheck.error };
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

// Function để lấy job theo ID
export async function getJobById(id: string): Promise<Jobs | null> {
  try {
    const job = await prisma.jobs.findUnique({
      where: { id },
      include: {
        department: true, // Include department info nếu cần
      },
    });

    return job;
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    return null;
  }
}

// Function để update job
export async function updateJob(id: string, data: JobFormData) {
  try {
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return { success: false, error: "ID không hợp lệ" };

    const parsed = jobFormSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
    }

    const authCheck = await requirePermission(PERMISSIONS.JOBS.UPDATE);
    if (!authCheck.authorized) return { success: false, error: authCheck.error };
    const updatedJob = await prisma.jobs.update({
      where: { id },
      data: {
        job: data.job,
        salary: data.salary,
        type: data.type,
        status: data.status,
        departmentId: data.departmentId,
      },
    });
    return { success: true, job: updatedJob };
  } catch (error) {
    console.error("Error updating job:", error);
    return { success: false, error: "Failed to update job" };
  }
}

// Function để update job status
export async function updateJobStatus(
  id: string,
  status: "Active" | "Ended" | "Completed"
) {
  try {
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return { success: false, error: "ID không hợp lệ" };

    const parsed = jobStatusSchema.safeParse({ status });
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
    }

    const authCheck = await requirePermission(PERMISSIONS.JOBS.UPDATE);
    if (!authCheck.authorized) return { success: false, error: authCheck.error };

    const updatedJob = await prisma.jobs.update({
      where: { id },
      data: {
        status: status,
      },
    });
    return { success: true, job: updatedJob };
  } catch (error) {
    console.error("Error updating job status:", error);
    return { success: false, error: "Failed to update job status" };
  }
}

// Function để delete job
export async function deleteJob(id: string) {
  try {
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return { success: false, error: "ID không hợp lệ" };

    const authCheck = await requirePermission(PERMISSIONS.JOBS.DELETE);
    if (!authCheck.authorized) return { success: false, error: authCheck.error };
    await prisma.jobs.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting job:", error);
    return { success: false, error: "Failed to delete job" };
  }
}
