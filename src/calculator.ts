import { CarbonRequest, CarbonResponse, ModelName, TaskName } from "./types";
import { MODELS } from "./data/models";
import { EQUIVALENCIES } from "./data/equivalencies";
import { APIGatewayProxyResultV2 } from "aws-lambda";

type ModelFactors = { input: number; output: number; time: number };

const MODEL_FACTORS: Record<string, ModelFactors> = MODELS;
const EQUIVALENCY_FACTORS: Record<string, number> = EQUIVALENCIES;

export function isValidModel(model: string): model is ModelName {
  return model in MODEL_FACTORS;
}

function isValidTask(task: string): task is TaskName {
  return ["chat", "coding", "document-generation", "agentic"].includes(task);
}

export function validateRequest(payload: CarbonRequest): string | null {
  const model = payload.model ?? "sonnet";
  if (!isValidModel(model)) {
    return "unknown model";
  }
  const task = payload.task ?? "chat";
  if (!isValidTask(task)) {
    return "unknown task";
  }
  if (payload.input_tokens < 0 || payload.output_tokens < 0) {
    return "token counts must be non-negative";
  }
  if (payload.input_tokens > 1000000 || payload.output_tokens > 1000000) {
    return "token counts exceed maximum allowed (1M)";
  }
  return null;
}

export function carbonPerToken(
  inputTokens: number,
  outputTokens: number,
  model: ModelName,
  task: TaskName = "chat",
): number {
  const factors = MODEL_FACTORS[model];
  console.log(
    `Calculating carbon for model=${model}, task=${task}, inputTokens=${inputTokens}, outputTokens=${outputTokens}, using factors:`,
    factors,
  );
  return (inputTokens * factors.input + outputTokens * factors.output) / 1000;
}

export function getEquivalencies(kgCo2e: number): Record<string, string> {
  return {
    microwave_runs: `${Math.round(kgCo2e * EQUIVALENCY_FACTORS.microwave_runs)}-${Math.round(kgCo2e * EQUIVALENCY_FACTORS.microwave_runs * 1.15)}`,
    driving_km: (kgCo2e * EQUIVALENCY_FACTORS.driving_km).toFixed(1),
    tea_boiling: (kgCo2e * EQUIVALENCY_FACTORS.tea_boiling).toFixed(1),
  };
}

export function calculate(request: CarbonRequest): CarbonResponse {
  const model = (request.model ?? "sonnet") as ModelName;
  const carbonKg = carbonPerToken(
    request.input_tokens,
    request.output_tokens,
    model,
    request.task,
  );

  return {
    carbon_kg_co2e: Number(carbonKg.toFixed(5)),
    model,
    equivalencies: getEquivalencies(carbonKg),
    task: request.task,
  };
}
