"use server";
import { getDepartments } from "../../departments/actions";
import { getJobs } from "../../jobs/actions";
import { getEmployees, getPosition } from "../actions";
import { Option } from "./types";

export const getDepartmentOptions = async (): Promise<Option[]> => {
  const departments = await getDepartments();
  return departments.map((department) => ({
    label: department.name,
    value: department.id,
  })) as Option[];
};

export const getPositionOptions = async (): Promise<Option[]> => {
  const positions = await getPosition();
  return positions.map((position) => ({
    label: position.title,
    value: position.id,
  })) as Option[];
};

export const getJobOptions = async (): Promise<
  Array<Option & { departmentId: string }>
> => {
  const jobs = await getJobs();
  return jobs.map((job) => ({
    label: job.job,
    value: job.id,
    departmentId: job.departmentId,
  })) as Array<Option & { departmentId: string }>;
};
