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
import { Eye, Check, X } from "lucide-react";
import { Chip } from "primereact/chip";
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

  const actionBodyTemplate = (rowData: LeaveRequestWithEmployee) => {
    const isPending = rowData.status === "pending";

    return (
      <div className="flex gap-2">
        <Button
          icon={<Eye />}
          className="p-button-rounded p-button-info"
          onClick={() => {
            setSelectedRequest(rowData);
            setVisible(true);
          }}
          tooltip="Xem chi tiết"
        />
        {isPending && (
          <>
            <Button
              icon={<Check />}
              className="p-button-rounded p-button-success"
              onClick={() => confirmApprove(rowData)}
              tooltip="Duyệt"
            />
            <Button
              icon={<X />}
              className="p-button-rounded p-button-danger"
              onClick={() => confirmReject(rowData)}
              tooltip="Từ chối"
            />
          </>
        )}
      </div>
    );
  };
  const skeletonItems = Array.from({ length: 5 }, (_, i) => ({
    id: i,
  }));
  // Skeleton template for name column with avatar
  const skeletonNameTemplate = () => (
    <div className="flex items-center gap-2">
      <Skeleton shape="circle" size="2rem" />
      <Skeleton width="8rem" height="1rem" />
    </div>
  );
  // Skeleton template for regular text columns
  const skeletonTextTemplate = () => <Skeleton width="100%" height="1rem" />;
  return (
    <div className="flex flex-col h-full shadow-md rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn nghỉ phép</h1>

      <DataTable
        value={dataLoading ? skeletonItems : leaveRequests}
        paginator={!dataLoading}
        rows={10}
        className="p-datatable-sm"
        emptyMessage="Không tìm thấy đơn nghỉ phép nào"
        loading={false} // We handle loading state manually with skeleton
      >
        <Column
          field="fullName"
          header="Họ và tên"
          sortable
          body={
            dataLoading
              ? skeletonNameTemplate
              : (rowData: LeaveRequestWithEmployee) => (
                  <div className="flex items-center gap-2">
                    {rowData.employee?.image && (
                      <Avatar image={rowData.employee.image} shape="circle" />
                    )}
                    <span>
                      {rowData.employee?.firstName} {rowData.employee?.lastName}
                    </span>
                  </div>
                )
          }
        />

        <Column
          field="duration"
          header="Thời gian"
          body={
            dataLoading
              ? skeletonTextTemplate
              : (rowData: LeaveRequestWithEmployee) =>
                  `${new Date(rowData.startDate || "").toLocaleDateString(
                    "vi-VN"
                  )} - ${new Date(rowData.endDate || "").toLocaleDateString(
                    "vi-VN"
                  )}`
          }
        />
        <Column
          field="type"
          header="Loại"
          body={dataLoading ? skeletonTextTemplate : undefined}
        />
        <Column
          field="status"
          header="Trạng thái"
          body={
            dataLoading
              ? skeletonTextTemplate
              : (rowData: LeaveRequestWithEmployee) =>
                  rowData.status === "approved" ? (
                    <Chip
                      label="Đã duyệt"
                      icon="pi pi-check"
                      className="bg-green-500"
                    />
                  ) : rowData.status === "rejected" ? (
                    <Chip
                      label="Đã từ chối"
                      icon="pi pi-times"
                      className="bg-red-500"
                    />
                  ) : (
                    <Chip
                      label="Đang chờ duyệt"
                      icon="pi pi-clock"
                      className="bg-yellow-500"
                    />
                  )
          }
        />
        <Column
          field="action"
          header="Hành động"
          body={dataLoading ? skeletonTextTemplate : actionBodyTemplate}
        />
      </DataTable>
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

      <Toast ref={toast} />
      <ConfirmDialog />
    </div>
  );
}

export default withPermission(PERMISSIONS.LEAVES.APPROVE)(
  ManageLeavesPageComponent
);
