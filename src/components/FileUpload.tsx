"use client";

import React, { useState, useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";
import { FileText, Upload, Eye, Download, Trash2 } from "lucide-react";

interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  publicId: string;
  uploadedAt: string;
}

interface SimpleFileUploadProps {
  employeeId?: string;
  existingDocuments?: UploadedFile[];
  onDocumentsChange?: (documents: UploadedFile[]) => void;
}

const SimpleFileUpload: React.FC<SimpleFileUploadProps> = ({
  employeeId,
  existingDocuments = [],
  onDocumentsChange,
}) => {
  const [documents, setDocuments] = useState<UploadedFile[]>(existingDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useRef<Toast>(null);

  const onFileSelect = async (event: { files: File[] }) => {
    const file = event.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("employeeId", employeeId || "temp");

      // Progress simulation
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();

      const newDocument: UploadedFile = {
        id: result.public_id,
        fileName: result.original_filename,
        fileUrl: result.url,
        publicId: result.public_id,
        uploadedAt: new Date().toISOString(),
      };

      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      onDocumentsChange?.(updatedDocuments);

      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "File đã được upload thành công",
        life: 3000,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail:
          error instanceof Error ? error.message : "Không thể upload file",
        life: 5000,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteDocument = async (document: UploadedFile) => {
    try {
      const response = await fetch(
        `/api/upload?publicId=${document.publicId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        const updatedDocuments = documents.filter((d) => d.id !== document.id);
        setDocuments(updatedDocuments);
        onDocumentsChange?.(updatedDocuments);

        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "File đã được xóa",
          life: 3000,
        });
      }
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Không thể xóa file",
        life: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      {/* Upload Area */}
      <div className="card-modern p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Upload className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload tài liệu PDF
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Chọn file PDF để upload (tối đa 10MB)
            </p>
          </div>

          <FileUpload
            mode="basic"
            name="file"
            accept="application/pdf"
            maxFileSize={10000000}
            onSelect={onFileSelect}
            chooseLabel="Chọn file PDF"
            className="upload-btn"
            disabled={uploading}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Đang upload...
              </span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <ProgressBar value={uploadProgress} className="w-full h-2" />
          </div>
        )}
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="card-modern p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Tài liệu đã upload ({documents.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <Card key={document.id} className="border border-gray-200">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-red-600" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {document.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(document.uploadedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      icon={<Eye size={16} />}
                      className="p-button-text p-button-sm text-blue-600"
                      onClick={() => window.open(document.fileUrl, "_blank")}
                      tooltip="Xem tài liệu"
                    />
                    <Button
                      icon={<Download size={16} />}
                      className="p-button-text p-button-sm text-green-600"
                      onClick={() => {
                        const link = window.document.createElement("a");
                        link.href = document.fileUrl;
                        link.download = document.fileName;
                        link.click();
                      }}
                      tooltip="Tải xuống"
                    />
                    <Button
                      icon={<Trash2 size={16} />}
                      className="p-button-text p-button-sm text-red-600"
                      onClick={() => deleteDocument(document)}
                      tooltip="Xóa tài liệu"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleFileUpload;
