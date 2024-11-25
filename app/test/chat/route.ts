import { AIStreamCallbacksAndOptions, createCallbacksTransformer, LangChainAdapter, Message, StreamData } from 'ai';
// import { RemoteRunnable } from "@langchain/core/runnables/remote";
// import { RemoteRunnable } from "@langchain/core/runnables/remote.cjs";
import { RemoteRunnable } from "@/app/langchain/runnables/remote"
import { AIMessage } from "@langchain/core/messages"
import { LogStreamCallbackHandlerInput, StreamEvent } from "@langchain/core/tracers/log_stream.cjs"
import { formatStreamPart } from "@ai-sdk/ui-utils"


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const MOELIVE_LLM_API_URL = "http://localhost:8080"
// const MOELIVE_LLM_API_URL = "https://moelive-chatbot-dev.fly.dev"
const MOELIVE_LLM_API_PATH = "/v1/chat/single"

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
  const payload = {
    input: input,
    chat_history: chatHistory,
    chat_session_info: {
      "chat_session_id": "01J96R29632PHQ976FF35JWJ89",
      "user_id": "user_2mlwvkARtpNosqWZoADg0A73Sef",
      "user_persona_name": "호토케",
      "user_persona_desc": "### Description\n\nAn ordinary man.\n\n### Occupation\n\n- A homeless.",
      "intimacy": 160,
      "character_name": "Aika",
      "character_desc": "### Basic Information\n\n- Name: Aika\n- Age/Sex: 20/female\n- Language: Korean\n- Occupation: Idol trainee\n\n\n### Description\n- Brief Summary: A bright, cheerful, sociable idol trainee. She is passionate about everything and especially likes volleyball.\n\n### Appearance and Style\n- Appearance: brown hair, brown eyes, braided pigtails, red ribbons of hair, a normally cute face, a slender figure, chest D cup\n- Outfit Style: prefer a simple and comfortable uniform style At home, opts for loose-fitting t-shirts and dolphin pants.\n- Accessories: Red ribbons with pigtails\n- Outward Impression: Cute and pretty student. She has a good reputation around her because she is passionate about everything.\n\n\n### Background\n- Family: Doting parents and one younger brother. it's an ordinary family that love each other\n- Backstory: Raised in a relatively affluent family, she had a worry-free childhood and an untroubled adolescence. A bright student who was cheerful and sociable, Aika became interested in Idol in middle school and discovered musical talent. She was inspired by her sibling's praise for her musical talent, which made her pursue a career in Idol. She was also the captain of the volleyball team in high school, and she continued to play volleyball during idol practice.\n- Current Situation: After graduating from high school, she is practicing idol groups in earnest. She also plays volleyball from time to time.\n\n\n### Core Identity\n- Personality Keywords: extroverted, sociable, lively, friendly, responsible, cooperative, leadership\n- Values and Morality: Neutral Good\n- Motivations: Wants to become a top idol\n\n### Communication\n- Aika 는 존댓말을 사용한다.\n\n### Relationships\n- Reputation: Perceived as a cute and lively student\n- Notable Relationships: Close to various people, especially the members\n\n\n### Preferences\n- Hobbies: volleyball\n- Likes: Flower snacks, especially Mochi.\n\n\n### Strengths and Weaknesses\n- Health: Very healthy. Excellent athletic ability\n- Weaknesses: no\n- Skills and Abilities: Good at exercise, dance, singing\n\n\n### Knowledge\n- Common sense: A basic level of common sense. don't know specialized knowledge\n- Sports knowledge: She has a good understanding of sports, but she's not at an expert level\n- Other knowledge: at the level of an average Japanese high school student"
    }
  };
  console.log("payload: ", payload)


  const model = new RemoteRunnable<unknown, unknown, { configurable: { transformStreams: string[] } }>({
    url: `${MOELIVE_LLM_API_URL}${MOELIVE_LLM_API_PATH}`,
    options: {
      headers: {
        Authorization: "?",
      },
    },
  });

  const transformStreams = ["chat-only", "chunk-by-line", "block-streaming-until", "remove-newline-prefix"];
  const handlerInput: LogStreamCallbackHandlerInput = {
    ignoreLLM: false,
    ignoreAgent: false,
    ignoreChain: false,
    ignoreCustomEvent: false,
    ignoreRetriever: false,
    autoClose: false,
  }

  const eventStream = model.streamEvents(
    payload,
    { version: "v2", configurable: { transformStreams }},
    // handlerInput,
  );

  //////////////////////////////////////////
  // console.log("stream: ", eventStream);
  // return LangChainAdapter.toDataStreamResponse(eventStream);

  //////////////////////////////////////////
  const finalStream = toDataStream(eventStream);
  console.log("stream: ", finalStream);

  return new Response(finalStream, {
    // return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "x-vercel-ai-data-stream": "v1",
    },
  });

  // for await (const event of eventStream) {
  //   const eventType = event.event;
  //   // console.info(event, "all events");
  //   if (eventType === "on_chat_model_stream" && event.metadata.langgraph_node === "generate") {
  //     const content = event.data.chunk?.content
  //     const nodeName = event.metadata?.langgraph_node
  //     // console.info(event.data.chunk?.lc_kwargs?.content, `Chat model chunk::`);
  //     console.log(nodeName, content)
  //   } else if (eventType === "on_chain_end") {
  //     console.info(event);
  //     // if (event.name === MOELIVE_LLM_API_PATH) {
  //     //   console.info("on_chain_end")
  //     //   console.info(event.data.output?.output);
  //     //   console.info(event.data.output?.output.content);
  //     //   console.info(event.data.output?.output.response_metadata);
  //     // }
  //   }
  // }

}

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

function toDataStream(
  stream: ReadableStream<StreamEvent>,
  callbacks?: AIStreamCallbacksAndOptions,
) {
  return stream
    .pipeThrough(
      new TransformStream<
        StreamEvent | LangChainAIMessageChunk | string
      >({
        transform: async (value, controller) => {
          // text stream:
          // console.log(typeof value, JSON.stringify(value));

          if (typeof value === 'string') {
            controller.enqueue(value);
            return;
          }

          /////////////////////////////////////////////////
          // LC stream events v2:
          if (!('event' in value)) return;
          // if (!value?.data?.chunk) return;

          console.log(value.name)


          switch (value.event) {
            // chunk is AIMessage Chunk for `on_chat_model_stream` event:
            case 'on_chat_model_stream': {

              if (value.metadata.langgraph_node !== "generate") break;

              const chunk = value.data.chunk;
              const content = chunk?.content
              const nodeName = value.metadata?.langgraph_node
              // console.info(event.data.chunk?.lc_kwargs?.content, `Chat model chunk::`);
              console.log(nodeName, JSON.stringify(content))

              if (typeof chunk.content === 'string') {
                // skip empty content
                const textContent: string = content.endsWith("\n") ? content + "\n": content;
                chunk.content && controller.enqueue(formatStreamPart("text", textContent));
                // chunk.content && controller.enqueue(chunk.content + "\n");
              } else {
                const content: LangChainMessageContentComplex[] = chunk.content;
                for (const item of content) {
                  if (item.type === 'text') {
                    // skip empty content
                    chunk.content && controller.enqueue(formatStreamPart("text", chunk.content));
                    // chunk.content && controller.enqueue(chunk.content + "\n");
                  }
                }
              }
              break;
            }
            case 'on_chain_stream': {
              console.log(">>>>>>>>>>>>>>>");
              console.log(value.data.chunk);
              if (!!!value.data.chunk[Symbol.iterator]) {
                console.log(value.data.chunk.id);
                console.log(value.data.chunk.kwargs);
                console.log("<<<<<<<<<<<<<<<");
                return;
              }
              for (const chunkItem of value.data?.chunk) {
                if (chunkItem?.tool) {
                  const id = chunkItem.tool_call_id;
                  const name = chunkItem.tool;
                  const args = chunkItem.tool_input;
                  const data = {
                    toolCallId: id,
                    toolName: name,
                    args: args,
                  }
                  console.log("@@@@@@@@@", data);
                  controller.enqueue(`9:${JSON.stringify(data)}\n`);
                }
                console.log("<<<<<<<<<<<<<<<");
              }
              break;
            }
            case 'on_chain_end': {
              // console.info(value);
              // console.log(typeof value, JSON.stringify(value));
              if (value.name === MOELIVE_LLM_API_PATH) {
                console.info("on_chain_end")
                console.log(typeof value, JSON.stringify(value));
                console.info(value.data)
                controller.enqueue(`8:{"id":"xx", "other": ${JSON.stringify(value.data)}}\n`);
              }
            }
            default: {
              value.data?.chunk && console.log(value.data?.chunk?.type);
            }
          }
        },
      }),
    )
    .pipeThrough(createCallbacksTransformer(callbacks))
  // .pipeThrough(createStreamDataTransformer());
}