# AI Energy Awareness Calculator Skill

A Claude skill that estimates the energy impact of your conversations and translates it into relatable, real-world equivalencies.

## What It Does

When you ask Claude about the environmental impact of your session, this skill will:

1. **Extract your session metrics** — reads your token usage (input/output) and the model you're using
2. **Calculate energy usage** — sends this data to the AI Energy Awareness API
3. **Present results conversationally** — reports Wh first, with low/high CO₂e ranges and equivalencies

## Example Usage

**You ask**: "What is the environmental impact of this conversation?"

**Claude responds**:

> Based on our conversation so far (using Claude Sonnet 4.6):
>
> - **Energy usage**: 1.6 Wh
> - **Carbon range**: 0.00008-0.00112 kg CO₂e (low vs high grid intensity)
> - **That's equivalent to**:
>   - Running a microwave for about 5 seconds
>   - Charging a phone battery by a small fraction
>   - Running a laptop for about 2 minutes
>
> This conversation has had a negligible environmental impact! 🌱

## Trigger Phrases

The skill activates when you ask questions like:

- "What is the environmental impact of this conversation?"
- "How much carbon has this session emitted?"
- "What's the carbon footprint of our chat?"
- "Is this conversation environmentally expensive?"
- "How does the environmental impact compare to other AI conversations?"

Or any variation asking about carbon, emissions, environmental impact, or carbon footprint of the current session.

## Features

✅ **Works with all Claude models** — Sonnet, Opus, Haiku, etc.  
✅ **Real-world comparisons** — Kettles boiled, km driven, video watched, etc.  
✅ **Transparent methodology** — Based on published research and provider disclosures

## How It Works

### The Calculation

The API multiplies token counts by per-model input/output energy factors and returns Wh as the primary output. It then derives low/high CO₂e ranges using grid-intensity assumptions.

These factors are based on:

- Public model/provider disclosures
- Benchmark analyses
- Published energy/emissions references

### Important Notes

- Results are **directional guidance**, not precise measurements
- Better for behavior awareness than formal reporting
- Methodology improves as better data becomes available
- All calculations are transparent and verifiable

## API Details

**Endpoint**: `https://carbon.miamollie.dev/energy`

**Request Format**:

```json
{
  "model": "claude-sonnet-4.6",
  "input_tokens": 5000,
  "output_tokens": 2000
}
```

**Response Includes**:

- `energy_wh` — Total energy usage in watt-hours
- `model` — The model name from your request
- `carbon_kg_co2e_range` — Low/high CO₂e range based on grid intensity assumptions
- `equivalencies` — Real-world energy comparisons (microwave runtime, laptop runtime, phone charges, etc.)

## Who Should Use This?

✅ Users curious about AI's environmental footprint  
✅ Teams evaluating sustainability of AI workflows  
✅ Developers building carbon-aware applications  
✅ Anyone interested in tech's environmental impact

## Limitations

- **Session data extraction** depends on Claude having access to token usage metadata
- **Historical data** not available — only current session metrics
- **API limits** — no authentication, so rate limits may apply
- **Model coverage** — calculations most accurate for well-known models

## Want More Info?

The Carbon Awareness Calculator was created to increase transparency around AI's environmental impact. Learn more at: **https://miamollie.dev**

The project includes:

- REST API for direct integration
- MCP server for tool-calling workflows
- CloudWatch dashboards for tracking usage

## Support

If you have questions, suggestions, or want to contribute improvements:

- Check the project's main documentation
- Verify the API health at `/health` or `/mcp-health` endpoints
- Ensure your request format matches the spec above
