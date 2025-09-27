import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { DataTableEmployee } from "../employees/types";

interface PayrollStatusDialogProps {
  visible: boolean;
  onHide: () => void;
  employee: DataTableEmployee | null;
  onConfirm: (employeeId: string) => void;
  loading?: boolean;
}

const PayrollStatusDialog: React.FC<PayrollStatusDialogProps> = ({
  visible,
  onHide,
  employee,
  onConfirm,
  loading = false,
}) => {
  if (!employee) return null;

  const handleConfirm = () => {
    onConfirm(employee.id);
  };

  const isAlreadyPaid = employee.status === "Đã hoàn thành";

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Xác nhận trả lương"
      modal
      className="w-full max-w-md mx-4"
      contentClassName="p-6"
    >
      <div className="space-y-4">
        {/* Thông tin nhân viên */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <div className="relative">
            {employee.image ? (
              <Avatar image={employee.image} shape="circle" size="large" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <i className="pi pi-user text-gray-500"></i>
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{employee.fullName}</p>
            <p className="text-sm text-gray-500">
              {employee.job?.job || "Nhân viên"}
            </p>
            <p className="text-sm text-gray-500">{employee.department?.name}</p>
          </div>
        </div>

        {/* Thông tin lương */}
        <div className="space-y-2 p-4 border rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-600">Lương cơ bản:</span>
            <span className="font-semibold">
              {(employee.job?.salary || 0).toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Khấu trừ (8%):</span>
            <span className="text-orange-600">
              -{((employee.job?.salary || 0) * 0.08).toLocaleString("vi-VN")}{" "}
              VNĐ
            </span>
          </div>
          <hr />
          <div className="flex justify-between font-bold text-lg">
            <span>Thực nhận:</span>
            <span className="text-green-600">
              {((employee.job?.salary || 0) * 0.92).toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
        </div>

        {/* Trạng thái hiện tại */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <span className="text-gray-600">Trạng thái hiện tại:</span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              employee.status === "Đã hoàn thành"
                ? "bg-green-100 text-green-800"
                : employee.status === "Đang chờ"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                employee.status === "Đã hoàn thành"
                  ? "bg-green-400"
                  : employee.status === "Đang chờ"
                  ? "bg-yellow-400"
                  : "bg-gray-400"
              }`}
            ></div>
            {employee.status || "Chưa xử lý"}
          </span>
        </div>

        {/* Tin nhắn xác nhận */}
        {!isAlreadyPaid ? (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-700">
              Bạn có chắc chắn muốn đánh dấu là <strong>đã trả lương</strong>{" "}
              cho nhân viên này?
            </p>
          </div>
        ) : (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <i className="pi pi-check-circle text-2xl text-green-600 mb-2"></i>
            <p className="text-gray-700">Nhân viên này đã được trả lương.</p>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex space-x-3 gap-3">
          <Button
            label="Hủy"
            icon="pi pi-times"
            className="flex-1"
            severity="secondary"
            onClick={onHide}
            disabled={loading}
          />
          {!isAlreadyPaid && (
            <Button
              label={loading ? "Đang xử lý..." : "Xác nhận đã trả"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
              className="flex-1 btn-primary"
              onClick={handleConfirm}
              loading={loading}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default PayrollStatusDialog;
