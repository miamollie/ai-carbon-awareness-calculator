import { ModelName } from "../types";

export type ModelSizeClass = "small" | "medium" | "large" | "huge";

export interface ModelEnergyProfile {
  modelClass: ModelSizeClass;
  parameterRangeBillions: string;
  classMultiplier: number;
  params: string;
  inputWhPer1kTokens: number;
  outputWhPer1kTokens: number;
  source: string;
}

// GPT-4o anchor: 240 kWh / 1,000,000 tokens = 0.24 Wh / 1,000 tokens.
const BASE_INPUT_WH_PER_1K_TOKENS = 0.24;
const OUTPUT_TOKEN_MULTIPLIER = 3;

// Determined multipliers: keep medium as anchor (1x), and scale by class.
// This keeps estimates in plausible ranges while preserving class separation.
const CLASS_MULTIPLIERS: Record<ModelSizeClass, number> = {
  small: 0.5,
  medium: 1,
  large: 2,
  huge: 4,
};

function buildProfile(
  modelClass: ModelSizeClass,
  parameterRangeBillions: string,
  source: string,
): ModelEnergyProfile {
  const classMultiplier = CLASS_MULTIPLIERS[modelClass];
  const inputWhPer1kTokens = BASE_INPUT_WH_PER_1K_TOKENS * classMultiplier;
  const outputWhPer1kTokens =
    inputWhPer1kTokens * OUTPUT_TOKEN_MULTIPLIER;

  return {
    modelClass,
    parameterRangeBillions,
    classMultiplier,
    params: parameterRangeBillions,
    inputWhPer1kTokens,
    outputWhPer1kTokens,
    source,
  };
}

export const LLM_ENERGY_ESTIMATES: Record<ModelName, ModelEnergyProfile> = {
  "claude-haiku-4.5": buildProfile(
    "small",
    "5B-20B",
    "Class-based estimate from the GPT-4o anchor, scaled down for small models.",
  ),
  "claude-sonnet-4.6": buildProfile(
    "medium",
    "20B-100B",
    "Class-based estimate using medium-model multiplier on the GPT-4o anchor.",
  ),
  "claude-opus-4.6": buildProfile(
    "large",
    "100B-250B",
    "Class-based estimate for larger reasoning workloads using the large-model multiplier.",
  ),
  "gpt-4o": buildProfile(
    "medium",
    "20B-100B",
    "Anchor model: 240 kWh per million tokens baseline before class scaling.",
  ),
  "gpt-4o-mini": buildProfile(
    "small",
    "5B-20B",
    "Class-based estimate from GPT-4o anchor, scaled down for mini models.",
  ),
  "gpt-4.1": buildProfile(
    "medium",
    "20B-100B",
    "Class-based estimate aligned with mainstream general-purpose models.",
  ),
  "gpt-4.1-mini": buildProfile(
    "small",
    "5B-20B",
    "Class-based estimate aligned with lightweight general-purpose models.",
  ),
  o1: buildProfile(
    "large",
    "100B-250B",
    "Class-based estimate for reasoning-heavy models using a larger multiplier.",
  ),
  "o3-mini": buildProfile(
    "medium",
    "20B-100B",
    "Class-based estimate for compact reasoning models.",
  ),
  "gemini-2.0": buildProfile(
    "medium",
    "20B-100B",
    "Class-based estimate aligned with mainstream hosted assistants.",
  ),
  "llama-3.1-405b": buildProfile(
    "huge",
    ">250B",
    "Class-based estimate for very large open-weight models.",
  ),
  "mixtral-8x22b": buildProfile(
    "large",
    "100B-250B",
    "Class-based estimate for larger open-source MoE models.",
  ),
  "grok-3": buildProfile(
    "huge",
    ">250B",
    "Class-based estimate for frontier-scale hosted assistants.",
  ),
  "palm-2": buildProfile(
    "huge",
    ">250B",
    "Class-based estimate for legacy large Google-class models.",
  ),
  "qwen-2.5-72b": buildProfile(
    "large",
    "100B-250B",
    "Class-based estimate for large open-source instruct models.",
  ),
};
