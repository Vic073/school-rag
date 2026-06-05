import os

import chromadb
from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer


load_dotenv()


def get_embedding_model():
    return SentenceTransformer(
        "sentence-transformers/all-MiniLM-L6-v2"
    )


def get_collection():
    client = chromadb.PersistentClient(
        path="./db"
    )

    return client.get_collection(
        "school_knowledge_base"
    )


def retrieve(question, collection, model):
    embedding = model.encode(
        question
    ).tolist()

    return collection.query(
        query_embeddings=[embedding],
        n_results=5
    )


def build_context(results):
    documents = results["documents"][0]

    return "\n\n".join(documents)


def build_sources(results):
    sources = []

    for metadata in results["metadatas"][0]:
        source = metadata["source"]

        if source not in sources:
            sources.append(source)

    return sources


def ask_llm(question, context):
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = f"""
You are the official assistant for Domasi College of Education.

Answer the question using ONLY the supplied context.

If the answer cannot be found in the context, say:

"I could not find that information in the school documents."

Context:
{context}

Question:
{question}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content


def main():
    print("Loading models...")

    embedding_model = get_embedding_model()

    collection = get_collection()

    print("Ready!\n")

    while True:

        question = input("Question: ")

        if question.lower() == "exit":
            break

        results = retrieve(
            question,
            collection,
            embedding_model
        )

        context = build_context(results)

        sources = build_sources(results)

        answer = ask_llm(
            question,
            context
        )

        print("\nAnswer:\n")
        print(answer)

        print("\nSources:")

        for source in sources:
            print(f"- {source}")

        print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    main()