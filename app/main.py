from fastapi import FastAPI
from pydantic import BaseModel

from app.rag import ask


app = FastAPI()


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
def chat(request: ChatRequest):

    result = ask(request.message)

    return result