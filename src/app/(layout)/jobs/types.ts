import { Jobs } from "@/db/prisma";

export type { Jobs };

export type JobFormData = Omit<Jobs, "id" | "createdAt" | "updatedAt">;
