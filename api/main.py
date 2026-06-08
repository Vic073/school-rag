import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api.database import init_db
from api.routes import auth, query, upload, conversations, documents, subjects, feedback

load_dotenv()

app = FastAPI(
    title="SchoolRAG API",
    description="Backend API for SchoolRAG retrieval-augmented generation system",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(query.router, prefix="/api", tags=["query"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["conversations"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["subjects"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])

@app.on_event("startup")
def startup_event():
    # Make sure DB schema is created
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": os.getenv("ENVIRONMENT", "development")}
