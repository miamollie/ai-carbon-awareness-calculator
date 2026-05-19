# AI Carbon Awareness API

What this is

This repo is a practical carbon-awareness layer for AI usage.

It estimates emissions from token usage, then translates the result into human-scale equivalencies so teams can compare tradeoffs quickly (for example: "is this workflow more like a few km of driving, or something much bigger?").

Under the hood, it includes:

- A REST API for direct integration (`POST /carbon`)
- An MCP server over Streamable HTTP (`/mcp`) so AI assistants can call the calculator as a tool
- AWS CDK infrastructure split into API, REST, MCP, and observability stacks
- CloudWatch dashboard widgets for usage and carbon metrics

## How to use

This section is for people integrating the API into LLM products, assistants, or automations.

Integration paths:

1. REST API integration (`POST /carbon`) for direct app/server use
2. MCP integration (`/mcp`) for assistant tool-calling workflows

Start by setting a base URL:

- Local: `http://localhost:3000`
- Deployed: your API Gateway URL from CDK outputs

Then verify connectivity:

- `GET /health`
- `GET /mcp-health`

3. Use the request templates in [requests.http](requests.http) for ready-to-run REST and MCP examples.

### Claude

Use this project as an MCP tool backend for Claude/Desktop clients that support MCP Streamable HTTP.

High-level flow:

1. Initialize a session with `POST /mcp` (JSON-RPC `initialize`)
2. Capture the `mcp-session-id` response header
3. Call tools with `POST /mcp` and the same `mcp-session-id`
4. End the session with `DELETE /mcp`

The calculator tool name is:

- `calculate_AI_carbon_emissions`

Example `skill.md` style instruction block for Claude projects:

```md
# Carbon awareness tool usage

When estimating the environmental impact of AI outputs, call the MCP tool:
- Tool: calculate_AI_carbon_emissions
- Required arguments:
  - model (for example: claude-sonnet-4.6)
  - input_tokens (integer)
  - output_tokens (integer)

After receiving the result:
1. Report carbon_kg_co2e
2. Include at least one equivalency (for example drivingKm or videoHours)
3. If token counts are missing, ask the user for them before calculating
```

### ChatGPT

If your ChatGPT setup can call external APIs/tools, you can use the REST endpoint directly.

Typical pattern:

1. Send model + input/output token counts to `POST /carbon`
2. Read back:

- `carbon_kg_co2e`
- `equivalencies` (driving km, streaming hours, smartphone charges, etc.)

This is useful for prompt-level budgeting and model comparisons inside your workflow.

### API

See requests.http or follow this example cURL

```bash
curl -X POST "$BASE_URL/carbon" \
	-H "Content-Type: application/json" \
	-d '{
		"model": "claude-sonnet-4.6",
		"input_tokens": 50000,
		"output_tokens": 25000
	}'
```

Expected response shape:

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

## How to develop

This section is for contributors maintaining and deploying this repository.

Prerequisites:

- Node.js 22+
- npm
- AWS CLI configured with credentials
- AWS CDK v2 CLI
- SAM CLI (for local API emulation)

Install dependencies:

```bash
npm install
```

Build and validate:

```bash
npm run build
npm test
npm run cdk:synth
```

Run locally with SAM:

```bash
npm run sam:local
```

Deploy to AWS:

```bash
npm run cdk:deploy
```

Helpful scripts:

- `npm run cdk:diff` to inspect infra changes
- `npm run cdk:bootstrap` to bootstrap an AWS account/region for first deploy
- `npm run cdk:destroy` to tear down deployed resources

## Carbon per Token Methodology

### Motivation: Progress > Perfection

Better to have _some_ kind of visibility than a perfect one. The API should be used to guide behaviour and create awareness and not as a precise reporting tool.

### Data

The model factors are currently curated estimates for popular model families and versions.

Method summary:

1. Token counts are multiplied by per-model input/output factors
2. Combined value is normalized into kg CO2e
3. Result is mapped into everyday equivalencies for quick interpretation

Sources include public model/provider disclosures, benchmark analyses, and published energy/emissions references.

This dataset should be treated as directional guidance and updated as better numbers become available.

## Get in touch!

If you're interested in talking green tech, reach out from my [website](https://miamollie.dev).
