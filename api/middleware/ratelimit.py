"""
Rate-limiting middleware based on daily query quotas.

Quotas are stored in the ``query_usages`` table (one row per user per day).
"""

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from api.models import QueryUsage

# Daily limits by role
MAX_QUERIES_PER_DAY = 50          # students
MAX_QUERIES_PER_DAY_TEACHER = 200  # teachers
MAX_QUERIES_PER_DAY_ADMIN = 1000   # admins (effectively unlimited)

_LIMITS = {
    "student": MAX_QUERIES_PER_DAY,
    "teacher": MAX_QUERIES_PER_DAY_TEACHER,
    "admin": MAX_QUERIES_PER_DAY_ADMIN,
}


def _get_usage_row(user_id: str, db: Session) -> QueryUsage:
    """Return today's usage row, creating one if it doesn't exist."""
    today = date.today()
    usage = (
        db.query(QueryUsage)
        .filter(QueryUsage.user_id == user_id, QueryUsage.date == today)
        .first()
    )
    if usage is None:
        usage = QueryUsage(user_id=user_id, date=today, count=0)
        db.add(usage)
        db.flush()
    return usage


def check_quota(user_id: str, role: str, db: Session) -> None:
    """
    Raise 429 if the user has exceeded their daily query limit.
    """
    limit = _LIMITS.get(role, MAX_QUERIES_PER_DAY)
    usage = _get_usage_row(user_id, db)
    if usage.count >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily query limit ({limit}) reached. Try again tomorrow.",
        )


def increment_query_count(user_id: str, db: Session) -> int:
    """
    Increment today's query count and return the new value.
    """
    usage = _get_usage_row(user_id, db)
    usage.count += 1
    db.flush()
    return usage.count
