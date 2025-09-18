"use client";
import { Holidays } from "./types";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { useEffect, useRef, useState } from "react";
import { addHoliday, getHolidays } from "./actions";
import { useForm, Controller } from "react-hook-form";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import { useCheckPermission } from "@/hooks/usePermission";

function HolidaysPageComponent() {
  const [holidays, setHolidays] = useState<Holidays[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);
  const { control, handleSubmit, reset } = useForm<Holidays>({
    defaultValues: {
      title: "",
      date: null,
    },
  });
  const dateToday = new Date();
  const toast = useRef<Toast>(null);
  useEffect(() => {
    const fetchHolidays = async () => {
      const holidays = await getHolidays();
      setHolidays(holidays);
      setLoading(false);
    };

    fetchHolidays();
  }, []);
  const DataTableFooter = () => {
    return (
      <div className="flex gap-4 items-center">
        <div className="w-4 h-4 rounded-full bg-[color:var(--color-primary-500)]"></div>
        <span className="font-bold">Sắp tới</span>
        <div className="w-4 h-4 rounded-full bg-[color:var(--color-muted)]"></div>
        <span className="font-bold">Ngày nghỉ đã qua</span>
      </div>
    );
  };
  const canCreateHoliday = useCheckPermission(PERMISSIONS.HOLIDAYS.CREATE);
  const onSubmit = async (data: Holidays) => {
    try {
      const newHoliday = await addHoliday(data);
      setHolidays((prevHolidays) => [...prevHolidays, newHoliday]);
      setVisible(false);
      reset();
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-surface rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Quản lý ngày nghỉ lễ
            </h1>
            <p className="text-gray-600">
              Thiết lập và quản lý các ngày nghỉ lễ trong năm
            </p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {holidays.length} ngày nghỉ lễ
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {
                    holidays.filter(
                      (h) =>
                        h.date &&
                        dateToday.getTime() < new Date(h.date).getTime()
                    ).length
                  }{" "}
                  sắp tới
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              label="Thêm ngày nghỉ lễ"
              icon="pi pi-plus"
              className="btn-primary"
              disabled={!canCreateHoliday}
              onClick={() => setVisible(true)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card-modern overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="pi pi-calendar text-blue-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Danh sách ngày nghỉ lễ
            </h3>
          </div>
        </div>

        <DataTable
          value={holidays}
          loading={loading}
          footer={<DataTableFooter />}
          className="modern-datatable"
          emptyMessage="Không tìm thấy ngày nghỉ lễ nào"
          rows={10}
        >
          <Column
            header="Ngày nghỉ lễ"
            body={(rowData) => (
              <div className="flex items-center space-x-3">
                <div
                  className={`w-1 h-12 rounded-full ${
                    rowData.date &&
                    dateToday.getTime() < new Date(rowData.date).getTime()
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {rowData.date
                      ? new Date(rowData.date).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {rowData.date &&
                    dateToday.getTime() < new Date(rowData.date).getTime()
                      ? "Sắp tới"
                      : "Đã qua"}
                  </p>
                </div>
              </div>
            )}
            style={{ minWidth: "200px" }}
          />
          <Column
            header="Thứ"
            body={(rowData) => (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {rowData.date
                  ? rowData.date.toLocaleDateString("vi-VN", {
                      weekday: "long",
                    })
                  : "N/A"}
              </span>
            )}
            style={{ minWidth: "150px" }}
          />
          <Column
            field="title"
            header="Tên ngày lễ"
            body={(rowData) => (
              <div>
                <p className="font-semibold text-gray-800">{rowData.title}</p>
              </div>
            )}
            style={{ minWidth: "200px" }}
          />
        </DataTable>
      </div>

      {/* Add Holiday Dialog */}
      <Dialog
        header="Thêm ngày nghỉ lễ mới"
        visible={visible}
        style={{ width: "500px", maxWidth: "90vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
          reset();
        }}
        modal
        className="modern-dialog"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tên ngày lễ <span className="text-red-500">*</span>
            </label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  placeholder="Ví dụ: Tết Nguyên Đán"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Ngày <span className="text-red-500">*</span>
            </label>
            <Controller
              name="date"
              control={control}
              render={({ field, fieldState }) => (
                <Calendar
                  {...field}
                  value={field.value}
                  dateFormat="dd/mm/yy"
                  className={`w-full ${fieldState.error ? "p-invalid" : ""}`}
                  showIcon
                  placeholder="Chọn ngày nghỉ lễ"
                  inputClassName="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              label="Hủy"
              icon="pi pi-times"
              className="btn-secondary"
              onClick={() => {
                setVisible(false);
                reset();
              }}
            />
            <Button
              type="submit"
              label="Thêm mới"
              icon="pi pi-plus"
              className="btn-primary"
            />
          </div>
        </form>
      </Dialog>

      <Toast ref={toast} />
    </div>
  );
}

export default withPermission(PERMISSIONS.HOLIDAYS.VIEW)(HolidaysPageComponent);
