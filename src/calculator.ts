import { Request, Response, ModelName } from "./types";
import { LLM_ENERGY_ESTIMATES } from "./data/models";
import { getEquivalencies } from "./data/equivalencies";
import { requestSchema } from "./schemas";

export const DEFAULT_LOW_GRID_INTENSITY_G_PER_KWH = 50;
export const DEFAULT_HIGH_GRID_INTENSITY_G_PER_KWH = 700;

export function impactLevelFromWh(energyWh: number) {
  if (energyWh < 0.5) {
    return "light" as const;
  }

  if (energyWh < 5) {
    return "moderate" as const;
  }

  if (energyWh < 20) {
    return "heavy" as const;
  }

  return "very_heavy" as const;
}

export function isValidModel(model: string): model is ModelName {
  return model in LLM_ENERGY_ESTIMATES;
}

export function validateRequest(payload: Request): string | null {
  const parsedPayload = requestSchema.safeParse(payload);
  if (!parsedPayload.success) {
    const firstIssue = parsedPayload.error.issues[0];
    if (!firstIssue) {
      return "invalid request";
    }
    if (firstIssue.path[0] === "model") {
      return "unknown model";
    }

    if (
      firstIssue.path[0] === "input_tokens" ||
      firstIssue.path[0] === "output_tokens"
    ) {
      return "token counts must be integers between 0 and 1000000";
    }
    return "invalid request";
  }
  return null;
}

export function energyWhFromTokens(
  inputTokens: number,
  outputTokens: number,
  model: ModelName,
): number {
  const factors = LLM_ENERGY_ESTIMATES[model];

  return (
    (inputTokens / 1000) * factors.inputWhPer1kTokens +
    (outputTokens / 1000) * factors.outputWhPer1kTokens
  );
}

export function carbonRangeFromEnergyWh(
  energyWh: number,
  lowGridIntensity = DEFAULT_LOW_GRID_INTENSITY_G_PER_KWH,
  highGridIntensity = DEFAULT_HIGH_GRID_INTENSITY_G_PER_KWH,
): { low: number; high: number } {
  const lowKg = (energyWh * lowGridIntensity) / 1_000_000;
  const highKg = (energyWh * highGridIntensity) / 1_000_000;

  return {
    low: Number(lowKg.toFixed(6)),
    high: Number(highKg.toFixed(6)),
  };
}

export function calculate(request: Request): Response {
  const model = (request.model ?? "claude-sonnet-4.6") as ModelName;
  const profile = LLM_ENERGY_ESTIMATES[model];
  const energyWh = energyWhFromTokens(
    request.input_tokens,
    request.output_tokens,
    model,
  );
  const carbonRange = carbonRangeFromEnergyWh(energyWh);

  return {
    energy_wh: Number(energyWh.toFixed(4)),
    impact_level: impactLevelFromWh(energyWh),
    model,
    carbon_kg_co2e_range: carbonRange,
    grid_intensity_assumptions_gco2e_per_kwh: {
      low: DEFAULT_LOW_GRID_INTENSITY_G_PER_KWH,
      high: DEFAULT_HIGH_GRID_INTENSITY_G_PER_KWH,
    },
    equivalencies: getEquivalencies(energyWh),
    methodology: {
      source_type: "estimated",
      confidence: "medium",
      notes: `Class-based estimate anchored to GPT-4o at 240 kWh per million tokens (0.24 Wh per 1k input tokens). Model class ${profile.modelClass} applies a ${profile.classMultiplier}x multiplier; output tokens use a 3x multiplier vs input tokens.`,
    },
  };
}
