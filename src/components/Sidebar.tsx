"use client";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CircleDollarSign,
  BriefcaseBusiness,
  CalendarDays,
  FileCheck,
  History,
  CalendarOff,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import { useAppContext } from "@/app/(layout)/AppContext";
import { useCheckPermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";

// Interface cho menu item
interface MenuItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  permission?: string; // Thêm permission cho từng menu item
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

// Props interface cho Sidebar component (nếu sau này cần truyền props)

// Data cho menu items với type safety
const menuGroups: MenuGroup[] = [
  {
    title: "Quản lý chính",
    items: [
      {
        href: "/",
        label: "Bảng điều khiển",
        icon: <LayoutDashboard className="inline w-4 h-4 mr-2" />,
        // Dashboard không cần permission
      },
      {
        href: "/employees",
        label: "Nhân viên",
        icon: <Users className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.EMPLOYEES.CREATE,
      },
      {
        href: "/departments",
        label: "Phòng ban",
        icon: <Building2 className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.DEPARTMENTS.VIEW,
      },
      {
        href: "/jobs",
        label: "Công việc",
        icon: <BriefcaseBusiness className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.JOBS.VIEW,
      },
    ],
  },
  {
    title: "Chấm công & Lương",
    items: [
      {
        href: "/attendance",
        label: "Chấm công",
        icon: <CalendarCheck className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.ATTENDANCE.CREATE,
      },
      {
        href: "/payroll",
        label: "Lương",
        icon: <CircleDollarSign className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.PAYROLL.VIEW,
      },
    ],
  },
  {
    title: "Nghỉ phép & Lịch",
    items: [
      {
        href: "/holidays",
        label: "Ngày nghỉ",
        icon: <CalendarDays className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.HOLIDAYS.VIEW,
      },
      {
        href: "/manageLeaves",
        label: "Duyệt phép",
        icon: <FileCheck className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.LEAVES.APPROVE,
      },
      {
        href: "/leaves",
        label: "Đơn nghỉ phép",
        icon: <CalendarOff className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.LEAVES.VIEW_OWN,
      },
    ],
  },
  {
    title: "Báo cáo & Lịch sử",
    items: [
      {
        href: "/history",
        label: "Điểm danh",
        icon: <History className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.HISTORY.VIEW,
      },
    ],
  },
];

export default function Sidebar(): React.JSX.Element {
  const { toggleSelected, selectedItem } = useAppContext();

  // Component để render menu item với permission check
  const MenuItemComponent = ({ item }: { item: MenuItem }) => {
    const hasPermission = useCheckPermission(item.permission || "");

    // Nếu có permission được định nghĩa nhưng user không có quyền, thì ẩn menu item
    if (item.permission && !hasPermission) {
      return null;
    }

    return (
      <li key={item.href}>
        <Link
          onClick={() => toggleSelected(item.label)}
          href={item.href}
          className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
            selectedItem === item.label
              ? "bg-gradient-primary text-white shadow-lg transform scale-[1.02]"
              : "text-gray-600 hover:text-white hover:bg-gradient-primary hover:shadow-md hover:transform hover:scale-[1.02]"
          }`}
        >
          {/* Background Animation */}
          <div
            className={`absolute inset-0 bg-gradient-primary transition-all duration-300 ${
              selectedItem === item.label
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          />

          {/* Icon */}
          <span
            className={`relative z-10 flex items-center justify-center w-6 h-6 mr-3 transition-transform duration-300 ${
              selectedItem === item.label
                ? "text-white"
                : "text-gray-500 group-hover:text-white group-hover:scale-110"
            }`}
          >
            {item.icon}
          </span>

          {/* Label */}
          <span className="relative z-10 font-medium">{item.label}</span>

          {/* Active Indicator */}
          {selectedItem === item.label && (
            <div className="absolute right-3 w-2 h-2 bg-white rounded-full opacity-75" />
          )}
        </Link>
      </li>
    );
  };

  return (
    <div className="w-64 h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-xl">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="block">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">HRM</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-8">
            {menuGroups.map((group: MenuGroup) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                  {group.title}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item: MenuItem) => (
                    <MenuItemComponent key={item.href} item={item} />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 text-center">
            <p>© 2025 HRM System</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
