"use server";

import { PrismaClient } from "@/db/prisma";

const prisma = new PrismaClient();

// Lấy danh sách nhân viên theo departmentId
export const getEmployeesByDepartmentId = async (departmentId: string) => {
  try {
    const employees = await prisma.employees.findMany({
      where: {
        departmentId: departmentId,
      },
      include: {
        department: true,
        job: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
    return employees;
  } catch (error) {
    console.error("Error fetching employees by department:", error);
    return [];
  }
};

// Lấy danh sách tất cả nhân viên để chọn
export const getAllEmployees = async () => {
  try {
    const employees = await prisma.employees.findMany({
      where: {
        status: "active", // Chỉ lấy nhân viên đang làm việc
      },
      include: {
        department: true,
        job: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
    return employees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

// Lấy thông tin điểm danh của nhân viên trong ngày
export const getTodayAttendance = async (employeeId: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return attendance;
  } catch (error) {
    console.error("Error fetching today attendance:", error);
    return null;
  }
};

// Điểm danh vào
export const clockIn = async (employeeId: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Kiểm tra xem đã điểm danh hôm nay chưa
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        error: "Bạn đã điểm danh vào hôm nay rồi",
      };
    }

    // Tạo bản ghi điểm danh mới
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(),
        clockIn: new Date(),
        status:
          Date.now() < new Date().setHours(8, 30, 0, 0) ? "Present" : "Late",
      },
    });

    return {
      success: true,
      attendance,
      message: "Điểm danh vào thành công",
    };
  } catch (error) {
    console.error("Error clocking in:", error);
    return {
      success: false,
      error: "Không thể điểm danh vào. Vui lòng thử lại.",
    };
  }
};

// Điểm danh ra
export const clockOut = async (employeeId: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Tìm bản ghi điểm danh hôm nay
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!attendance) {
      return {
        success: false,
        error: "Bạn chưa điểm danh vào hôm nay",
      };
    }

    if (attendance.clockOut) {
      return {
        success: false,
        error: "Bạn đã điểm danh ra rồi",
      };
    }

    // Cập nhật thời gian ra
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { clockOut: new Date() },
    });

    return {
      success: true,
      attendance: updatedAttendance,
      message: "Điểm danh ra thành công",
    };
  } catch (error) {
    console.error("Error clocking out:", error);
    return {
      success: false,
      error: "Không thể điểm danh ra. Vui lòng thử lại.",
    };
  }
};
