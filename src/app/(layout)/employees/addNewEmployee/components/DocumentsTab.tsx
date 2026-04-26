import React from "react";
import SimpleFileUpload from "@/components/FileUpload";

interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  publicId: string;
  uploadedAt: string;
  fileSize?: number;
  documentType?: string;
  mimeType?: string;
  description?: string;
}

interface DocumentsTabProps {
  uploadedDocuments: UploadedFile[];
  setUploadedDocuments: (documents: UploadedFile[]) => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  uploadedDocuments,
  setUploadedDocuments,
}) => {
  return (
    <SimpleFileUpload
      employeeId="temp-employee-id"
      existingDocuments={uploadedDocuments}
      onDocumentsChange={setUploadedDocuments}
    />
  );
};
