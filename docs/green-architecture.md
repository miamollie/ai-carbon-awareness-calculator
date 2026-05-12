# Green MCP Server Architecture

## The Problem with Always-On

Traditional server:

```
24/7 running → Idling 95% of time → Wasted carbon
```

Green alternative:

```
Serverless (Lambda) → Only pays for execution → Zero idle
```

---

## Greenest Architecture: Lambda + API Gateway + SSE

```
┌─────────────┐
│   Client    │ (Claude, ChatGPT, etc.)
└──────┬──────┘
       │ HTTP POST to /carbon
       ↓
┌─────────────────────────┐
│   API Gateway (REST)    │
│  (Route + Auth Layer)   │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Lambda Function        │
│  (Execution = ~50ms)    │
│  (No idle time)         │
│  (Pay per request)      │
└──────┬──────────────────┘
       │
       ↓ Return JSON + timestamp
┌─────────────────────────┐
│  CloudWatch Logs        │
│  (Track carbon profile) │
└─────────────────────────┘
```

## Green Principles Implemented

### 1. No Idle Time

- Lambda only runs when invoked
- Pay only for execution (~50ms)
- No 24/7 server costs

### 2. Minimal Dependencies

- AWS Lambda runtime built-in
- Zero external libraries
- Pure TypeScript, ~100 lines
- Fast cold start (<100ms)

### 3. Caching
<!-- //todo check this is happening -->

- Identical requests return cached response
- Avoid re-computing

### 4. GreenOps

- Log every execution
- CloudWatch tracks:
  - Carbon per request
  - Lambda overhead
  - Execution time


### Multi region deployment
Original considered see [multi region doc](multi-region-deployment.md) but opted to use G[reenPixie cloud region scorecard](https://assets.greenpixie.com/downloads/Cloud_Region_Scorecard.pdf) and instead deploy in a green zoen.


## Multi-LLM Support

Same Lambda backend works for:

- Claude (via MCP)
- ChatGPT (via API endpoint directly, no MCP wrapper needed)
- Any LLM that can call HTTP APIs

Just change the client wrapper, Lambda stays the same.
