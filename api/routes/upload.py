"""
File upload route — PDF ingestion into the RAG pipeline.

POST /upload  accepts a PDF file + subject, extracts text, chunks it,
embeds the chunks, stores them in ChromaDB, and records the document
in the database.
"""

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.database import get_db
from api.middleware.auth import require_role
from api.models import Document
from app.embeddings import get_embedding_model
from app.retrieval import client as chroma_client, collection as chroma_collection

router = APIRouter()

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ── Schemas ──────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    filename: str
    chunks_created: int
    status: str = "ok"


# ── Chunking helper (reuses logic from scripts/chunk_documents.py) ───────

def _chunk_text(text: str, chunk_size: int = 512, overlap: int = 64) -> list[str]:
    """Split text into overlapping chunks of approximately *chunk_size* chars."""
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end >= len(text):
            chunks.append(text[start:])
            break
        search_start = max(start + chunk_size // 2, end - overlap)
        cut = end
        para_break = text.rfind("\n\n", search_start, end)
        if para_break != -1:
            cut = para_break + 1
        else:
            newline_break = text.rfind("\n", search_start, end)
            if newline_break != -1:
                cut = newline_break + 1
            else:
                for sep in (". ", "! ", "? "):
                    idx = text.rfind(sep, search_start, end)
                    if idx != -1:
                        cut = idx + len(sep)
                        break
        chunks.append(text[start:cut])
        start = cut - overlap if cut != end else cut
        if start >= end:
            start = end
    return chunks


# ── Route ────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadResponse)
def upload_document(
    file: UploadFile = File(...),
    subject: str = Form("General"),
    user: dict = Depends(require_role("teacher", "admin")),
    db: Session = Depends(get_db),
):
    """Upload a PDF, extract text, embed chunks, and store in ChromaDB."""

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported",
        )

    # ── Save file to disk ────────────────────────────────────────────
    safe_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = UPLOAD_DIR / safe_name
    content = file.file.read()
    file_path.write_bytes(content)

    # ── Extract text with pdfplumber ─────────────────────────────────
    try:
        import pdfplumber

        full_text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"
    except Exception as exc:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract text from PDF: {exc}",
        )

    if not full_text.strip():
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="PDF contains no extractable text",
        )

    # ── Chunk ────────────────────────────────────────────────────────
    chunks = _chunk_text(full_text)

    # ── Embed & store in ChromaDB ────────────────────────────────────
    model = get_embedding_model()
    now_str = datetime.now(timezone.utc).isoformat()

    doc_ids: list[str] = []
    documents: list[str] = []
    embeddings: list[list[float]] = []
    metadatas: list[dict] = []

    for i, chunk_text_content in enumerate(chunks):
        chunk_id = f"{safe_name}_{i}"
        doc_ids.append(chunk_id)
        documents.append(chunk_text_content)
        embeddings.append(model.encode(chunk_text_content).tolist())
        metadatas.append(
            {
                "source": file.filename,
                "subject": subject,
                "uploaded_by": str(user["id"]),
                "uploaded_at": now_str,
            }
        )

    # Batch upsert
    BATCH = 32
    for start in range(0, len(doc_ids), BATCH):
        end = start + BATCH
        chroma_collection.add(
            ids=doc_ids[start:end],
            documents=documents[start:end],
            embeddings=embeddings[start:end],
            metadatas=metadatas[start:end],
        )

    # ── Record in DB ─────────────────────────────────────────────────
    doc_record = Document(
        filename=file.filename,
        subject=subject,
        uploaded_by=user["id"],
        chunk_count=len(chunks),
        file_path=str(file_path),
    )
    db.add(doc_record)
    db.commit()

    return UploadResponse(
        filename=file.filename,
        chunks_created=len(chunks),
    )
