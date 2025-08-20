"use client";
import React, { useEffect } from "react";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { getDepartments, DepartmentType } from "./actions";



export default function DepartmentsPage(): React.JSX.Element {
  const [departments, setDepartments] = React.useState<DepartmentType[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const data = await getDepartments();
      setDepartments(data);
      console.log(data);
    };
    fetchDepartments();
  }, []);

  return (
    <div className="flex flex-col h-full border">
      {/* Header  */}
      <div className=" p-5 pb-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <IconField iconPosition="left" className="flex-1">
            <InputIcon className="pi pi-search" />
            <InputText placeholder="Tìm kiếm phòng ban" className="w-[35%]" />
          </IconField>
          <Button
            label="Thêm phòng ban"
            icon="pi pi-plus"
            className="px-4 py-2"
          />
        </div>
      </div>

      {/* phan scroll và data */}
      <div className="flex-1 p-5 min-h-0 ">
        {/* noi dung scroll */}
        <div className="h-full overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-1 md:grid-rows-2 gap-4 ">
            {departments.map(department => (
              <div
                key={department.id}
                className=" h-full border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
              >
                {/* thẻ tiêu đề */}
                <header className="flex justify-between items-center ">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{department.name}</h3>
                    <p>20 người</p>
                    <p className="text-gray-600 text-sm mb-3"></p>
                  </div>
                  <Button label="Xem tất cả" text />
                </header>
                <hr className="border-gray-300" />
                <div>
                  {/* ra danh sach nhan vien */}
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque molestias perferendis veniam vel asperiores blanditiis, inventore dolore fuga sed! Fugiat nemo omnis perspiciatis, vitae veniam inventore nam sint adipisci explicabo.</p>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque molestias perferendis veniam vel asperiores blanditiis, inventore dolore fuga sed! Fugiat nemo omnis perspiciatis, vitae veniam inventore nam sint adipisci explicabo.</p>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque molestias perferendis veniam vel asperiores blanditiis, inventore dolore fuga sed! Fugiat nemo omnis perspiciatis, vitae veniam inventore nam sint adipisci explicabo.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}