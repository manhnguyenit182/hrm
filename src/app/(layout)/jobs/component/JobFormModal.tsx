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
    <div className="flex justify-center gap-4">
      <Button
        label="Hủy"
        onClick={handleCancel}
        className="flex-1 max-w-[45%] px-4 py-2"
        disabled={loading}
      />
      <Button
        label="Thêm"
        onClick={handleSubmit(onFormSubmit)}
        loading={loading}
        className="flex-1 max-w-[45%]"
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header="Tạo công việc mới"
      visible={visible}
      headerStyle={{ paddingBottom: 0 }}
      onHide={handleCancel}
      footer={footer}
      modal
      draggable={false}
      resizable={false}
      className="p-fluid w-1/3"
      maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      contentStyle={{ padding: "2rem" }}
    >
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="flex flex-col  gap-4"
      >
        <div className="field">
          <label className="block text-sm font-medium mb-2">
            Chọn Phòng ban <span className="text-red-500">*</span>
          </label>
          <Controller
            name="departmentId"
            control={control}
            rules={{ required: "Phòng ban là bắt buộc" }}
            render={({ field, fieldState }) => (
              <>
                <Dropdown
                  id="department"
                  {...field}
                  options={departmentsOptions}
                  placeholder="Chọn Phòng ban"
                  className={fieldState.error ? "p-invalid" : ""}
                />
                {fieldState.error && (
                  <small className="p-error">{fieldState.error.message}</small>
                )}
              </>
            )}
          />
        </div>

        <div className="field">
          <label htmlFor="job" className="block text-sm font-medium mb-2">
            Công việc <span className="text-red-500">*</span>
          </label>
          <Controller
            name="job"
            control={control}
            rules={{ required: "Công việc là bắt buộc" }}
            render={({ field, fieldState }) => (
              <>
                <InputText
                  id="job"
                  {...field}
                  placeholder="Nhập Công việc"
                  className={fieldState.error ? "p-invalid" : ""}
                />

                {fieldState.error && (
                  <small className="p-error">{fieldState.error.message}</small>
                )}
              </>
            )}
          />
        </div>

        <div className="field">
          <label htmlFor="salary" className="block text-sm font-medium mb-2">
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
              <>
                <InputNumber
                  id="salary"
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  placeholder="Nhập lương cơ bản"
                  mode="currency"
                  currency="VND"
                  locale="vi-VN"
                  className={fieldState.error ? "p-invalid" : ""}
                />
                {fieldState.error && (
                  <small className="p-error">{fieldState.error.message}</small>
                )}
              </>
            )}
          />
        </div>

        <div className="field">
          <label className="block text-sm font-medium mb-2">
            Kiểu công việc <span className="text-red-500">*</span>
          </label>

          <Controller
            name="type"
            control={control}
            rules={{ required: "Kiểu công việc là bắt buộc" }}
            render={({ field, fieldState }) => (
              <>
                <div className="inline-block">
                  <RadioButton
                    inputId="office"
                    name="type"
                    value="văn Phòng"
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === "văn Phòng"}
                  />
                  <label htmlFor="văn Phòng" className="ml-2">
                    Văn phòng
                  </label>
                </div>
                <div className="inline-block ml-4">
                  <RadioButton
                    inputId="remote"
                    name="type"
                    value="Làm việc từ xa"
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === "Làm việc từ xa"}
                  />
                  <label htmlFor="remote" className="ml-2">
                    Làm việc từ xa
                  </label>
                  {fieldState.error && (
                    <small className="p-error">
                      {fieldState.error.message}
                    </small>
                  )}
                </div>
              </>
            )}
          />
        </div>
      </form>
    </Dialog>
  );
}
