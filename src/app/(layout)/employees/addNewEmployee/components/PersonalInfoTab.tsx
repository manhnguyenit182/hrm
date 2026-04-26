import React from "react";
import { Controller, Control } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { NewEmployeeFormData } from "../../types";

interface PersonalInfoTabProps {
  control: Control<NewEmployeeFormData>;
}

const maritalStatusOptions = [
  { label: "Độc thân", value: "single" },
  { label: "Đã kết hôn", value: "married" },
];

const genderOptions = [
  { label: "Nam", value: "male" },
  { label: "Nữ", value: "female" },
  { label: "Khác", value: "other" },
];

export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ control }) => {
  return (
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
                  value={field.value || ""}
                  placeholder="Nhập số điện thoại..."
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
            Email <span className="text-red-500">*</span>
          </label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Vui lòng nhập email",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Email không hợp lệ",
              },
            }}
            render={({ field, fieldState }) => (
              <div>
                <InputText
                  {...field}
                  value={field.value}
                  placeholder="Nhập địa chỉ email..."
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
                  value={field.value || ""}
                  placeholder="Nhập địa chỉ chi tiết..."
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
                  value={field.value || ""}
                  placeholder="Nhập tỉnh/thành phố..."
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
                  value={field.value || ""}
                  placeholder="Nhập quận/huyện..."
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
                  value={field.value || ""}
                  placeholder="Nhập quốc tịch..."
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
    </div>
  );
};
