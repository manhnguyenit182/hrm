import { PrismaClient } from "../db/prisma";

const main = async () => {
  const prisma = new PrismaClient();

  console.log("🌱 Starting to seed job data...");

  const jobDatas = [
    {
      job: "Backend Team Lead",
      salary: 60_000_000,
      deductions: 5_000_000, // ~ BHXH + thuế TNCN thực tế
      netPay: 55_000_000,
    },
    {
      job: "Backend Developer (Node.js)",
      salary: 40_000_000,
      deductions: 3_500_000, // ~8-9% (thuế + bảo hiểm)
      netPay: 36_500_000,
    },
    {
      job: "Backend Developer (Java/Spring) ",
      salary: 34_000_000,
      deductions: 3_000_000,
      netPay: 31_000_000,
    },
    {
      job: "Backend Developer (PHP/Laravel) ",
      salary: 28_000_000,
      deductions: 2_200_000,
      netPay: 25_800_000,
    },
  ];

  let createdJobsCount = 0;
  for (const jobData of jobDatas) {
    try {
      await prisma.jobs.create({
        data: jobData,
      });
      createdJobsCount++;
      console.log(`✅ Created job: ${jobData.job}`);
    } catch {
      console.log(`⚠️ Skipped job ${jobData.job} - might already exist`);
    }
  }

  console.log(`✅ Created ${createdJobsCount} jobs total`);
  console.log("🎉 Job seeding completed successfully!");

  await prisma.$disconnect();
};

main();
