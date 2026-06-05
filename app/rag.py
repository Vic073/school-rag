from app.retrieval import retrieve
from app.llm import generate_answer

def ask(question: str):
    results = retrieve(question)

    documents = results["documents"][0]

    context = "\n\n".join(documents)

    answer = generate_answer(
        question,
        context
    )

    sources = []

    for metadata in results["metadatas"][0]:
        source = metadata["source"]

        if source not in sources:
            sources.append(source)

    return {
        "answer": answer,
        "sources": sources
    }