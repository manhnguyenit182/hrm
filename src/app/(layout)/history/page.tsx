"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

import { getEmployeeByIdLeaveRequests } from "./actions";
import { LeaveRequests } from "./types";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Chip } from "primereact/chip";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";

function HistoryPageComponent() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequests[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequests | null>(
    null
  );
  const [leaveRemaining, setLeaveRemaining] = useState<number>(0);
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        if (!user?.employee?.id) return;
        const employee = await getEmployeeByIdLeaveRequests(user.employee.id);
        setLeaveRequests(employee?.LeaveRequests || []);
        const leaveRemaining =
          employee?.startDate?.getFullYear() !== new Date().getFullYear()
            ? (new Date().getMonth() + 1) * 2
            : (new Date().getMonth() - employee?.startDate?.getMonth() + 1) * 2;
        setLeaveRemaining(leaveRemaining);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-surface rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Lịch sử đơn xin nghỉ
            </h1>
            <p className="text-gray-600">
              Theo dõi các đơn xin nghỉ phép và tình trạng phê duyệt
            </p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {leaveRequests.length} đơn xin nghỉ
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {
                    leaveRequests.filter((req) => req.status === "approved")
                      .length
                  }{" "}
                  đã duyệt
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {
                    leaveRequests.filter((req) => req.status === "pending")
                      .length
                  }{" "}
                  chờ duyệt
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg px-4 py-3 border shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="pi pi-calendar text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày nghỉ còn lại</p>
                  <p className="text-xl font-bold text-gray-800">
                    {leaveRemaining}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {leaveRequests.length === 0 ? (
        <div className="card-modern p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="pi pi-calendar-times text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có đơn xin nghỉ nào
          </h3>
          <p className="text-gray-500 mb-6">
            Bạn chưa gửi đơn xin nghỉ phép nào. Hãy tạo đơn mới khi cần thiết.
          </p>
        </div>
      ) : (
        <div className="card-modern overflow-hidden">
          <DataTable
            value={leaveRequests}
            paginator
            rows={10}
            className="modern-datatable"
            emptyMessage="Không tìm thấy đơn xin nghỉ nào"
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} đơn"
          >
            <Column
              header="Thời gian nghỉ"
              body={(rowData) => (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <i className="pi pi-calendar text-gray-400 text-sm"></i>
                    <span className="font-medium text-gray-700">
                      {rowData.startDate
                        ? new Date(rowData.startDate).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                        : "Chưa có"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="pi pi-arrow-right text-gray-400 text-sm"></i>
                    <span className="text-gray-600">
                      {rowData.endDate
                        ? new Date(rowData.endDate).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                        : "Chưa có"}
                    </span>
                  </div>
                </div>
              )}
              style={{ minWidth: "200px" }}
            />
            <Column
              header="Loại nghỉ phép"
              body={(rowData) => (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {rowData.type || "Chưa xác định"}
                </span>
              )}
              style={{ minWidth: "150px" }}
            />
            <Column
              header="Số ngày"
              body={(rowData) => {
                if (!rowData.startDate || !rowData.endDate) return "0 ngày";
                const startDate = new Date(rowData.startDate);
                const endDate = new Date(rowData.endDate);
                const diffTime = Math.abs(
                  endDate.getTime() - startDate.getTime()
                );
                const diffDays =
                  Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">
                        {diffDays}
                      </span>
                    </div>
                    <span className="text-gray-600">ngày</span>
                  </div>
                );
              }}
              style={{ minWidth: "120px" }}
            />
            <Column
              header="Trạng thái"
              body={(rowData) => (
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
              )}
              style={{ minWidth: "130px" }}
            />
            <Column
              header="Thao tác"
              body={(rowData) => (
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
              )}
              style={{ width: "100px" }}
            />
          </DataTable>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog
        header="Chi tiết đơn xin nghỉ"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Trạng thái hiện tại
                </label>
                <div>
                  {selectedRequest.status === "approved" ? (
                    <Chip
                      label="Đã duyệt"
                      icon="pi pi-check"
                      className="!bg-green-500 !text-white"
                    />
                  ) : selectedRequest.status === "rejected" ? (
                    <Chip
                      label="Đã từ chối"
                      icon="pi pi-times"
                      className="!bg-red-500 !text-white"
                    />
                  ) : (
                    <Chip
                      label="Đang chờ duyệt"
                      icon="pi pi-clock"
                      className="!bg-yellow-500 !text-white"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default withPermission(PERMISSIONS.HISTORY.VIEW)(HistoryPageComponent);
