"use client";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useRef } from "react";
import { getDepartmentsById } from "../../actions";
import React from "react";
import { DepartmentWithEmployees } from "../../type";
import { Avatar } from "primereact/avatar";

export default function ViewDepartmentPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const [employees, setEmployees] = React.useState<
    DepartmentWithEmployees["Employees"]
  >([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { id } = await params;
        const data = await getDepartmentsById(id);
        console.log("Fetched department data:", data);
        if (data) {
          setEmployees(data.Employees);
        }
      } catch (error) {
        console.error("Error fetching department data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value.toLowerCase();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        const { id } = await params;
        const data = await getDepartmentsById(id, searchTerm);
        if (data) {
          setEmployees(data.Employees);
        }
      }, 400);
    },
    [params]
  );
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
          rows={5}
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
                <span>
                  {rowData.lastName} {rowData.firstName}
                </span>
              </div>
            )}
          />
          <Column field="phone" header="Điện thoại" />
          <Column field="job.job" header="Công việc" />
          <Column field="job.type" header="Loại" />
          <Column
            body={(rowData) => <span>{rowData.status}</span>}
            header="Trạng thái"
          />
        </DataTable>
      </main>
    </div>
  );
}
