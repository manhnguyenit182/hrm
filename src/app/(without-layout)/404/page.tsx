"use client";

import React from "react";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import { ShieldX, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <ShieldX className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
            viên để được cấp quyền.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            label="Về trang chủ"
            icon={<Home className="mr-2 h-4 w-4" />}
            onClick={() => router.push("/")}
            className="w-full p-button-primary"
          />

          <Button
            label="Quay lại"
            icon={<ArrowLeft className="mr-2 h-4 w-4" />}
            onClick={() => router.back()}
            className="w-full p-button-outlined"
          />
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Mã lỗi: 403 - Forbidden</p>
        </div>
      </div>
    </div>
  );
}
