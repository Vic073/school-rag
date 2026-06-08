"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { api, Document } from "@/lib/api";
import { ArrowLeft, Trash2, FileText, Calendar, Database, RefreshCw, Eye } from "lucide-react";

export default function DocumentManagementPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Enforce access control
  useEffect(() => {
    if (user && user.role !== "teacher" && user.role !== "admin") {
      router.push("/chat");
    }
  }, [user, router]);

  const loadDocuments = async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadDocuments().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (user?.role !== "admin") {
      alert("Only system administrators are authorized to delete knowledge base documents.");
      return;
    }

    if (!confirm("Are you sure you want to delete this document? All associated vector embeddings will be permanently removed from ChromaDB.")) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete document");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getSubjectsList = () => {
    const subjects = new Set<string>();
    documents.forEach((d) => subjects.add(d.subject));
    return ["All", ...Array.from(subjects)];
  };

  const filteredDocs = subjectFilter === "All"
    ? documents
    : documents.filter((d) => d.subject === subjectFilter);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050508] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-indigo-400" size={24} />
          <span className="text-sm text-gray-400">Loading document log...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050508] overflow-y-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#07070b]/60 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <Database size={20} className="text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Knowledge Base Log</h1>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-semibold">Subject Filter:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {getSubjectsList().map((subj) => (
              <option key={subj} className="bg-[#050508] text-white" value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
              <FileText size={32} className="text-gray-600" />
              <p>No documents match the active subject filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/[0.01]">
                    <th className="px-6 py-4">Filename</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Vector Chunks</th>
                    <th className="px-6 py-4">Ingested Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/[0.01] transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <FileText size={16} className="text-indigo-400 shrink-0" />
                        <span className="font-semibold text-white truncate max-w-xs md:max-w-md" title={doc.filename}>
                          {doc.filename}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-semibold uppercase">
                          {doc.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 font-mono">
                        {doc.chunk_count}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user?.role === "admin" ? (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deleteLoading === doc.id}
                            className="p-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                            title="Delete Document & Vectors"
                          >
                            {deleteLoading === doc.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-600 font-medium italic">
                            Read Only
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
