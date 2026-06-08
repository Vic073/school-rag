"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import SubjectSelector from "@/components/SubjectSelector";
import ChatInput from "@/components/ChatInput";
import { api } from "@/lib/api";
import { MessageSquarePlus, GraduationCap, Calendar, ShieldCheck, HelpCircle } from "lucide-react";

export default function ChatMainPage() {
  const { currentSubject, refreshConversations } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    { text: "What is the policy on plagiarism?", icon: ShieldCheck, color: "text-red-400 bg-red-500/10 border-red-500/20" },
    { text: "When does the academic calendar start?", icon: Calendar, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { text: "What are the requirements for graduation?", icon: GraduationCap, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  ];

  const handleSend = async (messageText: string) => {
    setLoading(true);
    try {
      // 1. Create conversation
      const conv = await api.createConversation(currentSubject, messageText.slice(0, 40) + "...");
      await refreshConversations();

      // 2. Perform the initial query
      const queryResponse = await api.query(messageText, conv.id, currentSubject);

      // 3. Redirect to the chat thread
      router.push(`/chat/${conv.id}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#050508]">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#07070b]/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <SubjectSelector />
        </div>
        <div className="text-xs text-gray-500">
          Ready to query
        </div>
      </header>

      {/* Welcome Screen / History empty state */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 md:p-12 space-y-8 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 mb-2 shadow-inner">
            <MessageSquarePlus size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-white">How can I help you study?</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Ask any question below. Answers are grounded in the college handbooks, calendar, and documents.
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <HelpCircle size={14} /> Suggested Questions
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestedQuestions.map((q, i) => {
              const Icon = q.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  disabled={loading}
                  className="glass-panel p-4.5 rounded-2xl text-left hover:bg-white/5 hover:border-white/15 transition duration-200 group flex flex-col justify-between h-32 text-sm border border-white/5 text-gray-300"
                >
                  <div className={`p-2 rounded-xl w-max border ${q.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-medium group-hover:text-white transition">
                    {q.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input Form */}
      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
