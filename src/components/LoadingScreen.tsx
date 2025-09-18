"use client";

import React from "react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Đang tải..." }: LoadingScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface PermissionLoadingScreenProps {
  message?: string;
}

export function PermissionLoadingScreen({
  message = "Đang kiểm tra quyền truy cập...",
}: PermissionLoadingScreenProps) {
  return <LoadingScreen message={message} />;
}

interface RedirectingScreenProps {
  message?: string;
}

export function RedirectingScreen({
  message = "Đang chuyển hướng...",
}: RedirectingScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-3 w-3 bg-blue-500 rounded-full inline-block mx-1 animate-bounce"></div>
          <div
            className="h-3 w-3 bg-blue-500 rounded-full inline-block mx-1 animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="h-3 w-3 bg-blue-500 rounded-full inline-block mx-1 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <p className="text-gray-600 mt-4">{message}</p>
      </div>
    </div>
  );
}
