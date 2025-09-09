"use client";

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Avatar } from "primereact/avatar";
import { Skeleton } from "primereact/skeleton";
import { AttendanceWithEmployee } from "./types";
import { getAttendance } from "./actions";

const Payroll: React.FC = () => {
  const [employees, setEmployees] = useState<AttendanceWithEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
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
    return Math.max(calculatedRows, 5);
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

  // const debounceRef = useRef<NodeJS.Timeout | null>(null);
  // const handleSearchChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const searchTerm = e.target.value.toLowerCase();
  //     if (debounceRef.current) {
  //       console.log("haha");
  //       clearTimeout(debounceRef.current);
  //     }
  //     debounceRef.current = setTimeout(async () => {
  //       const data = await getAttendance(searchTerm);
  //       setEmployees(data);
  //     }, 400); // 400ms debounce
  //   },
  //   []
  // );

  useEffect(() => {
    // Fetch employee data from API or database
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getAttendance();
        console.log("Attendance data:", data);
        setEmployees(data);
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
    <div className="p-5 h-full shadow-md rounded-lg border border-gray-200">
      <header className="flex gap-4 mb-4">
        <IconField iconPosition="left" className="flex-1">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder="Tìm kiếm nhân viên..."
            // onChange={handleSearchChange}
            className="w-[35%]"
            disabled={loading}
          />
        </IconField>
      </header>

      <main className="">
        <DataTable
          value={loading ? skeletonItems : employees}
          paginator={!loading}
          rows={rowsPerPage}
          className="p-datatable-sm"
          emptyMessage="Không tìm thấy nhân viên nào"
          loading={false} // We handle loading state manually with skeleton
        >
          <Column
            header="Họ và tên"
            body={
              loading
                ? skeletonNameTemplate
                : (rowData) => (
                    <div className="flex items-center gap-2">
                      {rowData.employee?.image && (
                        <Avatar image={rowData.employee.image} shape="circle" />
                      )}
                      <span>
                        {rowData.employee?.lastName}{" "}
                        {rowData.employee?.firstName}
                      </span>
                    </div>
                  )
            }
          />
          <Column
            header="Chức vụ"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <span>{rowData.employee?.position?.title || "N/A"}</span>
                  )
            }
          />
          <Column
            header="Loại"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <span>{rowData.employee?.job?.type || "Office"}</span>
                  )
            }
          />
          <Column
            header="Giờ vào"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <span>
                      {rowData.clockIn
                        ? new Date(rowData.clockIn).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : "N/A"}
                    </span>
                  )
            }
          />
          <Column
            header="Trạng thái"
            body={
              loading
                ? skeletonStatusTemplate
                : (rowData) => (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rowData.status === "Present"
                          ? "bg-green-100 text-green-800"
                          : rowData.status === "Late"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {rowData.status === "Present"
                        ? "Đúng giờ"
                        : rowData.status === "Late"
                        ? "Muộn"
                        : "Không xác định"}
                    </span>
                  )
            }
          />
        </DataTable>
      </main>

      <Toast ref={toast} />
      <ConfirmDialog />
    </div>
  );
};
export default Payroll;
