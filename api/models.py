"""
SQLAlchemy ORM models for the SchoolRAG application.

All primary keys use server-generated UUIDs via gen_random_uuid()
(PostgreSQL 13+). Timestamps default to UTC now.
"""

import uuid
from datetime import datetime, date, timezone

from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from api.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="student")
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    conversations = relationship(
        "Conversation", back_populates="user", cascade="all, delete-orphan"
    )
    feedbacks = relationship(
        "Feedback", back_populates="user", cascade="all, delete-orphan"
    )
    query_usages = relationship(
        "QueryUsage", back_populates="user", cascade="all, delete-orphan"
    )
    documents = relationship(
        "Document", back_populates="uploader"
    )


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    subject = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="conversations")
    messages = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan",
        order_by="Message.created_at",
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )
    role = Column(String(20), nullable=False)  # 'user' | 'assistant'
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)  # [{ filename, page, chunk }]
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    conversation = relationship("Conversation", back_populates="messages")
    feedbacks = relationship(
        "Feedback", back_populates="message", cascade="all, delete-orphan"
    )


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    message_id = Column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    rating = Column(Integer, nullable=False)  # 1 or -1
    comment = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    message = relationship("Message", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")


class QueryUsage(Base):
    __tablename__ = "query_usages"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    date = Column(Date, nullable=False, default=lambda: date.today())
    count = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_date"),
    )

    user = relationship("User", back_populates="query_usages")


class Document(Base):
    __tablename__ = "documents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    filename = Column(String(500), nullable=False)
    subject = Column(String(255), nullable=False)
    uploaded_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    uploaded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    chunk_count = Column(Integer, nullable=False, default=0)
    file_path = Column(String(1000), nullable=False)

    uploader = relationship("User", back_populates="documents")
