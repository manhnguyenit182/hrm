"use client";

import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import JobFormModal from "./component/JobFormModal";
import { createJob } from "./actions";
import { JobFormData } from "./types";
import JobCard from "./component/JobCard";
import { getJobData } from "./component/helper";
import { JobData } from "./component/type";

export default function JobsPage(): React.JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [jobData, setJobData] = useState<JobData[]>([]);
  const toast = useRef<Toast>(null);

  const fetchJobData = async () => {
    const data = await getJobData();
    setJobData(data);
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
    <>
      <Toast ref={toast} />
      <div className="flex flex-col h-full shadow-md rounded-lg border border-gray-200">
        {/* header */}
        <div className=" p-5 pb-4 ">
          <div className="flex flex-col sm:flex-row gap-3">
            <IconField iconPosition="left" className="flex-1">
              <InputIcon className="pi pi-search" />
              <InputText placeholder="Tìm kiếm" className="w-[35%]" />
            </IconField>
            <Button
              label="Tạo công việc"
              icon="pi pi-plus"
              className="px-4 py-2"
              onClick={() => setShowForm(true)}
            />
          </div>
        </div>
        {/* body */}
        <div className="flex-1  ">
          <div className=" flex justify-around  items-center">
            <JobCard
              jobData={jobData.filter((job) => job.status === "Active")}
              onStatusUpdate={fetchJobData}
            >
              <div className="flex items-center gap-2 m-4">
                <div className="h-3 w-3 rounded-2xl bg-yellow-500 inline-block"></div>
                Đang hoạt động
              </div>
            </JobCard>
            <JobCard
              jobData={jobData.filter((job) => job.status === "Ended")}
              onStatusUpdate={fetchJobData}
            >
              <div className="flex items-center gap-2 m-4">
                <div className="h-3 w-3 rounded-2xl bg-red-500 inline-block"></div>
                Đã kết thúc
              </div>
            </JobCard>
            <JobCard
              jobData={jobData.filter((job) => job.status === "Completed")}
              onStatusUpdate={fetchJobData}
            >
              <div className="flex items-center gap-2 m-4">
                <div className="h-3 w-3 rounded-2xl bg-green-500 inline-block"></div>
                Đã hoàn thành
              </div>
            </JobCard>
          </div>
        </div>
      </div>

      <JobFormModal
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSubmit={handleCreateJob}
      />
    </>
  );
}
