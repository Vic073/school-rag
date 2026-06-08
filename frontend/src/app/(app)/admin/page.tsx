"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import DocumentUpload from "@/components/DocumentUpload";
import { api, Feedback, Document } from "@/lib/api";
import { RefreshCw } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Enforce access control
  useEffect(() => {
    if (user && user.role !== "teacher" && user.role !== "admin") {
      router.push("/chat");
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      const [fb, docs] = await Promise.all([
        api.getLowRatedFeedback(),
        api.getDocuments(),
      ]);
      setFeedbackList(fb);
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#0A0A0B] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[--text-secondary]" size={16} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-gray-500">Loading admin ledger</span>
        </div>
      </div>
    );
  }

  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunk_count, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0B] overflow-y-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[--bg-border] bg-[#0A0A0B] sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/chat")}
            className="font-mono text-[10px] text-[--text-tertiary] hover:text-[--text-primary] uppercase"
          >
            [Exit Dashboard]
          </button>
          <span className="font-mono text-[11px] text-[--text-secondary] uppercase tracking-wider">
            Teacher Panel
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/documents")}
            className="font-mono text-[10px] text-[--text-primary] border border-[--bg-border] hover:border-[--text-secondary] px-3 py-1.5 transition uppercase tracking-wider"
          >
            Manage Documents →
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="font-mono text-[10px] text-[--text-tertiary] hover:text-[--text-primary] transition uppercase tracking-wider"
          >
            [Refresh]
          </button>
        </div>
      </header>

      {/* Grid Content */}
      <div className="p-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left marketing columns */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Section: Stats */}
          <div className="space-y-4">
            <span className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-widest block">
              [01] Overview
            </span>
            <h2 className="font-display text-3xl font-normal text-white">
              System <em className="italic">metrics</em> log
            </h2>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-[--bg-border]">
              <div className="space-y-1">
                <p className="font-mono text-3xl text-[--text-primary]">{documents.length}</p>
                <p className="font-body text-xs text-[--text-secondary] uppercase tracking-wider">Indexed files</p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-3xl text-[--text-primary]">{totalChunks}</p>
                <p className="font-body text-xs text-[--text-secondary] uppercase tracking-wider">Total chunks</p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-3xl text-[--text-primary]">{feedbackList.length}</p>
                <p className="font-body text-xs text-[--text-secondary] uppercase tracking-wider">Flagged outputs</p>
              </div>
            </div>
          </div>

          {/* Section: User feedback */}
          <div className="space-y-6">
            <div className="border-t border-[--bg-border] pt-6 flex justify-between items-baseline">
              <span className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-widest block">
                [02] Quality loop
              </span>
              <span className="font-mono text-[9px] text-[--error] uppercase tracking-wider">
                Flagged answers
              </span>
            </div>

            {feedbackList.length === 0 ? (
              <div className="p-8 border border-[--bg-border] text-center font-mono text-xs text-[--text-tertiary] italic">
                Zero quality flags reported by students.
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackList.map((fb) => (
                  <div key={fb.id} className="border border-[--bg-border] p-5 space-y-3 relative">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[--text-secondary]">
                      <span>{fb.user_email}</span>
                      <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>

                    <p className="font-body text-xs text-[--text-tertiary] italic pl-3 border-l border-[--bg-border] line-clamp-3">
                      "{fb.message_content}"
                    </p>

                    {fb.comment && (
                      <div className="font-mono text-xs text-[--text-primary] pt-2 border-t border-[--bg-border]/40 flex gap-2">
                        <span className="text-[--accent] shrink-0">Reason:</span>
                        <span>{fb.comment}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side uploader */}
        <div className="lg:col-span-5">
          <DocumentUpload />
        </div>
      </div>
    </div>
  );
}
