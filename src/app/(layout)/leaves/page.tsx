"use client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { createLeaveRequest } from "./actions";
import { FormLeaveRequestType } from "./types";
import { useAuth } from "@/hooks/useAuth";
export default function LeavesPage() {
  const { user } = useAuth();
  const [visible, setVisible] = useState<boolean>(false);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      dateRange: [],
      reason: "",
      type: "",
      status: "pending",
    },
  });
  const onSubmit = async (data: FormLeaveRequestType) => {
    try {
      if (!user) {
        console.error("User is not authenticated.");
        return;
      }
      console.log("User:", user);
      const [startDate, endDate] = data.dateRange;

      await createLeaveRequest({
        reason: data.reason,
        type: data.type,
        status: data.status,
        employeeId: user?.employee?.id ?? "",
        startDate: startDate,
        endDate: endDate,
      });
      reset();
      setVisible(false);
    } catch (error) {
      console.error("Error adding leave request:", error);
    }
  };
  return (
    <div className="p-5 h-full shadow-md rounded-lg border border-gray-200">
      <Button
        label="Thêm ngày nghỉ phép"
        className="btn-primary"
        onClick={() => setVisible(true)}
      />
      {/* tao ra cai form co validate */}

      <Dialog
        header="Thêm ngày nghỉ phép"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => setVisible(false)}
      >
        {/* submit thi gui du lieu len db vao bang leaves */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="field flex flex-col mb-3">
            <label htmlFor="dateRange">Chọn khoảng thời gian</label>
            <Controller
              name="dateRange"
              control={control}
              render={({ field }) => (
                <Calendar
                  value={field.value}
                  onChange={(e) => {
                    console.log("Selected date range:", e.value);
                    field.onChange(e.value);
                  }}
                  selectionMode="range"
                  readOnlyInput
                  hideOnRangeSelection
                />
              )}
            />
          </div>

          <div className="field flex flex-col mb-3">
            <label htmlFor="name">Loại phép</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="type"
                  {...field}
                  options={["Phép năm", "Nghỉ không lương"]}
                />
              )}
            />
          </div>

          <div className="field flex flex-col mb-3">
            <label htmlFor="name">Lý do nghỉ</label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => <InputText id="reason" {...field} />}
            />
          </div>
          <Button type="submit">Gửi</Button>
        </form>
      </Dialog>
    </div>
  );
}
