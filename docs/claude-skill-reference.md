# Claude Skill Reference for AI Carbon Awareness API

Purpose

This file is a ready-to-copy reference for teams that want Claude to use this repository as a carbon estimation tool.

It includes:
- A short skill prompt block you can paste into your own skill.md
- MCP calling workflow for this API
- A REST fallback workflow

## Option A: MCP-first skill.md template

Copy and adapt this block:

```md
# Carbon Impact Assistant

When a user asks about AI energy or carbon impact, use the carbon calculator tool.

Primary tool
- Name: calculate_AI_carbon_emissions
- Transport: MCP Streamable HTTP

Required arguments
- model: one of
  - claude-haiku-4.5
  - claude-sonnet-4.6
  - claude-opus-4.6
  - gpt-4o
  - gemini-2.0
  - llama-3.1-405b
  - mixtral-8x22b
  - grok-3
  - palm-2
  - qwen-2.5-72b
- input_tokens: integer from 0 to 1000000
- output_tokens: integer from 0 to 1000000

Behavior rules
1. If any required value is missing, ask a short follow-up question.
2. Always return carbon_kg_co2e.
3. Also return 2 equivalencies in plain language.
4. Keep answers concise and include assumptions.
5. If model is unknown, ask the user to choose one from the supported list.

Output format
- Carbon estimate: <value> kg CO2e
- Equivalency 1: <label and value>
- Equivalency 2: <label and value>
- Assumptions: model, input tokens, output tokens
```

## Option B: REST fallback instructions

Use this if MCP is not available in your environment.

```md
If MCP is unavailable, call the REST API endpoint:
- POST /carbon
- Content-Type: application/json

Request body
{
  "model": "claude-sonnet-4.6",
  "input_tokens": 50000,
  "output_tokens": 25000
}

Then summarize:
- carbon_kg_co2e
- 2 equivalencies
- assumptions
```

## MCP session flow

For clients that directly manage MCP transport:
1. POST /mcp with initialize request
2. Store response header mcp-session-id
3. POST /mcp for tools/list and tools/call with the same mcp-session-id header
4. DELETE /mcp to close session

Reference requests are in requests.http.

## Practical tips for teams

- Keep this file as a template and create a project-specific variant next to your assistant config.
- Pin the supported model list so behavior stays deterministic.
- Keep prompt instructions focused on output format and assumptions, not implementation details.
