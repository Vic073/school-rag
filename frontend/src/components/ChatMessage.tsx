"use client";

import React, { useState } from "react";
import { Message, api } from "@/lib/api";
import { User, Sparkles, BookText, ChevronDown, ChevronUp } from "lucide-react";
import FeedbackButtons from "./FeedbackButtons";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className={`flex w-full gap-4 py-6 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Icon/Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
          <Sparkles size={16} />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-2xl gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/10 rounded-tr-none"
              : "glass-panel text-gray-200 rounded-tl-none border border-white/5"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Collapsible Citations/Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full mt-1">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-300 hover:bg-white/5 transition"
            >
              <BookText size={12} />
              <span>References ({message.sources.length})</span>
              {sourcesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {sourcesOpen && (
              <div className="mt-2 space-y-2 pl-3">
                {message.sources.map((src, i) => (
                  <div key={i} className="glass-panel p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="flex items-center justify-between gap-4 mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-400 truncate">
                        {src.filename}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 uppercase shrink-0 font-medium">
                        {src.subject}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3 italic">
                      "{src.chunk}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback buttons */}
        {!isUser && <FeedbackButtons messageId={message.id} />}
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0 shadow-inner">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
