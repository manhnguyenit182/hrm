import { PrismaClient } from "../db/prisma";

const main = async () => {
  const prisma = new PrismaClient();

  console.log("🌱 Starting to seed user data...");

  const createdDepartments = await prisma.departments.findMany();
  const createdPositions = await prisma.positions.findMany();

  const employeesData = [
    {
      firstName: "Nguyễn",
      lastName: "Văn An",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Nhân Sự")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      type: "Full-time",
      status: "Active",
      image: "https://i.pravatar.cc/150?img=3",
      phone: "0901234567",
      email: "nguyen.van.an@company.com",
      address: "123 Đường ABC, Quận 1",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nam",
      birthday: new Date("1985-03-15"),
      maritalStatus: "Đã kết hôn",
      nationality: "Việt Nam",
    },
  ];

  let createdEmployeesCount = 0;
  for (const employeeData of employeesData) {
    try {
      await prisma.employees.create({
        data: employeeData,
      });
      createdEmployeesCount++;
    } catch {
      console.log(
        `⚠️ Skipped employee ${employeeData.firstName} ${employeeData.lastName} - might already exist`
      );
    }
  }
  console.log(`✅ Created ${createdEmployeesCount} employees`);
};
