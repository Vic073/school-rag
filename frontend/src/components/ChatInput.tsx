"use client";

import React, { useRef, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-t border-[--bg-border] bg-[#0A0A0B] relative flex items-center px-6 py-2"
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about this subject..."
        rows={1}
        disabled={disabled}
        className="flex-1 bg-transparent resize-none outline-none font-body text-[15px] font-light text-[--text-primary] placeholder:text-[--text-tertiary] py-4 pr-12 min-h-[56px] max-h-[200px]"
      />

      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
        {disabled ? (
          <Loader2 size={16} className="animate-spin text-[--text-tertiary]" />
        ) : (
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="w-10 h-10 flex items-center justify-center text-[--text-secondary] hover:text-[--accent] transition-colors text-lg font-mono disabled:opacity-20 disabled:hover:text-[--text-secondary]"
            title="Send query"
          >
            →
          </button>
        )}
      </div>
    </form>
  );
}
