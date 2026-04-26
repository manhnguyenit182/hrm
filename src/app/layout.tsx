import "./globals.css";
import type { Metadata } from "next";
import { NextAuthProvider } from "@/components/NextAuthProvider";

export const metadata: Metadata = {
  title: "HRM - Hệ thống Quản lý Nhân sự",
  description: "Hệ thống quản lý nhân sự, chấm công, lương và nghỉ phép",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full">
      <body className="h-full bg-gray-50 antialiased" suppressHydrationWarning>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
