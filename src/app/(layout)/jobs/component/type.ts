export type OptionsType = {
  label: string;
  value: string;
}[];

export type JobData = {
  id: string;
  job: string;
  departmentId: string;
  department: string;
  type: string;
  typeWork: "Full-time";
  salary: number;
  status: "active" | "ended" | "completed";
};
