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
    <div className="p-5 h-full shadow-md rounded-lg border border-gray-200">
      {leaveRequests.length === 0 ? (
        <p className="text-center text-gray-500">No leave requests found.</p>
      ) : (
        <div>
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Lịch sử đơn xin nghỉ</h2>
            <p className="text-gray-600">
              Số ngày nghỉ còn lại: {leaveRemaining}
            </p>
          </header>
          <DataTable value={leaveRequests} paginator rows={10}>
            <Column
              body={(rowData) =>
                rowData.startDate
                  ? new Date(rowData.startDate).toLocaleDateString("vi-VN")
                  : ""
              }
              header="Ngày bắt đầu"
              sortable
            ></Column>
            <Column
              body={(rowData) =>
                rowData.endDate
                  ? new Date(rowData.endDate).toLocaleDateString("vi-VN")
                  : ""
              }
              header="Ngày kết thúc"
              sortable
            ></Column>
            <Column field="type" header="Loại" sortable></Column>
            <Column
              body={(rowData) => {
                if (!rowData.startDate || !rowData.endDate) return 0;
                const startDate = new Date(rowData.startDate);
                const endDate = new Date(rowData.endDate);
                const diffTime = Math.abs(
                  endDate.getTime() - startDate.getTime()
                );
                const diffDays =
                  Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return diffDays;
              }}
              header="Số ngày"
              sortable
            ></Column>
            <Column
              body={(rowData) => {
                if (rowData.status === "approved")
                  return (
                    <Chip label="Đã duyệt" icon="pi pi-check" color="success" />
                  );
                if (rowData.status === "rejected")
                  return (
                    <Chip
                      label="Đã từ chối"
                      icon="pi pi-times"
                      color="danger"
                    />
                  );
                return (
                  <Chip
                    label="Đang chờ duyệt"
                    icon="pi pi-clock"
                    color="warning"
                  />
                );
              }}
              header="Trạng thái"
              sortable
            ></Column>

            <Column
              body={(rowData) => (
                <div>
                  <Button
                    onClick={() => {
                      setSelectedRequest(rowData);
                      setVisible(true);
                    }}
                  >
                    Xem thêm
                  </Button>
                </div>
              )}
              header="Xem thêm"
            ></Column>
          </DataTable>
        </div>
      )}

      <Dialog
        header="Chi tiết đơn xin nghỉ"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          setVisible(false);
          setSelectedRequest(null);
        }}
      >
        {selectedRequest && (
          <div>
            <p className="m-0">
              <strong>Ngày bắt đầu: </strong>{" "}
              {selectedRequest.startDate
                ? new Date(selectedRequest.startDate).toLocaleDateString(
                    "vi-VN"
                  )
                : ""}
            </p>
            <p className="m-0">
              <strong>Ngày kết thúc: </strong>{" "}
              {selectedRequest.endDate
                ? new Date(selectedRequest.endDate).toLocaleDateString("vi-VN")
                : ""}
            </p>
            <p className="m-0">
              <strong>Lý do: </strong> {selectedRequest.reason}
            </p>
            <p className="m-0">
              <strong>Loại: </strong> {selectedRequest.type}
            </p>
            <p className="m-0">
              <strong>Số ngày: </strong>{" "}
              {(() => {
                if (!selectedRequest.startDate || !selectedRequest.endDate)
                  return 0;
                const startDate = new Date(selectedRequest.startDate);
                const endDate = new Date(selectedRequest.endDate);
                const diffTime = Math.abs(
                  endDate.getTime() - startDate.getTime()
                );
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              })()}
            </p>
            <p className="m-0">
              <strong>Ngày khởi tạo: </strong>{" "}
              {selectedRequest.createdAt
                ? new Date(selectedRequest.createdAt).toLocaleDateString(
                    "vi-VN"
                  )
                : ""}
            </p>

            <div className="m-0">
              <strong>Trạng thái: </strong>{" "}
              {selectedRequest.status === "approved" ? (
                <Chip label="Đã duyệt" icon="pi pi-check" color="success" />
              ) : selectedRequest.status === "rejected" ? (
                <Chip label="Đã từ chối" icon="pi pi-times" color="danger" />
              ) : (
                <Chip
                  label="Đang chờ duyệt"
                  icon="pi pi-clock"
                  color="warning"
                />
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default withPermission(PERMISSIONS.HISTORY.VIEW)(HistoryPageComponent);
