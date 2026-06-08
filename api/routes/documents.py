import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from api.database import get_db
from api.models import Document
from api.middleware.auth import require_role
from app.retrieval import collection as chroma_collection

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────

class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    subject: str
    uploaded_by: str | None
    uploaded_at: str
    chunk_count: int

    class Config:
        from_attributes = True

# ── Routes ───────────────────────────────────────────────────────────────

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    user: dict = Depends(require_role("teacher", "admin")),
    db: Session = Depends(get_db)
):
    """List all ingested documents (teacher/admin only)."""
    documents = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return [
        DocumentResponse(
            id=doc.id,
            filename=doc.filename,
            subject=doc.subject,
            uploaded_by=str(doc.uploaded_by) if doc.uploaded_by else None,
            uploaded_at=doc.uploaded_at.isoformat(),
            chunk_count=doc.chunk_count
        )
        for doc in documents
    ]

@router.delete("/{document_id}")
def delete_document(
    document_id: UUID,
    user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Delete a document and its chunks from ChromaDB (admin only)."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # 1. Delete associated chunks from ChromaDB
    # The safe filename used for chunk IDs is the basename of file_path
    safe_name = os.path.basename(doc.file_path)
    chunk_ids = [f"{safe_name}_{i}" for i in range(doc.chunk_count)]
    try:
        if chunk_ids:
            chroma_collection.delete(ids=chunk_ids)
    except Exception as exc:
        # Log error but proceed to delete the record/file if possible
        print(f"Error deleting from ChromaDB: {exc}")

    # 2. Delete the physical upload file
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as exc:
            print(f"Error deleting physical file: {exc}")

    # 3. Delete from DB
    db.delete(doc)
    db.commit()

    return {"status": "ok", "message": f"Document {doc.filename} successfully deleted."}
