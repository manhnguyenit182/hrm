"use client";
import React, { useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "primereact/button";
import { createDepartment, getDepartments } from "./actions";
import { DepartmentWithEmployees } from "./type";
import { Avatar } from "primereact/avatar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "primereact/skeleton";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";

function DepartmentsPageComponent(): React.JSX.Element {
  const router = useRouter();
  const [departments, setDepartments] = React.useState<
    DepartmentWithEmployees[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast>(null);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { name: "", location: "" },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleAdd = () => {
    setVisible(true);
  };
  const handleViewAll = (departmentId: string) => {
    router.push(`departments/viewDepartment/${departmentId}`);
  };
  const onSubmit = async (data: { name: string; location: string }) => {
    try {
      const result = await createDepartment(data);
      console.log("Created department:", result);
      // Show success toast
      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "Phòng ban đã được tạo thành công",
        life: 3000,
      });

      // Close dialog
      setVisible(false);

      // Reset form
      reset();

      // Refresh departments list
      setLoading(true);
      const updatedDepartments = await getDepartments();
      setDepartments(updatedDepartments);
      setLoading(false);
    } catch (error) {
      console.error("Error creating department:", error);

      // Show error toast
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Không thể tạo phòng ban. Vui lòng thử lại.",
        life: 5000,
      });
    }
  };

  // Skeleton component for department cards
  const DepartmentCardSkeleton = () => (
    <div className="card-modern overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Skeleton shape="circle" size="3rem" />
              <div className="space-y-2">
                <Skeleton width="8rem" height="1.5rem" />
                <Skeleton width="6rem" height="1rem" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Skeleton shape="circle" size="2rem" />
                  <div className="space-y-1">
                    <Skeleton width="2rem" height="1rem" />
                    <Skeleton width="3rem" height="0.7rem" />
                  </div>
                </div>
              </div>
              <Skeleton shape="circle" size="2.5rem" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton width="7rem" height="1.2rem" />
          <Skeleton width="3rem" height="1rem" borderRadius="1rem" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 rounded-lg"
            >
              <div className="relative">
                <Skeleton shape="circle" size="2.5rem" />
                <Skeleton
                  shape="circle"
                  size="0.75rem"
                  className="absolute -bottom-0.5 -right-0.5"
                />
              </div>

              <div className="flex-1 space-y-1">
                <Skeleton width="8rem" height="1rem" />
                <Skeleton width="6rem" height="0.8rem" />
              </div>

              <Skeleton width="0.5rem" height="0.5rem" />
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Skeleton width="100%" height="1.5rem" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-surface rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Quản lý phòng ban
            </h1>
            <p className="text-gray-600">
              Tổng quan về các phòng ban và nhân viên trong công ty
            </p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {departments.length} phòng ban
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {departments.reduce(
                    (total, dept) => total + (dept.Employees?.length || 0),
                    0
                  )}{" "}
                  nhân viên
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              label="Thêm phòng ban"
              icon="pi pi-plus"
              className="btn-primary !px-6 !py-3"
              onClick={handleAdd}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading
          ? // Show skeleton cards when loading
            Array.from({ length: 6 }, (_, index) => (
              <DepartmentCardSkeleton key={index} />
            ))
          : // Show actual department data when not loading
            departments.map((department) => (
              <div
                key={department.id}
                className="card-modern overflow-hidden group"
              >
                {/* Department Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                          <i className="pi pi-building text-white text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-800 group-hover:text-primary-600 transition-colors">
                            {department.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            <i className="pi pi-map-marker text-gray-400 mr-1"></i>
                            {department.location || "Chưa có địa điểm"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <i className="pi pi-users text-blue-600 text-sm"></i>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-800">
                                {department.Employees?.length || 0}{" "}
                                <span className="text-xs text-gray-500">
                                  Thành viên
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          icon="pi pi-arrow-right"
                          className="!p-2 !bg-white !text-[color:var(--color-primary-500)] hover:!bg-gray-50 !border-gray-200 !rounded-xl transition-all duration-200 "
                          onClick={() => handleViewAll(department.id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employees List */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-700">
                      Danh sách nhân viên
                    </h4>
                    {(department.Employees?.length || 0) > 4 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        +{(department.Employees?.length || 0) - 4} khác
                      </span>
                    )}
                  </div>

                  {department.Employees && department.Employees.length > 0 ? (
                    <div className="space-y-3">
                      {department.Employees.slice(0, 4).map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group/employee"
                        >
                          <div className="relative">
                            <Avatar
                              image={employee.image || undefined}
                              icon={!employee.image ? "pi pi-user" : undefined}
                              shape="circle"
                              size="large"
                              className="!w-10 !h-10 border-2 border-white shadow-sm"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {employee.job?.job || "Chưa có chức vụ"}
                            </p>
                          </div>

                          <div className="opacity-0 group-hover/employee:opacity-100 transition-opacity">
                            <i className="pi pi-chevron-right text-gray-400 text-sm"></i>
                          </div>
                        </div>
                      ))}

                      {(department.Employees?.length || 0) === 0 && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i className="pi pi-users text-gray-400 text-2xl"></i>
                          </div>
                          <p className="text-gray-500 text-sm">
                            Chưa có nhân viên
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="pi pi-users text-gray-400 text-2xl"></i>
                      </div>
                      <p className="text-gray-500 text-sm">Chưa có nhân viên</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* Empty State */}
      {!loading && departments.length === 0 && (
        <div className="card-modern p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="pi pi-building text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có phòng ban nào
          </h3>
          <p className="text-gray-500 mb-6">
            Bắt đầu bằng cách tạo phòng ban đầu tiên cho công ty của bạn
          </p>
          <Button
            label="Tạo phòng ban đầu tiên"
            icon="pi pi-plus"
            className="btn-primary !px-6 !py-3"
            onClick={handleAdd}
          />
        </div>
      )}

      <Toast ref={toast} />

      {/* Add Department Dialog */}
      <Dialog
        header="Thêm phòng ban mới"
        visible={visible}
        style={{ width: "50vw", minWidth: "320px" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
          reset();
        }}
        modal
        blockScroll
        className="modern-dialog"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-2">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700"
            >
              Tên phòng ban <span className="text-red-500">*</span>
            </label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Vui lòng nhập tên phòng ban" }}
              render={({ field, fieldState }) => (
                <div>
                  <InputText
                    id="name"
                    {...field}
                    placeholder="Nhập tên phòng ban..."
                    className="w-full"
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
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-gray-700"
            >
              Địa điểm
            </label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <InputText
                  id="location"
                  {...field}
                  placeholder="Nhập địa điểm văn phòng..."
                  className="w-full"
                />
              )}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              label="Hủy"
              severity="secondary"
              className="btn-secondary !px-6 !py-3"
              onClick={() => {
                setVisible(false);
                reset();
              }}
            />
            <Button
              type="submit"
              label="Tạo phòng ban"
              className="btn-primary !px-6 !py-3"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}

const DepartmentsPage = withPermission(PERMISSIONS.DEPARTMENTS.VIEW, {
  redirectToNotFound: true,
})(DepartmentsPageComponent);

export default DepartmentsPage;
