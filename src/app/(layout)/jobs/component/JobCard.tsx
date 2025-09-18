import { BriefcaseBusiness } from "lucide-react";
import { JobData } from "./type";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { updateJobStatus } from "../actions";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { Skeleton } from "primereact/skeleton";

export default function JobCard({
  jobData,
  onStatusUpdate,
  isLoading = false,
}: {
  jobData: JobData[];
  onStatusUpdate?: () => void;
  isLoading?: boolean;
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

  // Skeleton component for job items
  const JobItemSkeleton = () => (
    <div className="p-2 bg-gray-100 rounded-lg">
      <div className="flex mb-4 gap-5 items-center">
        <Skeleton shape="circle" size="2rem" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton width="8rem" height="1rem" />
          <Skeleton width="6rem" height="0.8rem" />
        </div>
      </div>
      <div className="flex mb-5 flex-nowrap gap-3">
        <Skeleton width="4rem" height="1.5rem" borderRadius="1rem" />
        <Skeleton width="3rem" height="1.5rem" borderRadius="1rem" />
        <Skeleton width="5rem" height="1.5rem" borderRadius="1rem" />
      </div>
      <div className="flex justify-between items-center mb-2">
        <Skeleton width="6rem" height="1rem" />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <div className="flex flex-col overflow-hidden">
        <div className="flex flex-col overflow-auto space-y-4 p-4 max-h-96">
          {isLoading ? (
            // Show skeleton items when loading
            Array.from({ length: 3 }, (_, index) => (
              <JobItemSkeleton key={index} />
            ))
          ) : jobData.length === 0 ? (
            // Show empty state
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="pi pi-briefcase text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">Không có công việc nào</p>
            </div>
          ) : (
            // Show actual job data when not loading
            jobData.map((job) => (
              // Enhanced job card
              <div
                key={job.id}
                onClick={(e) => handleClick(e, job)}
                className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <BriefcaseBusiness className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate mb-1">
                      {job.job}
                    </h3>
                    <p className="text-sm text-gray-500">{job.department}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                      setSelectedStatus(job.status);
                      setShowStatusDialog(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <i className="pi pi-ellipsis-v text-gray-400"></i>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                    <i className="pi pi-building mr-1 text-xs"></i>
                    {job.department}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800">
                    <i className="pi pi-users mr-1 text-xs"></i>
                    {job.type}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
                    <i className="pi pi-map-marker mr-1 text-xs"></i>
                    {job.typeWork}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {job.salary.toLocaleString("vi-VN")} VNĐ
                    </p>
                    <p className="text-sm text-gray-500">Mỗi tháng</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                        job.status === "Active"
                          ? "bg-yellow-100 text-yellow-800"
                          : job.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${
                          job.status === "Active"
                            ? "bg-yellow-400"
                            : job.status === "Completed"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      ></div>
                      {job.status === "Active"
                        ? "Hoạt động"
                        : job.status === "Completed"
                        ? "Hoàn thành"
                        : "Kết thúc"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog
        header="Chỉnh sửa trạng thái công việc"
        visible={showStatusDialog}
        style={{ width: "450px", maxWidth: "90vw" }}
        onHide={() => setShowStatusDialog(false)}
        modal
        className="modern-dialog"
        footer={
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              label="Hủy"
              icon="pi pi-times"
              className="btn-secondary"
              onClick={() => setShowStatusDialog(false)}
            />
            <Button
              label="Cập nhật"
              icon="pi pi-check"
              className="btn-primary"
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
