---
name: carbon-awareness
description: Calculate the environmental impact of AI conversations and sessions. Use this skill whenever a user asks about carbon footprint, environmental impact, emissions, or sustainability of the current chat/session (for example: "What is the environmental impact of this conversation?", "How much carbon has this session emitted?", or "What is the carbon footprint of this chat?").
---

# AI Carbon Awareness Skill

This skill converts model + token usage into an API-based environmental impact summary with practical equivalencies.

## When To Use

Use this skill when users ask about:

- carbon footprint of the current conversation
- emissions from this session
- whether this chat is environmentally expensive
- comparisons between model/session impact

## Inputs Required

Collect or confirm:

- `model` (example: `claude-sonnet-4.6`)
- `input_tokens` (integer)
- `output_tokens` (integer)

If token metadata is not available in session context, ask the user for these values.

## API Endpoint

Use production endpoint:

- `POST https://carbon.miamollie.dev/energy`

Request body:

```json
{
  "model": "claude-sonnet-4.6",
  "input_tokens": 5000,
  "output_tokens": 2000
}
```

## Expected Response Shape

```json
{
  "carbon_kg_co2e": 0.00013,
  "model": "claude-sonnet-4.6",
  "equivalencies": {
    "microwaveRuns": {
      "value": 0,
      "range": "0-0",
      "unit": "runs (2 min each)"
    },
    "drivingKm": { "value": "0.00", "unit": "km" },
    "flyingKmRoundtrip": { "value": "0.00", "unit": "km" },
    "videoHours": { "value": 0, "unit": "hours streaming" },
    "beefKg": { "value": "0.00", "unit": "kg" },
    "smartphoneCharges": { "value": 0, "unit": "charges" }
  }
}
```


## Response Methodology Guidance

Present results as directional estimates (awareness-grade, not precise measurement).

Method summary to mention when useful:

- class-based estimate anchored to GPT-4o baseline
- output tokens weighted more than input tokens
- model class changes estimated intensity

Keep this short and readable unless user asks for details.

## Output Style

Use a concise conversational format:

1. State model.
2. Highlight 2-4 relatable equivalencies.
3. Add context (very low, low, moderate, high) without overclaiming precision.
4. Offer a reduction tip if useful (for example, use lighter models for simple tasks).

Example:

> Based on this session with Claude Sonnet 4.6:
>
> - Carbon estimate: 0.00013 kg CO2e
> - Equivalent to roughly: 0.00 km driving, 0 hours of video streaming, and 0 phone charges
> - Impact level: very low for a single conversation

## Error Handling

- Missing token/model data: ask user for model, input tokens, and output tokens.
- API non-200 response: explain service is unavailable and suggest retrying.
- Validation error (unknown model or bad token values): ask for corrected values.

## Safety And Transparency

- Do not present output as exact measured emissions.
- Do not fabricate token counts or API output.
- If uncertain, explicitly label the uncertainty.
