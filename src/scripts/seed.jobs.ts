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
// giờ đến phòng "Phát triển sản phẩm"

// {
//       firstName: "Duy Hùng", //  Tên trước
//       lastName: "Nguyễn", //  Họ sau
//       phone: "0901234567", // số điện thoại ngẫu nhiên
//       email: "duy.hung.nguyen@company.com", // theo ten.ho
//       birthday: new Date("1985-03-15"),
//       maritalStatus: "married", // married hoặc single
//       gender: "male", // male hoặc female ứng với firstName
//       nationality: "Việt Nam", // luôn là Việt Nam
//       image: "https://randomuser.me/api/portraits/men/6.jpg", // ứng với gender , nếu male thì lấy ảnh nam, female thì lấy ảnh nữ (random từ 1 đến 90)
//       address: "147 Cách Mạng Tháng 8, P.10",// ngẫu nhiên
//       city: "Hồ Chí Minh",// ngẫu nhiên
//       state: "Hồ Chí Minh",// ngẫu nhiên
//       status: "Active",
//       departmentId: createdDepartments.find(
//         (d) => d.name === "Phát triển sản phẩm"
//       )?.id,
//       positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id, // 1 "Trưởng Phòng" và 20 "Nhân Viên" và (1 đến 2 "Thực Tập")
//       jobId: createdJobs.find((j) => j.job === "Trưởng Marketing")?.id, // 1 "Trưởng Phòng"  ứng với "Team lead" còn lại "Node JS" và "React JS"
//       startDate: new Date("2024-05-20T17:00:00"),
//       type: "full-time", // full-time, part-time
//     }
