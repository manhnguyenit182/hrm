"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { deleteEmployee, getEmployees } from "./actions";
import { DataTableEmployee, EmployeeWithRelations } from "./types";
import { employeesTableMapping } from "./helpers";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "primereact/avatar";
import { Eye } from "lucide-react";

const EmployeesTable: React.FC = () => {
  const [employees, setEmployees] = useState<DataTableEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rowsPerPage, setRowsPerPage] = useState<number>(4);
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
      calculatedRows = Math.min(calculatedRows, 5);
    } else if (screenWidth >= 1024) {
      // Tablets in landscape
      calculatedRows = Math.min(calculatedRows, 4);
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

  // Handle view action
  const handleView = (employee: EmployeeWithRelations) => {
    console.log("View employee:", employee);
    router.push(`/employees/viewEmployee/${employee.id}`);
  };

  // Handle delete action with confirmation
  const handleDelete = (employee: EmployeeWithRelations) => {
    confirmDialog({
      message: `Bạn có chắc chắn muốn xóa nhân viên "${employee.firstName} ${employee.lastName}"?`,
      header: "Xác nhận xóa",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const previousEmployees = [...employees];
          setEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
          const result = await deleteEmployee(employee.id);
          if (result.success) {
            toast.current?.show({
              severity: "success",
              summary: "Xóa thành công",
              detail: `Nhân viên ${employee.firstName} ${employee.lastName} đã được xóa.`,
              life: 3000,
            });
          } else {
            setEmployees(previousEmployees);
            toast.current?.show({
              severity: "error",
              summary: "Lỗi",
              detail: "Không thể xóa nhân viên. Vui lòng thử lại.",
              life: 5000,
            });
          }
        } catch (error) {
          try {
            const refreshedData = await getEmployees();
            setEmployees(employeesTableMapping(refreshedData));
          } catch (refreshError) {
            console.error("Error refreshing data:", refreshError);
          }

          console.error("Error deleting employee:", error);
          toast.current?.show({
            severity: "error",
            summary: "Lỗi",
            detail: "Có lỗi xảy ra khi xóa nhân viên.",
            life: 5000,
          });
        }
      },
      reject: () => {},
    });
  };
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
  // Action buttons template
  const actionBodyTemplate = (rowData: EmployeeWithRelations) => {
    return (
      <div className="flex gap-2">
        <Button
          icon={<Eye />}
          className="p-button-rounded p-button-success "
          onClick={() => handleView(rowData)}
          tooltip="Xem"
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
      <header className="flex gap-4 mb-4">
        <IconField iconPosition="left" className="flex-1">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder="Tìm kiếm nhân viên..."
            onChange={handleSearchChange}
            className="w-[35%]"
          />
        </IconField>
        <Link href="/employees/addNewEmployee">
          <Button label="Thêm nhân viên" icon="pi pi-plus" />
        </Link>
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
          <Column field="phone" header="Điện thoại" />
          <Column field="department.name" header="Phòng ban" />
          <Column field="job.job" header="Công việc" />
          <Column field="job.type" header="Loại" />
          <Column
            header="Hành động"
            body={actionBodyTemplate}
            style={{ width: "120px" }}
          />
        </DataTable>
      </main>

      <Toast ref={toast} />
      <ConfirmDialog />
    </div>
  );
};

export default EmployeesTable;
