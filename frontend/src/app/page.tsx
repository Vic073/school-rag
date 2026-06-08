"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/Providers";

export default function Home() {
  const { login, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("student@schoolrag.edu");
  const [name, setName] = useState("Alex Johnson");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, name, role);
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    }
  };

  const handleRoleChange = (newRole: "student" | "teacher" | "admin") => {
    setRole(newRole);
    if (newRole === "student") {
      setEmail("student@schoolrag.edu");
      setName("Alex Johnson");
    } else if (newRole === "teacher") {
      setEmail("teacher@schoolrag.edu");
      setName("Dr. Sarah Vance");
    } else {
      setEmail("admin@schoolrag.edu");
      setName("System Admin");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--bg-base] text-[--text-primary] relative select-none">

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 border-b border-[--bg-border] bg-[--bg-base]/90 backdrop-blur-sm">
        <div className="container h-full flex items-center justify-between">
          <span className="font-[family-name:var(--font-body)] font-medium text-[--text-primary] tracking-tight">
            School<span className="text-[--accent]">RAG</span>
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 font-[family-name:var(--font-body)] font-medium text-sm text-[--bg-base] bg-[--text-primary] hover:bg-[--accent] px-5 py-2 transition-colors duration-200"
          >
            Sign in →
          </button>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="pt-32 pb-24 lg:pb-32 relative z-10">
        <div className="container stagger">
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-[--text-secondary] tracking-widest uppercase block mb-6">
            [01] School Intelligence Platform
          </span>

          <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-6xl lg:text-[5rem] font-normal leading-[1.05] text-[--text-primary] max-w-3xl">
            Your course notes,<br />
            your past papers,<br />
            <em className="italic text-[--accent]">finally answerable.</em>
          </h1>

          <p className="font-[family-name:var(--font-body)] text-base text-[--text-secondary] font-light max-w-lg leading-relaxed mt-8">
            SchoolRAG is a self-hosted academic engine that indexes syllabi, handbooks, and documents. Students get answers with direct citations. Hallucinations eliminated.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 font-[family-name:var(--font-body)] font-medium text-sm text-[--bg-base] bg-[--text-primary] hover:bg-[--accent] px-6 py-3 transition-colors duration-200 mt-10"
          >
            Continue with Google →
          </button>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg">
            <div className="border-t border-[--bg-border] pt-6">
              <p className="font-[family-name:var(--font-mono)] text-3xl text-[--text-primary] mb-1">2,847</p>
              <p className="font-[family-name:var(--font-body)] text-sm text-[--text-secondary]">Chunks indexed</p>
            </div>
            <div className="border-t border-[--bg-border] pt-6">
              <p className="font-[family-name:var(--font-mono)] text-3xl text-[--text-primary] mb-1">4</p>
              <p className="font-[family-name:var(--font-body)] text-sm text-[--text-secondary]">Subjects</p>
            </div>
            <div className="border-t border-[--bg-border] pt-6">
              <p className="font-[family-name:var(--font-mono)] text-3xl text-[--text-primary] mb-1">0</p>
              <p className="font-[family-name:var(--font-body)] text-sm text-[--text-secondary]">Hallucinations</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── [02] How it works ────────────────────────────── */}
      <section className="border-t border-[--bg-border] pt-20 pb-24 relative z-10">
        <div className="container">
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-[--text-secondary] tracking-widest uppercase block mb-6">
            [02] How it works
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal leading-snug text-[--text-primary] mb-12">
            Three steps to <em className="italic text-[--accent]">cited answers.</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: "01", title: "Upload your PDFs", desc: "Teachers upload syllabi, past papers, and handbooks. Documents are chunked and embedded into a vector database." },
              { num: "02", title: "Ask in plain English", desc: "Students type natural language questions. The system retrieves the most relevant passages from your school's own documents." },
              { num: "03", title: "Get cited answers", desc: "Every answer includes page-level citations back to the source material. No hallucinations — only grounded responses." },
            ].map((step) => (
              <div key={step.num} className="space-y-4">
                <span className="font-[family-name:var(--font-mono)] text-[11px] text-[--text-tertiary] tracking-widest">{step.num}</span>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-normal text-[--text-primary]">
                  <em className="italic">{step.title}</em>
                </h3>
                <p className="font-[family-name:var(--font-body)] text-sm text-[--text-secondary] font-light leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── [03] For Schools ─────────────────────────────── */}
      <section className="border-t border-[--bg-border] pt-20 pb-24 relative z-10">
        <div className="container">
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-[--text-secondary] tracking-widest uppercase block mb-6">
            [03] For Schools
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal leading-snug text-[--text-primary] mb-12">
            Built for every <em className="italic text-[--accent]">stakeholder.</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { role: "Students", items: ["Ask questions in natural language", "Get page-cited answers instantly", "Study across all indexed subjects", "Flag unhelpful answers for review"] },
              { role: "Teachers", items: ["Upload syllabi and past papers", "Review flagged student queries", "Monitor answer quality metrics", "Manage subject knowledge bases"] },
              { role: "Admins", items: ["Full document lifecycle control", "User and role management", "System metrics and usage logs", "Delete and re-index documents"] },
            ].map((col) => (
              <div key={col.role} className="border-t border-[--bg-border] pt-6 space-y-4">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-normal text-[--text-primary]">
                  <em className="italic">{col.role}</em>
                </h3>
                <ul className="space-y-2.5">
                  {col.items.map((item, i) => (
                    <li key={i} className="flex items-baseline gap-3">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-[--text-tertiary]">→</span>
                      <span className="font-[family-name:var(--font-body)] text-sm text-[--text-secondary] font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-[--bg-border] py-8 relative z-10">
        <div className="container">
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[--text-tertiary] uppercase tracking-widest">
            SchoolRAG · Domasi College of Education · © 2026
          </span>
        </div>
      </footer>

      {/* ── Sign-in Modal ────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal panel */}
          <div className="relative bg-[--bg-surface] border border-[--bg-border] w-full max-w-md mx-4 p-8 animate-in z-10">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2 border-b border-[--bg-border] pb-4">
                <span className="font-[family-name:var(--font-mono)] text-[10px] text-[--text-tertiary] uppercase tracking-widest block">[Access Portal]</span>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-normal text-[--text-primary]">
                  Select a <em className="italic">session</em> role
                </h2>
              </div>

              {/* Role select */}
              <div className="flex gap-2">
                {(["student", "teacher", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`flex-1 py-1.5 border font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider transition ${
                      role === r
                        ? "border-[--accent] text-[--accent] bg-[--accent-subtle]"
                        : "border-[--bg-border] text-[--text-secondary] hover:text-[--text-primary]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="font-[family-name:var(--font-mono)] text-xs text-[--error]">
                    [ERR] {error}
                  </div>
                )}

                <div className="border-b border-[--bg-border] pb-2 focus-within:border-[--text-secondary] transition-colors">
                  <label className="font-[family-name:var(--font-mono)] text-[10px] text-[--text-tertiary] uppercase tracking-widest block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent outline-none font-[family-name:var(--font-body)] text-sm text-[--text-primary]"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="border-b border-[--bg-border] pb-2 focus-within:border-[--text-secondary] transition-colors">
                  <label className="font-[family-name:var(--font-mono)] text-[10px] text-[--text-tertiary] uppercase tracking-widest block mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none font-[family-name:var(--font-body)] text-sm text-[--text-primary]"
                    placeholder="Enter institutional email"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 font-[family-name:var(--font-body)] font-medium text-sm text-[--bg-base] bg-[--text-primary] hover:bg-[--accent] px-5 py-3 transition-colors duration-200 flex items-center justify-center gap-1.5"
                  >
                    {loading ? "Authenticating..." : `Enter as ${role.toUpperCase()} →`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="font-[family-name:var(--font-mono)] text-[10px] text-[--text-tertiary] hover:text-[--text-primary] uppercase tracking-wider transition px-3 py-3 border border-[--bg-border] hover:border-[--text-secondary]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
