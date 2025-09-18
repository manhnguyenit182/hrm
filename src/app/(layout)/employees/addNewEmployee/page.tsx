"use client";

import { TabMenu } from "primereact/tabmenu";
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
    { label: "nam", value: "male" },
    { label: "nữ", value: "female" },
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
        summary: "Success",
        detail: "Employee created successfully",
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create employee",
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
    <div className="p-5  border border-gray-300 rounded-lg">
      <Toast ref={toast} />
      <TabMenu
        activeIndex={activeIndex}
        model={menuItems}
        onTabChange={(e) => setActiveIndex(e.index)}
        className="tab-menu-primary"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <main>
          {activeIndex === 0 && (
            <div>
              <div className="flex gap-4 my-4">
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: "First name is required" }}
                    render={({ field, fieldState }) => (
                      <>
                        <InputText
                          {...field}
                          value={field.value}
                          placeholder="First Name"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="lastName"
                    control={control}
                    rules={{ required: "Last name is required" }}
                    render={({ field, fieldState }) => (
                      <>
                        <InputText
                          {...field}
                          value={field.value}
                          placeholder="Last Name"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: "Phone number is required",
                      pattern: {
                        value: /^\d{10,11}$/,
                        message: "Số điện thoại phải có 10 hoặc 11 chữ số",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <InputText
                          {...field}
                          value={field.value}
                          placeholder="Phone"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4 my-4">
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <InputText
                          {...field}
                          value={field.value}
                          placeholder="Email address"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="birthday"
                    control={control}
                    rules={{
                      required: "Birthday is required",
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <Calendar
                          {...field}
                          value={field.value}
                          placeholder="Birthday"
                          dateFormat="dd/mm/yy"
                          className={fieldState.error ? "p-invalid" : ""}
                          showIcon
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="maritalStatus"
                    control={control}
                    rules={{
                      required: "Marital status is required",
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <Dropdown
                          {...field}
                          options={maritalStatusOptions}
                          placeholder="Marital Status"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4 my-4">
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="gender"
                    control={control}
                    rules={{
                      required: "Gender is required",
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <Dropdown
                          {...field}
                          options={genderOptions}
                          placeholder="Gender"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="field flex flex-col flex-2/3">
                  <Controller
                    name="address"
                    control={control}
                    rules={{
                      required: "Address is required",
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <InputText
                          {...field}
                          placeholder="Address"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4 my-4">
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="state"
                    control={control}
                    rules={{
                      required: "State is required",
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <InputText
                          {...field}
                          placeholder="State"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="city"
                    control={control}
                    rules={{
                      required: "City is required",
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <InputText
                          {...field}
                          placeholder="City"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="nationality"
                    control={control}
                    rules={{
                      required: "Nationality is required",
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <InputText
                          {...field}
                          placeholder="Nationality"
                          className={fieldState.error ? "p-invalid" : ""}
                        />
                        {fieldState.error && (
                          <small className="p-error">
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
          )}
          {activeIndex === 1 && (
            <div>
              <div className="flex gap-4 my-4 flex-col">
                <div className="flex gap-2">
                  <div className="field flex flex-col flex-1/3 ">
                    <Controller
                      name="departmentId"
                      control={control}
                      rules={{
                        required: "Department is required",
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <Dropdown
                            {...field}
                            options={departmentOptions}
                            onBlur={() => {
                              console.log(field.value);
                              return setDepartmentSelected(field.value);
                            }}
                            placeholder="Department"
                            className={fieldState.error ? "p-invalid" : ""}
                          />
                          {fieldState.error && (
                            <small className="p-error">
                              {fieldState.error.message}
                            </small>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div className="field flex flex-col flex-1/3">
                    <Controller
                      name="positionId"
                      control={control}
                      rules={{
                        required: "Position is required",
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <Dropdown
                            {...field}
                            options={positionOptions}
                            placeholder="Position"
                            className={fieldState.error ? "p-invalid" : ""}
                          />
                          {fieldState.error && (
                            <small className="p-error">
                              {fieldState.error.message}
                            </small>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div className="field flex flex-col flex-1/3">
                    <Controller
                      name="jobId"
                      control={control}
                      rules={{
                        required: "Job is required",
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <Dropdown
                            {...field}
                            options={jobOptions.filter(
                              (job) => job.departmentId === departmentSelected
                            )}
                            placeholder="Job"
                            className={fieldState.error ? "p-invalid" : ""}
                          />
                          {fieldState.error && (
                            <small className="p-error">
                              {fieldState.error.message}
                            </small>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {" "}
                  <div className="field flex flex-col flex-1/3">
                    <Controller
                      name="type"
                      control={control}
                      rules={{
                        required: "type is required",
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <Dropdown
                            {...field}
                            options={typeOptions}
                            placeholder="Type"
                            className={fieldState.error ? "p-invalid" : ""}
                          />
                          {fieldState.error && (
                            <small className="p-error">
                              {fieldState.error.message}
                            </small>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div className="field flex flex-col flex-1/3">
                    <Controller
                      name="startDate"
                      control={control}
                      rules={{
                        required: "Start Date is required",
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <Calendar
                            {...field}
                            value={field.value}
                            placeholder="Start Date"
                            dateFormat="dd/mm/yy"
                            className={fieldState.error ? "p-invalid" : ""}
                            showIcon
                          />
                          {fieldState.error && (
                            <small className="p-error">
                              {fieldState.error.message}
                            </small>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div className="field flex flex-col flex-1/3"></div>
                </div>
              </div>
            </div>
          )}
          {activeIndex === 2 && (
            <div>
              Content for Tài liệu
              <p>Thông tin chi tiết về tài liệu</p>
            </div>
          )}
          {activeIndex === 3 && (
            <div className="flex flex-col gap-4 my-4">
              <div className="flex gap-2">
                <div className="field flex flex-col flex-1/2 ">
                  <Controller
                    name="user.email"
                    control={control}
                    rules={{
                      required: "Email for account is required",
                      pattern: {
                        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                        message: "Email is not valid",
                      },
                    }}
                    render={({ field }) => (
                      <InputText
                        {...field}
                        placeholder="Email for account"
                        className="w-full mb-4"
                      />
                    )}
                  />
                </div>
                <div className="field flex flex-col flex-1/2">
                  <Controller
                    name="user.password"
                    control={control}
                    rules={{
                      required: "Password is required",
                    }}
                    render={({ field }) => (
                      <InputText
                        {...field}
                        placeholder="Password"
                        className="w-full mb-4"
                      />
                    )}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="user.firstName"
                    control={control}
                    rules={{
                      required: "First Name is required",
                    }}
                    render={({ field }) => (
                      <InputText
                        {...field}
                        placeholder="First Name"
                        className="w-full mb-4"
                      />
                    )}
                  />
                </div>
                <div className="field flex flex-col flex-1/3">
                  <Controller
                    name="user.lastName"
                    control={control}
                    rules={{
                      required: "Last Name is required",
                    }}
                    render={({ field }) => (
                      <InputText
                        {...field}
                        placeholder="Last Name"
                        className="w-full mb-4"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            Quay lại
          </button>

          {activeIndex < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 btn-primary rounded"
            >
              Tiếp theo
            </button>
          ) : (
            <button type="submit" className="px-4 py-2 btn-primary rounded">
              Xác nhận
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Wrap component với HOC để bảo vệ với permission
const AddNewEmployeePage = withPermission(PERMISSIONS.EMPLOYEES.CREATE, {
  redirectToNotFound: true,
})(AddNewEmployeePageComponent);

export default AddNewEmployeePage;
