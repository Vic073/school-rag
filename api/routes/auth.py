"""
Authentication routes.

- POST /token        — exchange an external token for a SchoolRAG JWT
- GET  /me           — return current user profile
- POST /dev-login    — dev-mode login (creates user if needed)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.database import get_db
from api.models import User
from api.middleware.auth import (
    create_access_token,
    decode_access_token,
    get_current_user,
)

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────

class TokenRequest(BaseModel):
    token: str


class DevLoginRequest(BaseModel):
    email: str
    name: str = "Dev User"
    role: str = "student"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None
    role: str

    model_config = {"from_attributes": True}


# ── Helpers ──────────────────────────────────────────────────────────────

def _get_or_create_user(
    email: str,
    name: str | None,
    role: str,
    db: Session,
) -> User:
    """Look up user by email; create if not found."""
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(email=email, name=name, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def _issue_jwt(user: User) -> str:
    return create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "name": user.name or "",
            "role": user.role,
        }
    )


# ── Routes ───────────────────────────────────────────────────────────────

@router.post("/token", response_model=TokenResponse)
def exchange_token(body: TokenRequest, db: Session = Depends(get_db)):
    """
    Accept an external JWT (e.g. from NextAuth), verify it, look up or
    create the user in the local DB, and return a SchoolRAG JWT.
    """
    payload = decode_access_token(body.token)
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token must contain an email claim",
        )

    user = _get_or_create_user(
        email=email,
        name=payload.get("name"),
        role=payload.get("role", "student"),
        db=db,
    )
    return TokenResponse(access_token=_issue_jwt(user))


@router.get("/me", response_model=UserResponse)
def me(user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return UserResponse(
        id=str(user["id"]),
        email=user["email"],
        name=user.get("name"),
        role=user["role"],
    )


@router.post("/dev-login", response_model=TokenResponse)
def dev_login(body: DevLoginRequest, db: Session = Depends(get_db)):
    """
    Dev-only endpoint. Creates the user if it doesn't exist and returns
    a JWT. No password required.
    """
    if body.role not in ("student", "teacher", "admin"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="role must be student, teacher, or admin",
        )

    user = _get_or_create_user(
        email=body.email,
        name=body.name,
        role=body.role,
        db=db,
    )
    return TokenResponse(access_token=_issue_jwt(user))
