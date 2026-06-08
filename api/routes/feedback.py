from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from api.database import get_db
from api.models import Feedback, Message
from api.middleware.auth import get_current_user, require_role

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    message_id: UUID
    rating: int  # 1 (up) or -1 (down)
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: UUID
    message_id: UUID
    user_id: UUID
    rating: int
    comment: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

class LowRatedFeedbackResponse(BaseModel):
    id: UUID
    message_content: str
    user_email: str
    rating: int
    comment: Optional[str]
    created_at: str

# ── Routes ───────────────────────────────────────────────────────────────

@router.post("", response_model=FeedbackResponse)
def submit_feedback(
    body: FeedbackCreate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit rating and comment for an assistant message."""
    if body.rating not in (1, -1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be 1 (thumbs up) or -1 (thumbs down)"
        )

    # Verify message exists
    message = db.query(Message).filter(Message.id == body.message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    # Check if user already gave feedback for this message
    feedback = (
        db.query(Feedback)
        .filter(Feedback.message_id == body.message_id, Feedback.user_id == user["id"])
        .first()
    )

    if feedback:
        feedback.rating = body.rating
        feedback.comment = body.comment
    else:
        feedback = Feedback(
            message_id=body.message_id,
            user_id=user["id"],
            rating=body.rating,
            comment=body.comment
        )
        db.add(feedback)

    db.commit()
    db.refresh(feedback)

    return FeedbackResponse(
        id=feedback.id,
        message_id=feedback.message_id,
        user_id=feedback.user_id,
        rating=feedback.rating,
        comment=feedback.comment,
        created_at=feedback.created_at.isoformat()
    )

@router.get("/low-rated", response_model=List[LowRatedFeedbackResponse])
def get_low_rated_feedback(
    user: dict = Depends(require_role("teacher", "admin")),
    db: Session = Depends(get_db)
):
    """Retrieve all negative/low-rated feedback entries (teacher/admin only)."""
    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.rating == -1)
        .order_by(Feedback.created_at.desc())
        .all()
    )

    results = []
    for fb in feedbacks:
        msg = db.query(Message).filter(Message.id == fb.message_id).first()
        usr = fb.user
        results.append(
            LowRatedFeedbackResponse(
                id=fb.id,
                message_content=msg.content if msg else "Message deleted",
                user_email=usr.email if usr else "Unknown user",
                rating=fb.rating,
                comment=fb.comment,
                created_at=fb.created_at.isoformat()
            )
        )
    return results
