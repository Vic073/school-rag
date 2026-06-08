"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "./Providers";
import { MessageSquare, Plus, LogOut, Settings, Shield } from "lucide-react";
import { api } from "@/lib/api";

export default function ConversationSidebar() {
  const { conversations, user, logout, refreshConversations, currentSubject } = useAuth();
  const router = useRouter();
  const params = useParams();
  const activeId = params?.id as string | undefined;

  const handleNewChat = async () => {
    try {
      const newConv = await api.createConversation(currentSubject, "New Chat");
      await refreshConversations();
      router.push(`/chat/${newConv.id}`);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  return (
    <aside className="w-80 border-r border-white/10 bg-[#0b0b10] flex flex-col h-full z-10 shrink-0">
      {/* Header / Brand */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/chat")}>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            SchoolRAG 📚
          </span>
        </div>

        {user && (user.role === "teacher" || user.role === "admin") && (
          <button
            onClick={() => router.push("/admin")}
            title="Admin Dashboard"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <Shield size={18} />
          </button>
        )}
      </div>

      {/* New Conversation Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversation Thread List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Recent Chats
        </div>
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No chats yet. Start a new one!
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = activeId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.id}`)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white border-l-2 border-indigo-500"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <MessageSquare size={16} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{conv.title || "Untitled Chat"}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                      {conv.subject || "General"}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {conv.message_count} msgs
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* User Footer Panel */}
      {user && (
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
              {user.name ? user.name[0] : user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.name || "User"}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
