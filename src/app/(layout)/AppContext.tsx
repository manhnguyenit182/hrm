"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";

type AppContextType = {
  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;
  toggleSelected: (item: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mapping từ pathname đến menu item label
const pathToMenuMap: Record<string, string> = {
  "/": "Bảng điều khiển",
  "/employees": "Nhân viên",
  "/departments": "Phòng ban",
  "/attendance": "Chấm công",
  "/payroll": "Lương",
  "/jobs": "Công việc",
  "/holidays": "Ngày nghỉ",
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleSelected = (item: string) => {
    setSelectedItem(item);
  };

  // Auto-select item based on current pathname
  useEffect(() => {
    const currentMenuItem = pathToMenuMap[pathname] || pathToMenuMap["/"];
    setSelectedItem(currentMenuItem);
  }, [pathname]);

  useEffect(() => {
    console.log("Selected item changed:", selectedItem);
  }, [selectedItem]);

  return (
    <AppContext.Provider
      value={{ selectedItem, setSelectedItem, toggleSelected }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
