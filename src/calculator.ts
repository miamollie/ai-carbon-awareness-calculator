import { CarbonRequest, CarbonResponse, ModelName } from "./types";
import { LLM_CARBON_EMISSIONS } from "./data/models";
import { getEquivalencies } from "./data/equivalencies";
import { carbonRequestSchema } from "./schemas/carbon";

export function isValidModel(model: string): model is ModelName {
  return model in LLM_CARBON_EMISSIONS;
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

export function carbonPerToken(
  inputTokens: number,
  outputTokens: number,
  model: ModelName,
): number {
  const factors = LLM_CARBON_EMISSIONS[model];

  // Divide by 1000 to convert grams to kilograms, since the factors are in grams CO2e per token
  return (
    (inputTokens * factors.inputCo2PerToken +
      outputTokens * factors.outputCo2PerToken) /
    1000
  );
}

export function calculate(request: CarbonRequest): CarbonResponse {
  const model = (request.model ?? "sonnet") as ModelName;
  const carbonKg = carbonPerToken(
    request.input_tokens,
    request.output_tokens,
    model,
  );

  return {
    carbon_kg_co2e: Number(carbonKg.toFixed(5)),
    model,
    equivalencies: getEquivalencies(carbonKg),
  };
}
