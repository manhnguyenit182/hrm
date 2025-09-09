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
import { ChevronRight } from "lucide-react";
import { Skeleton } from "primereact/skeleton";
export default function DepartmentsPage(): React.JSX.Element {
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
    <div className="h-[50vh] border border-gray-200 rounded-lg p-4 overflow-hidden">
      {/* Header skeleton */}
      <header className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-2">
          <Skeleton width="8rem" height="1.5rem" />
          <Skeleton width="6rem" height="1rem" />
        </div>
        <Skeleton width="5rem" height="2rem" borderRadius="0.5rem" />
      </header>
      <hr className="border-gray-300 mb-4" />
      {/* Employee list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton shape="circle" size="2.5rem" />
              <div className="flex flex-col gap-1">
                <Skeleton width="7rem" height="1rem" />
                <Skeleton width="5rem" height="0.8rem" />
              </div>
            </div>
            <Skeleton shape="circle" size="1.5rem" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full border border-gray-200 shadow-md rounded-lg">
      {/* Header  */}
      <div className=" p-5 pb-0">
        <div className="flex justify-end sm:flex-row gap-3">
          <Button
            label="Thêm phòng ban"
            icon="pi pi-plus"
            className="px-4 py-2"
            onClick={handleAdd}
            disabled={loading}
          />
          <Dialog
            header="Thêm phòng ban"
            visible={visible}
            style={{ width: "50vw" }}
            onHide={() => {
              if (!visible) return;
              setVisible(false);
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="field flex flex-col mb-3">
                <label htmlFor="name">Tên phòng ban</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <InputText id="name" {...field} />}
                />
              </div>
              <div className="field flex flex-col mb-3">
                <label htmlFor="location">Địa điểm</label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => <InputText id="location" {...field} />}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" label="Thêm" />
              </div>
            </form>
          </Dialog>
        </div>
      </div>
      {/* phan scroll và data */}
      <div className="flex-1 p-5 min-h-0 ">
        {/* noi dung scroll */}
        <div className="h-full overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-1 md:grid-rows-2 gap-4 ">
            {loading
              ? // Show skeleton cards when loading
                Array.from({ length: 4 }, (_, index) => (
                  <DepartmentCardSkeleton key={index} />
                ))
              : // Show actual department data when not loading
                departments.map((department) => (
                  <div
                    key={department.id}
                    className="h-[50vh] border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    {/* thẻ tiêu đề */}
                    <header className="flex justify-between items-center ">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">
                          {department.name}
                        </h3>
                        <p>{department.Employees?.length} thành viên</p>
                        <p className="text-gray-600 text-sm mb-3"></p>
                      </div>
                      <Button
                        label="Xem tất cả"
                        text
                        severity="help"
                        onClick={() => handleViewAll(department.id)}
                      />
                    </header>
                    <hr className="border-gray-300" />
                    <div>
                      {/* ra danh sach nhan vien */}
                      <ul>
                        {department.Employees?.map((employee) => (
                          <li
                            key={employee.id}
                            className="flex items-center gap-2 my-2"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                {employee.image && (
                                  <Avatar
                                    image={employee.image}
                                    shape="circle"
                                    className="mr-2"
                                  />
                                )}
                                <div className="flex flex-col">
                                  <p>
                                    {employee.firstName} {employee.lastName}
                                  </p>
                                  <small className="text-gray-400">
                                    {employee.job?.job}
                                  </small>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <ChevronRight />
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
      <Toast ref={toast} />
    </div>
  );
}
