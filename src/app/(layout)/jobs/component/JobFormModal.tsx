"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { RadioButton } from "primereact/radiobutton";
import { JobFormData } from "../types";
import { Dropdown } from "primereact/dropdown";

import { getDepartmentOptions } from "./helper";
import { OptionsType } from "./type";
import { InputText } from "primereact/inputtext";

interface JobFormModalProps {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: JobFormData) => void;
}

export default function JobFormModal({
  visible,
  onHide,
  onSubmit,
}: JobFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [departmentsOptions, setDepartmentOptions] = useState<OptionsType[]>(
    []
  );
  const { control, handleSubmit, reset } = useForm<JobFormData>({
    defaultValues: {
      job: "",
      salary: undefined,
      type: "",
      status: "active",
    },
  });

  useEffect(() => {
    const fetchDepartments = async (): Promise<void> => {
      const departments = await getDepartmentOptions();
      setDepartmentOptions(departments);
    };

    fetchDepartments();
  }, []);

  const onFormSubmit = async (data: JobFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
      onHide();
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onHide();
  };

  const footer = (
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <Button
        label="Hủy"
        icon="pi pi-times"
        className="btn-secondary"
        onClick={handleCancel}
        disabled={loading}
      />
      <Button
        label="Tạo công việc"
        icon="pi pi-plus"
        className="btn-primary"
        onClick={handleSubmit(onFormSubmit)}
        loading={loading}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header="Tạo công việc mới"
      visible={visible}
      style={{ width: "500px", maxWidth: "90vw" }}
      onHide={handleCancel}
      footer={footer}
      modal
      className="modern-dialog"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 p-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Phòng ban <span className="text-red-500">*</span>
          </label>
          <Controller
            name="departmentId"
            control={control}
            rules={{ required: "Phòng ban là bắt buộc" }}
            render={({ field, fieldState }) => (
              <div>
                <Dropdown
                  {...field}
                  options={departmentsOptions}
                  placeholder="Chọn phòng ban"
                  className={`w-full ${fieldState.error ? "p-invalid" : ""}`}
                  panelClassName="modern-dropdown-panel"
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
            Tên công việc <span className="text-red-500">*</span>
          </label>
          <Controller
            name="job"
            control={control}
            rules={{ required: "Tên công việc là bắt buộc" }}
            render={({ field, fieldState }) => (
              <div>
                <InputText
                  {...field}
                  placeholder="Nhập tên công việc"
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
            Lương cơ bản <span className="text-red-500">*</span>
          </label>
          <Controller
            name="salary"
            control={control}
            rules={{
              required: "Lương cơ bản là bắt buộc",
              min: { value: 1, message: "Lương phải lớn hơn 0" },
            }}
            render={({ field, fieldState }) => (
              <div>
                <InputNumber
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  placeholder="Nhập lương cơ bản"
                  mode="currency"
                  currency="VND"
                  locale="vi-VN"
                  className={`w-full ${fieldState.error ? "p-invalid" : ""}`}
                  inputClassName="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Hình thức làm việc <span className="text-red-500">*</span>
          </label>
          <Controller
            name="type"
            control={control}
            rules={{ required: "Hình thức làm việc là bắt buộc" }}
            render={({ field, fieldState }) => (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioButton
                    inputId="office"
                    name="type"
                    value="văn Phòng"
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === "văn Phòng"}
                  />
                  <label htmlFor="office" className="cursor-pointer flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="pi pi-building text-blue-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Văn phòng</p>
                        <p className="text-sm text-gray-500">
                          Làm việc tại văn phòng công ty
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioButton
                    inputId="remote"
                    name="type"
                    value="Làm việc từ xa"
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === "Làm việc từ xa"}
                  />
                  <label htmlFor="remote" className="cursor-pointer flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="pi pi-home text-green-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Làm việc từ xa
                        </p>
                        <p className="text-sm text-gray-500">
                          Làm việc online từ nhà
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                {fieldState.error && (
                  <small className="text-red-500 mt-1 block">
                    {fieldState.error.message}
                  </small>
                )}
              </div>
            )}
          />
        </div>
      </form>
    </Dialog>
  );
}
