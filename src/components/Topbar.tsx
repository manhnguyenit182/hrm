'use client'
import { UserRound } from "lucide-react";
import { Button } from 'primereact/button';
import React from "react";
import { useAppContext } from "@/app/(layout)/AppContext";

// Props interface cho Topbar component
interface TopbarProps {
  className?: string;
}

const Topbar: React.FC<TopbarProps> = ({ className = "" }) => {
  const { selectedItem } = useAppContext();
  return (
    <div className={`bg-white shadow-md flex border m-5 justify-end px-4 py-2 ${className}`}>
      {selectedItem}
      <Button className="p-2">
        <UserRound className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Topbar;