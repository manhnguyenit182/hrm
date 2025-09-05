"use client";
import { UserRound, LogOut } from "lucide-react";
import { Button } from "primereact/button";
import React from "react";
import { useAppContext } from "@/app/(layout)/AppContext";
import { useAuth } from "@/hooks/useAuth";

// Props interface cho Topbar component
interface TopbarProps {
  className?: string;
}

const Topbar: React.FC<TopbarProps> = ({ className = "" }) => {
  const { selectedItem } = useAppContext();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={`bg-white shadow-md flex border m-5 justify-between items-center px-4 py-2 ${className}`}
    >
      <b>{selectedItem}</b>

      <div className="flex items-center gap-3">
        {/* User info */}
        <div className="flex items-center gap-2">
          <UserRound className="w-5 h-5" />
          <span className="text-sm font-medium">
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.email || "User"}
          </span>
        </div>

        {/* Logout button */}
        <Button
          onClick={handleLogout}
          className="p-2 text-red-600 hover:bg-red-50"
          tooltip="Đăng xuất"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Topbar;
