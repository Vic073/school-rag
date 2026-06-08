"use client";

import React, { useState } from "react";
import { Message } from "@/lib/api";
import FeedbackButtons from "./FeedbackButtons";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [sourcesOpen, setSourcesOpen] = useState(false);

  if (isUser) {
    return (
      <div className="flex justify-end mb-10 message-enter">
        <p className="font-body text-[15px] font-light text-[--text-primary] max-w-[75%] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12 message-enter">
      <div className="pl-5 border-l-2 border-[--accent] space-y-4">
        <p className="font-body text-[15px] font-light text-[--text-primary] leading-[1.8] whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Citations list */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="font-mono text-[11px] text-[--text-tertiary] hover:text-[--text-secondary] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <span>{sourcesOpen ? "↑" : "↓"}</span>
              <span>Sources · {message.sources.length} document{message.sources.length > 1 ? "s" : ""}</span>
            </button>

            {sourcesOpen && (
              <ul className="mt-3 space-y-2.5">
                {message.sources.map((src, i) => (
                  <li key={i} className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-[--text-tertiary]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-xs text-[--text-secondary] hover:text-[--text-primary] transition-colors truncate max-w-[200px]" title={src.filename}>
                        {src.filename}
                      </span>
                      <span className="font-mono text-[10px] text-[--text-tertiary] uppercase">
                        [{src.subject}]
                      </span>
                    </div>
                    <p className="text-xs text-[--text-secondary] font-light italic leading-relaxed md:border-l md:border-[--bg-border] md:pl-3">
                      "{src.chunk}"
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="pl-5 mt-2">
        <FeedbackButtons messageId={message.id} />
      </div>
    </div>
  );
}
