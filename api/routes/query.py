"""
Query route — the main RAG endpoint.

POST /query  accepts a question (and optional conversation_id / subject),
performs retrieval-augmented generation, persists messages, and returns the
answer with source citations.
"""

from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.database import get_db
from api.models import Conversation, Message
from api.middleware.auth import get_current_user
from api.middleware.ratelimit import check_quota, increment_query_count
from app.rag import ask

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    subject: Optional[str] = None


class SourceItem(BaseModel):
    filename: str | None = None
    chunk: str | None = None
    source: str | None = None


class QueryResponse(BaseModel):
    answer: str
    sources: list
    conversation_id: str
    message_id: str


# ── Route ────────────────────────────────────────────────────────────────

@router.post("/query", response_model=QueryResponse)
def query(
    body: QueryRequest,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run a RAG query and persist the conversation."""

    user_id = user["id"]

    # ── Rate limiting ────────────────────────────────────────────────
    check_quota(user_id, user["role"], db)

    # ── Resolve or create conversation ───────────────────────────────
    if body.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == body.conversation_id)
            .first()
        )
        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
    else:
        conversation = Conversation(
            user_id=user_id,
            subject=body.subject,
            title=body.question[:50],
        )
        db.add(conversation)
        db.flush()

    # ── Call the RAG pipeline ────────────────────────────────────────
    result = ask(body.question, subject=body.subject)

    # ── Persist messages ─────────────────────────────────────────────
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=body.question,
    )
    db.add(user_msg)

    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=result["answer"],
        sources=result.get("sources"),
    )
    db.add(assistant_msg)

    # ── Increment usage counter ──────────────────────────────────────
    increment_query_count(user_id, db)

    db.commit()
    db.refresh(assistant_msg)

    return QueryResponse(
        answer=result["answer"],
        sources=result.get("sources", []),
        conversation_id=str(conversation.id),
        message_id=str(assistant_msg.id),
    )
