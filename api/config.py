import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv(".env.local")

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

client = ChatOpenAI(
    api_key=OPENAI_API_KEY,
    model="gpt-3.5-turbo",
    streaming=True,
)
