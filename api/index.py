from typing import Sequence

from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from langserve import add_routes
from pydantic import BaseModel, Field

from .bare import stream_text
from .config import client as lc_openai_client
from .lc import agent_executor_with_configs
from .utils.prompt import ClientMessage, convert_to_openai_messages

app = FastAPI()


class Request(BaseModel):
    messages: Sequence[ClientMessage] = Field(
        ...,
        examples=[[{"role": "user", "content": "Hello, good morning!"}]],
    )


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
    runnable=lc_openai_client,
    path="/api/openai",
    disabled_endpoints=["config_hashes"],
    # playground_type="chat",
)


add_routes(
    app=app,
    runnable=agent_executor_with_configs,
    path="/api/agent",
    disabled_endpoints=["config_hashes"],
    # playground_type="chat",
)
