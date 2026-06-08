"use client";

import React, { useState } from "react";
import { useAuth } from "./Providers";
import { RefreshCw } from "lucide-react";

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
        className="flex items-center gap-2 font-mono text-xs text-[--text-secondary] border border-[--bg-border] hover:border-[--text-secondary] px-3 py-1.5 rounded-full transition-colors bg-transparent"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[--accent]" />
        <span>{currentSubject}</span>
        <span className="text-[--text-tertiary] text-[9px] ml-0.5">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-60 bg-[--bg-surface] rounded-none border border-[--bg-border] p-1.5 z-30 shadow-2xl">
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[--bg-border] mb-1">
              <span className="font-mono text-[9px] text-[--text-tertiary] uppercase tracking-wider">Subject Scope</span>
              <button 
                onClick={handleRefresh} 
                disabled={refreshing} 
                className="text-[--text-tertiary] hover:text-[--text-primary] transition"
              >
                <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="space-y-0.5">
              {subjects.map((subj) => (
                <button
                  key={subj.name}
                  onClick={() => {
                    setCurrentSubject(subj.name);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-left rounded-none transition ${
                    currentSubject === subj.name
                      ? "bg-[--bg-elevated] text-[--accent]"
                      : "text-[--text-secondary] hover:bg-[--bg-elevated]/60 hover:text-[--text-primary]"
                  }`}
                >
                  <span className="font-body text-xs font-light truncate">{subj.name}</span>
                  <span className="font-mono text-[9px] text-[--text-tertiary] shrink-0 ml-2">
                    {subj.chunk_count}
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
