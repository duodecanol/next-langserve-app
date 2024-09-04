# Vercel AI SDK, Next.js, and FastAPI Examples

These examples show you how to use the [Vercel AI SDK](https://sdk.vercel.ai/docs) with [Next.js](https://nextjs.org) and [FastAPI](https://fastapi.tiangolo.com).

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example https://github.com/vercel/ai/tree/main/examples/next-fastapi next-fastapi-app
```

```bash
yarn create next-app --example https://github.com/vercel/ai/tree/main/examples/next-fastapi next-fastapi-app
```

```bash
pnpm create next-app --example https://github.com/vercel/ai/tree/main/examples/next-fastapi next-fastapi-app
```

You will also need [Python 3.6+](https://www.python.org/downloads) and [virtualenv](https://virtualenv.pypa.io/en/latest/installation.html) installed to run the FastAPI server.

To run the example locally you need to:

1. Sign up at [OpenAI's Developer Platform](https://platform.openai.com/signup).
2. Go to [OpenAI's dashboard](https://platform.openai.com/account/api-keys) and create an API KEY.
3. Set the required environment variables as shown in [the example env file](./.env.local.example) but in a new file called `.env.local`.
4. `virtualenv venv` to create a python virtual environment.
5. `source venv/bin/activate` to activate the python virtual environment.
6. `pip install -r requirements.txt` to install the required python dependencies.
7. `pnpm install` to install the required dependencies.
8. `pnpm dev` to launch the development server.

## Learn More

To learn more about the Vercel AI SDK, Next.js, and FastAPI take a look at the following resources:

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs) - view documentation and reference for the Vercel AI SDK.
- [Vercel AI Playground](https://play.vercel.ai) - try different models and choose the best one for your use case.
- [Next.js Docs](https://nextjs.org/docs) - learn about Next.js features and API.
- [FastAPI Docs](https://fastapi.tiangolo.com) - learn about FastAPI features and API.

```sh
curl -v -X POST 'http://localhost:3000/api/chat' \
  -H 'Content-Type: application/json' \
  --data-raw $'{"messages":[{"role":"user","content":"What\'s the weather in Seoul?"}]}'

curl -v -X POST 'http://localhost:3000/test/openai' \
  -H 'Content-Type: application/json' \
  --data-raw $'{"messages":[{"role":"user","content":"What\'s the weather in Seoul?"}]}'


curl -v -X POST 'http://localhost:3000/test/agent' \
  --data-raw $'{"messages":[{"role":"user","content":"What\'s the weather in Seoul?"}]}'

curl 'http://localhost:3000/test/agent-streamevent' \
  -H 'Content-Type: application/json' \
  -H 'Connection: keep-alive' \
  --data-raw $'{"messages":[{"role":"user","content":"Howdy"},{"role":"user","content":"What is the weather in LA?"}]}'


curl -v -X POST 'http://localhost:8000/api/agent/stream_events' \
  -H 'Content-Type: application/json' \
  --data-raw $'{"input":{"input":"What\'s the weather in Seoul?", "chat_history": []}}'

curl -v -X POST 'http://localhost:8000/api/agent/stream_log' \
  -H 'Content-Type: application/json' \
  --data-raw $'{"input":{"input":"What\'s the weather in Seoul?", "chat_history": []}}'
```

## Sample

* tools = [get_current_weather, special_summarization_tool]

-----------------

What's the weather in Seoul?

-----------------

Would you please summarize the following text for me?

-----------------

If the Chinese Communist party truly believes it has a territorial claim to Taiwan, then it should also be trying to take back land from Russia, Taiwan’s president, Lai Ching-te, has said.

Lai made the remark in an interview to local media on Sunday, noting Beijing’s very different approach to two similar historical moments of territorial loss.

Under the rule of Xi Jinping, the CCP claims Taiwan is a Chinese province run by illegal separatists, and he has vowed to annex Taiwan under what it calls “reunification”.

Beijing says Taiwan has been part of China since “ancient times” but was taken by Japan during the “century of humiliation”, the period between 1839 and 1949 during which China was repeatedly subject to defeat and subjugation. Complete restoration of China’s losses in that time is a driving narrative of the CCP, and today is largely focused on Taiwan.

However, Lai, who was elected president in January, noted that China also lost land to Russia during that period but was not making any effort to take it back. He said this showed Beijing’s plans to annex Taiwan – which it has not ruled out using force to achieve – were not driven by territorial integrity.

“If it is for the sake of territorial integrity, why doesn’t it take back the lands occupied by Russia that were signed over in the treaty of Aigun? Russia is now at its weakest, right?” he said, referencing an 1858 treaty in which Russia annexed about 1m sq km of Chinese territory, including Haishengwei – today known as Vladivostok.

“You can ask Russia (for the land back) but you don’t. So it’s obvious they don’t want to invade Taiwan for territorial reasons,” Lai said.

He said Beijing’s true motivations were geopolitical, wanting to change the world order in its favour. Taiwan is a major island in the first island chain of the Pacific, and control would give the CCP highly strategic access and passage, as well as increased control of the Taiwan strait.

-----------------

Thank you very much for your assistant. It was very helpful.

-----------------


