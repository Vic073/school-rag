"use client";

import React, { useRef, useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex gap-3 items-end p-4 border-t border-white/10 bg-[#07070b]/80 backdrop-blur-md">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question against school documents..."
          rows={1}
          disabled={disabled}
          className="w-full pl-4 pr-12 py-3.5 rounded-2xl glass-input text-sm text-white placeholder-gray-500 focus:outline-none resize-none min-h-[50px] max-h-[200px]"
        />
        {disabled && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="h-[50px] w-[50px] rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center justify-center transition shadow-lg shadow-indigo-500/10 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
