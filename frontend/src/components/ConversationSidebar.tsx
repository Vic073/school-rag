"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "./Providers";
import { api } from "@/lib/api";

export default function ConversationSidebar() {
  const { conversations, user, logout, refreshConversations, currentSubject } = useAuth();
  const router = useRouter();
  const params = useParams();
  const activeId = params?.id as string | undefined;

  const handleNewChat = async () => {
    try {
      const newConv = await api.createConversation(currentSubject, "New session");
      await refreshConversations();
      router.push(`/chat/${newConv.id}`);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  return (
    <aside className="w-[260px] border-r border-[--bg-border] bg-[#0A0A0B] flex flex-col h-full z-10 shrink-0 select-none relative">
      {/* Brand Heading */}
      <div className="p-6 border-b border-[--bg-border] flex items-center justify-between">
        <span 
          onClick={() => router.push("/chat")} 
          className="font-body font-semibold text-lg text-[--text-primary] tracking-tight cursor-pointer"
        >
          School<span className="text-[--accent]">RAG</span>
        </span>
        {user && (user.role === "teacher" || user.role === "admin") && (
          <button
            onClick={() => router.push("/admin")}
            className="font-mono text-[10px] text-[--text-secondary] border border-[--bg-border] hover:border-[--accent] px-2 py-0.5 transition"
          >
            ADMIN
          </button>
        )}
      </div>

      {/* Group Title */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[--text-tertiary] tracking-widest">[01]</span>
          <span className="font-mono text-[10px] text-[--text-secondary] uppercase tracking-[0.15em]">Conversations</span>
        </div>
      </div>

      {/* Conversation Thread List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {conversations.length === 0 ? (
          <div className="px-4 py-6 text-xs text-[--text-tertiary] font-body italic">
            No active sessions.
          </div>
        ) : (
          conversations.map((conv, index) => {
            const isActive = activeId === conv.id;
            const indexStr = index + 1 < 10 ? `0${index + 1}` : index + 1;
            return (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.id}`)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 rounded-none border-l-2 ${
                  isActive
                    ? "bg-[--bg-surface] text-[--text-primary] border-[--accent]"
                    : "text-[--text-secondary] border-transparent hover:text-[--text-primary] hover:bg-[--bg-surface]/50"
                }`}
              >
                <span className="font-mono text-[11px] text-[--text-tertiary] shrink-0">
                  {indexStr}
                </span>
                <span className="font-body text-sm truncate flex-1 font-light">
                  {conv.title || "Untitled Session"}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* New Session footer panel */}
      <div className="border-t border-[--bg-border] p-4 bg-[#0A0A0B] space-y-4">
        <button
          onClick={handleNewChat}
          className="w-full text-left font-body text-sm text-[--accent] hover:underline flex items-center gap-1.5 transition-all duration-150 py-1"
        >
          <span>+</span> New session →
        </button>

        {user && (
          <div className="pt-3 border-t border-[--bg-border]/40 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[--text-primary] truncate">{user.name || user.email}</div>
              <div className="font-mono text-[9px] text-[--text-secondary] uppercase tracking-wider mt-0.5">
                {user.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="font-mono text-[10px] text-[--text-tertiary] hover:text-[--error] transition"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
