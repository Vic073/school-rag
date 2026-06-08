"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { api, Message } from "@/lib/api";
import SubjectSelector from "@/components/SubjectSelector";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { RefreshCw } from "lucide-react";

export default function ChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const { refreshConversations, currentSubject } = useAuth();
  const id = params?.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryLoading, setQueryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load message thread
  useEffect(() => {
    async function fetchThread() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const threadMessages = await api.getMessages(id);
        setMessages(threadMessages);
      } catch (err: any) {
        setError(err.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    }
    fetchThread();
  }, [id]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    setQueryLoading(true);
    setError(null);

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: messageText,
      sources: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.query(messageText, id, currentSubject);
      
      const assistantMsg: Message = {
        id: res.message_id,
        role: "assistant",
        content: res.answer,
        sources: res.sources,
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...withoutTemp, tempUserMsg, assistantMsg];
      });

      await refreshConversations();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#0A0A0B]">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[--bg-border] bg-[#0A0A0B] z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="font-mono text-[10px] text-[--text-tertiary] hover:text-[--text-primary] uppercase md:hidden"
          >
            [Back]
          </button>
          <SubjectSelector />
        </div>
        <span className="font-mono text-[9px] text-[--text-tertiary] uppercase tracking-widest">
          Session · {id.slice(0, 6)}
        </span>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[--text-secondary]">
            <RefreshCw className="animate-spin mr-2" size={12} />
            <span className="font-mono text-[11px] uppercase tracking-wider">Loading Session</span>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={scrollRef} />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto font-mono text-xs text-[--error] border-t border-[--bg-border] pt-4 mt-6">
            [ERR] {error}
          </div>
        )}
      </div>

      {/* Input panel */}
      <div className="w-full">
        <ChatInput onSend={handleSend} disabled={queryLoading || loading} />
      </div>
    </div>
  );
}
