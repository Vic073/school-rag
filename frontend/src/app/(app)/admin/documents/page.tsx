"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { api, Document } from "@/lib/api";
import { RefreshCw } from "lucide-react";

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
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0B] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[--text-secondary]" size={16} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-gray-500">Loading document log</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0B] overflow-y-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[--bg-border] bg-[#0A0A0B] sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="font-mono text-[10px] text-[--text-tertiary] hover:text-[--text-primary] uppercase"
          >
            [Back]
          </button>
          <span className="font-mono text-[11px] text-[--text-secondary] uppercase tracking-wider">
            Knowledge Base log
          </span>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-wider">Course Filter:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1 bg-transparent border border-[--bg-border] font-mono text-[11px] text-[--text-primary] focus:outline-none focus:border-[--text-secondary] cursor-pointer"
          >
            {getSubjectsList().map((subj) => (
              <option key={subj} className="bg-[#0A0A0B] text-[#F2F0EC]" value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="space-y-4">
          <span className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-widest block">
            [01] Document log
          </span>
          <h2 className="font-display text-3xl font-normal text-white">
            Ingested <em className="italic">publications</em> index
          </h2>
        </div>

        <div className="border-t border-[--bg-border] pt-2">
          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-[--text-tertiary] italic">
              No files recorded.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredDocs.map((doc) => (
                <div 
                  key={doc.id} 
                  className="border-b border-[--bg-border]/40 py-5 flex justify-between items-center hover:bg-[--bg-surface]/30 px-4 -mx-4 transition-colors group"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <p className="font-body text-sm text-[--text-primary] font-light truncate max-w-lg" title={doc.filename}>
                      {doc.filename}
                    </p>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-[--text-tertiary]">
                      <span className="text-[--accent] uppercase">[{doc.subject}]</span>
                      <span>·</span>
                      <span>{doc.chunk_count} chunks</span>
                      <span>·</span>
                      <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {user?.role === "admin" ? (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleteLoading === doc.id}
                        className="font-mono text-xs text-[--text-tertiary] hover:text-[--error] transition uppercase tracking-wider py-1"
                      >
                        {deleteLoading === doc.id ? (
                          "[Deleting]"
                        ) : (
                          "Delete →"
                        )}
                      </button>
                    ) : (
                      <span className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-wider italic">
                        [Read-Only]
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
