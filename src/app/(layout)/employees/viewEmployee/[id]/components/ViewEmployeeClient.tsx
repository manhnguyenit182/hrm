"use client";

import React, { useState, useEffect, useRef } from "react";
import { EmployeeWithRelations } from "../../../types";
import { updateEmployee, updateUser } from "../../../actions";
import { Departments, Jobs, Positions, User, EmployeeDocuments } from "@/db/prisma";
import { Avatar } from "primereact/avatar";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {
  BriefcaseBusiness,
  FileText,
  Mail,
  UserRound,
  Lock,
  Edit,
  Save,
  X,
} from "lucide-react";

interface ViewEmployeeClientProps {
  initialEmployee: EmployeeWithRelations | null;
  initialUserAccount: User | null;
  initialDocuments: EmployeeDocuments[];
  departments: Departments[];
  jobs: Jobs[];
  positions: Positions[];
}

export function ViewEmployeeClient({
  initialEmployee,
  initialUserAccount,
  initialDocuments,
  departments,
  jobs,
  positions,
}: ViewEmployeeClientProps) {
  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(initialEmployee);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("userInfo");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<EmployeeWithRelations>>({});
  const [editUserData, setEditUserData] = useState<{
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const toast = useRef<Toast>(null);

  const [userAccount, setUserAccount] = useState<User | null>(initialUserAccount);
  const [documents] = useState<EmployeeDocuments[]>(initialDocuments);

  let fullName = "";

  // Options for dropdowns
  const maritalStatusOptions = [
    { label: "Độc thân", value: "single" },
    { label: "Đã kết hôn", value: "married" },
  ];

  const genderOptions = [
    { label: "Nam", value: "male" },
    { label: "Nữ", value: "female" },
    { label: "Khác", value: "other" },
  ];

  const departmentOptions = departments.map((dept) => ({
    label: dept.name,
    value: dept.id,
  }));

  const jobOptions = jobs.map((job) => ({
    label: job.job,
    value: job.id,
  }));

  const positionOptions = positions.map((pos) => ({
    label: pos.roleName,
    value: pos.id,
  }));

  const employeeTypeOptions = [
    { label: "Toàn thời gian", value: "full-time" },
    { label: "Bán thời gian", value: "part-time" },
  ];

  const employeeStatusOptions = [
    { label: "Đang làm việc", value: "active" },
    { label: "Tạm nghỉ", value: "inactive" },
    { label: "Đã nghỉ việc", value: "terminated" },
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...employee });
    setEditUserData({
      email: userAccount?.email || "",
      firstName: userAccount?.firstName || "",
      lastName: userAccount?.lastName || "",
      password: "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setEditUserData({});
  };

  const handleSave = async () => {
    if (!employee?.id) return;

    setSaving(true);
    try {
      const employeeResult = await updateEmployee(employee.id, {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        email: editData.email,
        birthday: editData.birthday,
        maritalStatus: editData.maritalStatus,
        gender: editData.gender,
        nationality: editData.nationality,
        address: editData.address,
        city: editData.city,
        state: editData.state,
        departmentId: editData.departmentId,
        positionId: editData.positionId,
        jobId: editData.jobId,
        startDate: editData.startDate,
        type: editData.type,
        status: editData.status,
      });

      let userResult: { success: boolean; user?: User; error?: string } = {
        success: true,
      };
      
      if (
        userAccount &&
        Object.keys(editUserData).some(
          (key) => editUserData[key as keyof typeof editUserData]
        )
      ) {
        const userUpdateData: {
          email?: string;
          firstName?: string;
          lastName?: string;
          password?: string;
        } = {};

        if (editUserData.email && editUserData.email !== userAccount.email) {
          userUpdateData.email = editUserData.email;
        }
        if (
          editUserData.firstName &&
          editUserData.firstName !== userAccount.firstName
        ) {
          userUpdateData.firstName = editUserData.firstName;
        }
        if (
          editUserData.lastName &&
          editUserData.lastName !== userAccount.lastName
        ) {
          userUpdateData.lastName = editUserData.lastName;
        }
        if (editUserData.password && editUserData.password.trim() !== "") {
          userUpdateData.password = editUserData.password;
        }

        if (Object.keys(userUpdateData).length > 0) {
          userResult = await updateUser(employee.id, userUpdateData);
        }
      }

      if (employeeResult.success && userResult.success) {
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Cập nhật thông tin nhân viên và tài khoản thành công",
          life: 3000,
        });

        setEmployee((prev) => (prev ? { ...prev, ...editData } : null));

        if (userResult.user) {
          setUserAccount(userResult.user);
        }

        setIsEditing(false);
        setEditData({});
        setEditUserData({});
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail:
            employeeResult.error ||
            userResult.error ||
            "Không thể cập nhật thông tin",
          life: 5000,
        });
      }
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Có lỗi xảy ra khi cập nhật thông tin",
        life: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setSelectedMenuItem("userInfo");
  }, []);

  const profileMenu = [
    {
      icon: <UserRound className="mr-2 text-[var(--color-primary-500)]" />,
      label: "Thông tin cá nhân",
    },
    {
      icon: (
        <BriefcaseBusiness className="mr-2 text-[var(--color-primary-500)]" />
      ),
      label: "Thông tin nghề nghiệp",
    },
    {
      icon: <FileText className="mr-2 text-[var(--color-primary-500)]" />,
      label: "Tài liệu",
    },
    {
      icon: <Lock className="mr-2 text-[var(--color-primary-500)]" />,
      label: "Quyền truy cập tài khoản",
    },
  ];

  if (!employee) {
    return (
      <div className="card-modern p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="pi pi-user text-gray-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Không tìm thấy nhân viên
        </h3>
        <p className="text-gray-500">
          Nhân viên bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
        </p>
      </div>
    );
  } else {
    fullName = employee.firstName + " " + employee.lastName;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-surface rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar
                image={employee.image || undefined}
                icon={!employee.image ? "pi pi-user" : undefined}
                size="xlarge"
                className="!w-20 !h-20 border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-4 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">
                {fullName}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <BriefcaseBusiness className="w-4 h-4" />
                  <span>{employee.job?.job || "Chưa có chức vụ"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{employee.email}</span>
                </div>
              </div>
              <div className="flex items-center space-x-6 mt-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Đang hoạt động</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {employee.department?.name || "Chưa có phòng ban"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <Button
                icon={<Edit className="w-4 h-4 mr-2" />}
                label="Chỉnh sửa"
                onClick={handleEdit}
                className="p-button-outlined btn-primary"
                size="small"
              />
            ) : (
              <div className="flex space-x-2 gap-2">
                <Button
                  icon={<Save className="w-4 h-4" />}
                  label="Lưu"
                  onClick={handleSave}
                  loading={saving}
                  className="btn-primary"
                  size="small"
                />
                <Button
                  icon={<X className="w-4 h-4" />}
                  label="Hủy"
                  onClick={handleCancel}
                  className="p-button-outlined p-button-secondary"
                  size="small"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-modern overflow-hidden">
        <div className="p-6">
          {selectedMenuItem === "userInfo" && (
            <div className="space-y-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {profileMenu.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeIndex === index
                        ? "bg-white text-primary-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeIndex === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Họ</label>
                        {isEditing ? (
                          <InputText value={editData.firstName || ""} onChange={(e) => setEditData({ ...editData, firstName: e.target.value })} className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tên</label>
                        {isEditing ? (
                          <InputText value={editData.lastName || ""} onChange={(e) => setEditData({ ...editData, lastName: e.target.value })} className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.lastName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Số điện thoại</label>
                        {isEditing ? (
                          <InputText value={editData.phone || ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.phone}</p>
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                        {isEditing ? (
                          <InputText value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ngày sinh</label>
                        {isEditing ? (
                          <Calendar value={editData.birthday ? new Date(editData.birthday) : null} onChange={(e) => setEditData({ ...editData, birthday: e.value as Date })} dateFormat="dd/mm/yy" className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.birthday ? employee.birthday.toLocaleDateString("vi-VN") : "Chưa cập nhật"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tình trạng hôn nhân</label>
                        {isEditing ? (
                          <Dropdown value={editData.maritalStatus} options={maritalStatusOptions} onChange={(e) => setEditData({ ...editData, maritalStatus: e.value })} placeholder="Chọn tình trạng" className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.maritalStatus === "single" ? "Độc thân" : employee.maritalStatus === "married" ? "Đã kết hôn" : "Chưa cập nhật"}</p>
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Giới tính</label>
                        {isEditing ? (
                          <Dropdown value={editData.gender} options={genderOptions} onChange={(e) => setEditData({ ...editData, gender: e.value })} placeholder="Chọn giới tính" className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.gender === "male" ? "Nam" : employee.gender === "female" ? "Nữ" : employee.gender === "other" ? "Khác" : "Chưa cập nhật"}</p>
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Địa chỉ</label>
                        {isEditing ? (
                          <InputText value={editData.address || ""} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.address || "Chưa cập nhật"}</p>
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tỉnh/Thành phố</label>
                        {isEditing ? (
                          <InputText value={editData.state || ""} onChange={(e) => setEditData({ ...editData, state: e.target.value })} className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.state || "Chưa cập nhật"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Quận/Huyện</label>
                        {isEditing ? (
                          <InputText value={editData.city || ""} onChange={(e) => setEditData({ ...editData, city: e.target.value })} className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.city || "Chưa cập nhật"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Quốc tịch</label>
                        {isEditing ? (
                          <InputText value={editData.nationality || ""} onChange={(e) => setEditData({ ...editData, nationality: e.target.value })} className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.nationality || "Chưa cập nhật"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeIndex === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phòng ban</label>
                        {isEditing ? (
                          <Dropdown value={editData.departmentId} options={departmentOptions} onChange={(e) => setEditData({ ...editData, departmentId: e.value })} placeholder="Chọn phòng ban" className="w-full" />
                        ) : (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {employee.department?.name || "Chưa có phòng ban"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Chức vụ</label>
                        {isEditing ? (
                          <Dropdown value={editData.positionId} options={positionOptions} onChange={(e) => setEditData({ ...editData, positionId: e.value })} placeholder="Chọn chức vụ" className="w-full" />
                        ) : (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              {employee.position?.title || "Chưa có chức vụ"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Công việc</label>
                        {isEditing ? (
                          <Dropdown value={editData.jobId} options={jobOptions} onChange={(e) => setEditData({ ...editData, jobId: e.value })} placeholder="Chọn công việc" className="w-full" />
                        ) : (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {employee.job?.job || "Chưa có công việc"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Loại nhân viên</label>
                        {isEditing ? (
                          <Dropdown value={editData.type} options={employeeTypeOptions} onChange={(e) => setEditData({ ...editData, type: e.value })} placeholder="Chọn loại nhân viên" className="w-full" />
                        ) : (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                              {employee.type === "full-time" ? "Toàn thời gian" : employee.type === "part-time" ? "Bán thời gian" : "Chưa cập nhật"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</label>
                        {isEditing ? (
                          <Dropdown value={editData.status} options={employeeStatusOptions} onChange={(e) => setEditData({ ...editData, status: e.value })} placeholder="Chọn trạng thái" className="w-full" />
                        ) : (
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                employee.status === "active" ? "bg-green-100 text-green-800" : employee.status === "inactive" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {employee.status === "active" ? "Đang làm việc" : employee.status === "inactive" ? "Tạm nghỉ" : employee.status === "terminated" ? "Đã nghỉ việc" : "Chưa cập nhật"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ngày bắt đầu</label>
                        {isEditing ? (
                          <Calendar value={editData.startDate ? new Date(editData.startDate) : null} onChange={(e) => setEditData({ ...editData, startDate: e.value as Date })} dateFormat="dd/mm/yy" className="w-full" />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">{employee.startDate ? employee.startDate.toLocaleDateString("vi-VN") : "Chưa cập nhật"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeIndex === 2 && (
                  <div className="space-y-6">
                    {documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                          <div key={doc.id} className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg text-gray-800 truncate">{doc.fileName || "Tài liệu không tên"}</h3>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">{doc.documentType || "Không xác định"}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1"><strong>Người tải lên:</strong> {doc.uploadedBy || "Không xác định"}</p>
                            <p className="text-sm text-gray-600 mb-1"><strong>Định dạng:</strong> {doc.mimeType || "Không xác định"}</p>
                            <p className="text-sm text-gray-600 mb-3"><strong>Ngày tạo:</strong> {doc.createdAt ? new Date(doc.createdAt).toLocaleString("vi-VN") : "Không xác định"}</p>
                            <a href={doc.fileUrl || "#"} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Xem tài liệu</a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Không có tài liệu nào.</p>
                    )}
                  </div>
                )}

                {activeIndex === 3 && (
                  <div className="space-y-6">
                    {userAccount ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email đăng nhập</label>
                            {isEditing ? (
                              <InputText value={editUserData.email || userAccount.email || ""} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} className="w-full" placeholder="Nhập email đăng nhập" />
                            ) : (
                              <p className="text-lg font-medium text-gray-800">{userAccount.email}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Mật khẩu</label>
                            {isEditing ? (
                              <InputText type="password" value={editUserData.password || ""} onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })} className="w-full" placeholder="Nhập mật khẩu mới (để trống nếu không đổi)" />
                            ) : (
                              <p className="text-lg font-medium text-gray-800">••••••••</p>
                            )}
                          </div>
                        </div>

                        <hr className="border-gray-200" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Họ (Tài khoản)</label>
                            {isEditing ? (
                              <InputText value={editUserData.firstName || userAccount.firstName || ""} onChange={(e) => setEditUserData({ ...editUserData, firstName: e.target.value })} className="w-full" placeholder="Nhập họ" />
                            ) : (
                              <p className="text-lg font-medium text-gray-800">{userAccount.firstName || "Chưa cập nhật"}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tên (Tài khoản)</label>
                            {isEditing ? (
                              <InputText value={editUserData.lastName || userAccount.lastName || ""} onChange={(e) => setEditUserData({ ...editUserData, lastName: e.target.value })} className="w-full" placeholder="Nhập tên" />
                            ) : (
                              <p className="text-lg font-medium text-gray-800">{userAccount.lastName || "Chưa cập nhật"}</p>
                            )}
                          </div>
                        </div>

                        <hr className="border-gray-200" />

                        <div className="flex gap-32">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ngày tạo tài khoản</label>
                            <p className="text-lg font-medium text-gray-800">{userAccount.createdAt ? new Date(userAccount.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Chưa có thông tin"}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cập nhật lần cuối</label>
                            <p className="text-lg font-medium text-gray-800">{userAccount.updatedAt ? new Date(userAccount.updatedAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Chưa có thông tin"}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="text-gray-400 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có tài khoản truy cập</h3>
                        <p className="text-gray-500">Nhân viên này chưa được cấp tài khoản đăng nhập hệ thống</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Toast ref={toast} />
    </div>
  );
}
