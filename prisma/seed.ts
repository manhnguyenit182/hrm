import { PrismaClient } from "../src/db/prisma";

const prisma = new PrismaClient();
function getRandomAvatar(): string {
  const randomNum = Math.floor(Math.random() * 70) + 1;
  return `https://i.pravatar.cc/150?img=${randomNum}`;
}
// Helper function to generate random avatar

async function main() {
  console.log("🌱 Starting to seed database...");

  // Seed Departments first (since Employees depend on Departments)
  const departmentsData = [
    {
      name: "Ban Giám Đốc",
      location: "Tầng 10 - Toà A",
    },
    {
      name: "Phòng Kỹ Thuật",
      location: "Tầng 4 - Toà B",
    },
    {
      name: "Phòng Sản Phẩm & Thiết Kế",
      location: "Tầng 6 - Toà B",
    },
    {
      name: "Phòng Kinh Doanh & Marketing",
      location: "Tầng 3 - Toà A",
    },
    {
      name: "Phòng Hỗ Trợ Khách Hàng",
      location: "Tầng 7 - Toà A",
    },
    {
      name: "Phòng Nhân Sự",
      location: "Tầng 2 - Toà A",
    },
    {
      name: "Phòng Kế Toán",
      location: "Tầng 1 - Toà A",
    },
    {
      name: "Phòng Hành Chính",
      location: "Tầng 2 - Toà A",
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
      title: "CEO",
      description: "Tổng Giám Đốc điều hành công ty",
    },
    {
      title: "COO",
      description:
        "Giám Đốc Điều Hành – quản lý vận hành, nhân sự, hành chính, khách hàng",
    },
    {
      title: "CTO",
      description: "Giám Đốc Công Nghệ – quản lý toàn bộ khối kỹ thuật",
    },
    {
      title: "CPO",
      description: "Giám Đốc Sản Phẩm – quản lý product & design",
    },
    {
      title: "CFO",
      description: "Giám Đốc Tài Chính – quản lý tài chính, kế toán",
    },
    {
      title: "Trưởng Phòng",
      description: "Quản lý và điều hành hoạt động của phòng ban",
    },
    {
      title: "Nhân Viên",
      description: "Thực hiện các công việc được giao",
    },
    {
      title: "Thực Tập Sinh",
      description: "Học tập và thực hành trong môi trường làm việc thực tế",
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

  // Seed Jobs before Employees (since Employees depend on Jobs)
  const jobsData = [
    // Ban Giám Đốc
    {
      job: "CEO",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      type: "Văn phòng",
      salary: 100000000,
      status: "Active",
    },
    {
      job: "COO",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      type: "Văn phòng",
      salary: 80000000,
      status: "Active",
    },
    {
      job: "CTO",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      type: "Văn phòng",
      salary: 75000000,
      status: "Active",
    },
    {
      job: "CPO",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      type: "Văn phòng",
      salary: 75000000,
      status: "Active",
    },
    {
      job: "CFO",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      type: "Văn phòng",
      salary: 75000000,
      status: "Active",
    },

    // Phòng Kỹ Thuật
    {
      job: "Trưởng phòng kỹ thuật",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      type: "Văn phòng",
      salary: 40000000,
      status: "Active",
    },
    {
      job: "Lập trình viên Senior",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      type: "Làm việc từ xa",
      salary: 35000000,
      status: "Active",
    },
    {
      job: "Lập trình viên",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      type: "Văn phòng",
      salary: 20000000,
      status: "Active",
    },
    {
      job: "Tester",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      type: "Văn phòng",
      salary: 18000000,
      status: "Active",
    },
    {
      job: "DevOps Engineer",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      type: "Làm việc từ xa",
      salary: 22000000,
      status: "Active",
    },

    // Phòng Sản Phẩm & Thiết Kế
    {
      job: "Trưởng phòng sản phẩm",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Sản Phẩm & Thiết Kế"
      )?.id,
      type: "Văn phòng",
      salary: 35000000,
      status: "Active",
    },
    {
      job: "Business Analyst",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Sản Phẩm & Thiết Kế"
      )?.id,
      type: "Làm việc từ xa",
      salary: 22000000,
      status: "Active",
    },
    {
      job: "UI/UX Designer",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Sản Phẩm & Thiết Kế"
      )?.id,
      type: "Văn phòng",
      salary: 18000000,
      status: "Active",
    },

    // Phòng Kinh Doanh & Marketing
    {
      job: "Trưởng phòng marketing",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      type: "Văn phòng",
      salary: 32000000,
      status: "Active",
    },
    {
      job: "Sales Manager",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      type: "Văn phòng",
      salary: 25000000,
      status: "Active",
    },
    {
      job: "Nhân Viên Sales",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      type: "Văn phòng",
      salary: 18000000,
      status: "Active",
    },
    {
      job: "Marketing",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      type: "Làm việc từ xa",
      salary: 20000000,
      status: "Active",
    },
    {
      job: "Content Creator",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      type: "Văn phòng",
      salary: 16000000,
      status: "Active",
    },

    // Phòng Hỗ Trợ Khách Hàng
    {
      job: "Trưởng phòng hỗ trợ khách hàng",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hỗ Trợ Khách Hàng"
      )?.id,
      type: "Văn phòng",
      salary: 28000000,
      status: "Active",
    },
    {
      job: "Nhân viên hỗ trợ khách hàng",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hỗ Trợ Khách Hàng"
      )?.id,
      type: "Làm việc từ xa",
      salary: 14000000,
      status: "Active",
    },

    // Phòng Nhân Sự
    {
      job: "Trưởng phòng nhân sự",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Nhân Sự")
        ?.id,
      type: "Văn phòng",
      salary: 32000000,
      status: "Active",
    },
    {
      job: "Nhân Viên HR",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Nhân Sự")
        ?.id,
      type: "Văn phòng",
      salary: 25000000,
      status: "Active",
    },

    // Phòng Kế Toán
    {
      job: "Trưởng phòng kế toán",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      type: "Văn phòng",
      salary: 30000000,
      status: "Active",
    },
    {
      job: "Kế toán trưởng",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      type: "Văn phòng",
      salary: 25000000,
      status: "Active",
    },
    {
      job: "Kế toán tổng hợp",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      type: "Văn phòng",
      salary: 18000000,
      status: "Active",
    },
    {
      job: "Kế toán công nợ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      type: "Văn phòng",
      salary: 16000000,
      status: "Active",
    },
    {
      job: "Kế toán thuế",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      type: "Làm việc từ xa",
      salary: 17000000,
      status: "Active",
    },

    // Phòng Hành Chính
    {
      job: "Trưởng phòng hành chính",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      type: "Văn phòng",
      salary: 25000000,
      status: "Active",
    },
    {
      job: "Chuyên viên pháp chế",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      type: "Văn phòng",
      salary: 22000000,
      status: "Active",
    },
    {
      job: "Nhân viên hành chính",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      type: "Văn phòng",
      salary: 13000000,
      status: "Active",
    },
    {
      job: "Lễ tân",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      type: "Văn phòng",
      salary: 12000000,
      status: "Active",
    },
    {
      job: "Bảo vệ",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      type: "Văn phòng",
      salary: 10000000,
      status: "Active",
    },
  ];

  let createdJobsCount = 0;
  for (const jobData of jobsData) {
    try {
      await prisma.jobs.create({
        data: jobData,
      });
      createdJobsCount++;
    } catch {
      console.log(`⚠️ Skipped job ${jobData.job} - might already exist`);
    }
  }

  // Seed Holidays
  const holidaysData = [
    {
      title: "Tết Nguyên Đán",
      date: new Date("2025-01-29"),
    },
    {
      title: "Giỗ Tổ Hùng Vương",
      date: new Date("2025-04-18"),
    },
    {
      title: "Ngày Thống Nhất",
      date: new Date("2025-04-30"),
    },
    {
      title: "Ngày Quốc Tế Lao Động",
      date: new Date("2025-05-01"),
    },
    {
      title: "Quốc Khánh",
      date: new Date("2025-09-02"),
    },
    {
      title: "Giáng Sinh",
      date: new Date("2025-12-25"),
    },
  ];

  let createdHolidaysCount = 0;
  for (const holidayData of holidaysData) {
    try {
      await prisma.holidays.create({
        data: holidayData,
      });
      createdHolidaysCount++;
    } catch {
      console.log(
        `⚠️ Skipped holiday ${holidayData.title} - might already exist`
      );
    }
  }

  // Get created jobs and holidays to reference their IDs
  const createdJobs = await prisma.jobs.findMany();
  const createdPositions = await prisma.positions.findMany();
  // Seed Employees
  const employeesData = [
    // Ban Giám Đốc
    {
      firstName: "Nguyễn",
      lastName: "Đình Mạnh",
      phone: "0901234567",
      email: "ceo@company.com",
      birthday: new Date("1975-03-15"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "123 Đường Nguyễn Huệ, Quận 1",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "CEO")?.id,
      jobId: createdJobs.find((j) => j.job === "CEO")?.id,
      startDate: new Date("2015-01-01"),
      type: "Full-time",
    },
    {
      firstName: "Trần",
      lastName: "Thị Mai",
      phone: "0901234568",
      email: "coo@company.com",
      birthday: new Date("1978-07-22"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "456 Đường Lê Lợi, Quận 1",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "COO")?.id,
      jobId: createdJobs.find((j) => j.job === "COO")?.id,
      startDate: new Date("2016-03-01"),
      type: "Full-time",
    },
    {
      firstName: "Lê",
      lastName: "Hoang Minh",
      phone: "0901234569",
      email: "cto@company.com",
      birthday: new Date("1980-09-10"),
      maritalStatus: "Độc thân",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "789 Đường Pasteur, Quận 3",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "CTO")?.id,
      jobId: createdJobs.find((j) => j.job === "CTO")?.id,
      startDate: new Date("2016-06-01"),
      type: "Full-time",
    },
    {
      firstName: "Phạm",
      lastName: "Thu Hà",
      phone: "0901234570",
      email: "cpo@company.com",
      birthday: new Date("1982-12-05"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "321 Đường Võ Văn Tần, Quận 3",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "CPO")?.id,
      jobId: createdJobs.find((j) => j.job === "CPO")?.id,
      startDate: new Date("2017-01-15"),
      type: "Full-time",
    },
    {
      firstName: "Võ",
      lastName: "Đình Khoa",
      phone: "0901234571",
      email: "cfo@company.com",
      birthday: new Date("1979-04-18"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "654 Đường Hai Bà Trưng, Quận 1",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find((d) => d.name === "Ban Giám Đốc")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "CFO")?.id,
      jobId: createdJobs.find((j) => j.job === "CFO")?.id,
      startDate: new Date("2016-09-01"),
      type: "Full-time",
    },

    // Phòng Kỹ Thuật
    {
      firstName: "Đặng",
      lastName: "Thị Mai",
      phone: "0901234572",
      email: "truongphong.kt@company.com",
      birthday: new Date("1985-06-12"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "147 Đường Cách Mạng Tháng 8, Quận 10",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      jobId: createdJobs.find((j) => j.job === "Trưởng phòng kỹ thuật")?.id,
      startDate: new Date("2018-02-01"),
      type: "Full-time",
    },
    {
      firstName: "Hoàng",
      lastName: "Văn Tùng",
      phone: "0901234573",
      email: "senior.dev@company.com",
      birthday: new Date("1987-08-25"),
      maritalStatus: "Độc thân",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "258 Đường Trần Hưng Đạo, Quận 5",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Lập trình viên Senior")?.id,
      startDate: new Date("2019-05-15"),
      type: "Full-time",
    },
    {
      firstName: "Bùi",
      lastName: "Thị Lan",
      phone: "0901234574",
      email: "developer1@company.com",
      birthday: new Date("1990-11-08"),
      maritalStatus: "Độc thân",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "369 Đường Lý Thái Tổ, Quận 10",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Lập trình viên")?.id,
      startDate: new Date("2020-03-10"),
      type: "Full-time",
    },
    {
      firstName: "Ngô",
      lastName: "Thanh Tú",
      phone: "0901234575",
      email: "developer2@company.com",
      birthday: new Date("1992-01-20"),
      maritalStatus: "Độc thân",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "741 Đường Nam Kỳ Khởi Nghĩa, Quận 3",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Lập trình viên")?.id,
      startDate: new Date("2021-07-01"),
      type: "Full-time",
    },
    {
      firstName: "Lý",
      lastName: "Thị Hoa",
      phone: "0901234576",
      email: "tester@company.com",
      birthday: new Date("1988-04-14"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "852 Đường Điện Biên Phủ, Quận Bình Thạnh",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Tester")?.id,
      startDate: new Date("2019-09-01"),
      type: "Full-time",
    },
    {
      firstName: "Trương",
      lastName: "Văn Đức",
      phone: "0901234577",
      email: "devops@company.com",
      birthday: new Date("1986-10-30"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "963 Đường Xô Viết Nghệ Tĩnh, Quận Bình Thạnh",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kỹ Thuật")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "DevOps Engineer")?.id,
      startDate: new Date("2018-12-01"),
      type: "Full-time",
    },

    // Phòng Sản Phẩm & Thiết Kế
    {
      firstName: "Vũ",
      lastName: "Thị Thu",
      phone: "0901234578",
      email: "truongphong.sp@company.com",
      birthday: new Date("1984-02-28"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "174 Đường Nguyễn Thị Minh Khai, Quận 1",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Sản Phẩm & Thiết Kế"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      jobId: createdJobs.find((j) => j.job === "Trưởng phòng sản phẩm")?.id,
      startDate: new Date("2017-11-01"),
      type: "Full-time",
    },
    {
      firstName: "Phan",
      lastName: "Văn Long",
      phone: "0901234579",
      email: "ba@company.com",
      birthday: new Date("1989-05-16"),
      maritalStatus: "Độc thân",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "285 Đường Cộng Hòa, Quận Tân Bình",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Sản Phẩm & Thiết Kế"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Business Analyst")?.id,
      startDate: new Date("2020-01-15"),
      type: "Full-time",
    },
    {
      firstName: "Đinh",
      lastName: "Thị Hương",
      phone: "0901234580",
      email: "designer@company.com",
      birthday: new Date("1991-09-03"),
      maritalStatus: "Độc thân",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "396 Đường Hoàng Văn Thụ, Quận Phú Nhuận",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Sản Phẩm & Thiết Kế"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "UI/UX Designer")?.id,
      startDate: new Date("2020-08-01"),
      type: "Full-time",
    },

    // Phòng Kinh Doanh & Marketing
    {
      firstName: "Châu",
      lastName: "Văn Nam",
      phone: "0901234581",
      email: "truongphong.marketing@company.com",
      birthday: new Date("1983-12-11"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "507 Đường Sư Vạn Hạnh, Quận 10",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      jobId: createdJobs.find((j) => j.job === "Trưởng phòng marketing")?.id,
      startDate: new Date("2018-04-01"),
      type: "Full-time",
    },

    {
      firstName: "Huỳnh",
      lastName: "Văn Phúc",
      phone: "0901234583",
      email: "sales1@company.com",
      birthday: new Date("1990-07-19"),
      maritalStatus: "Độc thân",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "729 Đường Tô Hiến Thành, Quận 10",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Nhân Viên Sales")?.id,
      startDate: new Date("2021-01-15"),
      type: "Full-time",
    },
    {
      firstName: "Tô",
      lastName: "Thị Bích",
      phone: "0901234584",
      email: "sales2@company.com",
      birthday: new Date("1993-11-25"),
      maritalStatus: "Độc thân",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "830 Đường Âu Cơ, Quận Tân Phú",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Nhân Viên Sales")?.id,
      startDate: new Date("2021-09-01"),
      type: "Full-time",
    },
    {
      firstName: "Dương",
      lastName: "Văn Hải",
      phone: "0901234585",
      email: "marketing@company.com",
      birthday: new Date("1988-08-13"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "941 Đường Hùng Vương, Quận 5",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Marketing")?.id,
      startDate: new Date("2020-06-01"),
      type: "Full-time",
    },
    {
      firstName: "Lâm",
      lastName: "Thị Ngọc",
      phone: "0901234586",
      email: "content@company.com",
      birthday: new Date("1994-04-02"),
      maritalStatus: "Độc thân",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "152 Đường Nguyễn Oanh, Quận Gò Vấp",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Kinh Doanh & Marketing"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Content Creator")?.id,
      startDate: new Date("2022-02-15"),
      type: "Full-time",
    },

    // Phòng Hỗ Trợ Khách Hàng
    {
      firstName: "Phạm",
      lastName: "Thị Lan",
      phone: "0901234587",
      email: "truongphong.htkh@company.com",
      birthday: new Date("1980-05-22"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "25 Đường Lê Văn Sỹ, Quận 3",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hỗ Trợ Khách Hàng"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      jobId: createdJobs.find((j) => j.job === "Trưởng phòng hỗ trợ khách hàng")
        ?.id,
      startDate: new Date("2017-08-01"),
      type: "Full-time",
    },
    {
      firstName: "Cao",
      lastName: "Văn Minh",
      phone: "0901234588",
      email: "support1@company.com",
      birthday: new Date("1992-12-09"),
      maritalStatus: "Độc thân",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "263 Đường Phan Văn Trị, Quận Gò Vấp",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hỗ Trợ Khách Hàng"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Nhân viên hỗ trợ khách hàng")
        ?.id,
      startDate: new Date("2021-05-01"),
      type: "Full-time",
    },
    {
      firstName: "Nguyễn",
      lastName: "Thị Ánh",
      phone: "0901234589",
      email: "support2@company.com",
      birthday: new Date("1995-01-17"),
      maritalStatus: "Độc thân",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "374 Đường Quang Trung, Quận Gò Vấp",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hỗ Trợ Khách Hàng"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Nhân viên hỗ trợ khách hàng")
        ?.id,
      startDate: new Date("2022-03-15"),
      type: "Full-time",
    },

    // Phòng Nhân Sự
    {
      firstName: "Hồ",
      lastName: "Văn Cường",
      phone: "0901234590",
      email: "truongphong.hr@company.com",
      birthday: new Date("1981-10-14"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "485 Đường Lý Thường Kiệt, Quận 10",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Nhân Sự")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      jobId: createdJobs.find((j) => j.job === "Trưởng phòng nhân sự")?.id,
      startDate: new Date("2017-05-01"),
      type: "Full-time",
    },
    {
      firstName: "Lưu",
      lastName: "Thị Hạnh",
      phone: "0901234591",
      email: "hr1@company.com",
      birthday: new Date("1989-06-26"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "596 Đường Nguyễn Kiệm, Quận Phú Nhuận",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Nhân Sự")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Nhân Viên HR")?.id,
      startDate: new Date("2019-08-15"),
      type: "Full-time",
    },
    {
      firstName: "Nguyễn",
      lastName: "Thị Nhi",
      phone: "0901234591",
      email: "hr2@company.com",
      birthday: new Date("1989-06-26"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "596 Đường Nguyễn Kiệm, Quận Phú Nhuận",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Nhân Sự")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Nhân Viên HR")?.id,
      startDate: new Date("2019-08-15"),
      type: "Full-time",
    },
    {
      firstName: "Nguyễn",
      lastName: "Thị Thảo",
      phone: "0901234591",
      email: "hr3@company.com",
      birthday: new Date("1989-06-26"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "596 Đường Nguyễn Kiệm, Quận Phú Nhuận",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Nhân Sự")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Nhân Viên HR")?.id,
      startDate: new Date("2019-08-15"),
      type: "Full-time",
    },

    // Phòng Kế Toán
    {
      firstName: "Đỗ",
      lastName: "Văn Tấn",
      phone: "0901234592",
      email: "truongphong.ktoan@company.com",
      birthday: new Date("1978-02-08"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "607 Đường Khánh Hội, Quận 4",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      jobId: createdJobs.find((j) => j.job === "Trưởng phòng kế toán")?.id,
      startDate: new Date("2016-10-01"),
      type: "Full-time",
    },
    {
      firstName: "Tạ",
      lastName: "Thị Uyên",
      phone: "0901234593",
      email: "ketoan.truong@company.com",
      birthday: new Date("1984-11-21"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "718 Đường Nguyễn Văn Cừ, Quận 5",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Kế toán trưởng")?.id,
      startDate: new Date("2018-01-15"),
      type: "Full-time",
    },
    {
      firstName: "Bạch",
      lastName: "Thị Ngân",
      phone: "0901234594",
      email: "ketoan.tonghop@company.com",
      birthday: new Date("1990-03-12"),
      maritalStatus: "Độc thân",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "829 Đường Phạm Văn Đồng, Quận Thủ Đức",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Kế toán tổng hợp")?.id,
      startDate: new Date("2020-07-01"),
      type: "Full-time",
    },
    {
      firstName: "Quách",
      lastName: "Văn Dũng",
      phone: "0901234595",
      email: "ketoan.congno@company.com",
      birthday: new Date("1986-09-04"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "930 Đường Lê Đức Thơ, Quận Gò Vấp",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Kế toán công nợ")?.id,
      startDate: new Date("2019-04-01"),
      type: "Full-time",
    },
    {
      firstName: "Hà",
      lastName: "Thị Yến",
      phone: "0901234596",
      email: "ketoan.thue@company.com",
      birthday: new Date("1991-07-18"),
      maritalStatus: "Độc thân",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "141 Đường Võ Thị Sáu, Quận 3",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find((d) => d.name === "Phòng Kế Toán")
        ?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Kế toán thuế")?.id,
      startDate: new Date("2021-02-01"),
      type: "Full-time",
    },

    // Phòng Hành Chính
    {
      firstName: "Mạc",
      lastName: "Văn Hùng",
      phone: "0901234597",
      email: "truongphong.hc@company.com",
      birthday: new Date("1982-08-31"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "252 Đường Bạch Đằng, Quận Bình Thạnh",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Trưởng Phòng")?.id,
      jobId: createdJobs.find((j) => j.job === "Trưởng phòng hành chính")?.id,
      startDate: new Date("2017-12-01"),
      type: "Full-time",
    },
    {
      firstName: "Ông",
      lastName: "Thị Kiều",
      phone: "0901234598",
      email: "phapche@company.com",
      birthday: new Date("1987-01-23"),
      maritalStatus: "Đã kết hôn",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "363 Đường Hoàng Hoa Thám, Quận Tân Bình",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Chuyên viên pháp chế")?.id,
      startDate: new Date("2019-03-15"),
      type: "Full-time",
    },
    {
      firstName: "Thái",
      lastName: "Văn Quang",
      phone: "0901234599",
      email: "hanhchinh@company.com",
      birthday: new Date("1993-05-06"),
      maritalStatus: "Độc thân",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "474 Đường Tân Sơn Nhì, Quận Tân Phú",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Nhân viên hành chính")?.id,
      startDate: new Date("2021-06-01"),
      type: "Full-time",
    },
    {
      firstName: "Võ",
      lastName: "Thị Tuyết",
      phone: "0901234600",
      email: "letan@company.com",
      birthday: new Date("1996-10-15"),
      maritalStatus: "Độc thân",
      gender: "Nữ",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "585 Đường Lũy Bán Bích, Quận Tân Phú",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đã hoàn thành",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Lễ tân")?.id,
      startDate: new Date("2022-01-03"),
      type: "Full-time",
    },
    {
      firstName: "Đặng",
      lastName: "Văn Sơn",
      phone: "0901234601",
      email: "baove@company.com",
      birthday: new Date("1985-12-28"),
      maritalStatus: "Đã kết hôn",
      gender: "Nam",
      nationality: "Việt Nam",
      image: getRandomAvatar(),
      address: "696 Đường Hậu Giang, Quận 6",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      status: "Đang chờ",
      departmentId: createdDepartments.find(
        (d) => d.name === "Phòng Hành Chính"
      )?.id,
      positionId: createdPositions.find((p) => p.title === "Nhân Viên")?.id,
      jobId: createdJobs.find((j) => j.job === "Bảo vệ")?.id,
      startDate: new Date("2018-07-01"),
      type: "Full-time",
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
        `⚠️ Skipped employee ${employeeData.email} - might already exist`
      );
    }
  }

  // Seed User accounts for employees
  const createdEmployees = await prisma.employees.findMany();

  // Seed Attendance records
  const attendanceData = [
    {
      employeeId: createdEmployees.find((e) => e.email === "ceo@company.com")
        ?.id,
      date: new Date("2024-08-20"),
      clockIn: new Date("2024-08-20T08:00:00"),
      clockOut: new Date("2024-08-20T17:30:00"),
      status: "Present",
    },
    {
      employeeId: createdEmployees.find(
        (e) => e.email === "developer1@company.com"
      )?.id,
      date: new Date("2024-08-20"),
      clockIn: new Date("2024-08-20T08:15:00"),
      clockOut: new Date("2024-08-20T17:45:00"),
      status: "Present",
    },
    {
      employeeId: createdEmployees.find(
        (e) => e.email === "senior.dev@company.com"
      )?.id,
      date: new Date("2024-08-20"),
      clockIn: new Date("2024-08-20T08:30:00"),
      clockOut: new Date("2024-08-20T18:00:00"),
      status: "Late",
    },
    {
      employeeId: createdEmployees.find((e) => e.email === "cpo@company.com")
        ?.id,
      date: new Date("2024-08-20"),
      clockIn: null,
      clockOut: null,
      status: "Absent",
    },
    {
      employeeId: createdEmployees.find((e) => e.email === "cfo@company.com")
        ?.id,
      date: new Date("2024-08-21"),
      clockIn: new Date("2024-08-21T08:00:00"),
      clockOut: new Date("2024-08-21T17:00:00"),
      status: "Present",
    },
    {
      employeeId: createdEmployees.find(
        (e) => e.email === "truongphong.kt@company.com"
      )?.id,
      date: new Date("2024-08-21"),
      clockIn: new Date("2024-08-21T08:10:00"),
      clockOut: new Date("2024-08-21T17:30:00"),
      status: "Present",
    },
    {
      employeeId: createdEmployees.find((e) => e.email === "tester@company.com")
        ?.id,
      date: new Date("2024-08-21"),
      clockIn: new Date("2024-08-21T08:45:00"),
      clockOut: new Date("2024-08-21T18:15:00"),
      status: "Late",
    },
    {
      employeeId: createdEmployees.find(
        (e) => e.email === "designer@company.com"
      )?.id,
      date: new Date("2024-08-21"),
      clockIn: new Date("2024-08-21T09:00:00"),
      clockOut: new Date("2024-08-21T17:30:00"),
      status: "Present",
    },
    {
      employeeId: createdEmployees.find((e) => e.email === "sales1@company.com")
        ?.id,
      date: new Date("2024-08-22"),
      clockIn: new Date("2024-08-22T08:15:00"),
      clockOut: new Date("2024-08-22T17:45:00"),
      status: "Present",
    },
    {
      employeeId: createdEmployees.find(
        (e) => e.email === "marketing@company.com"
      )?.id,
      date: new Date("2024-08-22"),
      clockIn: new Date("2024-08-22T08:30:00"),
      clockOut: new Date("2024-08-22T18:00:00"),
      status: "Late",
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

  console.log(`✅ Created ${createdJobsCount} jobs`);
  console.log(`✅ Created ${createdHolidaysCount} holidays`);
  console.log(`✅ Created ${createdEmployeesCount} employees`);
  // console.log(`✅ Created ${createdUsersCount} users`);
  console.log(`✅ Created ${createdAttendanceCount} attendance records`);
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
