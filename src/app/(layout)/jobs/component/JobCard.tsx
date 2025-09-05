import { BriefcaseBusiness } from "lucide-react";
import { JobData } from "./type";
import { Chip } from "primereact/chip";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { updateJobStatus } from "../actions";
import { Toast } from "primereact/toast";
import { useRef } from "react";

export default function JobCard({
  children,
  jobData,
  onStatusUpdate,
}: {
  children: React.ReactNode;
  jobData: JobData[];
  onStatusUpdate?: () => void;
}): React.JSX.Element {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "Active" | "Ended" | "Completed" | null
  >(null);
  const toast = useRef<Toast>(null);

  const statusOptions = [
    { label: "Đang hoạt động", value: "Active" },
    { label: "Đã kết thúc", value: "Ended" },
    { label: "Đã hoàn thành", value: "Completed" },
  ];

  const handleClick = (e: React.MouseEvent, job: JobData) => {
    e.stopPropagation();
    setSelectedJob(job);
    setSelectedStatus(job.status);
    setShowStatusDialog(true);
  };
  const handleUpdateStatus = async () => {
    if (!selectedJob || !selectedStatus) return;

    try {
      const result = await updateJobStatus(selectedJob.id, selectedStatus);

      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Cập nhật trạng thái công việc thành công!",
          life: 3000,
        });
        setShowStatusDialog(false);
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: result.error || "Có lỗi xảy ra khi cập nhật trạng thái",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Có lỗi xảy ra khi cập nhật trạng thái",
        life: 3000,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="h-[65vh] w-3/10  rounded-lg border border-gray-200 flex flex-col">
        <div className="pb-4">{children}</div>
        <div className="flex flex-col overflow-auto gap-4 p-4">
          {jobData.map((job) => (
            // tung cai card nho
            <div
              key={job.id}
              onClick={(e) => handleClick(e, job)}
              className="p-2 bg-gray-100 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex mb-4 gap-5 items-center">
                <BriefcaseBusiness className="ml-4" />
                <div className="flex flex-col">
                  <h3 className="font-semibold">{job.job}</h3>
                  <span className="text-sm text-gray-600">
                    {job.department}
                  </span>
                </div>
              </div>
              <div className="flex mb-5 flex-nowrap gap-3">
                <Chip
                  label={job.department}
                  style={{
                    padding: "2px 8px",
                    fontSize: "10px",
                    color: "white",
                    backgroundColor: "var(--color-primary-500)",
                  }}
                />
                <Chip
                  label={job.type}
                  style={{
                    padding: "2px 8px",
                    fontSize: "10px",
                    color: "white",
                    backgroundColor: "var(--color-primary-500)",
                  }}
                />
                <Chip
                  label={job.typeWork}
                  style={{
                    padding: "2px 8px",
                    fontSize: "10px",
                    color: "white",
                    backgroundColor: "var(--color-primary-500)",
                  }}
                />
              </div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <b>{job.salary.toLocaleString("vi-VN")}</b> {" /Tháng"}
                </div>
                {/* <Button
                  label="Chỉnh sửa trạng thái"
                  icon="pi pi-pencil"
                  size="small"
                  text
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(job);
                    setSelectedStatus(job.status);
                    setShowStatusDialog(true);
                  }}
                /> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        header="Chỉnh sửa trạng thái công việc"
        visible={showStatusDialog}
        style={{ width: "450px" }}
        onHide={() => setShowStatusDialog(false)}
        footer={
          <div>
            <Button
              label="Hủy"
              icon="pi pi-times"
              text
              onClick={() => setShowStatusDialog(false)}
            />
            <Button
              label="Cập nhật"
              icon="pi pi-check"
              onClick={handleUpdateStatus}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <strong>Công việc:</strong> {selectedJob?.job}
          </div>
          <div>
            <strong>Phòng ban:</strong> {selectedJob?.department}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="status">Trạng thái:</label>
            <Dropdown
              id="status"
              value={selectedStatus}
              options={statusOptions}
              onChange={(e) => setSelectedStatus(e.value)}
              placeholder="Chọn trạng thái"
              className="w-full"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
