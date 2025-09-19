"use server";
// import { PrismaClient, Employees } from "@/db/prisma";
import { PrismaClient } from "@/db/prisma";
import { EmployeeWithRelations, Employees } from "./types";
import { createMultipleEmployeeDocuments } from "./documentActions";

const prisma = new PrismaClient();

const getEmployees = async (
  query?: string
): Promise<EmployeeWithRelations[]> => {
  try {
    const whereCondition = query
      ? {
          OR: [
            // Search trong firstName
            { firstName: { contains: query, mode: "insensitive" as const } },
            // Search trong lastName
            { lastName: { contains: query, mode: "insensitive" as const } },
            // Search trong phone
            { phone: { contains: query, mode: "insensitive" as const } },
            ...(query.includes(" ")
              ? (() => {
                  const nameParts = query.trim().split(/\s+/);
                  if (nameParts.length >= 2) {
                    return [
                      // Trường hợp "firstName lastName"
                      {
                        AND: [
                          {
                            firstName: {
                              contains: nameParts[0],
                              mode: "insensitive" as const,
                            },
                          },
                          {
                            lastName: {
                              contains: nameParts[1],
                              mode: "insensitive" as const,
                            },
                          },
                        ],
                      },
                      // Trường hợp "lastName firstName"
                      {
                        AND: [
                          {
                            lastName: {
                              contains: nameParts[0],
                              mode: "insensitive" as const,
                            },
                          },
                          {
                            firstName: {
                              contains: nameParts[1],
                              mode: "insensitive" as const,
                            },
                          },
                        ],
                      },
                    ];
                  }
                  return [];
                })()
              : []),
          ],
        }
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
    // Tách riêng data cho employee (loại bỏ user data và documents)
    const { user, documents, ...employeeData } = data;

    // Tạo employee trước
    const newEmployee = await prisma.employees.create({
      data: employeeData,
    });

    // Sau đó tạo user với employeeId từ employee vừa tạo
    await prisma.user.create({
      data: {
        employeeId: newEmployee.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
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

      await createMultipleEmployeeDocuments(newEmployee.id, documentsData);
    }

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
): Promise<{ success: boolean; employee: Employees | null }> => {
  try {
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

export {
  getEmployees,
  getEmployeeById,
  createEmployee,
  deleteEmployee,
  getPosition,
};
