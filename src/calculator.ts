import { CarbonRequest, CarbonResponse, ModelName, TaskName } from "./types";
import { MODELS } from "./data/models";
import { EQUIVALENCIES } from "./data/equivalencies";
import { carbonRequestSchema } from "./schemas/carbon";

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
  const parsedPayload = carbonRequestSchema.safeParse(payload);
  if (!parsedPayload.success) {
    const firstIssue = parsedPayload.error.issues[0];
    if (!firstIssue) {
      return "invalid request";
    }
    if (firstIssue.path[0] === "model") {
      return "unknown model";
    }
    if (firstIssue.path[0] === "task") {
      return "unknown task";
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
