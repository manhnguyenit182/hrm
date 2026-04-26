'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useResponsiveRows } from '@/hooks/useResponsiveRows';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Avatar } from 'primereact/avatar';
import { Skeleton } from 'primereact/skeleton';
import { AttendanceWithEmployee } from '../types';

const SKELETON_NAME = (
  <div className="flex items-center gap-2">
    <Skeleton shape="circle" size="2rem" />
    <Skeleton width="8rem" height="1rem" />
  </div>
);

const SKELETON_TEXT = <Skeleton width="100%" height="1rem" />;

const SKELETON_STATUS = <Skeleton width="4rem" height="1.5rem" borderRadius="1rem" />;

const skeletonNameTemplate = () => SKELETON_NAME;
const skeletonTextTemplate = () => SKELETON_TEXT;
const skeletonStatusTemplate = () => SKELETON_STATUS;

function getStatusDotClass(status: AttendanceWithEmployee['status']): string {
  if (status === 'Present') return 'bg-green-400';
  if (status === 'Late') return 'bg-red-400';
  return 'bg-gray-400';
}

function getStatusBadgeClass(status: AttendanceWithEmployee['status']): string {
  if (status === 'Present') return 'bg-green-100 text-green-800';
  if (status === 'Late') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status: AttendanceWithEmployee['status']): string {
  if (status === 'Present') return 'Đúng giờ';
  if (status === 'Late') return 'Đi muộn';
  return 'Chưa xác định';
}

interface AttendanceClientProps {
  initialAttendance: AttendanceWithEmployee[];
}

export function AttendanceClient({ initialAttendance }: AttendanceClientProps): React.ReactElement {
  const [employees] = useState<AttendanceWithEmployee[]>(initialAttendance);
  const loading = false;
  const rowsPerPage = useResponsiveRows();
  const toast = useRef<Toast>(null);

  const skeletonItems = useMemo(() => Array.from({ length: rowsPerPage }, (_, i) => ({ id: i })), [rowsPerPage]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="card-modern p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <IconField iconPosition="left" className=" max-w-2/5">
              <InputIcon className="pi pi-search text-gray-400" />
              <InputText
                placeholder="Tìm kiếm nhân viên theo tên hoặc chức vụ..."
                className="w-full !pl-10 !py-3 !text-base"
                disabled={loading}
              />
            </IconField>
          </div>
        </div>
      </div>

      {/* Attendance DataTable */}
      <div className="card-modern overflow-hidden">
        <DataTable
          value={loading ? skeletonItems : employees}
          paginator={!loading}
          rows={rowsPerPage}
          className="modern-datatable"
          emptyMessage="Không tìm thấy dữ liệu chấm công"
          loading={false}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} bản ghi"
        >
          <Column
            header="Thông tin nhân viên"
            body={
              loading
                ? skeletonNameTemplate
                : (rowData) => (
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar
                          image={rowData.employee?.image || undefined}
                          icon={!rowData.employee?.image ? 'pi pi-user' : undefined}
                          shape="circle"
                          size="large"
                          className="!w-12 !h-12 border-2 border-white shadow-sm"
                        />
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${getStatusDotClass(
                            rowData.status,
                          )}`}
                        ></div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-base">
                          {rowData.employee?.firstName} {rowData.employee?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {rowData.employee?.position?.title || 'Chưa có chức vụ'}
                        </p>
                      </div>
                    </div>
                  )
            }
            style={{ minWidth: '250px' }}
          />
          <Column
            header="LOẠI CÔNG VIỆC"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        rowData.employee?.job?.type === 'Văn phòng'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {rowData.employee?.job?.type || 'Văn phòng'}
                    </span>
                  )
            }
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Thời gian vào"
            body={
              loading
                ? skeletonTextTemplate
                : (rowData) => (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <i className="pi pi-clock text-gray-400"></i>
                        <span className="font-medium text-gray-700">
                          {rowData.clockIn
                            ? new Date(rowData.clockIn).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })
                            : 'Chưa vào'}
                        </span>
                      </div>
                      {rowData.clockIn ? (
                        <div className="text-xs text-gray-500">
                          {new Date(rowData.clockIn).toLocaleDateString('vi-VN')}
                        </div>
                      ) : null}
                    </div>
                  )
            }
            style={{ minWidth: '160px' }}
          />
          <Column
            header="Trạng thái chấm công"
            body={
              loading
                ? skeletonStatusTemplate
                : (rowData) => (
                    <div className="flex flex-col items-start space-y-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                          rowData.status,
                        )}`}
                      >
                        <div className={`w-2 h-2 rounded-full mr-2 ${getStatusDotClass(rowData.status)}`}></div>
                        {getStatusLabel(rowData.status)}
                      </span>
                    </div>
                  )
            }
            style={{ minWidth: '180px' }}
          />
        </DataTable>
      </div>

      <Toast ref={toast} />
      <ConfirmDialog />
    </div>
  );
}
