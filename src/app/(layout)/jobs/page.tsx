"use client";

import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import JobFormModal from "./component/JobFormModal";
import { createJob } from "./actions";
import { JobFormData } from "./types";
import JobCard from "./component/JobCard";
import { getJobData } from "./component/helper";
import { JobData } from "./component/type";
import { withPermission } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";

function JobsPageComponent(): React.JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [jobData, setJobData] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef<Toast>(null);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const data = await getJobData();
      setJobData(data);
    } catch (error) {
      console.error("Error fetching job data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
  }, []);
  console.log("jobdata", jobData);

  const handleCreateJob = async (data: JobFormData) => {
    try {
      const result = await createJob(data);

      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Tạo công việc thành công!",
          life: 3000,
        });
        await fetchJobData(); // Refresh data after creating
        setShowForm(false); // Close the form
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: result.error || "Có lỗi xảy ra khi tạo công việc",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Có lỗi xảy ra khi tạo công việc",
        life: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      {/* Page Header */}
      <div className="bg-gradient-surface rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Quản lý công việc
            </h1>
            <p className="text-gray-600">
              Tạo và theo dõi tiến độ các công việc trong tổ chức
            </p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {jobData.length} công việc
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {jobData.filter((job) => job.status === "Active").length} đang
                  hoạt động
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {jobData.filter((job) => job.status === "Completed").length}{" "}
                  hoàn thành
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              label="Tạo công việc mới"
              icon="pi pi-plus"
              className="btn-primary"
              onClick={() => setShowForm(true)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Job Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-modern">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <i className="pi pi-clock text-yellow-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Đang hoạt động
                  </h3>
                  <p className="text-sm text-gray-500">
                    {jobData.filter((job) => job.status === "Active").length}{" "}
                    công việc
                  </p>
                </div>
              </div>
              <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
          <JobCard
            jobData={jobData.filter((job) => job.status === "Active")}
            onStatusUpdate={fetchJobData}
            isLoading={loading}
          />
        </div>

        <div className="card-modern">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <i className="pi pi-times-circle text-red-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Đã kết thúc
                  </h3>
                  <p className="text-sm text-gray-500">
                    {jobData.filter((job) => job.status === "Ended").length}{" "}
                    công việc
                  </p>
                </div>
              </div>
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
            </div>
          </div>
          <JobCard
            jobData={jobData.filter((job) => job.status === "Ended")}
            onStatusUpdate={fetchJobData}
            isLoading={loading}
          />
        </div>

        <div className="card-modern">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <i className="pi pi-check-circle text-green-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Đã hoàn thành
                  </h3>
                  <p className="text-sm text-gray-500">
                    {jobData.filter((job) => job.status === "Completed").length}{" "}
                    công việc
                  </p>
                </div>
              </div>
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <JobCard
            jobData={jobData.filter((job) => job.status === "Completed")}
            onStatusUpdate={fetchJobData}
            isLoading={loading}
          />
        </div>
      </div>

      <JobFormModal
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSubmit={handleCreateJob}
      />
    </div>
  );
}

export default withPermission(PERMISSIONS.JOBS.VIEW)(JobsPageComponent);
