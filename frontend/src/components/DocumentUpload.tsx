"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "./Providers";

export default function DocumentUpload() {
  const { refreshSubjects } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("General");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: "success" | "error"; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        setResult({ status: "error", message: "Only PDF files are supported" });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await api.uploadDocument(file, subject);
      setResult({
        status: "success",
        message: `Successfully ingested "${res.filename}" into ${subject} (${res.chunks_created} chunks generated)`,
      });
      setFile(null);
      await refreshSubjects();
    } catch (err: any) {
      setResult({
        status: "error",
        message: err.message || "Failed to upload document",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">Ingest New Syllabus Document</h3>
        <p className="text-xs text-gray-400">
          Upload class materials, notes, or handbooks to add them directly to the RAG database context.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Subject Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Target Subject / Namespace</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option className="bg-[#050508] text-white" value="General">General</option>
            <option className="bg-[#050508] text-white" value="Physics">Physics</option>
            <option className="bg-[#050508] text-white" value="Chemistry">Chemistry</option>
            <option className="bg-[#050508] text-white" value="Biology">Biology</option>
            <option className="bg-[#050508] text-white" value="Mathematics">Mathematics</option>
            <option className="bg-[#050508] text-white" value="Computer Science">Computer Science</option>
            <option className="bg-[#050508] text-white" value="Academic Calendar">Academic Calendar</option>
            <option className="bg-[#050508] text-white" value="Handbook">Handbook</option>
          </select>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/5"
              : file
              ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
              : "border-white/10 hover:border-white/25 hover:bg-white/[0.01]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/25">
                <FileText size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/25">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Click or drag PDF here</p>
                <p className="text-xs text-gray-500">Only PDF formats under 10MB supported</p>
              </div>
            </>
          )}
        </div>

        {file && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Extracting & Chunking Document...</span>
              </>
            ) : (
              <span>Confirm & Ingest File</span>
            )}
          </button>
        )}
      </form>

      {/* Result feedback */}
      {result && (
        <div
          className={`flex items-start gap-2.5 p-4 rounded-xl border text-sm ${
            result.status === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {result.status === "success" ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
