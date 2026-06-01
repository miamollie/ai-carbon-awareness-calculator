import { ModelName } from "../types";

export interface ModelEnergyProfile {
  params: string;
  inputWhPer1kTokens: number;
  outputWhPer1kTokens: number;
  source: string;
  suggestedWhRange?: {
    low: number;
    high: number;
  };
}

export const LLM_ENERGY_ESTIMATES: Record<ModelName, ModelEnergyProfile> = {
  "claude-haiku-4.5": {
    params: "~8B",
    inputWhPer1kTokens: 0.03,
    outputWhPer1kTokens: 0.12,
    source: "Best-guess estimate for a small Claude-class model",
  },
  "claude-sonnet-4.6": {
    params: "~50B",
    inputWhPer1kTokens: 0.09,
    outputWhPer1kTokens: 0.55,
    source: "Best-guess estimate anchored to typical chat workloads",
  },
  "claude-opus-4.6": {
    params: "~100B+",
    inputWhPer1kTokens: 0.14,
    outputWhPer1kTokens: 0.9,
    source: "Best-guess estimate for larger Claude-class reasoning workloads",
  },
  "gpt-4o": {
    params: "~120B+",
    inputWhPer1kTokens: 0.09,
    outputWhPer1kTokens: 0.55,
    source: "Epoch AI GPT-4o query-energy discussion, calibrated to typical chat mix",
    suggestedWhRange: {
      low: 0.2,
      high: 1.5,
    },
  },
  "gpt-4o-mini": {
    params: "~8B-12B",
    inputWhPer1kTokens: 0.03,
    outputWhPer1kTokens: 0.18,
    source: "Best-guess estimate for a smaller OpenAI chat model",
    suggestedWhRange: {
      low: 0.08,
      high: 0.6,
    },
  },
  "gpt-4.1": {
    params: "~120B+",
    inputWhPer1kTokens: 0.08,
    outputWhPer1kTokens: 0.5,
    source: "Best-guess estimate for a mainstream OpenAI general model",
    suggestedWhRange: {
      low: 0.15,
      high: 1.2,
    },
  },
  "gpt-4.1-mini": {
    params: "~8B-12B",
    inputWhPer1kTokens: 0.025,
    outputWhPer1kTokens: 0.14,
    source: "Best-guess estimate for a lightweight OpenAI general model",
    suggestedWhRange: {
      low: 0.06,
      high: 0.45,
    },
  },
  "o1": {
    params: "unknown",
    inputWhPer1kTokens: 0.12,
    outputWhPer1kTokens: 0.9,
    source: "Best-guess estimate for a reasoning-heavy OpenAI model",
    suggestedWhRange: {
      low: 0.4,
      high: 3.0,
    },
  },
  "o3-mini": {
    params: "unknown",
    inputWhPer1kTokens: 0.05,
    outputWhPer1kTokens: 0.28,
    source: "Best-guess estimate for a smaller reasoning model",
    suggestedWhRange: {
      low: 0.15,
      high: 0.9,
    },
  },
  "gemini-2.0": {
    params: "~180B+",
    inputWhPer1kTokens: 0.08,
    outputWhPer1kTokens: 0.5,
    source: "Best-guess estimate for Gemini-class chat workloads",
  },
  "llama-3.1-405b": {
    params: "~405B",
    inputWhPer1kTokens: 0.4,
    outputWhPer1kTokens: 2.8,
    source: "Measured ~2,800 mWh/1k output tokens; input side best guess",
  },
  "mixtral-8x22b": {
    params: "~141B active",
    inputWhPer1kTokens: 0.18,
    outputWhPer1kTokens: 1.2,
    source: "Best-guess MoE estimate for a popular open-source chat model",
  },
  "grok-3": {
    params: "~314B",
    inputWhPer1kTokens: 0.12,
    outputWhPer1kTokens: 0.8,
    source: "Best-guess estimate from frontier-model scaling",
  },
  "palm-2": {
    params: "~340B",
    inputWhPer1kTokens: 0.15,
    outputWhPer1kTokens: 0.95,
    source: "Legacy Google model, estimated from older efficiency assumptions",
  },
  "qwen-2.5-72b": {
    params: "~72B",
    inputWhPer1kTokens: 0.14,
    outputWhPer1kTokens: 0.7,
    source: "Best-guess estimate for a widely used open-source instruct model",
  },
};
