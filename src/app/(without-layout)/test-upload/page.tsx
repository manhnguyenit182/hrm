"use client";

import React, { useState, useRef } from "react";
import DocumentUpload from "@/components/FileUpload";
import { Toast } from "primereact/toast";

const TestUploadPage = () => {
  const [documents, setDocuments] = useState<
    Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      publicId: string;
      fileSize: number;
      documentType: string;
      description?: string;
      uploadedAt: string;
    }>
  >([]);
  const toast = useRef<Toast>(null);

  const handleDocumentsChange = (newDocuments: typeof documents) => {
    setDocuments(newDocuments);
    console.log("Documents updated:", newDocuments);
  };

  return (
    <div className="container mx-auto p-6">
      <Toast ref={toast} />

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Test Upload Tài Liệu
          </h1>
          <p className="text-gray-600 mb-6">
            Trang test để kiểm tra tính năng upload PDF lên Cloudinary
          </p>
        </div>

        <DocumentUpload
          employeeId="test-employee-123"
          existingDocuments={documents}
          onDocumentsChange={handleDocumentsChange}
        />

        {documents.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Documents State (Debug)
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(documents, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUploadPage;
