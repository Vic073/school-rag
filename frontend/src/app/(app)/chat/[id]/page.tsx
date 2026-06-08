"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { api, Message } from "@/lib/api";
import SubjectSelector from "@/components/SubjectSelector";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

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
      
      // Add assistant message
      const assistantMsg: Message = {
        id: res.message_id,
        role: "assistant",
        content: res.answer,
        sources: res.sources,
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => {
        // filter out potential duplicate optimistic user message and append actual messages
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...withoutTemp, tempUserMsg, assistantMsg];
      });

      // Update conversations list in sidebar
      await refreshConversations();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      // Rollback optimistic message or display alongside error
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#050508]">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#07070b]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition md:hidden"
          >
            <ArrowLeft size={16} />
          </button>
          <SubjectSelector />
        </div>
        <div className="text-xs text-gray-500 font-mono">
          Session ID: {id.slice(0, 8)}...
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <RefreshCw className="animate-spin mr-2" size={16} />
            <span>Loading messages...</span>
          </div>
        ) : (
          <>
            <div className="max-w-3xl mx-auto divide-y divide-white/5">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
            <div ref={scrollRef} />
          </>
        )}

        {error && (
          <div className="max-w-2xl mx-auto flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input panel */}
      <ChatInput onSend={handleSend} disabled={queryLoading || loading} />
    </div>
  );
}
