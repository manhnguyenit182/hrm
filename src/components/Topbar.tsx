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

const Topbar: React.FC<TopbarProps> = ({ className = "" }) => {
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
          className="flex items-center gap-2 p-3 text-red-600 hover:bg-gray-100 cursor-pointer w-full"
          onClick={handleLogout}
        >
          <i className="pi pi-sign-out text-red-600"></i>
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
    <div
      className={`bg-white  flex  m-5 justify-between items-center px-4 py-2 ${className}`}
    >
      <b className="text-xl">{selectedItem}</b>

      <div className="flex items-center gap-3">
        {/* User info with dropdown menu */}
        <div className="relative">
          <Button
            onClick={handleUserClick}
            className="flex items-center gap-2 !p-2 !bg-white  !text-black hover:!bg-gray-100 !border-gray-300"
          >
            <Avatar
              image={user?.employee?.image || ""}
              icon="pi pi-user"
              shape="square"
            />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || "User"}
              </span>
              <small className="text-gray-400">{job?.job}</small>
            </div>
            <ChevronDown />
          </Button>

          <Menu ref={menuRef} model={menuItems} popup className="mt-2" />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
