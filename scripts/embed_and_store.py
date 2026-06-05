import json
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


DATA_DIR = Path("data")

CHUNKS_FILE = DATA_DIR / "chunks.json"


def load_chunks():
    with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def batch_generator(items, batch_size):
    for i in range(0, len(items), batch_size):
        yield items[i:i + batch_size]


def main():
    print("Loading chunks...")

    chunks = load_chunks()

    print(f"Loaded {len(chunks)} chunks")

    print("Loading embedding model...")

    model = SentenceTransformer(
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    print("Opening ChromaDB...")

    client = chromadb.PersistentClient(
        path="./db"
    )

    collection = client.get_or_create_collection(
        name="school_knowledge_base"
    )

    BATCH_SIZE = 32

    for batch_number, batch in enumerate(
        batch_generator(chunks, BATCH_SIZE),
        start=1
    ):
        print(
            f"Processing batch {batch_number}"
        )

        documents = [
            chunk["text"]
            for chunk in batch
        ]

        embeddings = model.encode(
            documents
        ).tolist()

        ids = [
            f'{chunk["title"]}_{chunk["chunk_index"]}'
            for chunk in batch
        ]

        metadatas = [
            {
                "source": chunk["title"]
            }
            for chunk in batch
        ]

        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    print("\nDone!")

    print(
        f"Total vectors stored: {collection.count()}"
    )


if __name__ == "__main__":
    main()