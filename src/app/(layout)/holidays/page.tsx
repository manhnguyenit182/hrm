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

export default function HolidaysPage() {
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
    <div className="p-5 h-full shadow-md rounded-lg border border-gray-200">
      <header className="flex justify-end gap-4 mb-4">
        <Button
          label="Thêm ngày lễ"
          className="btn-primary"
          onClick={() => setVisible(true)}
          icon="pi pi-plus"
        />
        <Dialog
          header="Thêm phòng ban"
          visible={visible}
          style={{ width: "50vw" }}
          onHide={() => {
            if (!visible) return;
            setVisible(false);
            reset();
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="field flex flex-col mb-3">
              <label htmlFor="name">Tên ngày lễ</label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => <InputText id="title" {...field} />}
              />
            </div>
            <div className="field flex flex-col mb-3">
              <label htmlFor="date">Ngày lễ</label>
              <Controller
                name="date"
                control={control}
                render={({ field, fieldState }) => (
                  <Calendar
                    {...field}
                    value={field.value}
                    dateFormat="dd/mm/yy"
                    className={` ${fieldState.error ? "p-invalid" : ""}`}
                    showIcon
                  />
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="btn-primary" label="Thêm" />
            </div>
          </form>
        </Dialog>
      </header>

      <main>
        <DataTable
          value={holidays}
          loading={loading}
          footer={<DataTableFooter />}
          className="p-datatable-sm"
          emptyMessage="No employees found"
        >
          <Column
            body={(rowData) => (
              <div
                style={{
                  borderLeft:
                    rowData.date &&
                    dateToday.getTime() < new Date(rowData.date).getTime()
                      ? "4px solid var(--color-primary-500)"
                      : "4px solid var(--color-muted)",
                }}
              >
                {rowData.date
                  ? new Date(rowData.date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "N/A"}
              </div>
            )}
            header="Date"
          />
          <Column
            body={(rowData) =>
              rowData.date
                ? rowData.date.toLocaleDateString("vi-VN", {
                    weekday: "long",
                  })
                : "N/A"
            }
            header="Day"
          />
          <Column field="title" header="Holiday Name" />
        </DataTable>
      </main>

      <Toast ref={toast} />
    </div>
  );
}
