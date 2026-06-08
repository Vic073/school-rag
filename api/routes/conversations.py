from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from api.database import get_db
from api.models import Conversation, Message
from api.middleware.auth import get_current_user

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    subject: Optional[str] = "General"
    title: Optional[str] = "New Conversation"

class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    sources: Optional[List[dict]] = None
    created_at: str

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: UUID
    subject: Optional[str]
    title: Optional[str]
    created_at: str
    message_count: int

    class Config:
        from_attributes = True

# ── Routes ───────────────────────────────────────────────────────────────

@router.post("", response_model=ConversationResponse)
def create_conversation(
    body: ConversationCreate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new conversation session."""
    conversation = Conversation(
        user_id=user["id"],
        subject=body.subject,
        title=body.title,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return ConversationResponse(
        id=conversation.id,
        subject=conversation.subject,
        title=conversation.title,
        created_at=conversation.created_at.isoformat(),
        message_count=0
    )

@router.get("", response_model=List[ConversationResponse])
def list_conversations(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all conversations for the authenticated user."""
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == user["id"])
        .order_by(Conversation.created_at.desc())
        .all()
    )

    response = []
    for conv in conversations:
        # count messages
        msg_count = db.query(Message).filter(Message.conversation_id == conv.id).count()
        response.append(
            ConversationResponse(
                id=conv.id,
                subject=conv.subject,
                title=conv.title,
                created_at=conv.created_at.isoformat(),
                message_count=msg_count
            )
        )
    return response

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: UUID,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the full message thread for a conversation."""
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == user["id"])
        .first()
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [
        MessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            sources=msg.sources,
            created_at=msg.created_at.isoformat()
        )
        for msg in messages
    ]
