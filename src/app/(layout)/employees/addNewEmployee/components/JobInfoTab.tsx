import React from "react";
import { Controller, Control } from "react-hook-form";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { NewEmployeeFormData } from "../../types";
import { Option } from "../types";

interface JobInfoTabProps {
  control: Control<NewEmployeeFormData>;
  departmentOptions: Option[];
  positionOptions: Option[];
  jobOptions: Array<Option & { departmentId: string }>;
  departmentSelected: string | null;
  setDepartmentSelected: (val: string | null) => void;
}

const typeOptions = [
  { label: "Toàn thời gian", value: "full-time" },
  { label: "Bán thời gian", value: "part-time" },
];

export const JobInfoTab: React.FC<JobInfoTabProps> = ({
  control,
  departmentOptions,
  positionOptions,
  jobOptions,
  departmentSelected,
  setDepartmentSelected,
}) => {
  return (
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
                    setDepartmentSelected(field.value);
                  }}
                  onChange={(e) => {
                    field.onChange(e.value);
                    setDepartmentSelected(e.value);
                  }}
                  placeholder="Chọn phòng ban..."
                  className={`w-full ${fieldState.error ? "p-invalid" : ""}`}
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
                  className={`w-full ${fieldState.error ? "p-invalid" : ""}`}
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
                  className={`w-full ${fieldState.error ? "p-invalid" : ""}`}
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
                  className={`w-full ${fieldState.error ? "p-invalid" : ""}`}
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
                  className={`w-full ${fieldState.error ? "p-invalid" : ""}`}
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
  );
};
