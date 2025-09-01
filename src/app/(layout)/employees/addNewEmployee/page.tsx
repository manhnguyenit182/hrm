"use client";

import { TabMenu } from "primereact/tabmenu";
import { BriefcaseBusiness, FileText, User, Lock } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { EmployeeWithRelations } from "../types";
import { createEmployee } from "../actions";
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
export default function AddNewEmployeePage(): React.JSX.Element {
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
  const { control, handleSubmit, trigger } = useForm<EmployeeWithRelations>({
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

  const onSubmit = async (data: EmployeeWithRelations) => {
    data.status = "Active";
    const result = await createEmployee(data);
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

  const handleNext = async () => {
    // Validate fields của tab hiện tại trước khi chuyển
    let fieldsToValidate: (keyof EmployeeWithRelations)[] = [];

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
      // Không có fields để validate cho tab 3
      fieldsToValidate = [];
    } else if (activeIndex === 3) {
      fieldsToValidate = [];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveIndex(Math.min(3, activeIndex + 1));
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: <User className="mr-2" />,
      label: "Thông tin cá nhân",
    },
    {
      icon: <BriefcaseBusiness className="mr-2" />,
      label: "Thông tin nghề nghiệp",
    },
    {
      icon: <FileText className="mr-2" />,
      label: "Tài liệu",
    },
    {
      icon: <Lock className="mr-2" />,
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
          {activeIndex === 3 && <div>Content for Quyền truy cập tài khoản</div>}
        </main>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {activeIndex < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
