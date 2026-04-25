"use server";
import { prisma } from "@/lib/prisma";
import { EmployeeWithRelations, Employees } from "./types";
import { createMultipleEmployeeDocuments } from "./documentActions";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { buildNameSearchCondition } from "@/lib/search-helpers";
import { createEmployeeSchema, updateEmployeeSchema, updateUserSchema, idSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

const getEmployees = async (
  query?: string
): Promise<EmployeeWithRelations[]> => {
  try {
    const whereCondition = query
      ? buildNameSearchCondition(query)
      : {};

    const employees = await prisma.employees.findMany({
      where: whereCondition,
      include: {
        department: true,
        position: true,
        job: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return employees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees");
  }
};

const getPosition = async (id?: string) => {
  try {
    if (id) {
      const position = await prisma.positions.findUnique({
        where: { id },
      });
      return position ? [position] : [];
    }
    const positions = await prisma.positions.findMany();
    return positions;
  } catch (error) {
    console.error("Error fetching positions:", error);
    throw new Error("Failed to fetch positions");
  }
};

const createEmployee = async (
  data: Employees & {
    user: {
      employeeId: string;
      email: string;
      firstName: string;
      lastName: string;
      password: string;
    };
    documents?: Array<{
      fileName: string;
      fileUrl: string;
      publicId: string;
      fileSize: number;
      documentType: string;
      description?: string;
      mimeType?: string;
    }>;
  }
): Promise<{ employee: Employees; success: boolean; error?: string }> => {
  try {
    const authCheck = await requirePermission(PERMISSIONS.EMPLOYEES.CREATE);
    if (!authCheck.authorized) {
      return { employee: {} as Employees, success: false, error: authCheck.error };
    }

    const { user, documents, ...employeeData } = data;

    // Validate input
    const parsed = createEmployeeSchema.safeParse(data);
    if (!parsed.success) {
      return {
        employee: {} as Employees,
        success: false,
        error: parsed.error.issues.map((e: any) => e.message).join(", "),
      };
    }

    // Hash password trước khi lưu
    const hashedPassword = await bcrypt.hash(user.password, 12);

    // Sử dụng transaction để đảm bảo data consistency
    const newEmployee = await prisma.$transaction(async (tx) => {
      // Tạo employee trước
      const employee = await tx.employees.create({
        data: employeeData,
      });

      // Sau đó tạo user với employeeId từ employee vừa tạo
      await tx.user.create({
        data: {
          employeeId: employee.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: hashedPassword,
        },
      });

      // Lưu documents nếu có
      if (documents && documents.length > 0) {
        const documentsData = documents.map((doc) => ({
          documentType: doc.documentType,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          publicId: doc.publicId,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType || "application/pdf",
          uploadedBy: user.email,
          description: doc.description || null,
        }));
        await createMultipleEmployeeDocuments(employee.id, documentsData);
      }

      return employee;
    });

    return {
      employee: newEmployee,
      success: true,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return {
      employee: {} as Employees,
      success: false,
      error: error.message || "Failed to create employee",
    };
  }
};

const deleteEmployee = async (
  id: string
): Promise<{ success: boolean; employee: Employees | null; error?: string }> => {
  try {
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return { success: false, employee: null, error: "ID không hợp lệ" };
    }

    const authCheck = await requirePermission(PERMISSIONS.EMPLOYEES.DELETE);
    if (!authCheck.authorized) {
      return { success: false, employee: null, error: authCheck.error };
    }

    const employee = await prisma.employees.delete({
      where: { id },
    });
    return { success: true, employee: employee };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, employee: null };
  }
};

const getEmployeeById = async (
  id: string
): Promise<EmployeeWithRelations | null> => {
  try {
    const employee = await prisma.employees.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        job: true,
      },
    });
    return employee;
  } catch (error) {
    console.error("Error fetching employee by ID:", error);
    throw new Error("Failed to fetch employee");
  }
};

const updateEmployee = async (
  id: string,
  data: Partial<Employees>
): Promise<{ success: boolean; employee?: Employees; error?: string }> => {
  try {
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return { success: false, error: "ID không hợp lệ" };
    }

    const parsed = updateEmployeeSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e: any) => e.message).join(", "),
      };
    }

    const authCheck = await requirePermission(PERMISSIONS.EMPLOYEES.UPDATE);
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const updatedEmployee = await prisma.employees.update({
      where: { id },
      data,
    });
    return { success: true, employee: updatedEmployee };
  } catch (error: unknown) {
    console.error("Error updating employee:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update employee",
    };
  }
};
const getUser = async (employeeId: string) => {
  const user = await prisma.user.findUnique({
    where: { employeeId },
  });
  return user;
};

const updateUser = async (
  employeeId: string,
  userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  }
) => {
  try {
    const parsed = updateUserSchema.safeParse(userData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e: any) => e.message).join(", "),
      };
    }

    const updateData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
    } = {};

    if (userData.email) updateData.email = userData.email;
    if (userData.firstName) updateData.firstName = userData.firstName;
    if (userData.lastName) updateData.lastName = userData.lastName;
    if (userData.password) updateData.password = userData.password;

    const updatedUser = await prisma.user.update({
      where: { employeeId },
      data: updateData,
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Không thể cập nhật thông tin tài khoản" };
  }
};

export {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getPosition,
  getUser,
  updateUser,
};
