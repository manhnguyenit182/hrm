"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  clockIn,
  clockOut,
  getTodayAttendance,
  getEmployeesByDepartmentId,
} from "./actions";
import { Employees, Departments, Jobs } from "@/db/prisma";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { Avatar } from "primereact/avatar";
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  User,
  Calendar,
  Building2,
} from "lucide-react";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import { useAuth } from "@/hooks/useAuth";
interface EmployeeWithRelations extends Employees {
  department: Departments | null;
  job: Jobs | null;
}

interface AttendanceRecord {
  id: string;
  employeeId: string | null;
  date: Date;
  clockIn: Date | null;
  clockOut: Date | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function AttendancePageComponent() {
  const [employees, setEmployees] = React.useState<EmployeeWithRelations[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeWithRelations | null>(null);
  const [todayAttendance, setTodayAttendance] =
    useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const toast = useRef<Toast>(null);
  const { user } = useAuth();
  // Cập nhật thời gian hiện tại mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load danh sách nhân viên
  useEffect(() => {
    if (!user?.employee?.departmentId) return;

    const fetchData = async () => {
      const data = await getEmployeesByDepartmentId(
        user.employee!.departmentId!
      );
      setEmployees(data);

      // Tự động chọn user hiện tại nếu có trong danh sách
      const currentEmployee = data.find((emp) => emp.id === user.employee?.id);
      if (currentEmployee) {
        setSelectedEmployee(currentEmployee);
      }
    };
    fetchData();
  }, [user]);

  const loadTodayAttendance = useCallback(async () => {
    if (!selectedEmployee) return;

    const attendance = await getTodayAttendance(selectedEmployee.id);
    setTodayAttendance(attendance);
  }, [selectedEmployee]);

  // Load thông tin điểm danh khi chọn nhân viên
  useEffect(() => {
    if (selectedEmployee) {
      loadTodayAttendance();
    }
  }, [selectedEmployee, loadTodayAttendance]);

  // Tạo options cho dropdown
  const employeeOptions = employees.map((emp: EmployeeWithRelations) => ({
    label: `${emp.firstName} ${emp.lastName} `,
    value: emp.id,
    employee: emp,
  }));

  const handleEmployeeSelect = (e: { value: string }) => {
    const employee = employees.find(
      (emp: EmployeeWithRelations) => emp.id === e.value
    );
    setSelectedEmployee(employee || null);
  };

  const handleClockIn = async () => {
    if (!selectedEmployee) {
      toast.current?.show({
        severity: "warn",
        summary: "Cảnh báo",
        detail: "Vui lòng chọn nhân viên",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await clockIn(selectedEmployee.id);

      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: result.message,
          life: 3000,
        });
        await loadTodayAttendance(); // Reload để cập nhật UI
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: result.error,
          life: 5000,
        });
      }
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Có lỗi xảy ra khi điểm danh",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedEmployee) {
      toast.current?.show({
        severity: "warn",
        summary: "Cảnh báo",
        detail: "Vui lòng chọn nhân viên",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await clockOut(selectedEmployee.id);

      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: result.message,
          life: 3000,
        });
        await loadTodayAttendance(); // Reload để cập nhật UI
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: result.error,
          life: 5000,
        });
      }
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Có lỗi xảy ra khi điểm danh",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Clock className="mr-3 w-8 h-8" />
              Hệ thống điểm danh
            </h1>
            <p className="text-blue-100">Điểm danh vào/ra cho nhân viên</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">
              {formatTime(currentTime)}
            </div>
            <div className="text-blue-200 text-sm">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form điểm danh */}
        <Card className="shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User className="mr-2 w-5 h-5 text-blue-600" />
              Chọn nhân viên điểm danh
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhân viên
                </label>
                <Dropdown
                  value={selectedEmployee?.id}
                  options={employeeOptions}
                  onChange={handleEmployeeSelect}
                  placeholder="Chọn nhân viên..."
                  className="w-full"
                  filter
                  filterBy="label"
                />
              </div>

              {selectedEmployee && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      image={selectedEmployee.image || undefined}
                      icon={!selectedEmployee.image ? "pi pi-user" : undefined}
                      size="large"
                      className="border-2 border-white shadow-md"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Building2 className="w-4 h-4 mr-1" />
                        {selectedEmployee.department?.name ||
                          "Chưa có phòng ban"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedEmployee.job?.job || "Chưa có chức vụ"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  icon={<LogIn className="w-4 h-4" />}
                  label="Điểm danh vào"
                  onClick={handleClockIn}
                  loading={loading}
                  disabled={!selectedEmployee}
                  className="flex-1 p-button-success"
                />
                <Button
                  icon={<LogOut className="w-4 h-4" />}
                  label="Điểm danh ra"
                  onClick={handleClockOut}
                  loading={loading}
                  disabled={!selectedEmployee}
                  className="flex-1 p-button-warning"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Thông tin điểm danh hôm nay */}
        <Card className="shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="mr-2 w-5 h-5 text-green-600" />
              Thông tin điểm danh hôm nay
            </h2>

            {selectedEmployee ? (
              <div className="space-y-4">
                {todayAttendance ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          Đã điểm danh
                        </span>
                      </div>
                      <Badge
                        value={
                          todayAttendance.status === "Present"
                            ? "Có mặt"
                            : "Đi muộn"
                        }
                        severity={
                          todayAttendance.status === "Present"
                            ? "success"
                            : "danger"
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">
                          Giờ vào
                        </div>
                        <div className="text-lg font-semibold text-blue-800">
                          {todayAttendance.clockIn
                            ? formatTime(new Date(todayAttendance.clockIn))
                            : "Chưa vào"}
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-sm text-orange-600 font-medium">
                          Giờ ra
                        </div>
                        <div className="text-lg font-semibold text-orange-800">
                          {todayAttendance.clockOut
                            ? formatTime(new Date(todayAttendance.clockOut))
                            : "Chưa ra"}
                        </div>
                      </div>
                    </div>

                    {todayAttendance.clockIn && todayAttendance.clockOut && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">
                          Tổng thời gian làm việc
                        </div>
                        <div className="text-lg font-semibold text-purple-800">
                          {(() => {
                            const clockIn = new Date(todayAttendance.clockIn);
                            const clockOut = new Date(todayAttendance.clockOut);
                            const diffMs =
                              clockOut.getTime() - clockIn.getTime();
                            const hours = Math.floor(diffMs / (1000 * 60 * 60));
                            const minutes = Math.floor(
                              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                            );
                            return `${hours} giờ ${minutes} phút`;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Chưa điểm danh hôm nay
                    </h3>
                    <p className="text-gray-500">
                      Nhân viên này chưa điểm danh hôm nay
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Chọn nhân viên
                </h3>
                <p className="text-gray-500">
                  Vui lòng chọn nhân viên để xem thông tin điểm danh
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Toast ref={toast} />
    </div>
  );
}

const AttendancePage = withPermission(PERMISSIONS.EMPLOYEES.VIEW, {
  redirectToNotFound: true,
})(AttendancePageComponent);

export default AttendancePage;
