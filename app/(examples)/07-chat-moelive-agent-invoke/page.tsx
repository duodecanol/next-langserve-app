'use client';

import { Card } from '@/app/components';
import { useChat } from 'ai/react';
import { GeistMono } from 'geist/font/mono';
import { Markdown } from '@/app/components/markdown';
import { Message } from 'ai/react';

export default function Page() {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    handleInputChange,
    isLoading,
    append,
    data: streamingData,
  } =
    useChat({
      api: '/test/chat',
      streamProtocol: 'data',
      onResponse: response => {
        console.log("Response: ", response);
      }
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col p-4 gap-2">
        {messages.map((message: Message) => (
          <div key={message.id} className="flex flex-row gap-2">
            <div className="w-24 text-zinc-500 flex-shrink-0">{`${message.role}: `}</div>

            <div className="flex flex-col gap-2">
              {message.content && (
                <div className="flex flex-col gap-4">
                  <Markdown>{message.content as string}</Markdown>
                </div>
              )}

              {message.content && console.log(message)}

              <div className="flex flex-row gap-2">
                {message.toolInvocations?.map(toolInvocation => (
                  <pre
                    key={toolInvocation.toolCallId}
                    className={`${GeistMono.className} text-sm text-zinc-500 bg-zinc-100 p-3 rounded-lg`}
                  >
                    {`${toolInvocation.toolName}(${JSON.stringify(
                      toolInvocation.args,
                      null,
                      2,
                    )})`}
                  </pre>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && <Card type="chat-data" />}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col fixed bottom-0 w-full border-t"
      >
        <input
          value={input}
          placeholder="What's the weather in San Francisco?"
          // onChange={handleInputChange}
          onChange={event => {
            setInput(event.target.value);
          }}
          onKeyDown={async event => {
            if (event.key === 'Enter') {
              append({ content: input, role: 'user' });
            }
          }}
          className="w-full p-4 outline-none bg-transparent"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}