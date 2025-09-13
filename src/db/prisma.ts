import { PrismaClient } from "./prisma/index.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export as default and named export
export default prisma;
export { prisma };

// Export all types and everything from local Prisma Client
export * from "./prisma/index.js";
