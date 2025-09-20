"use client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { createLeaveRequest, getLeaveRequestsByEmployeeId } from "./actions";
import { FormLeaveRequestType } from "./types";
import { useAuth } from "@/hooks/useAuth";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useCheckPermission } from "@/hooks/usePermission";
import { LeaveRequests } from "@/db/prisma";

function EmployeeUtilitiesPageComponent() {
  const { user } = useAuth();
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequests[]>([]);
  const [leaveStats, setLeaveStats] = useState({
    total: new Date().getMonth() + 1,
    used: 0,
    remaining: new Date().getMonth() + 1,
  });
  const toast = useRef<Toast>(null);

  // Check permissions
  const canCreateLeave = useCheckPermission(PERMISSIONS.LEAVES.CREATE_OWN);
  const canViewAttendance = useCheckPermission(PERMISSIONS.ATTENDANCE.VIEW);

  const { control, handleSubmit, reset } = useForm<FormLeaveRequestType>({
    defaultValues: {
      dateRange: [],
      reason: "",
      type: "",
      status: "pending",
      departmentId: "",
    },
  });

  // Fetch attendance data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.employee?.id) return;

      try {
        // Fetch attendance data if user has permission

        // Fetch leave requests if user has permission
        if (canCreateLeave) {
          const userLeaveRequests = await getLeaveRequestsByEmployeeId(
            user.employee.id
          );
          setLeaveRequests(userLeaveRequests);

          // Calculate leave statistics
          const currentYear = new Date().getFullYear();
          const approvedLeaves = userLeaveRequests.filter(
            (leave) =>
              leave.status === "approved" &&
              leave.startDate &&
              new Date(leave.startDate).getFullYear() === currentYear
          );

          const usedDays = approvedLeaves.reduce((total, leave) => {
            if (leave.startDate && leave.endDate) {
              const start = new Date(leave.startDate);
              const end = new Date(leave.endDate);
              const diffTime = Math.abs(end.getTime() - start.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              return total + diffDays;
            }
            return total;
          }, 0);

          setLeaveStats({
            total: new Date().getMonth() + 1, // Default annual leave days
            used: usedDays,
            remaining: new Date().getMonth() + 1 - usedDays,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "Không thể tải dữ liệu",
          life: 3000,
        });
      } finally {
      }
    };

    fetchData();
  }, [user?.employee?.id, canViewAttendance, canCreateLeave]);

  const onSubmit = async (data: FormLeaveRequestType) => {
    try {
      setLoading(true);

      if (!user?.employee?.id) {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "Không tìm thấy thông tin nhân viên.",
          life: 3000,
        });
        return;
      }

      if (!data.dateRange || data.dateRange.length !== 2) {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "Vui lòng chọn khoảng thời gian nghỉ.",
          life: 3000,
        });
        return;
      }

      const [startDate, endDate] = data.dateRange;

      await createLeaveRequest({
        reason: data.reason,
        type: data.type,
        status: data.status,
        employeeId: user.employee.id,
        departmentId: user.employee.departmentId ?? null,
        startDate: startDate,
        endDate: endDate,
      });

      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "Đơn xin nghỉ đã được gửi thành công!",
        life: 3000,
      });

      // Refresh leave requests data
      if (user.employee.id) {
        const updatedLeaveRequests = await getLeaveRequestsByEmployeeId(
          user.employee.id
        );
        setLeaveRequests(updatedLeaveRequests);
      }

      reset();
      setVisible(false);
    } catch (error) {
      console.error("Error adding leave request:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Có lỗi xảy ra khi gửi đơn xin nghỉ.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}

      {/* Tab Content */}
      <div className="card-modern">
        <TabView className="modern-tabs">
          {canCreateLeave && (
            <TabPanel header="Đơn nghỉ phép" leftIcon="pi pi-calendar mr-2">
              <div className="p-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card-modern p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">
                          Tổng ngày nghỉ
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                          {leaveStats.total}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Ngày/năm</p>
                      </div>
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <i className="pi pi-calendar text-blue-600 text-2xl"></i>
                      </div>
                    </div>
                  </div>

                  <div className="card-modern p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">
                          Đã sử dụng
                        </h3>
                        <p className="text-3xl font-bold text-orange-600">
                          {leaveStats.used}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Ngày đã nghỉ
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <i className="pi pi-check-circle text-orange-600 text-2xl"></i>
                      </div>
                    </div>
                  </div>

                  <div className="card-modern p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">
                          Còn lại
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                          {leaveStats.remaining}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Ngày khả dụng
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                        <i className="pi pi-clock text-green-600 text-2xl"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Create Leave Request */}
                <div className="card-modern p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                        <i className="pi pi-plus text-white text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                          Tạo đơn nghỉ phép mới
                        </h3>
                        <p className="text-gray-600">
                          Gửi yêu cầu nghỉ phép cho quản lý phê duyệt
                        </p>
                      </div>
                    </div>
                    <Button
                      label="Tạo đơn mới"
                      icon="pi pi-plus"
                      className="btn-primary !px-6 !py-3"
                      onClick={() => setVisible(true)}
                    />
                  </div>
                </div>

                {/* My Leave Requests */}
                <div className="card-modern p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="pi pi-list text-purple-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Đơn nghỉ phép của tôi
                    </h3>
                  </div>
                  <DataTable
                    value={leaveRequests}
                    emptyMessage="Chưa có đơn nghỉ phép nào"
                    paginator
                    rows={5}
                    className="modern-datatable"
                  >
                    <Column
                      field="startDate"
                      header="Ngày bắt đầu"
                      body={(rowData) =>
                        new Date(rowData.startDate).toLocaleDateString("vi-VN")
                      }
                    />
                    <Column
                      field="endDate"
                      header="Ngày kết thúc"
                      body={(rowData) =>
                        new Date(rowData.endDate).toLocaleDateString("vi-VN")
                      }
                    />
                    <Column field="type" header="Loại nghỉ phép" />
                    <Column field="reason" header="Lý do" />
                    <Column
                      field="status"
                      header="Trạng thái"
                      body={(rowData) => (
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            rowData.status === "approved"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : rowData.status === "rejected"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}
                        >
                          {rowData.status === "approved"
                            ? "Đã duyệt"
                            : rowData.status === "rejected"
                            ? "Từ chối"
                            : "Chờ duyệt"}
                        </span>
                      )}
                    />
                    <Column
                      field="createdAt"
                      header="Ngày tạo"
                      body={(rowData) =>
                        new Date(rowData.createdAt).toLocaleDateString("vi-VN")
                      }
                    />
                  </DataTable>
                </div>
              </div>
            </TabPanel>
          )}
        </TabView>
      </div>

      <Toast ref={toast} />

      {/* Leave Request Dialog */}
      <Dialog
        header="Tạo đơn xin nghỉ phép"
        visible={visible}
        style={{ width: "50vw", minWidth: "320px" }}
        onHide={() => {
          reset();
          setVisible(false);
        }}
        modal
        blockScroll
        className="modern-dialog"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-2">
          <div className="space-y-2">
            <label
              htmlFor="dateRange"
              className="block text-sm font-semibold text-gray-700"
            >
              Chọn khoảng thời gian <span className="text-red-500">*</span>
            </label>
            <Controller
              name="dateRange"
              control={control}
              rules={{
                required: "Vui lòng chọn khoảng thời gian nghỉ",
                validate: (value) => {
                  if (!value || value.length !== 2) {
                    return "Vui lòng chọn cả ngày bắt đầu và ngày kết thúc";
                  }
                  if (value[0] && value[1] && value[0] > value[1]) {
                    return "Ngày bắt đầu không thể sau ngày kết thúc";
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <div>
                  <Calendar
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    selectionMode="range"
                    readOnlyInput
                    showIcon
                    dateFormat="dd/mm/yy"
                    placeholder="Chọn ngày bắt đầu và kết thúc"
                    className="w-full"
                  />
                  {fieldState.error && (
                    <small className="text-red-500 mt-1 block">
                      {fieldState.error.message}
                    </small>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-sm font-semibold text-gray-700"
            >
              Loại nghỉ phép <span className="text-red-500">*</span>
            </label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "Vui lòng chọn loại nghỉ phép" }}
              render={({ field, fieldState }) => (
                <div>
                  <Dropdown
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    options={[
                      { label: "Nghỉ phép năm", value: "Nghỉ phép năm" },
                      { label: "Nghỉ cá nhân", value: "Nghỉ cá nhân" },
                    ]}
                    placeholder="Chọn loại nghỉ phép"
                    className="w-full"
                  />
                  {fieldState.error && (
                    <small className="text-red-500 mt-1 block">
                      {fieldState.error.message}
                    </small>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="reason"
              className="block text-sm font-semibold text-gray-700"
            >
              Lý do nghỉ phép <span className="text-red-500">*</span>
            </label>
            <Controller
              name="reason"
              control={control}
              rules={{ required: "Vui lòng nhập lý do nghỉ phép" }}
              render={({ field, fieldState }) => (
                <div>
                  <InputTextarea
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Nhập lý do nghỉ phép của bạn..."
                    rows={4}
                    className="w-full"
                  />
                  {fieldState.error && (
                    <small className="text-red-500 mt-1 block">
                      {fieldState.error.message}
                    </small>
                  )}
                </div>
              )}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              label="Hủy"
              severity="secondary"
              className="btn-secondary !px-6 !py-3"
              onClick={() => {
                reset();
                setVisible(false);
              }}
            />
            <Button
              type="submit"
              label="Gửi đơn"
              loading={loading}
              className="btn-primary !px-6 !py-3"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default withPermission(PERMISSIONS.LEAVES.VIEW_OWN)(
  EmployeeUtilitiesPageComponent
);
