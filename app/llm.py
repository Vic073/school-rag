import os

from groq import Groq
from dotenv import load_dotenv


load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_answer(
    question: str,
    context: str
):
    prompt = f"""
You are the official assistant for Domasi College of Education.

Answer ONLY using the supplied context. Cite the documents you used to answer (e.g. [Document 1 - filename.pdf]) when referencing facts.

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