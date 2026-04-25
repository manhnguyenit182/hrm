"use client";

import React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <i className="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Đã xảy ra lỗi
        </h2>
        <p className="text-sm text-gray-500 max-w-md">
          {error.message || "Có lỗi không mong muốn xảy ra. Vui lòng thử lại."}
        </p>
      </div>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
      >
        Thử lại
      </button>
    </div>
  );
}
