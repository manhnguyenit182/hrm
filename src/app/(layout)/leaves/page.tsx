"use client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { createLeaveRequest, getLeaveRequestsByEmployeeId } from "./actions";
import { FormLeaveRequestType } from "./types";
import { useAuth } from "@/hooks/useAuth";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getAttendance } from "../attendance/actions";
import { AttendanceWithEmployee } from "../attendance/types";
import { Chip } from "primereact/chip";
import { useCheckPermission } from "@/hooks/usePermission";
import { LeaveRequests } from "@/db/prisma";

function EmployeeUtilitiesPageComponent() {
  const { user } = useAuth();
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [attendanceData, setAttendanceData] = useState<
    AttendanceWithEmployee[]
  >([]);
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(true);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequests[]>([]);
  const [leaveStats, setLeaveStats] = useState({
    total: 12,
    used: 0,
    remaining: 12,
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
        if (canViewAttendance) {
          setAttendanceLoading(true);
          const attendanceData = await getAttendance();
          setAttendanceData(attendanceData || []);
        }

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
            total: 12, // Default annual leave days
            used: usedDays,
            remaining: 12 - usedDays,
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
        setAttendanceLoading(false);
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

  const getAttendanceStatusSeverity = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "absent":
        return "danger";
      case "late":
        return "warning";
      default:
        return "info";
    }
  };

  const getAttendanceStatusLabel = (status: string) => {
    switch (status) {
      case "present":
        return "Có mặt";
      case "absent":
        return "Vắng mặt";
      case "late":
        return "Đi trễ";
      default:
        return status;
    }
  };

  const currentDate = new Date().toLocaleDateString("vi-VN");
  const todayAttendance = attendanceData.find(
    (item) =>
      new Date(item.date || "").toLocaleDateString("vi-VN") === currentDate
  );

  return (
    <div className="p-5 h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tiện ích nhân viên</h1>
        <p className="text-gray-600">Quản lý nghỉ phép và điểm danh của bạn</p>
      </div>

      <TabView>
        {canCreateLeave && (
          <TabPanel header="Đơn nghỉ phép" leftIcon="pi pi-calendar mr-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Tổng ngày nghỉ</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {leaveStats.total}
                      </p>
                    </div>
                    <i className="pi pi-calendar text-3xl text-blue-500"></i>
                  </div>
                </Card>
                <Card className="shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Đã sử dụng</h3>
                      <p className="text-2xl font-bold text-orange-600">
                        {leaveStats.used}
                      </p>
                    </div>
                    <i className="pi pi-check-circle text-3xl text-orange-500"></i>
                  </div>
                </Card>
                <Card className="shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Còn lại</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {leaveStats.remaining}
                      </p>
                    </div>
                    <i className="pi pi-clock text-3xl text-green-500"></i>
                  </div>
                </Card>
              </div>

              {/* Create Leave Request */}
              <div className="lg:col-span-3">
                <Card title="Tạo đơn nghỉ phép mới" className="shadow-md">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 mb-0">
                      Tạo đơn xin nghỉ phép và gửi cho quản lý phê duyệt
                    </p>
                    <Button
                      label="Tạo đơn mới"
                      icon="pi pi-plus"
                      className="p-button-success"
                      onClick={() => setVisible(true)}
                    />
                  </div>
                </Card>
              </div>

              {/* My Leave Requests */}
              <div className="lg:col-span-4">
                <Card title="Đơn nghỉ phép của tôi" className="shadow-md">
                  <DataTable
                    value={leaveRequests}
                    emptyMessage="Chưa có đơn nghỉ phép nào"
                    paginator
                    rows={5}
                    className="p-datatable-sm"
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rowData.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : rowData.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
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
                </Card>
              </div>
            </div>
          </TabPanel>
        )}

        {canViewAttendance && (
          <TabPanel header="Điểm danh" leftIcon="pi pi-users mr-2">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Today's Attendance Status */}
              <Card title="Trạng thái hôm nay" className="shadow-md">
                <div className="text-center">
                  <div className="mb-4">
                    <i
                      className={`pi ${
                        todayAttendance
                          ? todayAttendance.status === "present"
                            ? "pi-check-circle text-green-500"
                            : todayAttendance.status === "late"
                            ? "pi-clock text-yellow-500"
                            : "pi-times-circle text-red-500"
                          : "pi-question-circle text-gray-400"
                      } text-4xl`}
                    ></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {todayAttendance
                      ? getAttendanceStatusLabel(todayAttendance.status || "")
                      : "Chưa điểm danh"}
                  </h3>
                  <p className="text-gray-600">{currentDate}</p>
                  {todayAttendance?.clockIn && (
                    <p className="text-sm text-gray-500 mt-2">
                      Giờ vào:{" "}
                      {new Date(todayAttendance.clockIn).toLocaleTimeString(
                        "vi-VN"
                      )}
                    </p>
                  )}
                </div>
              </Card>

              {/* Attendance History */}
              <div className="lg:col-span-3">
                <Card title="Lịch sử điểm danh" className="shadow-md">
                  <DataTable
                    value={attendanceData.slice(0, 10)} // Show last 10 records
                    loading={attendanceLoading}
                    emptyMessage="Không có dữ liệu điểm danh"
                    paginator
                    rows={5}
                    className="p-datatable-sm"
                  >
                    <Column
                      field="date"
                      header="Ngày"
                      body={(rowData) =>
                        new Date(rowData.date || "").toLocaleDateString("vi-VN")
                      }
                    />
                    <Column
                      field="clockIn"
                      header="Giờ vào"
                      body={(rowData) =>
                        rowData.clockIn
                          ? new Date(rowData.clockIn).toLocaleTimeString(
                              "vi-VN"
                            )
                          : "-"
                      }
                    />
                    <Column
                      field="clockOut"
                      header="Giờ ra"
                      body={(rowData) =>
                        rowData.clockOut
                          ? new Date(rowData.clockOut).toLocaleTimeString(
                              "vi-VN"
                            )
                          : "-"
                      }
                    />
                    <Column
                      field="status"
                      header="Trạng thái"
                      body={(rowData) => (
                        <Chip
                          label={getAttendanceStatusLabel(rowData.status || "")}
                          className={`p-chip-${getAttendanceStatusSeverity(
                            rowData.status || ""
                          )}`}
                        />
                      )}
                    />
                  </DataTable>
                </Card>
              </div>
            </div>
          </TabPanel>
        )}
      </TabView>

      {/* Leave Request Dialog */}
      <Dialog
        header="Tạo đơn xin nghỉ phép"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          reset();
          setVisible(false);
        }}
        modal
        blockScroll
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="field flex flex-col mb-3">
            <label htmlFor="dateRange" className="font-medium mb-2">
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
                    onChange={(e) => {
                      console.log("Selected date range:", e.value);
                      field.onChange(e.value);
                    }}
                    selectionMode="range"
                    readOnlyInput
                    hideOnRangeSelection
                    placeholder="Chọn khoảng thời gian nghỉ"
                    className={fieldState.error ? "p-invalid" : ""}
                  />
                  {fieldState.error && (
                    <small className="p-error">
                      {fieldState.error.message}
                    </small>
                  )}
                </div>
              )}
            />
          </div>

          <div className="field flex flex-col mb-3">
            <label htmlFor="type" className="font-medium mb-2">
              Loại phép <span className="text-red-500">*</span>
            </label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "Vui lòng chọn loại phép" }}
              render={({ field, fieldState }) => (
                <div>
                  <Dropdown
                    id="type"
                    {...field}
                    options={[
                      { label: "Phép năm", value: "Phép năm" },
                      { label: "Nghỉ không lương", value: "Nghỉ không lương" },
                      { label: "Nghỉ ốm", value: "Nghỉ ốm" },
                      { label: "Nghỉ việc riêng", value: "Nghỉ việc riêng" },
                    ]}
                    placeholder="Chọn loại phép"
                    className={fieldState.error ? "p-invalid" : ""}
                  />
                  {fieldState.error && (
                    <small className="p-error">
                      {fieldState.error.message}
                    </small>
                  )}
                </div>
              )}
            />
          </div>

          <div className="field flex flex-col mb-3">
            <label htmlFor="reason" className="font-medium mb-2">
              Lý do nghỉ <span className="text-red-500">*</span>
            </label>
            <Controller
              name="reason"
              control={control}
              rules={{
                required: "Vui lòng nhập lý do nghỉ",
                minLength: {
                  value: 10,
                  message: "Lý do nghỉ phải có ít nhất 10 ký tự",
                },
              }}
              render={({ field, fieldState }) => (
                <div>
                  <InputText
                    id="reason"
                    {...field}
                    placeholder="Nhập lý do nghỉ"
                    className={fieldState.error ? "p-invalid" : ""}
                  />
                  {fieldState.error && (
                    <small className="p-error">
                      {fieldState.error.message}
                    </small>
                  )}
                </div>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              label="Hủy"
              severity="secondary"
              onClick={() => {
                reset();
                setVisible(false);
              }}
            />
            <Button
              type="submit"
              label="Gửi đơn"
              loading={loading}
              disabled={loading}
            />
          </div>
        </form>
      </Dialog>

      <Toast ref={toast} />
    </div>
  );
}

export default withPermission(PERMISSIONS.LEAVES.VIEW_OWN)(
  EmployeeUtilitiesPageComponent
);
