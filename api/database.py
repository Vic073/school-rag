"""
Database configuration and session management.

Uses SQLAlchemy 2.0+ with PostgreSQL. Falls back to the default
connection string when DATABASE_URL is not set.
"""

import os
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://localhost:5432/schoolrag",
)

engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


def get_db():
    """FastAPI dependency that yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables that don't already exist."""
    # Import models so they are registered on Base.metadata
    import api.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
