"use client";

import React from "react";
import { useAuth } from "@/components/Providers";
import ConversationSidebar from "@/components/ConversationSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050508] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <span className="text-sm font-medium text-gray-400">Loading SchoolRAG...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected to "/" by Provider redirect guard
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050508]">
      {/* Sidebar */}
      <ConversationSidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {children}
      </div>
    </div>
  );
}
