import { LangChainAdapter, Message, readableFromAsyncIterable, StreamData, streamToResponse } from 'ai';
import { RemoteRunnable } from "@langchain/core/runnables/remote";
import { applyPatch } from '@langchain/core/utils/json_patch';
import { headers } from 'next/headers';



// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// export async function POST(req: Request) {
//   const {
//     messages,
//   }: {
//     messages: Message[];
//   } = await req.json();

//   console.log("messages: ", messages);

//   const model = new RemoteRunnable({
//     url: `http://localhost:8000/api/openai/`,
//   });
//   const logStream = await model.streamLog(messages);
//   // model.streamEvents

//   console.log("logStream: ", logStream);

//   const encoder = new TextEncoder()
//   let aggregateResponseChain: Record<string, any> = {};

//   const transformStream = new TransformStream({
//       transform(chunk, controller) {
//           aggregateResponseChain = applyPatch(aggregateResponseChain, chunk.ops).newDocument;
//           for (const op of chunk.ops) {
//               console.log(op);
//               const streamedText = encoder.encode(JSON.stringify(op.value) + "\n");
//               controller.enqueue(streamedText);
//           }
//       },
//   });

//   console.log("transformStream: ", transformStream);

//   const stream = readableFromAsyncIterable(logStream);
//   console.log("stream: ", stream);

//   return new Response(LangChainAdapter.toDataStream(stream), {
//     headers: {
//       "content-type": "text/event-stream",
//       "x-vercel-ai-data-stream" : "v1",
//     },
//   });
// }

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