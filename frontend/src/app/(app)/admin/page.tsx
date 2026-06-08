"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import DocumentUpload from "@/components/DocumentUpload";
import { api, Feedback, Document } from "@/lib/api";
import { LayoutDashboard, FileText, ArrowLeft, RefreshCw, AlertTriangle, FileSpreadsheet, MessagesSquare } from "lucide-react";

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
      <div className="flex-1 flex items-center justify-center bg-[#050508] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-indigo-400" size={24} />
          <span className="text-sm text-gray-400">Loading metrics...</span>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunk_count, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050508] overflow-y-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#07070b]/60 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={20} className="text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Teacher Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/documents")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold transition"
          >
            <FileSpreadsheet size={15} />
            <span>Manage Documents</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Stats + Feedback */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-gray-400">Total Documents</span>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                <FileText size={18} />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-gray-400">Vector Embeddings</span>
                <p className="text-2xl font-bold text-white">{totalChunks}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/25">
                <FileText size={18} />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-gray-400">Total Flagged</span>
                <p className="text-2xl font-bold text-white">{feedbackList.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/25">
                <AlertTriangle size={18} />
              </div>
            </div>
          </div>

          {/* Low Rated Feedback Section */}
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <h3 className="font-bold text-white">Negative User Feedback</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 font-semibold">
                Requires Review
              </span>
            </div>

            {feedbackList.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <MessagesSquare size={32} className="text-gray-600" />
                <p>No low-rated answers flagged by students.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {feedbackList.map((fb) => (
                  <div key={fb.id} className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-gray-400 font-medium">{fb.user_email}</span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.01] border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Answer Output:</span>
                      <p className="text-xs text-gray-300 line-clamp-3 italic">
                        "{fb.message_content}"
                      </p>
                    </div>

                    {fb.comment && (
                      <div className="space-y-1.5 p-3 rounded-xl bg-red-500/[0.02] border border-red-500/10">
                        <span className="text-[10px] text-red-400 uppercase font-semibold">Student Reason:</span>
                        <p className="text-xs text-red-200/90 font-medium">
                          {fb.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: File Upload Form */}
        <div className="lg:col-span-5">
          <DocumentUpload />
        </div>
      </div>
    </div>
  );
}
