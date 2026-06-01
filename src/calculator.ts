import { CarbonRequest, CarbonResponse, ModelName } from "./types";
import { LLM_ENERGY_ESTIMATES } from "./data/models";
import { getEquivalencies } from "./data/equivalencies";
import { carbonRequestSchema } from "./schemas/carbon";

export const DEFAULT_LOW_GRID_INTENSITY_G_PER_KWH = 50;
export const DEFAULT_HIGH_GRID_INTENSITY_G_PER_KWH = 700;

export function isValidModel(model: string): model is ModelName {
  return model in LLM_ENERGY_ESTIMATES;
}

export function validateRequest(payload: CarbonRequest): string | null {
  const parsedPayload = carbonRequestSchema.safeParse(payload);
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

export function calculate(request: CarbonRequest): CarbonResponse {
  const model = (request.model ?? "sonnet") as ModelName;
  const energyWh = energyWhFromTokens(
    request.input_tokens,
    request.output_tokens,
    model,
  );
  const carbonRange = carbonRangeFromEnergyWh(energyWh);

  return {
    energy_wh: Number(energyWh.toFixed(4)),
    model,
    carbon_kg_co2e_range: carbonRange,
    grid_intensity_assumptions_gco2e_per_kwh: {
      low: DEFAULT_LOW_GRID_INTENSITY_G_PER_KWH,
      high: DEFAULT_HIGH_GRID_INTENSITY_G_PER_KWH,
    },
    equivalencies: getEquivalencies(energyWh),
  };
}
