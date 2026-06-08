const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "student" | "teacher" | "admin";
}

export interface Conversation {
  id: string;
  subject: string | null;
  title: string | null;
  created_at: string;
  message_count: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Array<{
    filename: string;
    chunk: string;
    subject: string;
  }> | null;
  created_at: string;
}

export interface Subject {
  name: string;
  chunk_count: number;
}

export interface Document {
  id: string;
  filename: string;
  subject: string;
  uploaded_by: string | null;
  uploaded_at: string;
  chunk_count: number;
}

export interface Feedback {
  id: string;
  message_content: string;
  user_email: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function getHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("schoolrag_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "API request failed" }));
    throw new Error(errorData.detail || `HTTP error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  async devLogin(email: string, name: string, role: string): Promise<{ access_token: string }> {
    const res = await request<{ access_token: string }>("/api/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ email, name, role }),
    });
    if (res.access_token) {
      localStorage.setItem("schoolrag_token", res.access_token);
    }
    return res;
  },

  async getMe(): Promise<User> {
    return request<User>("/api/auth/me");
  },

  logout() {
    localStorage.removeItem("schoolrag_token");
  },

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return request<Conversation[]>("/api/conversations");
  },

  async createConversation(subject: string = "General", title: string = "New Conversation"): Promise<Conversation> {
    return request<Conversation>("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ subject, title }),
    });
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    return request<Message[]>(`/api/conversations/${conversationId}/messages`);
  },

  // RAG Query
  async query(question: string, conversationId?: string, subject?: string): Promise<{
    answer: string;
    sources: Message["sources"];
    conversation_id: string;
    message_id: string;
  }> {
    return request<{
      answer: string;
      sources: Message["sources"];
      conversation_id: string;
      message_id: string;
    }>("/api/query", {
      method: "POST",
      body: JSON.stringify({ question, conversation_id: conversationId || null, subject: subject || null }),
    });
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return request<Subject[]>("/api/subjects");
  },

  // Documents
  async getDocuments(): Promise<Document[]> {
    return request<Document[]>("/api/documents");
  },

  async uploadDocument(file: File, subject: string): Promise<{ filename: string; chunks_created: number }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", subject);

    const token = typeof window !== "undefined" ? localStorage.getItem("schoolrag_token") : null;
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
    }

    return response.json();
  },

  async deleteDocument(id: string): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>(`/api/documents/${id}`, {
      method: "DELETE",
    });
  },

  // Feedback
  async submitFeedback(messageId: string, rating: number, comment?: string): Promise<{ id: string }> {
    return request<{ id: string }>("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ message_id: messageId, rating, comment }),
    });
  },

  async getLowRatedFeedback(): Promise<Feedback[]> {
    return request<Feedback[]>("/api/feedback/low-rated");
  },
};
