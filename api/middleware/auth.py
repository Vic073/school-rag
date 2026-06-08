"""
Authentication middleware for SchoolRAG.

Supports three modes:
1. Production — verifies a JWT signed with JWT_SECRET.
2. Dev header  — if header ``X-Dev-User`` is sent, creates a mock user.
3. Dev auto    — if ENVIRONMENT=development and no auth header, defaults
                 to a dev admin user.
"""

import os
from typing import Optional
from uuid import UUID

from dotenv import load_dotenv
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

_bearer_scheme = HTTPBearer(auto_error=False)


# ── helpers ──────────────────────────────────────────────────────────────

def _make_dev_user(role: str = "admin") -> dict:
    """Return a deterministic dev-mode user dict."""
    return {
        "id": "00000000-0000-0000-0000-000000000000",
        "email": "dev@schoolrag.local",
        "name": f"Dev {role.capitalize()}",
        "role": role,
    }


def create_access_token(data: dict) -> str:
    """Create a signed JWT from *data*."""
    if not JWT_SECRET:
        # In dev mode fall back to a static secret so tokens still work.
        secret = "dev-secret-do-not-use-in-production"
    else:
        secret = JWT_SECRET
    return jwt.encode(data, secret, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT. Raises HTTPException on failure."""
    secret = JWT_SECRET or "dev-secret-do-not-use-in-production"
    try:
        payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


# ── FastAPI dependencies ─────────────────────────────────────────────────

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    x_dev_user: Optional[str] = Header(None),
) -> dict:
    """
    Resolve the current user from the request.

    Priority order:
    1. ``X-Dev-User`` header (dev mode shortcut).
    2. Bearer JWT in ``Authorization`` header.
    3. If ENVIRONMENT=development and nothing else is provided, return a
       default dev admin user.
    """
    # 1. Dev header bypass
    if x_dev_user and x_dev_user.lower() in ("admin", "teacher", "student"):
        return _make_dev_user(x_dev_user.lower())

    # 2. Bearer token
    if credentials and credentials.credentials:
        payload = decode_access_token(credentials.credentials)
        return {
            "id": payload.get("sub", payload.get("id")),
            "email": payload.get("email", ""),
            "name": payload.get("name", ""),
            "role": payload.get("role", "student"),
        }

    # 3. Dev auto-login
    if ENVIRONMENT == "development":
        return _make_dev_user("admin")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )


def require_role(*roles: str):
    """
    Return a FastAPI dependency that checks the user has one of the
    specified roles.

    Usage::

        @router.get("/admin-only", dependencies=[Depends(require_role("admin"))])
        def admin_only(): ...
    """

    async def _check(user: dict = Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {', '.join(roles)}",
            )
        return user

    return _check
