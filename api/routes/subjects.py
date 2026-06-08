from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from app.retrieval import collection as chroma_collection
from api.database import get_db
from api.models import Document
from sqlalchemy.orm import Session

router = APIRouter()

class SubjectResponse(BaseModel):
    name: str
    chunk_count: int

@router.get("", response_model=List[SubjectResponse])
def get_subjects(db: Session = Depends(get_db)):
    """Retrieve available subjects and their chunk counts."""
    # Default initial subjects from existing dataset
    subjects_map = {
        "General": 0,
        "Handbook": 0,
        "Academic Calendar": 0,
        "Website": 0
    }

    # Try to count chunks in ChromaDB for each default subject
    for subj in subjects_map.keys():
        try:
            # Query chroma collection for chunks matching this subject or source
            res = chroma_collection.get(
                where={"subject": subj} if subj == "General" else {"source": subj}
            )
            if res and res.get("ids"):
                subjects_map[subj] = len(res["ids"])
        except Exception:
            pass

    # Add subjects from uploaded documents in DB
    uploaded_docs = db.query(Document).all()
    for doc in uploaded_docs:
        subj = doc.subject
        if subj not in subjects_map:
            subjects_map[subj] = 0
        subjects_map[subj] += doc.chunk_count

    return [
        SubjectResponse(name=name, chunk_count=count)
        for name, count in subjects_map.items()
    ]
