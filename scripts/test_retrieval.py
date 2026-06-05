import chromadb
from sentence_transformers import SentenceTransformer


def main():
    print("Loading model...")

    model = SentenceTransformer(
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    print("Opening database...")

    client = chromadb.PersistentClient(
        path="./db"
    )

    collection = client.get_collection(
        "school_knowledge_base"
    )

    while True:
        question = input("\nQuestion: ")

        if question.lower() == "exit":
            break

        query_embedding = model.encode(
            question
        ).tolist()

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5
        )

        print("\nTOP RESULTS\n")

        docs = results["documents"][0]
        metas = results["metadatas"][0]

        for i, (doc, meta) in enumerate(
            zip(docs, metas),
            start=1
        ):
            print("=" * 80)
            print(f"Result {i}")
            print(f"Source: {meta['source']}")
            print(doc[:500])
            print()
            

if __name__ == "__main__":
    main()