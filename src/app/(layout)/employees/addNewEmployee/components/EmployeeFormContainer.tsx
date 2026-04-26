"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Toast } from "primereact/toast";
import { MenuItem } from "primereact/menuitem";
import { User, BriefcaseBusiness, FileText, Lock } from "lucide-react";
import bcrypt from "bcryptjs";

import { NewEmployeeFormData } from "../../types";
import { Option } from "../types";
import { createEmployee } from "../../actions";

import { PersonalInfoTab } from "./PersonalInfoTab";
import { JobInfoTab } from "./JobInfoTab";
import { DocumentsTab } from "./DocumentsTab";
import { AccountInfoTab } from "./AccountInfoTab";

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

interface EmployeeFormContainerProps {
  departmentOptions: Option[];
  positionOptions: Option[];
  jobOptions: Array<Option & { departmentId: string }>;
}

export const EmployeeFormContainer: React.FC<EmployeeFormContainerProps> = ({
  departmentOptions,
  positionOptions,
  jobOptions,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [departmentSelected, setDepartmentSelected] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([]);
  const toast = useRef<Toast>(null);

  const { control, handleSubmit, trigger, reset } = useForm<NewEmployeeFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      birthday: null,
      maritalStatus: null,
      gender: null,
      nationality: "",
      address: "",
      city: "",
      state: "",
      status: "",
      departmentId: null,
      positionId: null,
      jobId: null,
      startDate: null,
      type: null,
      user: {
        email: "",
        firstName: "",
        lastName: "",
        password: "",
      },
    },
  });

  function getRandomAvatar(): string {
    const randomNum = Math.floor(Math.random() * 70) + 1;
    return `https://i.pravatar.cc/150?img=${randomNum}`;
  }

  const onSubmit = async (data: NewEmployeeFormData) => {
    data.status = "Đang chờ";
    data.image = getRandomAvatar();

    const hashedPassword = await bcrypt.hash(data.user?.password || "", 12);
    const employeeData = {
      ...data,
      user: {
        employeeId: "", // Will be set by the server/database
        email: data.user?.email || "",
        firstName: data.user?.firstName || "",
        lastName: data.user?.lastName || "",
        password: hashedPassword,
      },
      documents: uploadedDocuments.map((doc) => ({
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        publicId: doc.publicId,
        fileSize: doc.fileSize || 0,
        documentType: doc.documentType || "PDF",
        mimeType: doc.mimeType || "application/pdf",
        description: doc.description || "",
      })),
    };
    
    const result = await createEmployee(employeeData);

    if (result.success) {
      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "Nhân viên và tài liệu đã được tạo thành công",
        life: 3000,
      });

      reset();
      setUploadedDocuments([]);
      setActiveIndex(0);
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Không thể tạo nhân viên",
        life: 5000,
      });
    }
  };

  const handleNext = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    let fieldsToValidate: (keyof NewEmployeeFormData)[] = [];

    if (activeIndex === 0) {
      fieldsToValidate = [
        "firstName",
        "lastName",
        "phone",
        "email",
        "birthday",
        "maritalStatus",
        "gender",
        "nationality",
        "address",
        "city",
        "state",
      ];
    } else if (activeIndex === 1) {
      fieldsToValidate = [
        "departmentId",
        "positionId",
        "jobId",
        "startDate",
        "type",
      ];
    } else if (activeIndex === 2) {
      setActiveIndex(Math.min(3, activeIndex + 1));
      return;
    } else if (activeIndex === 3) {
      fieldsToValidate = [];
      return;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveIndex(Math.min(3, activeIndex + 1));
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: <User className="mr-2" style={{ color: "var(--color-primary-500)" }} />,
      label: "Thông tin cá nhân",
    },
    {
      icon: <BriefcaseBusiness className="mr-2" style={{ color: "var(--color-primary-500)" }} />,
      label: "Thông tin nghề nghiệp",
    },
    {
      icon: <FileText className="mr-2" style={{ color: "var(--color-primary-500)" }} />,
      label: "Tài liệu",
    },
    {
      icon: <Lock className="mr-2" style={{ color: "var(--color-primary-500)" }} />,
      label: "Quyền truy cập tài khoản",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-surface rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Thêm nhân viên mới</h1>
            <p className="text-gray-600">Điền thông tin chi tiết để tạo hồ sơ nhân viên mới</p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Bước {activeIndex + 1} / 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-modern overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            {menuItems[activeIndex].icon}
            <span className="ml-3">{menuItems[activeIndex].label}</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {activeIndex === 0 && <PersonalInfoTab control={control} />}
          {activeIndex === 1 && (
            <JobInfoTab
              control={control}
              departmentOptions={departmentOptions}
              positionOptions={positionOptions}
              jobOptions={jobOptions}
              departmentSelected={departmentSelected}
              setDepartmentSelected={setDepartmentSelected}
            />
          )}
          {activeIndex === 2 && (
            <DocumentsTab
              uploadedDocuments={uploadedDocuments}
              setUploadedDocuments={setUploadedDocuments}
            />
          )}
          {activeIndex === 3 && <AccountInfoTab control={control} />}

          <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="btn-secondary !px-6 !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="pi pi-arrow-left mr-2"></i>
              Quay lại
            </button>

            {activeIndex < 3 ? (
              <button type="button" onClick={handleNext} className="btn-primary !px-6 !py-3">
                Tiếp theo
                <i className="pi pi-arrow-right ml-2"></i>
              </button>
            ) : (
              <button type="submit" className="btn-primary !px-6 !py-3">
                <i className="pi pi-check mr-2"></i>
                Tạo nhân viên
              </button>
            )}
          </div>
        </form>
      </div>

      <Toast ref={toast} />
    </div>
  );
};
