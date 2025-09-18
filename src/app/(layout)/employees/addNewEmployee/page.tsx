"use client";

import { BriefcaseBusiness, FileText, User, Lock } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { NewEmployeeFormData } from "../types";
import { createEmployee, getPosition } from "../actions";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { MenuItem } from "primereact/menuitem";
import { Dropdown } from "primereact/dropdown";
import {
  getDepartmentOptions,
  getPositionOptions,
  getJobOptions,
} from "./helper";
import { Option } from "./types";
import { Toast } from "primereact/toast";
import bcrypt from "bcryptjs";
import { PERMISSIONS } from "@/constants/permissions";
import { withPermission } from "@/components/PermissionGuard";

function AddNewEmployeePageComponent(): React.JSX.Element {
  // Move all hooks to the top before any conditional returns
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [departmentOptions, setDepartmentOptions] = useState<Option[]>([]);
  const [positionOptions, setPositionOptions] = useState<Option[]>([]);
  const [departmentSelected, setDepartmentSelected] = useState<string | null>(
    null
  );
  const [jobOptions, setJobOptions] = useState<
    Array<Option & { departmentId: string }>
  >([]);
  const toast = useRef<Toast>(null);
  const { control, handleSubmit, trigger } = useForm<NewEmployeeFormData>({
    defaultValues: {
      // field cho thong tin ca nhan
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
      // field cho thong tin nghe nghiep
      departmentId: null,
      positionId: null,
      jobId: null,
      startDate: null,
      type: null,
      // field cho tai lieu
      // field cho quyen truy cap tai khoan
      user: {
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        role: "",
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const departments = await getDepartmentOptions();
      const positions = await getPositionOptions();
      const jobs = await getJobOptions();
      console.log(jobs);
      console.log(departments);

      setDepartmentOptions(departments);
      setPositionOptions(positions);
      setJobOptions(jobs);
    };
    fetchData();
  }, []);

  const maritalStatusOptions = [
    { label: "Độc thân", value: "single" },
    { label: "Đã kết hôn", value: "married" },
  ];

  const typeOptions = [
    {
      label: "Toàn thời gian",
      value: "full-time",
    },
    {
      label: "Bán thời gian",
      value: "part-time",
    },
  ];
  const genderOptions = [
    { label: "Nam", value: "male" },
    { label: "Nữ", value: "female" },
    { label: "Khác", value: "other" },
  ];
  function getRandomAvatar(): string {
    const randomNum = Math.floor(Math.random() * 70) + 1;
    return `https://i.pravatar.cc/150?img=${randomNum}`;
  }
  const onSubmit = async (data: NewEmployeeFormData) => {
    console.log("🚨 Form submitted!", { activeIndex, data }); // Debug log
    data.status = "Đang chờ";
    data.image = getRandomAvatar();
    const positions = await getPosition(data.positionId || undefined);
    console.log(positions);
    if (data.user) {
      const title = positions[0]?.title || "";

      switch (title) {
        case "Trưởng Phòng":
          data.user.role = "manager";
          break;
        case "CEO CFO CTO COO CPO":
          data.user.role = "admin";
          break;
        default:
          data.user.role = "employee";
      }
    }
    const hashedPassword = await bcrypt.hash(data.user?.password || "", 12);
    // Ensure user object is properly structured
    const employeeData = {
      ...data,
      user: {
        employeeId: "", // Will be set by the server/database
        email: data.user?.email || "",
        firstName: data.user?.firstName || "",
        lastName: data.user?.lastName || "",
        password: hashedPassword,
        role: data.user?.role || "employee",
      },
    };

    const result = await createEmployee(employeeData);
    console.log("🚨 Employee created!", result);
    if (result.success) {
      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "Nhân viên đã được tạo thành công",
        life: 3000,
      });
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
    e?.preventDefault(); // Ngăn form submit không mong muốn

    // Validate fields của tab hiện tại trước khi chuyển
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
      // Thêm fields của tab 2 nếu có
      fieldsToValidate = [
        "departmentId",
        "positionId",
        "jobId",
        "startDate",
        "type",
      ];
    } else if (activeIndex === 2) {
      // Tab tài liệu - không cần validate, chỉ chuyển khi user click
      setActiveIndex(Math.min(3, activeIndex + 1));
      return;
    } else if (activeIndex === 3) {
      fieldsToValidate = [];
      return;
    }

    // Chỉ validate khi có fields
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveIndex(Math.min(3, activeIndex + 1));
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: (
        <User className="mr-2" style={{ color: "var(--color-primary-500)" }} />
      ),
      label: "Thông tin cá nhân",
    },
    {
      icon: (
        <BriefcaseBusiness
          className="mr-2"
          style={{ color: "var(--color-primary-500)" }}
        />
      ),
      label: "Thông tin nghề nghiệp",
    },
    {
      icon: (
        <FileText
          className="mr-2"
          style={{ color: "var(--color-primary-500)" }}
        />
      ),
      label: "Tài liệu",
    },
    {
      icon: (
        <Lock className="mr-2" style={{ color: "var(--color-primary-500)" }} />
      ),
      label: "Quyền truy cập tài khoản",
    },
  ];
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-surface rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Thêm nhân viên mới
            </h1>
            <p className="text-gray-600">
              Điền thông tin chi tiết để tạo hồ sơ nhân viên mới
            </p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Bước {activeIndex + 1} / 4
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="card-modern overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            {menuItems[activeIndex].icon}
            <span className="ml-3">{menuItems[activeIndex].label}</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {activeIndex === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Họ <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: "Vui lòng nhập họ" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          value={field.value}
                          placeholder="Nhập họ..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="lastName"
                    control={control}
                    rules={{ required: "Vui lòng nhập tên" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          value={field.value}
                          placeholder="Nhập tên..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: "Vui lòng nhập số điện thoại",
                      pattern: {
                        value: /^\d{10,11}$/,
                        message: "Số điện thoại phải có 10 hoặc 11 chữ số",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          value={field.value}
                          placeholder="Nhập số điện thoại..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Vui lòng nhập email",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Email không hợp lệ",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          value={field.value}
                          placeholder="Nhập địa chỉ email..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="birthday"
                    control={control}
                    rules={{ required: "Vui lòng chọn ngày sinh" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <Calendar
                          {...field}
                          value={field.value}
                          placeholder="Chọn ngày sinh..."
                          dateFormat="dd/mm/yy"
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                          showIcon
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tình trạng hôn nhân <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="maritalStatus"
                    control={control}
                    rules={{ required: "Vui lòng chọn tình trạng hôn nhân" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <Dropdown
                          {...field}
                          options={maritalStatusOptions}
                          placeholder="Chọn tình trạng..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: "Vui lòng chọn giới tính" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <Dropdown
                          {...field}
                          options={genderOptions}
                          placeholder="Chọn giới tính..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: "Vui lòng nhập địa chỉ" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          placeholder="Nhập địa chỉ chi tiết..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: "Vui lòng nhập tỉnh/thành phố" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          placeholder="Nhập tỉnh/thành phố..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="city"
                    control={control}
                    rules={{ required: "Vui lòng nhập quận/huyện" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          placeholder="Nhập quận/huyện..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Quốc tịch <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="nationality"
                    control={control}
                    rules={{ required: "Vui lòng nhập quốc tịch" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          placeholder="Nhập quốc tịch..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          )}
          {activeIndex === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phòng ban <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="departmentId"
                    control={control}
                    rules={{ required: "Vui lòng chọn phòng ban" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <Dropdown
                          {...field}
                          options={departmentOptions}
                          onBlur={() => {
                            console.log(field.value);
                            return setDepartmentSelected(field.value);
                          }}
                          placeholder="Chọn phòng ban..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Chức vụ <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="positionId"
                    control={control}
                    rules={{ required: "Vui lòng chọn chức vụ" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <Dropdown
                          {...field}
                          options={positionOptions}
                          placeholder="Chọn chức vụ..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Công việc <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="jobId"
                    control={control}
                    rules={{ required: "Vui lòng chọn công việc" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <Dropdown
                          {...field}
                          options={jobOptions.filter(
                            (job) => job.departmentId === departmentSelected
                          )}
                          placeholder="Chọn công việc..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Loại hợp đồng <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Vui lòng chọn loại hợp đồng" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <Dropdown
                          {...field}
                          options={typeOptions}
                          placeholder="Chọn loại hợp đồng..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: "Vui lòng chọn ngày bắt đầu" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <Calendar
                          {...field}
                          value={field.value}
                          placeholder="Chọn ngày bắt đầu..."
                          dateFormat="dd/mm/yy"
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                          showIcon
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div></div>
              </div>
            </div>
          )}
          {activeIndex === 2 && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="pi pi-file text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Tài liệu nhân viên
                </h3>
                <p className="text-gray-500">
                  Chức năng quản lý tài liệu sẽ được phát triển trong phiên bản
                  sau
                </p>
              </div>
            </div>
          )}
          {activeIndex === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email tài khoản <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="user.email"
                    control={control}
                    rules={{
                      required: "Vui lòng nhập email tài khoản",
                      pattern: {
                        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                        message: "Email không hợp lệ",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          placeholder="Nhập email tài khoản..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="user.password"
                    control={control}
                    rules={{ required: "Vui lòng nhập mật khẩu" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          type="password"
                          placeholder="Nhập mật khẩu..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Họ (tài khoản) <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="user.firstName"
                    control={control}
                    rules={{ required: "Vui lòng nhập họ" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          placeholder="Nhập họ cho tài khoản..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tên (tài khoản) <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="user.lastName"
                    control={control}
                    rules={{ required: "Vui lòng nhập tên" }}
                    render={({ field, fieldState }) => (
                      <div>
                        <InputText
                          {...field}
                          placeholder="Nhập tên cho tài khoản..."
                          className={`w-full ${
                            fieldState.error ? "p-invalid" : ""
                          }`}
                        />
                        {fieldState.error && (
                          <small className="text-red-500 mt-1 block">
                            {fieldState.error.message}
                          </small>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <i className="pi pi-info-circle text-blue-500 mt-0.5"></i>
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold mb-1">
                      Thông tin quyền truy cập:
                    </p>
                    <p>
                      Quyền của tài khoản sẽ được tự động phân bổ dựa trên chức
                      vụ được chọn ở bước trước.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary !px-6 !py-3"
              >
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
}

// Wrap component với HOC để bảo vệ với permission
const AddNewEmployeePage = withPermission(PERMISSIONS.EMPLOYEES.CREATE, {
  redirectToNotFound: true,
})(AddNewEmployeePageComponent);

export default AddNewEmployeePage;
