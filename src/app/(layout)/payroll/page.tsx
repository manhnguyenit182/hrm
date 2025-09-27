"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Avatar } from "primereact/avatar";
import { Skeleton } from "primereact/skeleton";
import { getEmployees } from "../employees/actions";
import { employeesTableMapping } from "../employees/helpers";
import { DataTableEmployee } from "../employees/types";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import { updatePayrollStatus } from "./actions";
import PayrollStatusDialog from "./PayrollStatusDialog";

const PayrollPageComponent: React.FC = () => {
  const [employees, setEmployees] = useState<DataTableEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<DataTableEmployee | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  // Calculate rows per page based on screen size

  const calculateRowsPerPage = () => {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    // Estimate available height for table (subtract header, padding, pagination)
    const availableHeight = screenHeight - 300; // Reserve space for header, pagination, etc.
    const rowHeight = 50; // Approximate row height in px

    // Base calculation on screen height
    let calculatedRows = Math.floor(availableHeight / rowHeight - 1);

    // Adjust based on screen size breakpoints
    if (screenWidth >= 1920) {
      // 24+ inch monitors
      calculatedRows = Math.min(calculatedRows, 15);
    } else if (screenWidth >= 1440) {
      // Laptop/desktop
      calculatedRows = Math.min(calculatedRows, 10);
    } else if (screenWidth >= 1024) {
      // Tablets in landscape
      calculatedRows = Math.min(calculatedRows, 8);
    } else {
      // Mobile/small screens
      calculatedRows = Math.min(calculatedRows, 5);
    }

    // Ensure minimum rows
    return Math.max(calculatedRows, 4);
  };

  // Update rows per page on window resize
  useEffect(() => {
    const handleResize = () => {
      setRowsPerPage(calculateRowsPerPage());
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value.toLowerCase();
      if (debounceRef.current) {
        console.log("haha");
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(async () => {
        const data = await getEmployees(searchTerm);
        setEmployees(employeesTableMapping(data));
      }, 400); // 400ms debounce
    },
    []
  );

  // Xử lý khi nhấp vào hàng trong bảng
  const handleRowClick = (employee: DataTableEmployee) => {
    setSelectedEmployee(employee);
    setDialogVisible(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setDialogVisible(false);
    setSelectedEmployee(null);
  };

  // Cập nhật trạng thái lương
  const handleUpdatePayrollStatus = async (employeeId: string) => {
    setUpdating(true);
    try {
      const result = await updatePayrollStatus(employeeId, "Đã hoàn thành");

      if (result.success) {
        // Cập nhật trạng thái nhân viên trong state
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === employeeId ? { ...emp, status: "Đã hoàn thành" } : emp
          )
        );

        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Đã cập nhật trạng thái lương thành công",
          life: 3000,
        });

        handleCloseDialog();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: result.error || "Không thể cập nhật trạng thái lương",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating payroll status:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Đã xảy ra lỗi khi cập nhật trạng thái lương",
        life: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    // Fetch employee data from API or database
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getEmployees();

        setEmployees(employeesTableMapping(data));
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Create skeleton data for loading state
  const skeletonItems = Array.from({ length: rowsPerPage }, (_, i) => ({
    id: i,
  }));

  // Skeleton template for name column with avatar
  const skeletonNameTemplate = () => (
    <div className="flex items-center gap-2">
      <Skeleton shape="circle" size="2rem" />
      <Skeleton width="8rem" height="1rem" />
    </div>
  );

  // Skeleton template for regular text columns
  const skeletonTextTemplate = () => <Skeleton width="100%" height="1rem" />;

  // Skeleton template for status badge
  const skeletonStatusTemplate = () => (
    <Skeleton width="4rem" height="1.5rem" borderRadius="1rem" />
  );

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="card-modern p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <IconField iconPosition="left" className="w-full">
              <InputIcon className="pi pi-search" />
              <InputText
                placeholder="Tìm kiếm nhân viên..."
                onChange={handleSearchChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </IconField>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="card-modern overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="pi pi-table text-blue-600"></i>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Bảng lương chi tiết
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Nhấp vào nhân viên để cập nhật trạng thái lương
              </p>
            </div>
          </div>
        </div>

        <DataTable
          value={loading ? skeletonItems : employees}
          paginator={!loading}
          rows={rowsPerPage}
          className="modern-datatable"
          emptyMessage="Không tìm thấy nhân viên nào"
          loading={false}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} nhân viên"
          onRowClick={(e) =>
            !loading && handleRowClick(e.data as DataTableEmployee)
          }
          rowClassName={(rowData) => {
            if (loading) return "";
            const employee = rowData as unknown as DataTableEmployee;
            return employee.status === "Đang chờ"
              ? "cursor-pointer hover:bg-gray-50"
              : "cursor-pointer";
          }}
        >
          <Column
            header="Nhân viên"
            body={
              loading
                ? skeletonNameTemplate
                : (rowData) => (
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {rowData.image ? (
                          <Avatar
                            image={rowData.image}
                            shape="circle"
                            size="large"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <i className="pi pi-user text-gray-500"></i>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {rowData.fullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {rowData.job?.job || "Nhân viên"}
                        </p>
                      </div>
                    </div>
                  )
            }
            style={{ minWidth: "250px" }}
          />
          <Column
            header="Lương năm (CTC)"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-blue-600">
                        {((rowData.job?.salary || 0) * 12).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VNĐ
                      </p>
                      <p className="text-sm text-gray-500">Lương thô/năm</p>
                    </div>
                  )
            }
            style={{ minWidth: "180px" }}
          />
          <Column
            header="Lương cơ bản"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800">
                        {(rowData.job?.salary || 0).toLocaleString("vi-VN")} VNĐ
                      </p>
                      <p className="text-sm text-gray-500">Mỗi tháng</p>
                    </div>
                  )
            }
            style={{ minWidth: "150px" }}
          />
          <Column
            header="Khấu trừ"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <div className="space-y-1">
                      <p className="font-semibold text-orange-600">
                        -
                        {((rowData.job?.salary || 0) * 0.08).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VNĐ
                      </p>
                      <p className="text-sm text-gray-500">Thuế + BHXH (8%)</p>
                    </div>
                  )
            }
            style={{ minWidth: "150px" }}
          />
          <Column
            header="Lương thực nhận"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-green-600">
                        {((rowData.job?.salary || 0) * 0.92).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VNĐ
                      </p>
                      <p className="text-sm text-gray-500">Sau khấu trừ</p>
                    </div>
                  )
            }
            style={{ minWidth: "180px" }}
          />
          <Column
            header="Trạng thái"
            body={
              loading
                ? skeletonStatusTemplate
                : (rowData) => (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        rowData.status === "Đã hoàn thành"
                          ? "bg-green-100 text-green-800"
                          : rowData.status === "Đang chờ"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          rowData.status === "Đã hoàn thành"
                            ? "bg-green-400"
                            : rowData.status === "Đang chờ"
                            ? "bg-yellow-400"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      {rowData.status || "Chưa xử lý"}
                    </span>
                  )
            }
            style={{ minWidth: "140px" }}
          />
        </DataTable>
      </div>

      <PayrollStatusDialog
        visible={dialogVisible}
        onHide={handleCloseDialog}
        employee={selectedEmployee}
        onConfirm={handleUpdatePayrollStatus}
        loading={updating}
      />

      <Toast ref={toast} />
      <ConfirmDialog />
    </div>
  );
};

export default withPermission(PERMISSIONS.PAYROLL.VIEW)(PayrollPageComponent);
