import { AIStreamCallbacksAndOptions, createCallbacksTransformer, Message } from 'ai';
import { RemoteRunnable } from "@langchain/core/runnables/remote";
import { LogStreamCallbackHandlerInput } from "@langchain/core/tracers/log_stream"
import { applyPatch } from '@langchain/core/utils/json_patch';

import { formatStreamPart } from "@ai-sdk/ui-utils"


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

type LangChainImageDetail = 'auto' | 'low' | 'high';

type LangChainMessageContentText = {
  type: 'text';
  text: string;
};

type LangChainMessageContentImageUrl = {
  type: 'image_url';
  image_url:
    | string
    | {
        url: string;
        detail?: LangChainImageDetail;
      };
};

type LangChainMessageContentComplex =
  | LangChainMessageContentText
  | LangChainMessageContentImageUrl
  | (Record<string, any> & {
      type?: 'text' | 'image_url' | string;
    })
  | (Record<string, any> & {
      type?: never;
    });

type LangChainMessageContent = string | LangChainMessageContentComplex[];

type LangChainAIMessageChunk = {
  content: LangChainMessageContent;
};

// LC stream event v2
type LangChainStreamEvent = {
  event: string;
  data: any;
};


/**
Converts LangChain output streams to AIStream.

The following streams are supported:
- `LangChainAIMessageChunk` streams (LangChain `model.stream` output)
- `string` streams (LangChain `StringOutputParser` output)
 */
function toLogStream(
  stream: ReadableStream<string>,
  callbacks?: AIStreamCallbacksAndOptions,
) {
  return stream
    .pipeThrough(
      new TransformStream<
        LangChainStreamEvent | LangChainAIMessageChunk | string
      >({
        transform: async (value, controller) => {
          // text stream:
          console.log(typeof value, JSON.stringify(value))

          if (typeof value === 'string') {
            controller.enqueue(value);
            return;
          }

          /////////////////////////////////////////////////
          // LC stream events v2:
          if (!('event' in value)) return;
          if (!value?.data?.chunk) return;

          const chunk = value.data.chunk;
          const encoder = new TextEncoder();

          switch (value.event) {
            // chunk is AIMessage Chunk for `on_chat_model_stream` event:
            case 'on_chat_model_stream': {
              if (typeof chunk.content === 'string') {
                // skip empty content
                chunk.content && controller.enqueue(formatStreamPart("text", chunk.content));
              } else {
                const content: LangChainMessageContentComplex[] = chunk.content;
                for (const item of content) {
                  if (item.type === 'text') {
                    // skip empty content
                    chunk.content && controller.enqueue(formatStreamPart("text", chunk.content));
                  }
                }
              }
              break;
            }
            case 'on_chain_stream': {
              console.log(">>>>>>>>>>>>>>>")
              console.log(value.data.chunk)
              if (!!!value.data.chunk[Symbol.iterator]) {
                console.log(value.data.chunk.id);
                console.log(value.data.chunk.kwargs);
                console.log("<<<<<<<<<<<<<<<")
                return;
              }
              for (const chunkItem of value.data?.chunk) {
                if(chunkItem?.tool) {
                  const id = chunkItem.tool_call_id;
                  const name = chunkItem.tool;
                  const args = chunkItem.tool_input;
                  const data = {
                    toolCallId: id,
                    toolName: name,
                    args: args,
                  }
                  console.log("@@@@@@@@@", data)
                  controller.enqueue(`9:${JSON.stringify(data)}\n`);
                }
                console.log("<<<<<<<<<<<<<<<")
              }
              break;
            }
            default: {
              console.log(value.data?.chunk?.type);
            }
          }
        },
      }),
    )
    .pipeThrough(createCallbacksTransformer(callbacks))
    // .pipeThrough(createStreamDataTransformer());
}


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
  const agentPayload = {input: input, chat_history: chatHistory};

  const model = new RemoteRunnable({
    url: `http://localhost:8000/api/agent/`,
  });
  const handlerInput: LogStreamCallbackHandlerInput = {
    ignoreLLM: false,
    ignoreAgent: false,
    ignoreChain: false,
    ignoreCustomEvent: false,
    ignoreRetriever: false,
    autoClose: false,
  }
  const eventStream = await model.streamEvents(agentPayload, { version: "v2"}, handlerInput);

  const finalStream = toLogStream(eventStream);
  console.log("stream: ", finalStream);

  return new Response(finalStream, {
    // return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "x-vercel-ai-data-stream" : "v1",
    },
  });
}

