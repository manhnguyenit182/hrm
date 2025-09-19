import { PrismaClient, EmployeeDocuments } from "@/db/prisma";

const prisma = new PrismaClient();

// Update Cloudinary folder after employee creation
export const updateDocumentFolders = async (
  tempEmployeeId: string,
  realEmployeeId: string,
  documents: Array<{
    publicId: string;
    documentType: string;
  }>
) => {
  try {
    const updatedDocuments = [];

    for (const doc of documents) {
      const response = await fetch("/api/upload/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPublicId: doc.publicId,
          newEmployeeId: realEmployeeId,
          documentType: doc.documentType,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        updatedDocuments.push({
          oldPublicId: doc.publicId,
          newPublicId: result.newPublicId,
          newUrl: result.newUrl,
        });
      }
    }

    return { success: true, updatedDocuments };
  } catch (error) {
    console.error("Error updating document folders:", error);
    return { success: false, error: "Failed to update document folders" };
  }
};

// Tạo tài liệu mới cho nhân viên
export const createEmployeeDocument = async (data: EmployeeDocuments) => {
  try {
    const document = await prisma.employeeDocuments.create({
      data: {
        employeeId: data.employeeId,
        documentType: data.documentType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        publicId: data.publicId,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        uploadedBy: data.uploadedBy,
        description: data.description,
      },
    });
    return { success: true, document };
  } catch (error) {
    console.error("Error creating employee document:", error);
    return { success: false, error: "Failed to create document" };
  }
};

// Lấy tất cả tài liệu của nhân viên
export const getEmployeeDocuments = async (employeeId: string) => {
  try {
    const documents = await prisma.employeeDocuments.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, documents };
  } catch (error) {
    console.error("Error fetching employee documents:", error);
    return { success: false, error: "Failed to fetch documents" };
  }
};

// Xóa tài liệu
export const deleteEmployeeDocument = async (documentId: string) => {
  try {
    await prisma.employeeDocuments.delete({
      where: { id: documentId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting employee document:", error);
    return { success: false, error: "Failed to delete document" };
  }
};

// Lưu nhiều tài liệu cho nhân viên mới
export const createMultipleEmployeeDocuments = async (
  employeeId: string,
  documents: Array<{
    documentType: string;
    fileName: string;
    fileUrl: string;
    publicId: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    description?: string | null;
  }>
) => {
  try {
    const documentsData = documents.map((doc) => ({
      ...doc,
      employeeId,
    }));

    const createdDocuments = await prisma.employeeDocuments.createMany({
      data: documentsData,
    });

    return { success: true, count: createdDocuments.count };
  } catch (error) {
    console.error("Error creating multiple employee documents:", error);
    return { success: false, error: "Failed to create documents" };
  }
};
