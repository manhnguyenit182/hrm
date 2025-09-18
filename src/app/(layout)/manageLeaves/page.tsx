"use client";

import { useEffect, useState, useRef } from "react";
import {
  getLeaveRequestsByDepartment,
  updateLeaveRequestStatus,
} from "./actions";
import { useAuth } from "@/hooks/useAuth";
import { LeaveRequests, Employees } from "@/db/prisma";

type LeaveRequestWithEmployee = LeaveRequests & {
  employee: Employees | null;
};
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";

function ManageLeavesPageComponent() {
  const { user, loading } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<
    LeaveRequestWithEmployee[]
  >([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequestWithEmployee | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (loading) return;
      if (user?.employee?.departmentId) {
        try {
          setDataLoading(true);
          const departmentId = user.employee.departmentId;
          console.log("departmentId", departmentId);
          const res = await getLeaveRequestsByDepartment(departmentId);
          setLeaveRequests(res);
          console.log("leave requests", res);
        } catch (error) {
          console.error("Error fetching leave requests:", error);
          toast.current?.show({
            severity: "error",
            summary: "Lỗi",
            detail: "Không thể tải danh sách đơn nghỉ phép",
            life: 3000,
          });
        } finally {
          setDataLoading(false);
        }
      } else {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [loading, user]);

  const handleApprove = async (leaveRequest: LeaveRequestWithEmployee) => {
    try {
      const result = await updateLeaveRequestStatus(
        leaveRequest.id,
        "approved"
      );
      if (result.success) {
        setLeaveRequests((prev) =>
          prev.map((item) =>
            item.id === leaveRequest.id ? { ...item, status: "approved" } : item
          )
        );
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Đã duyệt đơn nghỉ phép",
          life: 3000,
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: result.error || "Không thể duyệt đơn nghỉ phép",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error approving leave request:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Có lỗi xảy ra khi duyệt đơn nghỉ phép",
        life: 3000,
      });
    }
  };

  const handleReject = async (leaveRequest: LeaveRequestWithEmployee) => {
    try {
      const result = await updateLeaveRequestStatus(
        leaveRequest.id,
        "rejected"
      );
      if (result.success) {
        setLeaveRequests((prev) =>
          prev.map((item) =>
            item.id === leaveRequest.id ? { ...item, status: "rejected" } : item
          )
        );
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Đã từ chối đơn nghỉ phép",
          life: 3000,
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: result.error || "Không thể từ chối đơn nghỉ phép",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error rejecting leave request:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Có lỗi xảy ra khi từ chối đơn nghỉ phép",
        life: 3000,
      });
    }
  };

  const confirmApprove = (leaveRequest: LeaveRequestWithEmployee) => {
    confirmDialog({
      message: `Bạn có chắc chắn muốn duyệt đơn nghỉ phép của ${leaveRequest.employee?.firstName} ${leaveRequest.employee?.lastName}?`,
      header: "Xác nhận duyệt",
      icon: "pi pi-check",
      acceptClassName: "p-button-success",
      accept: () => handleApprove(leaveRequest),
      acceptLabel: "Duyệt",
      rejectLabel: "Hủy",
    });
  };

  const confirmReject = (leaveRequest: LeaveRequestWithEmployee) => {
    confirmDialog({
      message: `Bạn có chắc chắn muốn từ chối đơn nghỉ phép của ${leaveRequest.employee?.firstName} ${leaveRequest.employee?.lastName}?`,
      header: "Xác nhận từ chối",
      icon: "pi pi-times",
      acceptClassName: "p-button-danger",
      accept: () => handleReject(leaveRequest),
      acceptLabel: "Từ chối",
      rejectLabel: "Hủy",
    });
  };

  // Skeleton templates for loading state
  const skeletonItems = Array.from({ length: 5 }, (_, i) => ({ id: i }));

  const skeletonNameTemplate = () => (
    <div className="flex items-center gap-2">
      <Skeleton shape="circle" size="2rem" />
      <Skeleton width="8rem" height="1rem" />
    </div>
  );
  // Skeleton template for regular text columns
  const skeletonTextTemplate = () => <Skeleton width="100%" height="1rem" />;
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-modern p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Tổng đơn
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {leaveRequests.length}
              </p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <i className="pi pi-file text-blue-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="card-modern p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Chờ duyệt
              </h3>
              <p className="text-3xl font-bold text-yellow-600">
                {leaveRequests.filter((req) => req.status === "pending").length}
              </p>
            </div>
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <i className="pi pi-clock text-yellow-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="card-modern p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Đã duyệt
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {
                  leaveRequests.filter((req) => req.status === "approved")
                    .length
                }
              </p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <i className="pi pi-check-circle text-green-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="card-modern p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Từ chối
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {
                  leaveRequests.filter((req) => req.status === "rejected")
                    .length
                }
              </p>
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
              <i className="pi pi-times-circle text-red-600 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="card-modern overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="pi pi-table text-blue-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Danh sách đơn xin nghỉ
            </h3>
          </div>
        </div>

        <DataTable
          value={dataLoading ? skeletonItems : leaveRequests}
          paginator={!dataLoading}
          rows={10}
          className="modern-datatable"
          emptyMessage="Không tìm thấy đơn nghỉ phép nào"
          loading={false}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} đơn"
        >
          <Column
            header="Nhân viên"
            body={
              dataLoading
                ? skeletonNameTemplate
                : (rowData: LeaveRequestWithEmployee) => (
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {rowData.employee?.image ? (
                          <Avatar
                            image={rowData.employee.image}
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
                          {rowData.employee?.firstName}{" "}
                          {rowData.employee?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {rowData.employee?.email}
                        </p>
                      </div>
                    </div>
                  )
            }
            style={{ minWidth: "250px" }}
          />

          <Column
            header="Thời gian nghỉ"
            body={
              dataLoading
                ? skeletonTextTemplate
                : (rowData: LeaveRequestWithEmployee) => (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <i className="pi pi-calendar text-gray-400 text-sm"></i>
                        <span className="font-medium text-gray-700">
                          {new Date(rowData.startDate || "").toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="pi pi-arrow-right text-gray-400 text-sm"></i>
                        <span className="text-gray-600">
                          {new Date(rowData.endDate || "").toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            {(() => {
                              if (!rowData.startDate || !rowData.endDate)
                                return 0;
                              const startDate = new Date(rowData.startDate);
                              const endDate = new Date(rowData.endDate);
                              const diffTime = Math.abs(
                                endDate.getTime() - startDate.getTime()
                              );
                              return (
                                Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                              );
                            })()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">ngày</span>
                      </div>
                    </div>
                  )
            }
            style={{ minWidth: "200px" }}
          />

          <Column
            header="Loại nghỉ phép"
            body={
              dataLoading
                ? skeletonTextTemplate
                : (rowData: LeaveRequestWithEmployee) => (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {rowData.type}
                    </span>
                  )
            }
            style={{ minWidth: "150px" }}
          />

          <Column
            header="Trạng thái"
            body={
              dataLoading
                ? skeletonTextTemplate
                : (rowData: LeaveRequestWithEmployee) => (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        rowData.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : rowData.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          rowData.status === "approved"
                            ? "bg-green-400"
                            : rowData.status === "rejected"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        }`}
                      ></div>
                      {rowData.status === "approved"
                        ? "Đã duyệt"
                        : rowData.status === "rejected"
                        ? "Từ chối"
                        : "Chờ duyệt"}
                    </span>
                  )
            }
            style={{ minWidth: "130px" }}
          />

          <Column
            header="Thao tác"
            body={
              dataLoading
                ? skeletonTextTemplate
                : (rowData: LeaveRequestWithEmployee) => {
                    const isPending = rowData.status === "pending";
                    return (
                      <div className="flex items-center space-x-2">
                        <Button
                          icon="pi pi-eye"
                          className="!p-2 !bg-blue-500 hover:!bg-blue-600 !text-white !border-blue-500 !rounded-lg transition-all duration-200"
                          onClick={() => {
                            setSelectedRequest(rowData);
                            setVisible(true);
                          }}
                          tooltip="Xem chi tiết"
                          tooltipOptions={{ position: "top" }}
                        />
                        {isPending && (
                          <>
                            <Button
                              icon="pi pi-check"
                              className="!p-2 !bg-green-500 hover:!bg-green-600 !text-white !border-green-500 !rounded-lg transition-all duration-200"
                              onClick={() => confirmApprove(rowData)}
                              tooltip="Duyệt"
                              tooltipOptions={{ position: "top" }}
                            />
                            <Button
                              icon="pi pi-times"
                              className="!p-2 !bg-red-500 hover:!bg-red-600 !text-white !border-red-500 !rounded-lg transition-all duration-200"
                              onClick={() => confirmReject(rowData)}
                              tooltip="Từ chối"
                              tooltipOptions={{ position: "top" }}
                            />
                          </>
                        )}
                      </div>
                    );
                  }
            }
            style={{ width: "150px" }}
          />
        </DataTable>
      </div>

      {/* Detail Dialog */}
      <Dialog
        header="Chi tiết đơn xin nghỉ phép"
        visible={visible}
        style={{ width: "600px", maxWidth: "90vw" }}
        onHide={() => {
          setVisible(false);
          setSelectedRequest(null);
        }}
        modal
        className="modern-dialog"
      >
        {selectedRequest && (
          <div className="space-y-6 p-2">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="relative">
                {selectedRequest.employee?.image ? (
                  <Avatar
                    image={selectedRequest.employee.image}
                    shape="circle"
                    size="xlarge"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <i className="pi pi-user text-gray-500 text-2xl"></i>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedRequest.employee?.firstName}{" "}
                  {selectedRequest.employee?.lastName}
                </h3>
                <p className="text-gray-600">
                  {selectedRequest.employee?.email}
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    selectedRequest.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : selectedRequest.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedRequest.status === "approved"
                    ? "Đã duyệt"
                    : selectedRequest.status === "rejected"
                    ? "Từ chối"
                    : "Chờ duyệt"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Ngày bắt đầu
                </label>
                <p className="text-lg font-medium text-gray-800">
                  {selectedRequest.startDate
                    ? new Date(selectedRequest.startDate).toLocaleDateString(
                        "vi-VN",
                        {
                          weekday: "long",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "Chưa có"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Ngày kết thúc
                </label>
                <p className="text-lg font-medium text-gray-800">
                  {selectedRequest.endDate
                    ? new Date(selectedRequest.endDate).toLocaleDateString(
                        "vi-VN",
                        {
                          weekday: "long",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "Chưa có"}
                </p>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Loại nghỉ phép
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {selectedRequest.type}
                </span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Số ngày nghỉ
                </label>
                <p className="text-lg font-medium text-gray-800">
                  {(() => {
                    if (!selectedRequest.startDate || !selectedRequest.endDate)
                      return "0 ngày";
                    const startDate = new Date(selectedRequest.startDate);
                    const endDate = new Date(selectedRequest.endDate);
                    const diffTime = Math.abs(
                      endDate.getTime() - startDate.getTime()
                    );
                    const days =
                      Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    return `${days} ngày`;
                  })()}
                </p>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Lý do nghỉ phép
              </label>
              <p className="text-lg text-gray-800 bg-gray-50 p-4 rounded-lg">
                {selectedRequest.reason || "Không có lý do cụ thể"}
              </p>
            </div>

            <hr className="border-gray-200" />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Ngày tạo đơn
              </label>
              <p className="text-lg font-medium text-gray-800">
                {selectedRequest.createdAt
                  ? new Date(selectedRequest.createdAt).toLocaleDateString(
                      "vi-VN",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )
                  : "Chưa có"}
              </p>
            </div>
          </div>
        )}
      </Dialog>

      <Toast ref={toast} />
      <ConfirmDialog />
    </div>
  );
}

export default withPermission(PERMISSIONS.LEAVES.APPROVE)(
  ManageLeavesPageComponent
);
