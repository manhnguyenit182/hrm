
import { BriefcaseBusiness } from "lucide-react"
import { JobData } from "./type"
import { Chip } from "primereact/chip"



export default function JobCard({ children, jobData }: { children: React.ReactNode, jobData: JobData[] }): React.JSX.Element {



  return (
    <div className="h-[70vh] w-3/10  rounded-lg border border-gray-200 flex flex-col">
      <div className="pb-4">{children}</div>
      <div className="flex flex-col overflow-auto gap-4 p-4">
        {jobData.map((job) => (
          // tung cai card nho
          <div key={job.id} className="p-2 border-b border-gray-200 ">
            <div className="flex mb-4">
              <BriefcaseBusiness />
              <div className="flex flex-col"><h3 className="font-semibold">{job.job}</h3>
                <span className="text-sm text-gray-600">{job.department}</span>
              </div>
            </div>
            <div className="flex mb-5 flex-nowrap gap-3">
              <Chip label={job.department} style={{ padding: '2px 8px', fontSize: '10px' }} />
              <Chip label={job.type} style={{ padding: '2px 8px', fontSize: '10px' }} />
              <Chip label={job.typeWork} style={{ padding: '2px 8px', fontSize: '10px' }} />
            </div>
            <div className="flex justify-end mb-2">{job.salary.toLocaleString("vi-VN")}{" /Tháng"}</div>
          </div>
        ))}
      </div>
    </div>
  )
}