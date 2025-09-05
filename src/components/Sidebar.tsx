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
} from "lucide-react";
import React, { use } from "react";
import Image from "next/image";
import { useAppContext } from "@/app/(layout)/AppContext";
// Interface cho menu item
interface MenuItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

// Props interface cho Sidebar component (nếu sau này cần truyền props)

// Data cho menu items với type safety
const menuItems: MenuItem[] = [
  {
    href: "/",
    label: "Bảng điều khiển",
    icon: <LayoutDashboard className="inline w-4 h-4 mr-2" />,
  },
  {
    href: "/employees",
    label: "Nhân viên",
    icon: <Users className="inline w-4 h-4 mr-2" />,
  },
  {
    href: "/departments",
    label: "Phòng ban",
    icon: <Building2 className="inline w-4 h-4 mr-2" />,
  },
  {
    href: "/attendance",
    label: "Chấm công",
    icon: <CalendarCheck className="inline w-4 h-4 mr-2" />,
  },
  {
    href: "/payroll",
    label: "Lương",
    icon: <CircleDollarSign className="inline w-4 h-4 mr-2" />,
  },
  {
    href: "/jobs",
    label: "Công việc",
    icon: <BriefcaseBusiness className="inline w-4 h-4 mr-2" />,
  },
  {
    href: "/holidays",
    label: "Ngày nghỉ",
    icon: <CalendarDays className="inline w-4 h-4 mr-2" />,
  },
];

export default function Sidebar(): React.JSX.Element {
  const { toggleSelected, selectedItem } = useAppContext();

  return (
    <div className={`w-64 h-[95%] text-black shadow-xl border m-5 mr-0`}>
      <div className="p-6">
        <Link href="/" className="block mb-8">
          <Image
            src="/logo.png"
            alt="logo"
            width={120}
            height={140}
            className="w-auto h-12 object-contain mx-auto"
          />
        </Link>

        <nav>
          <ul className="space-y-1">
            {menuItems.map((item: MenuItem) => (
              <li key={item.href}>
                <Link
                  onClick={() => toggleSelected(item.label)}
                  href={item.href}
                  className={`flex px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    selectedItem === item.label
                      ? "bg-[var(--color-primary-500)] text-white shadow-lg"
                      : "hover:bg-[var(--color-primary-500)] hover:text-blue-300"
                  }`}
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
