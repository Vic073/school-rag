import chromadb

from app.embeddings import get_embedding_model


client = chromadb.PersistentClient(
    path="./db"
)

collection = client.get_collection(
    "school_knowledge_base"
)


def retrieve(question: str, n_results: int = 5):
    model = get_embedding_model()

    embedding = model.encode(
        question
    ).tolist()

    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results
    )

    return results