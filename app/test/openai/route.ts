import { LangChainAdapter, Message } from 'ai';
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

  const model = new RemoteRunnable({
    url: `http://localhost:8000/api/openai/`,
  });
  // const stream = await model.stream(messages);
  const stream = await model.streamEvents(messages, {version: "v2"});

  console.log("stream: ", stream);
  return LangChainAdapter.toDataStreamResponse(stream);
}