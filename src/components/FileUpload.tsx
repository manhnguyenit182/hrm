"use client";

import React, { useState, useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { FileText, Upload } from "lucide-react";

interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  publicId: string;
  fileSize: number;
  documentType: string;
  description?: string;
  uploadedAt: string;
}

interface DocumentUploadProps {
  employeeId?: string;
  existingDocuments?: UploadedFile[];
  onDocumentsChange?: (documents: UploadedFile[]) => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  employeeId,
  existingDocuments = [],
  onDocumentsChange,
  maxFileSize = 10,
  allowedTypes = ["application/pdf"],
}) => {
  const [documents, setDocuments] = useState<UploadedFile[]>(existingDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  const documentTypes = [
    { label: "CV/Hồ sơ", value: "cv" },
    { label: "Hợp đồng lao động", value: "contract" },
    { label: "Chứng chỉ", value: "certificate" },
    { label: "CMND/CCCD", value: "id_card" },
    { label: "Bằng cấp", value: "diploma" },
    { label: "Giấy khám sức khỏe", value: "health_check" },
    { label: "Tài liệu khác", value: "other" },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): boolean => {
    if (!allowedTypes.includes(file.type)) {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Chỉ hỗ trợ file PDF",
        life: 3000,
      });
      return false;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: `Kích thước file không được vượt quá ${maxFileSize}MB`,
        life: 3000,
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: { files: File[] }) => {
    const file = event.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setShowUploadDialog(true);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !selectedDocumentType) {
      toast.current?.show({
        severity: "warn",
        summary: "Cảnh báo",
        detail: "Vui lòng chọn file và loại tài liệu",
        life: 3000,
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("employeeId", employeeId || "temp");
      formData.append("documentType", selectedDocumentType);
      formData.append("description", documentDescription);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
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
        fileSize: result.file_size,
        documentType: selectedDocumentType,
        description: documentDescription,
        uploadedAt: new Date().toISOString(),
      };

      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      onDocumentsChange?.(updatedDocuments);

      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "Tài liệu đã được upload thành công",
        life: 3000,
      });

      // Reset form
      setShowUploadDialog(false);
      setSelectedFile(null);
      setSelectedDocumentType("");
      setDocumentDescription("");
      fileUploadRef.current?.clear();
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
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa file");
      }

      const updatedDocuments = documents.filter(
        (doc) => doc.id !== document.id
      );
      setDocuments(updatedDocuments);
      onDocumentsChange?.(updatedDocuments);

      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "Tài liệu đã được xóa",
        life: 3000,
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Không thể xóa tài liệu",
        life: 3000,
      });
    }
  };

  const getDocumentTypeLabel = (value: string): string => {
    const type = documentTypes.find((type) => type.value === value);
    return type?.label || value;
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      {/* Upload Area */}
      <div className="card-modern p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Upload className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">
                Tài liệu nhân viên
              </h3>
              <p className="text-gray-600">
                Upload và quản lý tài liệu PDF của nhân viên
              </p>
            </div>
          </div>
          <Button
            label="Upload tài liệu"
            icon="pi pi-upload"
            className="btn-primary !px-6 !py-3"
            onClick={() => fileUploadRef.current?.getInput()?.click()}
          />
        </div>

        {/* Hidden File Upload */}
        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          accept=".pdf"
          maxFileSize={maxFileSize * 1024 * 1024}
          onSelect={handleFileSelect}
          customUpload
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="card-modern p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Đang upload...
            </span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <ProgressBar
            value={uploadProgress}
            className="w-full h-2"
            color="var(--color-primary-500)"
          />
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="card-modern p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Tài liệu đã upload ({documents.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <Card
                key={document.id}
                className="border border-gray-200 hover:shadow-md transition-shadow"
              >
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
                          {getDocumentTypeLabel(document.documentType)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Kích thước:</span>
                      <span>{formatFileSize(document.fileSize)}</span>
                    </div>
                    {document.description && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Mô tả:</span>{" "}
                        {document.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Upload:{" "}
                      {new Date(document.uploadedAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      icon="pi pi-eye"
                      className="p-button-text p-button-sm text-blue-600 hover:bg-blue-50"
                      onClick={() => window.open(document.fileUrl, "_blank")}
                      tooltip="Xem tài liệu"
                    />
                    <Button
                      icon="pi pi-download"
                      className="p-button-text p-button-sm text-green-600 hover:bg-green-50"
                      onClick={() => {
                        const link = window.document.createElement("a");
                        link.href = document.fileUrl;
                        link.download = document.fileName;
                        link.click();
                      }}
                      tooltip="Tải xuống"
                    />
                    <Button
                      icon="pi pi-trash"
                      className="p-button-text p-button-sm text-red-600 hover:bg-red-50"
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

      {/* Upload Dialog */}
      <Dialog
        header="Upload tài liệu mới"
        visible={showUploadDialog}
        style={{ width: "500px" }}
        onHide={() => {
          setShowUploadDialog(false);
          setSelectedFile(null);
          setSelectedDocumentType("");
          setDocumentDescription("");
        }}
        className="modern-dialog"
      >
        <div className="space-y-4">
          {selectedFile && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="text-red-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Loại tài liệu <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={selectedDocumentType}
              options={documentTypes}
              onChange={(e) => setSelectedDocumentType(e.value)}
              placeholder="Chọn loại tài liệu..."
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mô tả (tùy chọn)
            </label>
            <InputText
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="Nhập mô tả tài liệu..."
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              label="Hủy"
              className="btn-secondary"
              onClick={() => {
                setShowUploadDialog(false);
                setSelectedFile(null);
                setSelectedDocumentType("");
                setDocumentDescription("");
              }}
            />
            <Button
              label="Upload"
              className="btn-primary"
              onClick={uploadDocument}
              loading={uploading}
              disabled={!selectedDocumentType}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DocumentUpload;
