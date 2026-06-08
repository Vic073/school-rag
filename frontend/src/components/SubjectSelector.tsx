"use client";

import React, { useState } from "react";
import { useAuth } from "./Providers";
import { Book, ChevronDown, RefreshCw } from "lucide-react";

export default function SubjectSelector() {
  const { subjects, currentSubject, setCurrentSubject, refreshSubjects } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshing(true);
    try {
      await refreshSubjects();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-sm font-medium transition text-white"
      >
        <Book size={16} className="text-indigo-400" />
        <span>Subject: {currentSubject}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 glass-panel rounded-2xl p-2 z-30 shadow-xl border border-white/10">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 mb-1">
              <span className="text-xs font-semibold text-gray-400">Select Subject Scope</span>
              <button onClick={handleRefresh} disabled={refreshing} className="text-gray-500 hover:text-white transition">
                <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="space-y-1">
              {subjects.map((subj) => (
                <button
                  key={subj.name}
                  onClick={() => {
                    setCurrentSubject(subj.name);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-sm transition ${
                    currentSubject === subj.name
                      ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
                      : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <span className="font-medium truncate">{subj.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 shrink-0">
                    {subj.chunk_count} chunks
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
