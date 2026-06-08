"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/Providers";
import { BookOpen, ShieldAlert, Zap, GraduationCap } from "lucide-react";

export default function Home() {
  const { login, loading } = useAuth();
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
    <div className="flex min-h-screen flex-col bg-[#050508] relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Marketing / Branding */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold w-max">
            <GraduationCap size={14} /> Built for Domasi College of Education
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Grounded Knowledge for <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Smart Classrooms.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-lg">
            SchoolRAG is a self-hosted retrieval-augmented assistant that lets students and teachers get instant, cited answers directly from verified course syllabus documents and handbooks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-2xl">
            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <div className="text-indigo-400 bg-indigo-500/10 p-2.5 rounded-xl w-max">
                <BookOpen size={20} />
              </div>
              <h3 className="font-semibold text-white">Full Source Citations</h3>
              <p className="text-xs text-gray-400">
                Every answer references exact document sources and page numbers, enabling factual verification.
              </p>
            </div>
            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <div className="text-purple-400 bg-purple-500/10 p-2.5 rounded-xl w-max">
                <Zap size={20} />
              </div>
              <h3 className="font-semibold text-white">Course Namespacing</h3>
              <p className="text-xs text-gray-400">
                Isolate queries to specific courses or handbooks. No out-of-domain hallucinations.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-3xl pointer-events-none" />

            <div className="relative space-y-6">
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white">Welcome to SchoolRAG 📚</h2>
                <p className="text-sm text-gray-400">
                  Select your role to access the portal.
                </p>
              </div>

              {/* Role Toggle Selector */}
              <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                {(["student", "teacher", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      role === r
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Developer Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <ShieldAlert size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white"
                    placeholder="Alex Johnson"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white"
                    placeholder="student@schoolrag.edu"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm transition-all duration-200 animate-glow shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : `Access Portal as ${role.toUpperCase()}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
