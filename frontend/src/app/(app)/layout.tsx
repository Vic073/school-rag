"use client";

import React from "react";
import { useAuth } from "@/components/Providers";
import ConversationSidebar from "@/components/ConversationSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[--bg-base] text-[--text-primary]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[--accent] border-t-transparent" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[--text-secondary]">Loading SchoolRAG...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[--bg-base]">
      {/* Sidebar */}
      <ConversationSidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {children}
      </div>
    </div>
  );
}
