# 🌱 AI Energy Awareness API

> _Visibility over perfection._
> A practical carbon-awareness layer for AI applications, assistants, and workflows.

This project estimates the energy usage of AI token interactions, then translates those numbers into human-scale equivalencies and low/high carbon ranges based on grid intensity.

The goal is not perfect carbon accounting. The goal is awareness.

---

# 🌿 What’s Included

Under the hood, this repo contains:

- 🧮 A REST API for direct integration (`POST /energy`)
- 🤖 An MCP server over Streamable HTTP (`/mcp`) so LLMs can query the calculator as a tool
- ☁️ AWS CDK infrastructure split into API, REST, MCP, and observability stacks
- 📊 CloudWatch dashboards for usage and energy metrics
- 🪴 A lightweight data layer with values aggregated from other

---

# 🔌 Integration Options

You can integrate the calculator in two ways:

| Integration Type          | Best For                           |
| ------------------------- | ---------------------------------- |
| REST API (`POST /energy`) | Apps, services, automations        |
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
calculate_ai_energy_impact
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
curl -X POST "$BASE_URL/energy" \
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
  "energy_wh": 0.365,
  "impact_level": "light",
  "model": "claude-sonnet-4.6",
  "carbon_kg_co2e_range": {
    "low": 0.000018,
    "high": 0.000255
  },
  "grid_intensity_assumptions_gco2e_per_kwh": {
    "low": 50,
    "high": 700
  },
  "equivalencies": {
    "evMilesDriven": {
      "value": 0.0012,
      "unit": "miles in a typical EV (~300 Wh/mile)"
    }
  },
  "methodology": {
    "source_type": "estimated",
    "confidence": "medium",
    "notes": "Primary output is request energy in Wh, with carbon range derived from grid-intensity assumptions."
  }
}
```



# 🌍 Energy Methodology

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
2. Applies model-specific energy factors
3. Produces Wh as the primary output metric
4. Converts Wh into low/high kgCO2e using grid-intensity assumptions
5. Maps the output into everyday equivalencies
6. Labels the session with a simple impact level such as light, moderate, heavy, or very_heavy

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

## Watt hours -> CO₂e
Where data is available, it is typically reported in Watt hours, the standard unit of energy. Since carbon is a byproduct of most energy use, we can use this as a proxy for emissions. However, the actual emissions will vary widely based on the type of energy available in a region, grid intensity, and other factors. This calculator uses the following approximation:

Using a typical grid intensity of 0.4 kg CO₂e/kWh (400 g/kWh):

1 Wh ≈ 0.4 g CO₂e
100 Wh ≈ 40 g CO₂e
1 kWh ≈ 0.4 kg CO₂e
10 kWh ≈ 4 kg CO₂e

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
