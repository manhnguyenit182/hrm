'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useResponsiveRows } from '@/hooks/useResponsiveRows';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { deleteEmployee, getEmployees } from '../actions';
import { DataTableEmployee, EmployeeWithRelations } from '../types';
import { employeesTableMapping } from '../helpers';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from 'primereact/avatar';
import { Skeleton } from 'primereact/skeleton';

const SKELETON_NAME = (
  <div className="flex items-center gap-2">
    <Skeleton shape="circle" size="2rem" />
    <Skeleton width="8rem" height="1rem" />
  </div>
);

const SKELETON_TEXT = <Skeleton width="100%" height="1rem" />;

const SKELETON_ACTION = (
  <div className="flex gap-2">
    <Skeleton width="2rem" height="2rem" borderRadius="50%" />
    <Skeleton width="2rem" height="2rem" borderRadius="50%" />
  </div>
);

const skeletonNameTemplate = () => SKELETON_NAME;
const skeletonTextTemplate = () => SKELETON_TEXT;
const skeletonActionTemplate = () => SKELETON_ACTION;

interface EmployeesClientProps {
  initialEmployees: DataTableEmployee[];
}

export function EmployeesClient({ initialEmployees }: EmployeesClientProps): React.ReactElement {
  const [employees, setEmployees] = useState<DataTableEmployee[]>(initialEmployees);
  const [loading, setLoading] = useState<boolean>(false);
  const rowsPerPage = useResponsiveRows();
  const toast = useRef<Toast>(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Handle view action
  const handleView = (employee: EmployeeWithRelations) => {
    router.push(`/employees/viewEmployee/${employee.id}`);
  };

  // Handle delete action with confirmation
  const handleDelete = (employee: EmployeeWithRelations) => {
    confirmDialog({
      message: `Bạn có chắc chắn muốn xóa nhân viên "${employee.firstName} ${employee.lastName}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          const previousEmployees = [...employees];
          setEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
          const result = await deleteEmployee(employee.id);
          if (result.success) {
            toast.current?.show({
              severity: 'success',
              summary: 'Xóa thành công',
              detail: `Nhân viên ${employee.firstName} ${employee.lastName} đã được xóa.`,
              life: 3000,
            });
          } else {
            setEmployees(previousEmployees);
            toast.current?.show({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể xóa nhân viên. Vui lòng thử lại.',
              life: 5000,
            });
          }
        } catch (error) {
          try {
            const refreshedData = await getEmployees();
            setEmployees(employeesTableMapping(refreshedData));
          } catch (refreshError) {
            console.error('Error refreshing data:', refreshError);
          }

          console.error('Error deleting employee:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Có lỗi xảy ra khi xóa nhân viên.',
            life: 5000,
          });
        }
      },
      reject: () => {},
    });
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const fetchSearchedEmployees = async () => {
      setLoading(true);
      const data = await getEmployees(debouncedSearchTerm);
      setEmployees(employeesTableMapping(data));
      setLoading(false);
    };
    fetchSearchedEmployees();
  }, [debouncedSearchTerm, isFirstRender]);

  const skeletonItems = useMemo(() => Array.from({ length: rowsPerPage }, (_, i) => ({ id: i })), [rowsPerPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-surface rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Quản lý nhân viên</h1>
            <p className="text-gray-600">Tổng quan và quản lý thông tin nhân viên trong công ty</p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{employees.length} nhân viên</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Đang hoạt động</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/employees/addNewEmployee">
              <Button label="Thêm nhân viên" icon="pi pi-plus" className="btn-primary !px-6 !py-3" disabled={loading} />
            </Link>
          </div>
        </div>
      </div>

      {/* Employees DataTable */}
      <div style={{ background: 'var(--color-surface)' }} className="overflow-hidden">
        <div style={{ background: 'var(--color-surface)' }} className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <IconField iconPosition="left" className="max-w-4/10">
                <InputIcon className="pi pi-search text-gray-400" />
                <InputText
                  placeholder="Tìm kiếm nhân viên theo tên nhân viên..."
                  onChange={handleSearchChange}
                  className="w-full !pl-10 !py-3 !text-base"
                  disabled={loading}
                />
              </IconField>
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
        >
          <Column
            field="fullName"
            header="Thông tin nhân viên"
            sortable
            body={
              loading
                ? skeletonNameTemplate
                : (rowData) => (
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar
                          image={rowData.image || undefined}
                          icon={!rowData.image ? 'pi pi-user' : undefined}
                          shape="circle"
                          size="large"
                          className="!w-12 !h-12 border-2 border-white shadow-sm"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-base">{rowData.fullName}</p>
                        <p className="text-sm text-gray-500">Đang hoạt động</p>
                      </div>
                    </div>
                  )
            }
            style={{ minWidth: '250px' }}
          />
          <Column
            field="phone"
            header="Liên hệ"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <i className="pi pi-phone text-gray-400 text-sm"></i>
                        <span className="text-gray-700">{rowData.phone || 'Chưa có'}</span>
                      </div>
                    </div>
                  )
            }
            style={{ minWidth: '150px' }}
          />
          <Column
            field="department.name"
            header="Phòng ban"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {rowData.department?.name || 'Chưa có phòng ban'}
                    </span>
                  )
            }
            style={{ minWidth: '150px' }}
          />
          <Column
            header="Chức vụ & Loại CV"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <div className="space-y-2">
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {rowData.job?.job || 'Chưa có chức vụ'}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            rowData.job?.type === 'Office'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {rowData.job?.type || 'Office'}
                        </span>
                      </div>
                    </div>
                  )
            }
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Thao tác"
            body={
              loading
                ? skeletonActionTemplate
                : (rowData) => (
                    <div className="flex gap-2">
                      <Button
                        icon="pi pi-eye"
                        className="!p-2 !bg-blue-500 hover:!bg-blue-600 !text-white !border-blue-500 !rounded-lg transition-all duration-200"
                        onClick={() => handleView(rowData)}
                        tooltip="Xem chi tiết"
                        tooltipOptions={{ position: 'top' }}
                      />
                      <Button
                        icon="pi pi-trash"
                        className="!p-2 !bg-red-500 hover:!bg-red-600 !text-white !border-red-500 !rounded-lg transition-all duration-200"
                        onClick={() => handleDelete(rowData)}
                        tooltip="Xóa nhân viên"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  )
            }
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      <Toast ref={toast} />
      <ConfirmDialog />
    </div>
  );
}
