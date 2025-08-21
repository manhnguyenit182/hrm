import { PrismaClient } from "../src/db/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting to seed database...");

  // Seed Departments first (since Employees depend on Departments)
  const departmentsData = [
    {
      name: "Phòng Nhân Sự",
      location: "Tầng 2 - Toà A",
    },
    {
      name: "Phòng Kinh Doanh",
      location: "Tầng 3 - Toà A",
    },
    {
      name: "Phòng Kỹ Thuật",
      location: "Tầng 4 - Toà B",
    },
    {
      name: "Phòng Kế Toán",
      location: "Tầng 1 - Toà A",
    },
    {
      name: "Phòng Marketing",
      location: "Tầng 2 - Toà B",
    },
  ];

  let createdDepartmentsCount = 0;
  for (const departmentData of departmentsData) {
    try {
      await prisma.departments.create({
        data: departmentData,
      });
      createdDepartmentsCount++;
    } catch {
      console.log(
        `⚠️ Skipped department ${departmentData.name} - might already exist`
      );
    }
  }

  // Seed Positions (since Employees depend on Positions)
  const positionsData = [
    {
      title: "Trưởng Phòng",
      description: "Quản lý và điều hành hoạt động của phòng ban",
    },
    {
      title: "Phó Trưởng Phòng",
      description: "Hỗ trợ trưởng phòng trong công việc quản lý",
    },
    {
      title: "Nhân Viên",
      description: "Thực hiện các công việc được giao",
    },
    {
      title: "Thực Tập Sinh",
      description: "Học tập và thực hành trong môi trường làm việc thực tế",
    },
    {
      title: "Chuyên Viên",
      description: "Chuyên gia trong lĩnh vực cụ thể",
    },
  ];

  let createdPositionsCount = 0;
  for (const positionData of positionsData) {
    try {
      await prisma.positions.create({
        data: positionData,
      });
      createdPositionsCount++;
    } catch {
      console.log(
        `⚠️ Skipped position ${positionData.title} - might already exist`
      );
    }
  }

  console.log(`✅ Created ${createdDepartmentsCount} departments`);
  console.log(`✅ Created ${createdPositionsCount} positions`);

  // Get created departments and positions to reference their IDs
  const createdDepartments = await prisma.departments.findMany();
  const createdPositions = await prisma.positions.findMany();

  // Seed Employees
  const employeesData = [
    {
      firstName: "Nguyễn",
      lastName: "Văn An",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Nhân Sự")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      type: "Full-time",
      status: "Active",
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
    {
      firstName: "Trần",
      lastName: "Thị Bích",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Chuyên Viên")?.id,
      type: "Full-time",
      status: "Active",
      phone: "0912345678",
      email: "tran.thi.bich@company.com",
      address: "456 Đường DEF, Quận 3",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nữ",
      birthday: new Date("1990-07-20"),
      maritalStatus: "Độc thân",
      nationality: "Việt Nam",
    },
    {
      firstName: "Lê",
      lastName: "Hoàng Minh",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      type: "Full-time",
      status: "Active",
      phone: "0923456789",
      email: "le.hoang.minh@company.com",
      address: "789 Đường GHI, Quận 5",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nam",
      birthday: new Date("1992-11-10"),
      maritalStatus: "Đã kết hôn",
      nationality: "Việt Nam",
    },
    {
      firstName: "Phạm",
      lastName: "Thu Hà",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      type: "Full-time",
      status: "Active",
      phone: "0934567890",
      email: "pham.thu.ha@company.com",
      address: "321 Đường JKL, Quận 7",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nữ",
      birthday: new Date("1988-01-25"),
      maritalStatus: "Đã kết hôn",
      nationality: "Việt Nam",
    },
    {
      firstName: "Võ",
      lastName: "Đình Khoa",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Marketing")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Chuyên Viên")?.id,
      type: "Part-time",
      status: "Active",
      phone: "0945678901",
      email: "vo.dinh.khoa@company.com",
      address: "654 Đường MNO, Quận 2",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nam",
      birthday: new Date("1995-05-30"),
      maritalStatus: "Độc thân",
      nationality: "Việt Nam",
    },
    {
      firstName: "Đặng",
      lastName: "Thị Mai",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Nhân Sự")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      type: "Full-time",
      status: "Active",
      phone: "0956789012",
      email: "dang.thi.mai@company.com",
      address: "987 Đường PQR, Quận 4",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nữ",
      birthday: new Date("1993-09-12"),
      maritalStatus: "Độc thân",
      nationality: "Việt Nam",
    },
    {
      firstName: "Hoàng",
      lastName: "Văn Tùng",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Phó Trưởng Phòng")
        ?.id,
      type: "Full-time",
      status: "Active",
      phone: "0967890123",
      email: "hoang.van.tung@company.com",
      address: "147 Đường STU, Quận 6",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nam",
      birthday: new Date("1987-12-08"),
      maritalStatus: "Đã kết hôn",
      nationality: "Việt Nam",
    },
    {
      firstName: "Bùi",
      lastName: "Thị Lan",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Thực Tập Sinh")?.id,
      type: "Intern",
      status: "Active",
      phone: "0978901234",
      email: "bui.thi.lan@company.com",
      address: "258 Đường VWX, Quận 8",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nữ",
      birthday: new Date("1999-04-18"),
      maritalStatus: "Độc thân",
      nationality: "Việt Nam",
    },
    {
      firstName: "Ngô",
      lastName: "Quang Huy",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Marketing")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      type: "Full-time",
      status: "Active",
      phone: "0989012345",
      email: "ngo.quang.huy@company.com",
      address: "369 Đường YZ, Quận 9",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nam",
      birthday: new Date("1984-08-22"),
      maritalStatus: "Đã kết hôn",
      nationality: "Việt Nam",
    },
    {
      firstName: "Vũ",
      lastName: "Thị Ngọc",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      type: "Full-time",
      status: "On Leave",
      phone: "0990123456",
      email: "vu.thi.ngoc@company.com",
      address: "741 Đường ABC, Quận 10",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      gender: "Nữ",
      birthday: new Date("1991-06-14"),
      maritalStatus: "Đã kết hôn",
      nationality: "Việt Nam",
    },
  ];

  // Create employees one by one to handle any potential conflicts
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

  // Seed User accounts for employees
  const usersData = [
    {
      email: "admin@company.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "System",
    },
    {
      email: "nguyen.van.an@company.com",
      password: "password123",
      firstName: "Nguyễn",
      lastName: "Văn An",
      role: "manager",
    },
    {
      email: "tran.thi.bich@company.com",
      password: "password123",
      firstName: "Trần",
      lastName: "Thị Bích",
      role: "user",
    },
  ];

  let createdUsersCount = 0;
  for (const userData of usersData) {
    try {
      await prisma.user.create({
        data: userData,
      });
      createdUsersCount++;
    } catch {
      console.log(`⚠️ Skipped user ${userData.email} - might already exist`);
    }
  }

  // Seed Attendance records
  const attendanceData = [
    {
      date: new Date("2024-08-20"),
      clockIn: new Date("2024-08-20T08:00:00"),
      clockOut: new Date("2024-08-20T17:30:00"),
      status: "Present",
    },
    {
      date: new Date("2024-08-20"),
      clockIn: new Date("2024-08-20T08:15:00"),
      clockOut: new Date("2024-08-20T17:45:00"),
      status: "Present",
    },
    {
      date: new Date("2024-08-20"),
      clockIn: new Date("2024-08-20T08:30:00"),
      clockOut: new Date("2024-08-20T18:00:00"),
      status: "Late",
    },
    {
      date: new Date("2024-08-20"),
      clockIn: null,
      clockOut: null,
      status: "Absent",
    },
  ];

  let createdAttendanceCount = 0;
  for (const attendanceRecord of attendanceData) {
    try {
      await prisma.attendance.create({
        data: attendanceRecord,
      });
      createdAttendanceCount++;
    } catch {
      console.log(`⚠️ Skipped attendance record - might already exist`);
    }
  }

  // Seed Payroll records
  const payrollData = [
    {
      salary: 25000000,
      bonus: 2000000,
      deductions: 1000000,
      netPay: 26000000,
      payDate: new Date("2024-08-01"),
    },
    {
      salary: 15000000,
      bonus: 1000000,
      deductions: 500000,
      netPay: 15500000,
      payDate: new Date("2024-08-01"),
    },
    {
      salary: 18000000,
      bonus: 800000,
      deductions: 600000,
      netPay: 18200000,
      payDate: new Date("2024-08-01"),
    },
    {
      salary: 22000000,
      bonus: 1500000,
      deductions: 900000,
      netPay: 22600000,
      payDate: new Date("2024-08-01"),
    },
  ];

  let createdPayrollCount = 0;
  for (const payrollRecord of payrollData) {
    try {
      await prisma.jobs.create({
        data: payrollRecord,
      });
      createdPayrollCount++;
    } catch {
      console.log(`⚠️ Skipped payroll record - might already exist`);
    }
  }

  console.log(`✅ Created ${createdEmployeesCount} employees`);
  console.log(`✅ Created ${createdUsersCount} users`);
  console.log(`✅ Created ${createdAttendanceCount} attendance records`);
  console.log(`✅ Created ${createdPayrollCount} payroll records`);
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
