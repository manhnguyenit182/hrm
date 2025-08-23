"use server";
import { PrismaClient } from "@/db/prisma";
import { getDepartments } from "../../departments/actions";
import { OptionsType, JobData } from "./type";

const prisma = new PrismaClient();
export const getDepartmentOptions = async (): Promise<OptionsType[]> => {
  const departments = await getDepartments();

  return departments.map((department) => {
    if (department.name === "Ban Giám đốc") {
      return {
        label: department.name,
        value: department.id,
        disabled: true,
      } as unknown as OptionsType;
    } else {
      return {
        label: department.name,
        value: department.id,
        disabled: false,
      } as unknown as OptionsType;
    }
  });
};

export const getJobData = async (): Promise<JobData[]> => {
  const jobs = await prisma.jobs.findMany({
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return jobs.map(
    (job) =>
      ({
        id: job.id,
        job: job.job,
        departmentId: job.department?.id,
        department: job.department?.name,
        salary: job.salary,
        typeWork: "Full-time",
        type: job.type,
        status: job.status || "",
      } as JobData)
  );
};
