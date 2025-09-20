"use client";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/app/(layout)/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "primereact/avatar";
import { getJobById } from "@/app/(layout)/jobs/actions";
import { Jobs } from "@/app/(layout)/jobs/types";
import { ChevronDown } from "lucide-react";
// Props interface cho Topbar component
interface TopbarProps {
  className?: string;
}

const Topbar: React.FC<TopbarProps> = () => {
  const { selectedItem } = useAppContext();
  const { user, logout } = useAuth();
  const [job, setJob] = useState<Jobs | null>(null);
  const menuRef = useRef<Menu>(null);

  const handleLogout = async () => {
    await logout();
  };

  const menuItems: MenuItem[] = [
    {
      template: () => (
        <div
          className="flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 cursor-pointer w-full transition-colors duration-200 rounded-lg"
          onClick={handleLogout}
        >
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <i className="pi pi-sign-out text-red-600 text-sm"></i>
          </div>
          <span className="text-red-600 font-medium">Đăng xuất</span>
        </div>
      ),
    },
  ];
  useEffect(() => {
    // Chỉ fetch job khi user đã load và có data
    if (!user) {
      console.log("User not loaded yet, skipping job fetch");
      return;
    }

    const fetJob = async () => {
      if (user?.employee?.jobId) {
        try {
          const job = await getJobById(user.employee.jobId);
          setJob(job);
        } catch (error) {
          console.error("Error fetching job:", error);
        }
      } else {
        console.log("User has no jobId");
      }
    };

    fetJob();
  }, [user]);
  const handleUserClick = (event: React.MouseEvent) => {
    menuRef.current?.toggle(event);
  };

  return (
    <div className="bg-white backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Page Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gradient">{selectedItem}</h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <span>•</span>
            <span>
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-4 space-x-4">
          {/* Notifications */}
          <Button
            icon="pi pi-bell"
            className="!p-2 !bg-gray-50 !text-gray-600 hover:!bg-gray-100 !border-gray-200 !rounded-xl transition-all duration-200"
            outlined
          />

          {/* User Dropdown */}
          <div className="relative">
            <Button
              onClick={handleUserClick}
              className="!flex !items-center !gap-3 !p-3 !bg-white hover:!bg-gray-50 !border-gray-200 !rounded-xl !shadow-sm transition-all duration-200"
            >
              <div className="relative">
                <Avatar
                  image={user?.employee?.image || ""}
                  icon="pi pi-user"
                  shape="circle"
                  className="!w-10 !h-10 border-2 border-white shadow-md"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>

              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-sm font-semibold text-gray-800">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {job?.job || "Chức vụ"}
                </span>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
            </Button>

            <Menu
              ref={menuRef}
              model={menuItems}
              popup
              className="!mt-2 !shadow-xl !border-gray-200 !rounded-xl overflow-hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
