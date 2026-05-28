# 🌱 AI Carbon Awareness API

> _Visibility over perfection._
> A practical carbon-awareness layer for AI applications, assistants, and workflows.

This project estimates the environmental impact of AI token usage, then translates those numbers into human-scale equivalencies so they're easier to reason about.

The goal is not perfect carbon accounting. The goal is awareness.

---

# 🌿 What’s Included

Under the hood, this repo contains:

- 🧮 A REST API for direct integration (`POST /carbon`)
- 🤖 An MCP server over Streamable HTTP (`/mcp`) so LLMs can query the calculator as a tool
- ☁️ AWS CDK infrastructure split into API, REST, MCP, and observability stacks
- 📊 CloudWatch dashboards for usage and carbon metrics
- 🪴 A lightweight data layer with values aggregated from other

---

# 🔌 Integration Options

You can integrate the calculator in two ways:

| Integration Type          | Best For                           |
| ------------------------- | ---------------------------------- |
| REST API (`POST /carbon`) | Apps, services, automations        |
| MCP (`/mcp`)              | Claude/Desktop assistant workflows |

Ready-to-run examples live in:

```txt
requests.http
```

---

## 🤖 Claude / MCP Usage

This project can act as an MCP tool backend for Claude clients that support Streamable HTTP.

### High-level flow

1. Initialize a session with:

```http
POST /mcp
```

2. Capture the `mcp-session-id` response header

3. Call tools using the same session ID

4. End the session with:

```http
DELETE /mcp
```

---

### Available Tool

```txt
calculate_AI_carbon_emissions
```

### Required Arguments

| Argument        | Example             |
| --------------- | ------------------- |
| `model`         | `claude-sonnet-4.6` |
| `input_tokens`  | `50000`             |
| `output_tokens` | `25000`             |

---

## 💬 REST API Usage

Example request:

```bash
curl -X POST "$BASE_URL/carbon" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4.6",
    "input_tokens": 50000,
    "output_tokens": 25000
  }'
```

Example response:

```json
{
  "carbon_kg_co2e": 0.0012,
  "model": "claude-sonnet-4.6",
  "equivalencies": {
    "drivingKm": {
      "value": "0.00",
      "unit": "km"
    }
  }
}
```



# 🌍 Carbon Methodology

## Progress > Perfection

This project is intentionally pragmatic.

The environmental impact of AI systems is difficult to measure precisely because providers expose very little verifiable infrastructure data. These estimates should therefore be treated as directional guidance, not formal reporting figures.

The calculator exists to:

- increase visibility
- encourage better trade-off thinking
- support more mindful AI usage

—not to provide exact accounting.

---

## Method Summary

The calculator:

1. Takes input and output tokens
2. Applies model-specific emissions factors
3. Normalizes the result into kgCO2e
4. Maps the output into everyday equivalencies

Examples include:

- driving distance
- streaming hours
- smartphone charges

---

## Data Sources

The current estimates draw from a blend of:

- 🤗 Hugging Face
- 🌱 GreenPixie
- ⚡ EcoLogits
- public provider disclosures
- benchmark analyses

As better data becomes available, the dataset should evolve alongside it.

---

# 🚀 Quick Start

## Local Development

```bash
npm install
npm run build
npm run sam:local
```

Your local endpoints will be:

```txt
REST API: http://localhost:3000
MCP API:  http://localhost:3000/mcp
```

Health checks:

```txt
GET /health
GET /mcp-health
```

---

# 🏗️ Infrastructure & Deployment

## Prerequisites

- Node.js 22+
- npm
- AWS CLI configured
- AWS CDK v2 CLI
- SAM CLI

---

## Build & Validate

```bash
npm run build
npm test
npm run cdk:synth
```

---


# 🌱 Why This Exists

This project started as a personal experiment in applying green software principles to generative AI workflows.

The more I researched AI emissions, the clearer it became that precision is often an illusion — but imperfect visibility is still far better than none.

So this repo is my attempt at making AI energy usage a little more tangible.

---

# 👋 Get In Touch

Interested in green software, sustainable infrastructure, or AI observability?

Reach out via my [website](https://miamollie.dev/) — always happy to chat 🌿
