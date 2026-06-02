# Carbon Awareness Skill - Validation Notes

Date: 2026-06-02

## Live API Contract Check

Request used:

```json
{
  "model": "claude-sonnet-4.6",
  "input_tokens": 5000,
  "output_tokens": 2000
}
```

Observed production endpoint behavior:
- `POST /energy`: returns `404 Not Found`
- `POST /carbon`: returns `200` with `carbon_kg_co2e`, `model`, `equivalencies`

## Summary

- Skill instructions updated to target `POST /carbon`.
- Response parsing updated to carbon-first payload.
- Output guidance updated to explicitly communicate directional estimates.
- Test cases updated for current production contract and error handling.

## Residual Risk

If production moves to `/energy` with a new response shape, this packaged skill should be revised to match that deployment.
