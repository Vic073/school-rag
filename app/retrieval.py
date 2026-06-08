import chromadb

from app.embeddings import get_embedding_model


client = chromadb.PersistentClient(
    path="./db"
)

collection = client.get_collection(
    "school_knowledge_base"
)


def retrieve(question: str, n_results: int = 5, subject: str = None):
    model = get_embedding_model()

    embedding = model.encode(
        question
    ).tolist()

    where_clause = None
    if subject and subject.lower() != "general":
        where_clause = {"subject": subject}

    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results,
        where=where_clause
    )

    return results