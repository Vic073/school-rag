"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import SubjectSelector from "@/components/SubjectSelector";
import ChatInput from "@/components/ChatInput";
import { api } from "@/lib/api";

export default function ChatMainPage() {
  const { currentSubject, refreshConversations } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    { text: "What is the policy on plagiarism?", label: "Policy" },
    { text: "When does the academic calendar start?", label: "Calendar" },
    { text: "What are the requirements for graduation?", label: "Academics" },
  ];

  const handleSend = async (messageText: string) => {
    setLoading(true);
    try {
      const conv = await api.createConversation(currentSubject, messageText.slice(0, 40) + "...");
      await refreshConversations();
      await api.query(messageText, conv.id, currentSubject);
      router.push(`/chat/${conv.id}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[--bg-base] relative select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[--bg-border] bg-[--bg-base] z-10">
        <SubjectSelector />
        <span className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-widest">
          [System Ready]
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex flex-col justify-center px-8 max-w-2xl mx-auto w-full space-y-12 z-10 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[--text-tertiary] tracking-[0.15em]">[01]</span>
            <span className="font-mono text-[10px] text-[--text-secondary] uppercase tracking-[0.12em]">Search Engine</span>
          </div>
          
          <h2 className="font-display text-4xl font-normal leading-tight text-white">
            Ask anything about your <em className="italic text-[--accent] not-italic-none">studies.</em>
          </h2>
          <p className="font-body text-sm font-light text-[--text-secondary] leading-relaxed">
            SchoolRAG is connected directly to Domasi College's academic repositories. Submit a query to retrieve verified course literature citations.
          </p>
        </div>

        {/* Suggestion List */}
        <div className="space-y-3 pt-6 border-t border-[--bg-border]">
          <span className="font-mono text-[9px] text-[--text-tertiary] uppercase tracking-wider block">
            [Suggested Inquiries]
          </span>
          <div className="grid grid-cols-1 gap-2.5 stagger">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.text)}
                disabled={loading}
                className="flex justify-between items-center w-full p-4 border border-[--bg-border] hover:border-[--text-secondary] hover:bg-[--bg-surface]/30 text-left text-xs font-mono text-[--text-secondary] hover:text-[--text-primary] transition-all duration-150 rounded-none group"
              >
                <span>{q.text}</span>
                <span className="text-[--text-tertiary] group-hover:text-[--accent] transition-colors ml-4">
                  {q.label} →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form at bottom */}
      <div className="w-full">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
