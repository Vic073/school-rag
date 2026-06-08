from app.retrieval import retrieve
from app.llm import generate_answer

def ask(question: str, subject: str = None):
    results = retrieve(question, subject=subject)

    documents = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []

    # Build context with numbered sources
    context_parts = []
    for i, (doc, meta) in enumerate(zip(documents, metadatas), 1):
        source_name = meta.get("source", "Unknown")
        context_parts.append(f"[Document {i} - {source_name}]\n{doc}")

    context = "\n\n".join(context_parts)

    answer = generate_answer(
        question,
        context
    )

    sources = []
    for doc, meta in zip(documents, metadatas):
        sources.append({
            "filename": meta.get("source", "Unknown"),
            "chunk": doc,
            "subject": meta.get("subject", "General")
        })

    return {
        "answer": answer,
        "sources": sources
    }