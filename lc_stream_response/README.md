## Sample logs for langserve `stream_event` and `stream_log` API response

* response from:
```sh
curl -v -X POST 'http://localhost:8000/api/agent/stream_event' \
  -H 'Content-Type: application/json' \
  --data-raw $'{"input":{"input":"What\'s the weather in Seoul?", "chat_history": []}}' > stream_log.log

curl -v -X POST 'http://localhost:8000/api/agent/stream_log' \
  -H 'Content-Type: application/json' \
  --data-raw $'{"input":{"input":"What\'s the weather in Seoul?", "chat_history": []}}' > stream_log.log
```
