"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, User, Conversation, Subject } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  conversations: Conversation[];
  subjects: Subject[];
  currentSubject: string;
  setCurrentSubject: (subj: string) => void;
  login: (email: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  refreshConversations: () => Promise<void>;
  refreshSubjects: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState("General");
  const router = useRouter();
  const pathname = usePathname();

  const refreshConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const refreshSubjects = async () => {
    try {
      const subjs = await api.getSubjects();
      setSubjects(subjs);
    } catch (err) {
      console.error("Failed to load subjects:", err);
    }
  };

  // Initialize session
  useEffect(() => {
    async function initSession() {
      const token = localStorage.getItem("schoolrag_token");
      if (token) {
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
          await refreshConversations();
          await refreshSubjects();
        } catch (err) {
          console.error("Session initialization failed:", err);
          api.logout();
          setUser(null);
        }
      }
      setLoading(false);
    }
    initSession();
  }, []);

  // Redirect guard
  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === "/";
      if (!user && !isAuthPage) {
        router.push("/");
      } else if (user && isAuthPage) {
        router.push("/chat");
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, name: string, role: string) => {
    setLoading(true);
    try {
      await api.devLogin(email, name, role);
      const currentUser = await api.getMe();
      setUser(currentUser);
      await refreshConversations();
      await refreshSubjects();
      router.push("/chat");
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setConversations([]);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        conversations,
        subjects,
        currentSubject,
        setCurrentSubject,
        login,
        logout,
        refreshConversations,
        refreshSubjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
