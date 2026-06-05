from pathlib import Path
import json

DATA_DIR = Path("data")
CHUNK_SIZE = 512
CHUNK_OVERLAP = 64


def chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Split text into overlapping chunks of approximately chunk_size characters."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end >= len(text):
            end = len(text)
            chunks.append(text[start:end])
            break
        # Try to break at a sentence boundary or newline near the chunk end
        search_start = max(start + chunk_size // 2, end - overlap)
        cut = end
        # Look backwards for double newline (paragraph break)
        para_break = text.rfind("\n\n", search_start, end)
        if para_break != -1:
            cut = para_break + 1  # include the first newline
        else:
            # Look backwards for single newline
            newline_break = text.rfind("\n", search_start, end)
            if newline_break != -1:
                cut = newline_break + 1
            else:
                # Look backwards for sentence ending
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


def main():
    print("=" * 50)
    print("Chunking documents for RAG pipeline")
    print("=" * 50)

    input_path = DATA_DIR / "documents.json"
    if not input_path.exists():
        print(f"❌ {input_path} not found — run prepare_documents.py first")
        return

    with open(input_path, encoding="utf-8") as f:
        documents = json.load(f)

    chunks = []
    for doc in documents:
        title = doc.get("title", "Untitled")
        content = doc.get("content", "")
        if not content:
            continue
        doc_chunks = chunk_text(content, CHUNK_SIZE, CHUNK_OVERLAP)
        for i, text in enumerate(doc_chunks):
            chunks.append({
                "title": title,
                "chunk_index": i,
                "text": text,
            })
        print(f"  {title}: {len(doc_chunks)} chunks")

    output_path = DATA_DIR / "chunks.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Saved {len(chunks)} chunks to {output_path}")


if __name__ == "__main__":
    main()