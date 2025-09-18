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
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";

function ViewDepartmentPageComponent({
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
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="card-modern p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <IconField iconPosition="left" className="max-w-2/5">
              <InputIcon className="pi pi-search text-gray-400" />
              <InputText
                placeholder="Tìm kiếm nhân viên theo tên, chức vụ..."
                onChange={handleSearchChange}
                className="w-full !pl-10 !py-3 !text-base"
                disabled={loading}
              />
            </IconField>
          </div>
        </div>
      </div>

      {/* Employees DataTable */}
      <div className="card-modern overflow-hidden">
        <DataTable
          value={employees}
          loading={loading}
          paginator
          rows={7}
          className="modern-datatable"
          emptyMessage="Không tìm thấy nhân viên nào"
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} nhân viên"
        >
          <Column
            header="Thông tin nhân viên"
            body={(rowData) => (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar
                    image={rowData.image || undefined}
                    icon={!rowData.image ? "pi pi-user" : undefined}
                    shape="circle"
                    size="large"
                    className="!w-12 !h-12 border-2 border-white shadow-sm"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-base">
                    {rowData.firstName} {rowData.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {rowData.job?.job || "Chưa có chức vụ"}
                  </p>
                </div>
              </div>
            )}
            style={{ minWidth: "250px" }}
          />
          <Column
            field="phone"
            header="Liên hệ"
            body={(rowData) => (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <i className="pi pi-phone text-gray-400 text-sm"></i>
                  <span className="text-gray-700">
                    {rowData.phone || "Chưa có"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="pi pi-envelope text-gray-400 text-sm"></i>
                  <span className="text-gray-500 text-sm">
                    {rowData.email || "Chưa có email"}
                  </span>
                </div>
              </div>
            )}
            style={{ minWidth: "200px" }}
          />
          <Column
            header="Chức vụ & Loại công việc"
            body={(rowData) => (
              <div className="space-y-2">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {rowData.job?.job || "Chưa có chức vụ"}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      rowData.job?.type === "Office"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {rowData.job?.type || "Office"}
                  </span>
                </div>
              </div>
            )}
            style={{ minWidth: "180px" }}
          />
          <Column
            header="Thời gian làm việc"
            body={(rowData) => (
              <div className="flex flex-col items-start space-y-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    rowData.type === "Full-time"
                      ? "bg-green-100 text-green-800"
                      : rowData.type === "part-time"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      rowData.type === "Full-time"
                        ? "bg-green-400"
                        : rowData.type === "part-time"
                        ? "bg-red-400"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  {rowData.type === "Full-time"
                    ? "Toàn thời gian"
                    : rowData.type === "part-time"
                    ? "Bán thời gian"
                    : "Chưa xác định"}
                </span>
              </div>
            )}
            style={{ minWidth: "150px" }}
          />
        </DataTable>
      </div>
    </div>
  );
}

const ViewDepartmentPage = withPermission(
  PERMISSIONS.DEPARTMENTS.VIEW_MEMBERS,
  {
    redirectToNotFound: true,
  }
)(ViewDepartmentPageComponent);

export default ViewDepartmentPage;
