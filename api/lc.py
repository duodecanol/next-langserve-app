from typing import List, Literal, Union

from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.pydantic_v1 import BaseModel as BaseModelV1
from langchain.pydantic_v1 import Field as FieldV1
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from pydantic import BaseModel, Field

from .config import client
from .utils.tools import _get_current_weather


class GetCurrentWeatherParam(BaseModelV1):
    location: str = FieldV1(description="The city and state, e.g. San Francisco, CA")
    unit: Literal["celsius", "fahrenheit"] = FieldV1(
        default="celsius",
        description="The temperature unit to use. Infer this from the users location.",
    )


@tool(args_schema=GetCurrentWeatherParam)
def get_current_weather(location: str, unit: str = "fahrenheit"):
    """Get the current weather in a given location"""
    return _get_current_weather(location, unit)


@tool
async def special_summarization_tool(long_text: str, config: RunnableConfig) -> str:
    """A tool that summarizes input text using advanced techniques."""
    prompt = ChatPromptTemplate.from_template(
        "You are an expert writer. Summarize the following text in 10 words or less:\n\n{long_text}"
    )

    def reverse(x: str):
        return x[::-1]

    chain = prompt | client | StrOutputParser() | reverse
    summary = await chain.ainvoke({"long_text": long_text}, config=config)
    return summary


tools = [get_current_weather, special_summarization_tool]

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI bot."),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad", optional=True),
    ]
)

agent = create_tool_calling_agent(client, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

from langchain_core.messages import AIMessage, FunctionMessage, HumanMessage
from langchain_core.runnables import RunnableConfig


class Input(BaseModel):
    input: str
    # The field extra defines a chat widget.
    # Please see documentation about widgets in the main README.
    # The widget is used in the playground.
    # Keep in mind that playground support for agents is not great at the moment.
    # To get a better experience, you'll need to customize the streaming output
    # for now.
    chat_history: List[Union[HumanMessage, AIMessage, FunctionMessage]] = Field(
        ...,
        extra={"widget": {"type": "chat", "input": "input", "output": "output"}},
    )


agent_executor_with_configs = agent_executor.with_types(input_type=Input).with_config(
    RunnableConfig(run_name="agent")
)
