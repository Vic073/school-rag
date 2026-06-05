from pathlib import Path
import json

DATA_DIR = Path("data")


def load_handbook() -> str:
    path = DATA_DIR / "handbook.txt"
    if not path.exists():
        print(f"⚠️  {path} not found — skipping")
        return ""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    print(f"📖 handbook.txt: {len(text)} characters")
    return text


def load_calender() -> str:
    path = DATA_DIR / "calender.txt"
    if not path.exists():
        print(f"⚠️  {path} not found — skipping")
        return ""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    print(f"📅 calender.txt: {len(text)} characters")
    return text


def load_website() -> list[dict]:
    path = DATA_DIR / "website.json"
    if not path.exists():
        print(f"⚠️  {path} not found — skipping")
        return []
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    print(f"🌐 website.json: {len(data)} pages")
    return data


def main():
    print("=" * 50)
    print("Preparing documents for RAG pipeline")
    print("=" * 50)

    # Load all sources
    handbook = load_handbook()
    calender = load_calender()
    pages = load_website()

    # Build documents list with source labels
    documents = []

    if handbook:
        documents.append({"title": "Handbook", "content": handbook})

    if calender:
        documents.append({"title": "Academic Calendar", "content": calender})

    for page in pages:
        url = page.get("url", "")
        content = page.get("content", "")
        if content:
            # Derive a readable title from the URL path
            path_part = url.rstrip("/").rsplit("/", 1)[-1] if url else "Unknown"
            title = path_part.replace("-", " ").title() if path_part != url else url
            documents.append({"title": title, "content": content})

    # Save as JSON
    output_path = DATA_DIR / "documents.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)

    total_chars = sum(len(doc["content"]) for doc in documents)
    print(f"\n✅ Saved {len(documents)} documents ({total_chars:,} characters) to {output_path}")


if __name__ == "__main__":
    main()