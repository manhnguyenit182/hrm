"use client";

import React, { useState, useEffect, useRef } from "react";
import { EmployeeWithRelations } from "../../types";
import { getEmployeeById, updateEmployee, getPosition } from "../../actions";
import { getDepartments } from "../../../departments/actions";
import { getJobs } from "../../../jobs/actions";
import { Departments, Jobs, Positions } from "@/db/prisma";
import { Avatar } from "primereact/avatar";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {
  BriefcaseBusiness,
  CalendarCheck,
  FileText,
  Mail,
  ScrollText,
  SquareChartGantt,
  UserRound,
  Lock,
  Edit,
  Save,
  X,
} from "lucide-react";
import { classNames } from "primereact/utils";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";

interface EditEmployeePageProps {
  params: Promise<{
    id: string;
  }>;
}

function ViewEmployeePageComponent({ params }: EditEmployeePageProps) {
  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("userInfo");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<EmployeeWithRelations>>({});
  const [saving, setSaving] = useState(false);
  const toast = useRef<Toast>(null);

  // Dropdown options state
  const [departments, setDepartments] = useState<Departments[]>([]);
  const [jobs, setJobs] = useState<Jobs[]>([]);
  const [positions, setPositions] = useState<Positions[]>([]);

  let fullName;

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

  // Create dropdown options from loaded data
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

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...employee });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSave = async () => {
    if (!employee?.id) return;

    setSaving(true);
    try {
      const result = await updateEmployee(employee.id, {
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

      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Cập nhật thông tin nhân viên thành công",
          life: 3000,
        });

        // Update employee state
        setEmployee((prev) => (prev ? { ...prev, ...editData } : null));
        setIsEditing(false);
        setEditData({});
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: result.error || "Không thể cập nhật thông tin",
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

  const menuItems = [
    {
      label: "Thông tin cá nhân",
      icon: <UserRound />,
      classNames: classNames(
        "p-menuitem",
        selectedMenuItem === "userInfo" ? "bg-gray-200" : ""
      ),
      command: () => {
        setSelectedMenuItem("userInfo");
      },
    },
    {
      label: "Chấm công",
      icon: <CalendarCheck />,
      command: () => {
        setSelectedMenuItem("attendance");
      },
    },
    {
      label: "Dự án",
      icon: <ScrollText />,
      command: () => {
        setSelectedMenuItem("project");
      },
    },
    {
      label: "Nghỉ phép",
      icon: <SquareChartGantt />,
      command: () => {
        setSelectedMenuItem("leave");
      },
    },
  ];

  // Đảm bảo userInfo được selected khi component mount
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

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        // Await params trước khi sử dụng
        const resolvedParams = await params;
        const employeeId = resolvedParams.id;

        // Sử dụng getEmployeeById action
        const foundEmployee = await getEmployeeById(employeeId);

        setEmployee(foundEmployee);
      } catch (error) {
        console.error("Error fetching employee:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [params]);

  // Load dropdown options
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [departmentsData, jobsData, positionsData] = await Promise.all([
          getDepartments(),
          getJobs(),
          getPosition(),
        ]);
        setDepartments(departmentsData);
        setJobs(jobsData);
        setPositions(positionsData);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
      }
    };
    loadDropdownData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card-modern p-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
            </div>
          </div>
        </div>
        <div className="card-modern p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

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
    console.log(employee);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <Button
                icon={<Edit className="w-4 h-4" />}
                label="Chỉnh sửa"
                onClick={handleEdit}
                className="p-button-outlined p-button-primary"
                size="small"
              />
            ) : (
              <div className="flex space-x-2">
                <Button
                  icon={<Save className="w-4 h-4" />}
                  label="Lưu"
                  onClick={handleSave}
                  loading={saving}
                  className="p-button-primary"
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

      {/* Navigation Tabs */}
      <div className="card-modern overflow-hidden">
        <div className="flex border-b border-gray-200">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.command}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                selectedMenuItem ===
                (index === 0
                  ? "userInfo"
                  : index === 1
                  ? "attendance"
                  : index === 2
                  ? "project"
                  : "leave")
                  ? "border-primary-500 text-primary-600 bg-primary-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {selectedMenuItem === "userInfo" && (
            <div className="space-y-6">
              {/* Sub Navigation */}
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

              {/* Content */}
              <div className="mt-6">
                {activeIndex === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Họ
                        </label>
                        {isEditing ? (
                          <InputText
                            value={editData.firstName || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                firstName: e.target.value,
                              })
                            }
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Tên
                        </label>
                        {isEditing ? (
                          <InputText
                            value={editData.lastName || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                lastName: e.target.value,
                              })
                            }
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.lastName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Số điện thoại
                        </label>
                        {isEditing ? (
                          <InputText
                            value={editData.phone || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Email
                        </label>
                        {isEditing ? (
                          <InputText
                            value={editData.email || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                email: e.target.value,
                              })
                            }
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Ngày sinh
                        </label>
                        {isEditing ? (
                          <Calendar
                            value={
                              editData.birthday
                                ? new Date(editData.birthday)
                                : null
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                birthday: e.value as Date,
                              })
                            }
                            dateFormat="dd/mm/yy"
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.birthday
                              ? employee.birthday.toLocaleDateString("vi-VN")
                              : "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Tình trạng hôn nhân
                        </label>
                        {isEditing ? (
                          <Dropdown
                            value={editData.maritalStatus}
                            options={maritalStatusOptions}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                maritalStatus: e.value,
                              })
                            }
                            placeholder="Chọn tình trạng"
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.maritalStatus === "single"
                              ? "Độc thân"
                              : employee.maritalStatus === "married"
                              ? "Đã kết hôn"
                              : "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Giới tính
                        </label>
                        {isEditing ? (
                          <Dropdown
                            value={editData.gender}
                            options={genderOptions}
                            onChange={(e) =>
                              setEditData({ ...editData, gender: e.value })
                            }
                            placeholder="Chọn giới tính"
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.gender === "male"
                              ? "Nam"
                              : employee.gender === "female"
                              ? "Nữ"
                              : employee.gender === "other"
                              ? "Khác"
                              : "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Địa chỉ
                        </label>
                        {isEditing ? (
                          <InputText
                            value={editData.address || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                address: e.target.value,
                              })
                            }
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.address || "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Tỉnh/Thành phố
                        </label>
                        {isEditing ? (
                          <InputText
                            value={editData.state || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                state: e.target.value,
                              })
                            }
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.state || "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Quận/Huyện
                        </label>
                        {isEditing ? (
                          <InputText
                            value={editData.city || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, city: e.target.value })
                            }
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.city || "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Quốc tịch
                        </label>
                        {isEditing ? (
                          <InputText
                            value={editData.nationality || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                nationality: e.target.value,
                              })
                            }
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.nationality || "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {activeIndex === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Phòng ban
                        </label>
                        {isEditing ? (
                          <Dropdown
                            value={editData.departmentId}
                            options={departmentOptions}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                departmentId: e.value,
                              })
                            }
                            placeholder="Chọn phòng ban"
                            className="w-full"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {employee.department?.name || "Chưa có phòng ban"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Chức vụ
                        </label>
                        {isEditing ? (
                          <Dropdown
                            value={editData.positionId}
                            options={positionOptions}
                            onChange={(e) =>
                              setEditData({ ...editData, positionId: e.value })
                            }
                            placeholder="Chọn chức vụ"
                            className="w-full"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              {employee.position?.roleName || "Chưa có chức vụ"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Công việc
                        </label>
                        {isEditing ? (
                          <Dropdown
                            value={editData.jobId}
                            options={jobOptions}
                            onChange={(e) =>
                              setEditData({ ...editData, jobId: e.value })
                            }
                            placeholder="Chọn công việc"
                            className="w-full"
                          />
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
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Loại nhân viên
                        </label>
                        {isEditing ? (
                          <Dropdown
                            value={editData.type}
                            options={employeeTypeOptions}
                            onChange={(e) =>
                              setEditData({ ...editData, type: e.value })
                            }
                            placeholder="Chọn loại nhân viên"
                            className="w-full"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                              {employee.type || "Chưa cập nhật"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Trạng thái
                        </label>
                        {isEditing ? (
                          <Dropdown
                            value={editData.status}
                            options={employeeStatusOptions}
                            onChange={(e) =>
                              setEditData({ ...editData, status: e.value })
                            }
                            placeholder="Chọn trạng thái"
                            className="w-full"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                employee.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : employee.status === "inactive"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {employee.status === "active"
                                ? "Đang làm việc"
                                : employee.status === "inactive"
                                ? "Tạm nghỉ"
                                : employee.status === "terminated"
                                ? "Đã nghỉ việc"
                                : "Chưa cập nhật"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Ngày bắt đầu
                        </label>
                        {isEditing ? (
                          <Calendar
                            value={
                              editData.startDate
                                ? new Date(editData.startDate)
                                : null
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                startDate: e.value as Date,
                              })
                            }
                            dateFormat="dd/mm/yy"
                            className="w-full"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-800">
                            {employee.startDate
                              ? employee.startDate.toLocaleDateString("vi-VN")
                              : "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {activeIndex === 2 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="pi pi-file text-gray-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Quản lý tài liệu
                    </h3>
                    <p className="text-gray-500">
                      Chức năng quản lý tài liệu sẽ được phát triển trong phiên
                      bản sau
                    </p>
                  </div>
                )}
                {activeIndex === 3 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="pi pi-lock text-gray-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Quyền truy cập tài khoản
                    </h3>
                    <p className="text-gray-500">
                      Thông tin về quyền truy cập và phân quyền tài khoản
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {selectedMenuItem === "attendance" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="pi pi-calendar text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Thông tin chấm công
              </h3>
              <p className="text-gray-500">
                Chi tiết về lịch sử chấm công và thời gian làm việc
              </p>
            </div>
          )}
          {selectedMenuItem === "project" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="pi pi-briefcase text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Dự án tham gia
              </h3>
              <p className="text-gray-500">
                Danh sách các dự án và nhiệm vụ được phân công
              </p>
            </div>
          )}
          {selectedMenuItem === "leave" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="pi pi-calendar-times text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Lịch sử nghỉ phép
              </h3>
              <p className="text-gray-500">
                Thông tin về các ngày nghỉ phép và đơn xin nghỉ
              </p>
            </div>
          )}
        </div>
      </div>

      <Toast ref={toast} />
    </div>
  );
}

const ViewEmployeePage = withPermission(PERMISSIONS.EMPLOYEES.VIEW, {
  redirectToNotFound: true,
})(ViewEmployeePageComponent);

export default ViewEmployeePage;
