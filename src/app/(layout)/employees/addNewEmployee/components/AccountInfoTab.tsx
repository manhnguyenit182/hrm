import React from "react";
import { Controller, Control } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { NewEmployeeFormData } from "../../types";

interface AccountInfoTabProps {
  control: Control<NewEmployeeFormData>;
}

export const AccountInfoTab: React.FC<AccountInfoTabProps> = ({ control }) => {
  return (
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
                  value={field.value || ""}
                  placeholder="Nhập email tài khoản..."
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
                  value={field.value || ""}
                  type="password"
                  placeholder="Nhập mật khẩu..."
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
                  value={field.value || ""}
                  placeholder="Nhập họ cho tài khoản..."
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
                  value={field.value || ""}
                  placeholder="Nhập tên cho tài khoản..."
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
  );
};
