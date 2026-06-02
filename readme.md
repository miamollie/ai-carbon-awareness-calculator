# AI Energy Awareness API

Visibility over perfection.
A practical carbon-awareness layer for AI applications, assistants, and workflows.

This project estimates AI request energy from token counts, then translates that energy into human-scale equivalents and low/high carbon ranges based on grid intensity assumptions.

## What Is Included

- REST API for direct integration (`POST /energy`)
- MCP server over Streamable HTTP (`/mcp`) for tool calling workflows
- AWS CDK infrastructure split into API, REST, MCP, and observability stacks
- CloudWatch dashboards for usage and energy metrics

## Integration Options

| Integration Type | Best For |
| --- | --- |
| REST API (`POST /energy`) | Apps, services, automations |
| MCP (`/mcp`) | Claude/Desktop assistant workflows |

Ready-to-run examples are in `requests.http`.

## Claude / MCP Usage

High-level flow:

1. Initialize a session with `POST /mcp`
2. Capture the `mcp-session-id` response header
3. Call tools using the same session ID
4. End the session with `DELETE /mcp`

Available tool:

- `calculate_ai_energy_impact`

Required arguments:

| Argument | Example |
| --- | --- |
| `model` | `claude-sonnet-4.6` |
| `input_tokens` | `50000` |
| `output_tokens` | `25000` |

## REST API Usage

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
  "energy_wh": 30,
  "impact_level": "very_heavy",
  "model": "claude-sonnet-4.6",
  "carbon_kg_co2e_range": {
    "low": 0.0015,
    "high": 0.021
  },
  "grid_intensity_assumptions_gco2e_per_kwh": {
    "low": 50,
    "high": 700
  },
  "equivalencies": {
    "evMilesDriven": {
      "value": 0.1,
      "unit": "miles in a typical EV (~300 Wh/mile)"
    },
    "iphoneCharges": {
      "value": 2.5,
      "unit": "iPhone battery charges (~12 Wh each)"
    },
    "microwaveSeconds": {
      "value": 90,
      "unit": "seconds at 1200W"
    },
    "laptopMinutes": {
      "value": 30,
      "unit": "minutes at 60W"
    },
    "ledBulbHours": {
      "value": 3,
      "unit": "hours at 10W"
    }
  },
  "methodology": {
    "source_type": "estimated",
    "confidence": "medium",
    "notes": "Class-based estimate anchored to GPT-4o at 240 kWh per million tokens (0.24 Wh per 1k input tokens). Model class medium applies a 1x multiplier; output tokens use a 3x multiplier vs input tokens."
  }
}
```

## Energy Methodology

The current method is intentionally pragmatic and transparent.

1. Take input and output token counts.
2. Map model name to a model class (`small`, `medium`, `large`, `huge`).
3. Use a single anchor baseline from GPT-4o:
   - `240 kWh / 1,000,000 tokens`
   - Equivalent to `0.24 Wh / 1,000 input tokens`
4. Apply class multipliers:
   - `small=0.5x`
   - `medium=1x`
   - `large=2x`
   - `huge=4x`
5. Apply output-token weighting at `3x` input-token energy.
6. Return energy in Wh as the primary output.
7. Derive low/high kgCO2e from grid intensity assumptions.
8. Add practical equivalencies and an impact label.

These values are directional estimates, not provider-grade measured emissions.

## Wh to CO2e

Carbon depends on electricity mix, so the API returns a range using:

- Low grid intensity: `50 gCO2e/kWh`
- High grid intensity: `700 gCO2e/kWh`

Reference conversion at `400 gCO2e/kWh`:

- `1 Wh ~= 0.4 g CO2e`
- `100 Wh ~= 40 g CO2e`
- `1 kWh ~= 0.4 kg CO2e`
- `10 kWh ~= 4 kg CO2e`

## Quick Start

```bash
npm install
npm run build
npm run sam:local
```

Local endpoints:

- REST API: `http://localhost:3000`
- MCP API: `http://localhost:3000/mcp`

Health checks:

- `GET /health`
- `GET /mcp-health`

## Infrastructure and Deployment

Prerequisites:

- Node.js 22+
- npm
- AWS CLI configured
- AWS CDK v2 CLI
- SAM CLI

Build and validate:

```bash
npm run build
npm test
npm run cdk:synth
```

## Why This Exists

This project exists to make AI energy usage more tangible for everyday decisions.
Precision is hard with limited provider telemetry, but transparent directional guidance is still useful.

## Contact

More information: https://miamollie.dev/
