import { Attendance, Employees, Positions, Jobs } from "@/db/prisma";

export type { Attendance };

export type AttendanceWithEmployee = Attendance & {
  employee:
    | (Employees & {
        position: Positions | null;
        job: Jobs | null;
      })
    | null;
};
