"use client";

import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
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
        message: `Ingested "${res.filename}" into ${subject} (${res.chunks_created} chunks generated)`,
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
    <div className="space-y-8">
      <div className="border-t border-[--bg-border] pt-6">
        <span className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-widest block mb-2">
          [01] Ingestion
        </span>
        <h3 className="font-display text-2xl font-normal text-white">
          Add <em className="italic">course materials</em>
        </h3>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* Subject selection input */}
        <div className="border-b border-[--bg-border] pb-3 focus-within:border-[--text-secondary] transition-colors">
          <label className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-widest block mb-2">
            Target Subject / Course
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-transparent outline-none font-body text-base text-[--text-primary] cursor-pointer"
          >
            <option className="bg-[#0A0A0B] text-[#F2F0EC]" value="General">General</option>
            <option className="bg-[#0A0A0B] text-[#F2F0EC]" value="Physics">Physics</option>
            <option className="bg-[#0A0A0B] text-[#F2F0EC]" value="Chemistry">Chemistry</option>
            <option className="bg-[#0A0A0B] text-[#F2F0EC]" value="Biology">Biology</option>
            <option className="bg-[#0A0A0B] text-[#F2F0EC]" value="Mathematics">Mathematics</option>
            <option className="bg-[#0A0A0B] text-[#F2F0EC]" value="Computer Science">Computer Science</option>
            <option className="bg-[#0A0A0B] text-[#F2F0EC]" value="Academic Calendar">Academic Calendar</option>
            <option className="bg-[#0A0A0B] text-[#F2F0EC]" value="Handbook">Handbook</option>
          </select>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border border-dashed rounded-none p-12 text-center cursor-pointer transition-colors duration-300 group ${
            dragActive
              ? "border-[--accent] bg-[--accent-subtle]"
              : file
              ? "border-[--accent] bg-[--accent-subtle]"
              : "border-[--bg-border] hover:border-[--accent-border] hover:bg-[--accent-subtle]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <span className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-widest block mb-3">
            [Upload PDF]
          </span>

          {file ? (
            <div className="space-y-1">
              <p className="font-body text-sm font-semibold text-white truncate max-w-xs mx-auto">{file.name}</p>
              <p className="font-mono text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-display text-xl text-[--text-primary]">
                Drop your <em className="italic">documents</em> here.
              </p>
              <p className="font-body text-xs text-[--text-secondary]">
                PDF documents · up to 20MB
              </p>
            </div>
          )}

          {!file && (
            <span className="font-body text-xs text-[--accent] mt-4 block group-hover:underline">
              or browse files →
            </span>
          )}
        </div>

        {file && (
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 font-body font-medium text-sm text-[--bg-base] bg-[--text-primary] hover:bg-[--accent] px-5 py-2.5 transition-colors duration-200 rounded-none w-full disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Ingest document →</span>
            )}
          </button>
        )}
      </form>

      {/* Result feedback */}
      {result && (
        <div
          className={`border-t pt-4 font-mono text-xs ${
            result.status === "success" ? "text-[--success]" : "text-[--error]"
          }`}
        >
          [{result.status === "success" ? "OK" : "ERR"}] {result.message}
        </div>
      )}
    </div>
  );
}
