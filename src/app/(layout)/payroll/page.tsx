"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useRouter } from "next/navigation";
import { Avatar } from "primereact/avatar";
import { getEmployees } from "../employees/actions";
import { employeesTableMapping } from "../employees/helpers";
import { DataTableEmployee } from "../employees/types";

const Payroll: React.FC = () => {
  const [employees, setEmployees] = useState<DataTableEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const toast = useRef<Toast>(null);
  const router = useRouter();
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
  return (
    <div className="p-5 h-full shadow-md rounded-lg">
      <header className="flex gap-4">
        <IconField iconPosition="left" className="flex-1">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder="Tìm kiếm nhân viên..."
            onChange={handleSearchChange}
            className="w-[35%]"
          />
        </IconField>
      </header>

      <main className="">
        <DataTable
          value={employees}
          loading={loading}
          paginator
          rows={rowsPerPage}
          // rowsPerPageOptions={[5, 10, 15, 20]}
          className="p-datatable-sm"
          emptyMessage="No employees found"
        >
          <Column
            header="Họ và tên"
            body={(rowData) => (
              <div className="flex items-center gap-2">
                {rowData.image && (
                  <Avatar image={rowData.image} shape="circle" />
                )}
                <span>{rowData.fullName}</span>
              </div>
            )}
          />
          <Column
            body={(rowData) => (
              <span>{(rowData.job.salary * 12).toLocaleString("vi-VN")}</span>
            )}
            header="CTC"
          />
          <Column
            body={(rowData) => (
              <span>{rowData.job.salary.toLocaleString("vi-VN")}</span>
            )}
            header="Lương cơ bản"
          />
          <Column header="Khấu trừ" body={<span>{"add Later"}</span>} />
          <Column header="Trạng thái" field="status" />
        </DataTable>
      </main>

      <Toast ref={toast} />
      <ConfirmDialog />
    </div>
  );
};
export default Payroll;
