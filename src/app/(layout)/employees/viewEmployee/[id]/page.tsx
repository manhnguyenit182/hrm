"use client";

import React, { useState, useEffect } from "react";
import { EmployeeWithRelations } from "../../types";
import { getEmployeeById } from "../../actions";
import { Avatar } from "primereact/avatar";
import {
  BriefcaseBusiness,
  CalendarCheck,
  FileText,
  Mail,
  ScrollText,
  SquareChartGantt,
  UserRound,
  Lock,
} from "lucide-react";
import { Menu } from "primereact/menu";
import { TabMenu } from "primereact/tabmenu";
import { classNames } from "primereact/utils";

interface EditEmployeePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("userInfo");
  let fullName;

  const menuItems = [
    {
      label: "Thông tin cá nhân",
      icon: <UserRound />,
      classNames: classNames(
        "p-menuitem",
        selectedMenuItem === "userInfo" ? "bg-gray-200" : ""
      ),
      command: () => {
        setSelectedMenuItem("userInfo");
      },
    },
    {
      label: "Chấm công",
      icon: <CalendarCheck />,
      command: () => {
        setSelectedMenuItem("attendance");
      },
    },
    {
      label: "Dự án",
      icon: <ScrollText />,
      command: () => {
        setSelectedMenuItem("project");
      },
    },
    {
      label: "Nghỉ phép",
      icon: <SquareChartGantt />,
      command: () => {
        setSelectedMenuItem("leave");
      },
    },
  ];

  // Đảm bảo userInfo được selected khi component mount
  useEffect(() => {
    setSelectedMenuItem("userInfo");
  }, []);
  const profileMenu = [
    {
      icon: <UserRound className="mr-2 text-[var(--color-primary-500)]" />,
      label: "Thông tin cá nhân",
    },
    {
      icon: (
        <BriefcaseBusiness className="mr-2 text-[var(--color-primary-500)]" />
      ),
      label: "Thông tin nghề nghiệp",
    },
    {
      icon: <FileText className="mr-2 text-[var(--color-primary-500)]" />,
      label: "Tài liệu",
    },
    {
      icon: <Lock className="mr-2 text-[var(--color-primary-500)]" />,
      label: "Quyền truy cập tài khoản",
    },
  ];

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        // Await params trước khi sử dụng
        const resolvedParams = await params;
        const employeeId = resolvedParams.id;

        // Sử dụng getEmployeeById action
        const foundEmployee = await getEmployeeById(employeeId);

        setEmployee(foundEmployee);
      } catch (error) {
        console.error("Error fetching employee:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [params]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!employee) {
    return <div>Employee not found</div>;
  } else {
    fullName = employee.firstName + " " + employee.lastName;
    console.log(employee);
  }

  return (
    <div className="border border-gray-200 rounded-lg h-full shadow">
      <div className="flex flex-col p-5">
        <header className=" flex flex-1 justify-between">
          <nav className="flex">
            {employee.image && <Avatar image={employee.image} size="xlarge" />}
            <div className="info ml-4">
              <h2 className="text-xl font-bold">{fullName}</h2>
              <div className="flex items-center gap-1.5">
                <BriefcaseBusiness />
                <p className="text-sm ">{employee.job?.job}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail />
                <p className="text-sm ">{employee.email}</p>
              </div>
            </div>
          </nav>
        </header>
        <hr className="mt-4 mb-4 border-gray-400" />
        <main className="flex ">
          <Menu model={menuItems} className={"mr-5"} />
          <section className="flex-1">
            {selectedMenuItem === "userInfo" && (
              <div>
                <TabMenu
                  model={profileMenu}
                  activeIndex={activeIndex}
                  onTabChange={(e) => setActiveIndex(e.index)}
                  className="tab-menu-primary"
                />
                <div className="tab-content">
                  {activeIndex === 0 && (
                    <div className="flex flex-col">
                      <div className="flex mt-4">
                        <div className="flex-1/3">
                          <span className="text-gray-400">First Name</span>
                          <p>{employee.firstName}</p>
                        </div>
                        <div className="flex-1/3">
                          <span className="text-gray-400">Last Name</span>
                          <p>{employee.lastName}</p>
                        </div>
                        <div className="flex-1/3">
                          <span className="text-gray-400">Phone</span>
                          <p>{employee.phone}</p>
                        </div>
                      </div>

                      <hr className="mt-4 mb-4 border-gray-400" />

                      <div className="flex ">
                        <div className="flex-1/3">
                          <span className="text-gray-400">Email</span>
                          <p>{employee.email}</p>
                        </div>
                        <div className="flex-1/3">
                          <span className="text-gray-400">Date of Birth</span>
                          {employee.birthday && (
                            <p>{employee.birthday.toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="flex-1/3">
                          <span className="text-gray-400">Married status</span>
                          <p>{employee.maritalStatus}</p>
                        </div>
                      </div>

                      <hr className="mt-4 mb-4 border-gray-400" />

                      <div className="flex ">
                        <div className="flex-1/3">
                          <span className="text-gray-400">Gender</span>
                          <p>{employee.gender}</p>
                        </div>
                        <div className="flex-2/3">
                          <span className="text-gray-400">Address</span>
                          <p>{employee.address}</p>
                        </div>
                      </div>

                      <hr className="mt-4 mb-4 border-gray-400" />

                      <div className="flex ">
                        <div className="flex-1/3">
                          <span className="text-gray-400">State</span>
                          <p>{employee.state}</p>
                        </div>
                        <div className="flex-1/3">
                          <span className="text-gray-400">City</span>
                          <p>{employee.city}</p>
                        </div>
                        <div className="flex-1/3">
                          <span className="text-gray-400">Nationality</span>
                          <p>{employee.nationality}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeIndex === 1 && (
                    <div>
                      <div className="flex flex-col">
                        <div className="flex ">
                          <div className="flex-1/3">
                            <span className="text-gray-400">Phòng ban</span>
                            <p>{employee.department?.name}</p>
                          </div>
                          <div className="flex-1/3">
                            <span className="text-gray-400">Chức vụ</span>
                            <p>{employee.position?.title}</p>
                          </div>
                          <div className="flex-1/3">
                            <span className="text-gray-400">Công việc</span>
                            <p>{employee.job?.job}</p>
                          </div>
                        </div>

                        <hr className="mt-4 mb-4 border-gray-400" />

                        <div className="flex ">
                          <div className="flex-1/3">
                            <span className="text-gray-400">Loại hợp đồng</span>
                            <p>{employee.job?.type}</p>
                          </div>
                          <div className="flex-1/3">
                            <span className="text-gray-400">Ngày bắt đầu</span>
                            {employee.startDate && (
                              <p>{employee.startDate.toLocaleDateString()}</p>
                            )}
                          </div>
                          <div className="flex-1/3"></div>

                          <hr className="mt-4 mb-4 border-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                  {activeIndex === 2 && <div>Tài liệu Content</div>}
                  {activeIndex === 3 && (
                    <div>Quyền truy cập tài khoản Content</div>
                  )}
                </div>
              </div>
            )}
            {selectedMenuItem === "attendance" && <div>Attendance Content</div>}
            {selectedMenuItem === "project" && <div>Project Content</div>}
            {selectedMenuItem === "leave" && <div>Leave Content</div>}
          </section>
        </main>
      </div>
    </div>
  );
}
