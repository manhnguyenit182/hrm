"use client";

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { getEmployees } from "./actions";
import { EmployeeWithRelations } from "./types";
import { employeesTableMapping } from "./helpers";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar } from "primereact/avatar";

const EmployeesTable: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeWithRelations[]>([]);
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

  // Handle edit action
  const handleEdit = (employee: EmployeeWithRelations) => {
    console.log("Edit employee:", employee);
    // TODO: Implement edit functionality
    router.push(`/employees/editEmployee/${employee.id}`);
  };

  // Handle delete action
  const handleDelete = (employee: EmployeeWithRelations) => {
    console.log("Delete employee:", employee);
    // TODO: Implement delete functionality
    // You might want to show a confirmation dialog first
  };

  // Action buttons template
  const actionBodyTemplate = (rowData: EmployeeWithRelations) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => handleEdit(rowData)}
          tooltip="Chỉnh sửa"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData)}
          tooltip="Xóa"
        />
      </div>
    );
  };

  useEffect(() => {
    // Fetch employee data from API or database
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getEmployees();

        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);
  console.log(employees);
  return (
    <div className="p-5 h-full shadow-md rounded-lg">
      <header className="flex gap-4">
        <IconField iconPosition="left" className="flex-1">
          <InputIcon className="pi pi-search" />
          <InputText placeholder="Tìm kiếm phòng ban" className="w-[35%]" />
        </IconField>
        <Link href="/employees/addNewEmployee">
          <Button label="Thêm nhân viên" icon="pi pi-plus" />
        </Link>
      </header>

      <main className="">
        <DataTable
          value={employeesTableMapping(employees)}
          loading={loading}
          paginator
          rows={rowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20]}
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
          <Column field="phone" header="Điện thoại" />
          <Column field="department.name" header="Phòng ban" />
          <Column field="job.job" header="Công việc" />
          <Column field="job.type" header="Loại" />
          <Column
            body={(rowData) => <span>{rowData.status}</span>}
            header="Trạng thái"
          />
          <Column
            header="Hành động"
            body={actionBodyTemplate}
            style={{ width: "120px" }}
          />
        </DataTable>
      </main>
    </div>
  );
};

export default EmployeesTable;
