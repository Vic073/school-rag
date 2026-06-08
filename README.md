# SchoolRAG 📚

> A self-hosted, school-focused Retrieval-Augmented Generation (RAG) system that lets students and teachers ask questions against course materials and get cited, grounded answers.

---

## Table of Contents

- [Overview](#overview)
- [Current Architecture](#current-architecture)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [MVP Features Roadmap](#mvp-features-roadmap)
  - [1. Document Ingestion Pipeline (Admin Upload)](#1-document-ingestion-pipeline-admin-upload)
  - [2. Google OAuth (NextAuth.js)](#2-google-oauth-nextauthjs)
  - [3. Role-Based Access (Student vs Teacher)](#3-role-based-access-student-vs-teacher)
  - [4. Conversation History & Sessions](#4-conversation-history--sessions)
  - [5. Source Citations in Answers](#5-source-citations-in-answers)
  - [6. Subject / Course Namespacing](#6-subject--course-namespacing)
  - [7. Next.js Frontend](#7-nextjs-frontend)
  - [8. REST API (FastAPI)](#8-rest-api-fastapi)
  - [9. Feedback & Quality Loop](#9-feedback--quality-loop)
  - [10. Rate Limiting & Usage Quotas](#10-rate-limiting--usage-quotas)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

SchoolRAG is a RAG pipeline built **without LangChain or AutoGen** — everything is wired manually so you understand exactly what's happening at each step. The system:

1. Ingests school documents (PDFs, notes, past papers) and chunks + embeds them into a vector store.
2. When a student asks a question, it retrieves the top-k semantically similar chunks.
3. Those chunks are injected into a prompt, and an LLM generates a grounded, cited answer.

The goal for the MVP is to wrap this pipeline in a proper web application — a Next.js frontend, a FastAPI backend, Google login via NextAuth, and enough product polish to demo to a school.

---

## Current Architecture

```
User Question
     │
     ▼
[Embedding Model]  ──►  Query Vector
     │
     ▼
[Vector DB (ChromaDB / pgvector)]
     │  Top-K chunks
     ▼
[LLM (OpenAI / Gemini)]  ──►  Answer
```

**What already works:**
- Manual chunking of documents (`scripts/`)
- Embedding generation and storage (`db/`)
- Similarity search + prompt construction (`app/`)
- Basic question → answer flow

---

## Project Structure

```
school-rag/
├── app/                  # Core RAG logic
│   └── main.py           # Entry point: query → retrieve → generate
├── data/                 # Raw source documents (PDFs, text files)
├── db/                   # Vector store interaction (embed, upsert, query)
├── scripts/              # One-off scripts: chunking, ingestion
├── .gitignore
└── README.md             ← you are here

# Planned additions (MVP)
├── api/                  # FastAPI backend
│   ├── routes/
│   │   ├── query.py      # POST /api/query
│   │   ├── upload.py     # POST /api/upload  (admin only)
│   │   ├── history.py    # GET  /api/history
│   │   └── feedback.py   # POST /api/feedback
│   ├── middleware/
│   │   ├── auth.py       # JWT verification
│   │   └── ratelimit.py
│   └── main.py
└── frontend/             # Next.js app
    ├── app/
    │   ├── (auth)/       # Login page
    │   ├── (app)/
    │   │   ├── chat/     # Main Q&A interface
    │   │   └── admin/    # Document management
    │   └── api/auth/     # NextAuth route handler
    ├── components/
    └── lib/
```

---

## Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+ (for the frontend, once built)
- A vector DB running locally — ChromaDB (default) or Postgres with pgvector

### Backend

```bash
git clone https://github.com/Vic073/school-rag.git
cd school-rag

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Ingest documents
python scripts/ingest.py --dir data/

# Run the query pipeline (CLI, current state)
python app/main.py --query "What is the law of conservation of energy?"
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
OPENAI_API_KEY=sk-...
CHROMA_PERSIST_DIR=./db/chroma
```

---

## MVP Features Roadmap

Each section below describes the feature, why it matters, and enough technical detail for a coding agent to implement it autonomously.

---

### 1. Document Ingestion Pipeline (Admin Upload)

**Why:** Right now ingestion is a manual CLI script. Teachers need a UI to upload course PDFs without touching the terminal.

**What to build:**
- A `POST /api/upload` endpoint in FastAPI that accepts a multipart PDF upload.
- The endpoint should:
  1. Save the file to a `/data/uploads/` directory.
  2. Run the existing chunking + embedding pipeline on it (call the logic from `scripts/ingest.py` as a module).
  3. Tag each chunk with metadata: `{ source_filename, subject, uploaded_by, uploaded_at }`.
- Only users with the `teacher` or `admin` role can call this endpoint (see Role-Based Access below).
- Return a job status: `{ filename, chunks_created, status: "ok" }`.

**Suggested libraries:** `python-multipart`, `pypdf` or `pdfplumber` for extraction.

---

### 2. Google OAuth (NextAuth.js)

**Why:** Schools have Google Workspace accounts. One-click Google login removes all friction and means no password management.

**What to build (Next.js):**

```
frontend/
└── app/
    └── api/
        └── auth/
            └── [...nextauth]/
                └── route.ts    ← NextAuth handler
```

Install:
```bash
npm install next-auth @auth/core
```

`auth.ts` config:
```ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Attach role from your DB to the session
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Lookup or create user in your DB here
        token.role = await getUserRole(user.email);
      }
      return token;
    },
  },
});
```

The session `role` field is passed to every API call via a JWT in the `Authorization` header, which the FastAPI backend verifies.

**Required env vars:**
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...           # random string, e.g. openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

Set up OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.

---

### 3. Role-Based Access (Student vs Teacher)

**Why:** Students should only ask questions. Teachers should upload documents and see usage analytics.

**Roles:** `student` | `teacher` | `admin`

**What to build:**

On first Google login, create a user row in a Postgres table:

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  role        TEXT DEFAULT 'student',   -- 'student' | 'teacher' | 'admin'
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

FastAPI middleware — `api/middleware/auth.py`:
```python
from fastapi import HTTPException, Depends
from jose import jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload  # { email, role, ... }

def require_role(*roles):
    def guard(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return guard
```

Usage in routes:
```python
@router.post("/upload")
def upload_doc(file: UploadFile, user=Depends(require_role("teacher", "admin"))):
    ...
```

The Next.js frontend hides/shows UI elements based on `session.user.role`.

---

### 4. Conversation History & Sessions

**Why:** Students should be able to scroll back through their previous questions and answers, and context should carry across turns in a single session.

**What to build:**

Database table:
```sql
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  subject     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role            TEXT,   -- 'user' | 'assistant'
  content         TEXT,
  sources         JSONB,  -- array of { chunk_id, filename, page }
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

API routes:
- `POST /api/conversations` — start a new conversation, returns `conversation_id`.
- `GET /api/conversations` — list user's past conversations.
- `POST /api/query` — accepts `{ conversation_id, question, subject? }`, retrieves context, generates answer, saves both turns to `messages`.
- `GET /api/conversations/{id}/messages` — fetch full message thread.

For multi-turn context: on each query, fetch the last N messages from the conversation and prepend them to the LLM prompt as chat history.

---

### 5. Source Citations in Answers

**Why:** Grounded answers with citations build trust and help students study from the original material.

**What to build:**

When the retriever returns chunks, include metadata alongside the answer:

Modify `app/main.py` to return:
```python
{
  "answer": "The law of conservation of energy states...",
  "sources": [
    { "filename": "physics_notes_form3.pdf", "page": 12, "chunk": "Energy cannot be created..." },
    { "filename": "past_paper_2023.pdf",     "page": 3,  "chunk": "In a closed system..."    }
  ]
}
```

Prompt template:
```
Answer the question using ONLY the context below.
At the end, list the source documents you used.

Context:
[CHUNK 1 — physics_notes_form3.pdf, p.12]
Energy cannot be created or destroyed...

[CHUNK 2 — past_paper_2023.pdf, p.3]
In a closed system...

Question: {question}
```

In the Next.js frontend, render a collapsible "Sources" section under each answer showing the filenames and page numbers.

---

### 6. Subject / Course Namespacing

**Why:** A school has multiple subjects. Biology notes shouldn't pollute a Physics query.

**What to build:**

When ingesting, tag every chunk with a `subject` field (e.g., `"physics"`, `"biology"`).

In ChromaDB, use `where` filters:
```python
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=5,
    where={"subject": subject}   # filter to selected subject
)
```

If using pgvector:
```sql
SELECT *, embedding <=> $1 AS distance
FROM document_chunks
WHERE subject = $2
ORDER BY distance
LIMIT 5;
```

In the UI: a subject selector dropdown appears before the chat input. The selected subject is sent with every query.

Admin panel includes a subject management page to add/edit subjects and see how many chunks each has.

---

### 7. Next.js Frontend

**Why:** A proper web UI makes this usable by actual students and teachers, and is required for Google login.

**Pages to build:**

| Route | Description |
|---|---|
| `/` | Landing / login page |
| `/chat` | Main Q&A interface (protected) |
| `/chat/[id]` | Specific conversation thread |
| `/admin` | Teacher dashboard: upload docs, view usage |
| `/admin/documents` | List all ingested documents |

**Key components:**

- `<SubjectSelector />` — dropdown to pick subject before asking
- `<ChatMessage role="user|assistant" sources={[]} />` — renders a message with collapsible sources
- `<ChatInput />` — textarea + send button, shows loading spinner during streaming
- `<DocumentUpload />` — drag-and-drop PDF upload (admin only)
- `<ConversationSidebar />` — list of past conversation threads

**Streaming:** Use the Fetch API with `ReadableStream` to stream the LLM response token-by-token so it feels fast. FastAPI supports streaming via `StreamingResponse`.

**Install:**
```bash
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend
npm install next-auth @auth/core lucide-react
```

---

### 8. REST API (FastAPI)

**Why:** A proper API layer decouples the RAG logic from the frontend and makes the system extensible.

**Endpoints:**

```
POST   /api/auth/token          ← exchange NextAuth JWT for FastAPI JWT
POST   /api/conversations        ← start new conversation
GET    /api/conversations        ← list user's conversations
GET    /api/conversations/{id}   ← get conversation with messages
POST   /api/query                ← ask a question (main RAG endpoint)
POST   /api/upload               ← upload document (teacher/admin)
GET    /api/documents            ← list ingested documents (admin)
DELETE /api/documents/{id}       ← delete a document + its chunks (admin)
POST   /api/feedback             ← thumbs up/down on an answer
GET    /api/subjects             ← list available subjects
```

**Setup:**
```bash
pip install fastapi uvicorn python-jose[cryptography] python-multipart sqlalchemy psycopg2-binary
uvicorn api.main:app --reload
```

Add CORS middleware so the Next.js dev server can call it:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 9. Feedback & Quality Loop

**Why:** Knowing which answers were unhelpful tells you where the RAG pipeline needs improvement — better chunking, more documents, or prompt tuning.

**What to build:**

```sql
CREATE TABLE feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID REFERENCES messages(id),
  user_id     UUID REFERENCES users(id),
  rating      SMALLINT,   -- 1 = thumbs up, -1 = thumbs down
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

- In the UI, show 👍 / 👎 buttons under each assistant message.
- `POST /api/feedback` saves the rating.
- Admin dashboard shows a table of low-rated answers so teachers can see gaps and upload better materials.

---

### 10. Rate Limiting & Usage Quotas

**Why:** LLM API calls cost money. You need to prevent abuse and keep costs predictable.

**What to build:**

Simple per-user daily quota stored in Redis (or just Postgres if Redis is overkill for an MVP):

```python
# api/middleware/ratelimit.py
MAX_QUERIES_PER_DAY = 50   # students
MAX_QUERIES_PER_DAY_TEACHER = 200

def check_quota(user_id, role):
    count = get_query_count_today(user_id)   # query from DB
    limit = MAX_QUERIES_PER_DAY if role == "student" else MAX_QUERIES_PER_DAY_TEACHER
    if count >= limit:
        raise HTTPException(429, f"Daily limit of {limit} queries reached.")
    increment_query_count(user_id)
```

In the UI, show the user their remaining queries for the day (e.g., "32 / 50 queries used today").

---

## Tech Stack

| Layer | Technology |
|---|---|
| **RAG Pipeline** | Python, manual embeddings (no LangChain) |
| **Embeddings** | OpenAI `text-embedding-3-small` or `sentence-transformers` |
| **LLM** | OpenAI GPT-4o (swap for Gemini or local Ollama) |
| **Vector Store** | ChromaDB (dev) → pgvector on Postgres (prod) |
| **Backend API** | FastAPI + Uvicorn |
| **Database** | PostgreSQL (users, conversations, messages, feedback) |
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS |
| **Auth** | NextAuth.js v5 + Google OAuth |
| **Deployment** | Render / Railway (backend) + Vercel (frontend) |

---

## Environment Variables

### Backend `.env`

```env
# LLM
OPENAI_API_KEY=sk-...

# Vector Store
CHROMA_PERSIST_DIR=./db/chroma

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/schoolrag

# Auth
JWT_SECRET=your-random-secret

# App
ENVIRONMENT=development
```

### Frontend `.env.local`

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Deployment

### Quick (Free Tier)

- **Backend** → [Railway](https://railway.app) or [Render](https://render.com). Add a Postgres plugin for the database. Set env vars in the dashboard.
- **Frontend** → [Vercel](https://vercel.com). Connect the GitHub repo, set `frontend/` as root dir, add env vars.
- **Vector Store** → Use ChromaDB with persistent local storage on Railway, or swap to pgvector on the same Postgres instance.

Update `NEXTAUTH_URL` and `NEXT_PUBLIC_API_URL` to your production URLs. Add the production callback URL to Google OAuth credentials.

### Docker (Optional)

```dockerfile
# Dockerfile (backend)
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/document-upload`
3. Commit: `git commit -m "feat: add PDF upload endpoint"`
4. Open a PR with a description of what the feature does and how to test it

---

*Built by [@Vic073](https://github.com/Vic073) — learning RAG the hard way, without the abstraction.*
