from typing import List

from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from langchain_openai import ChatOpenAI
from langserve import add_routes
from pydantic import BaseModel

from .bare import stream_text
from .config import OPENAI_API_KEY
from .lc import agent_executor_with_configs
from .utils.prompt import ClientMessage, convert_to_openai_messages

app = FastAPI()


class Request(BaseModel):
    messages: List[ClientMessage]


@app.post("/api/chat")
async def handle_chat_data(request: Request, protocol: str = Query("data")):
    messages = request.messages
    openai_messages = convert_to_openai_messages(messages)

    response = StreamingResponse(
        stream_text(openai_messages, protocol), media_type="text/event-stream"
    )
    response.headers["x-vercel-ai-data-stream"] = "v1"
    return response


add_routes(
    app=app,
    runnable=ChatOpenAI(api_key=OPENAI_API_KEY, model="gpt-3.5-turbo", streaming=True),
    path="/api/openai",
    # playground_type="chat",
)


add_routes(
    app=app,
    runnable=agent_executor_with_configs,
    path="/api/agent",
    # playground_type="chat",
)
