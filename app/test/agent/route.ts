import { LangChainAdapter, Message, StreamData } from 'ai';
import { RemoteRunnable } from "@langchain/core/runnables/remote";


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: Message[];
  } = await req.json();

  console.log("messages: ", messages);

  const lastMessage = messages.pop();
  const input = lastMessage?.content;
  const chatHistory = messages;
  const payload = {input: input, chat_history: chatHistory};
  console.log("payload: ", payload)

  const model = new RemoteRunnable({
    url: `http://localhost:8000/api/agent/`,
  });
  const stream = await model.streamEvents(payload, {version: "v2"});

  console.log("stream: ", stream);
  return LangChainAdapter.toDataStreamResponse(stream);

}