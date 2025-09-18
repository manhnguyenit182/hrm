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
  Settings,
  FileCheck,
  History,
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
        permission: PERMISSIONS.EMPLOYEES.VIEW,
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
        permission: PERMISSIONS.ATTENDANCE.VIEW,
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
        label: "Tiện ích",
        icon: <Settings className="inline w-4 h-4 mr-2" />,
        permission: PERMISSIONS.LEAVES.VIEW_OWN,
      },
    ],
  },
  {
    title: "Báo cáo & Lịch sử",
    items: [
      {
        href: "/history",
        label: "Lịch sử",
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
          className={`flex px-4 py-3 text-sm font-medium rounded-lg rounded-l-none transition-all duration-200 group  ${
            selectedItem === item.label
              ? "bg-[color:#ebe9fe] text-[var(--color-primary-500)] border-l-4 border-[var(--color-primary-500)]"
              : "hover:bg-[color:#f5f5ff] hover:text-[var(--color-primary-500)]  "
          }`}
        >
          <span className="group-hover:scale-110 transition-transform duration-200">
            {item.icon}
          </span>
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <div
      className={`w-64 h-[95%] text-black rounded-lg bg-[color:#f5f5f5] m-5 mr-0`}
    >
      <div className="p-6">
        <Link href="/" className="block mb-8">
          <Image
            src="/logo.svg"
            alt="logo"
            width={120}
            height={140}
            className="w-auto h-12 object-contain mx-auto"
          />
        </Link>

        <nav className="space-y-6">
          {menuGroups.map((group: MenuGroup) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
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
    </div>
  );
}
