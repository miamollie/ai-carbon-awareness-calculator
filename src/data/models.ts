import { ModelName } from "../types";

export interface ModelEnergyProfile {
  params: string;
  inputWhPer1kTokens: number;
  outputWhPer1kTokens: number;
  source: string;
}

export const LLM_ENERGY_ESTIMATES: Record<ModelName, ModelEnergyProfile> = {
  "claude-haiku-4.5": {
    params: "~8B",
    inputWhPer1kTokens: 0.03,
    outputWhPer1kTokens: 0.12,
    source:
      "Heuristic estimate from a small-chat-model baseline: below GPT-4o because the model is smaller, but still high enough to reflect normal prompt and generation overhead.",
  },
  "claude-sonnet-4.6": {
    params: "~50B",
    inputWhPer1kTokens: 0.09,
    outputWhPer1kTokens: 0.55,
    source:
      "Scaled from the GPT-4o-style chat reference and nudged upward because Sonnet-class models are typically used for longer, more demanding conversations.",
  },
  "claude-opus-4.6": {
    params: "~100B+",
    inputWhPer1kTokens: 0.14,
    outputWhPer1kTokens: 0.9,
    source:
      "Scaled above the chat baseline for a larger reasoning-oriented model, where more internal compute and longer responses are expected.",
  },
  "gpt-4o": {
    params: "~120B+",
    inputWhPer1kTokens: 0.09,
    outputWhPer1kTokens: 0.55,
    source:
      "Primary reference point: Epoch AI’s GPT-4o energy discussion (~0.3 Wh for a typical chat query), converted into a per-token proxy using a representative input/output token mix.",
  },
  "gpt-4o-mini": {
    params: "~8B-12B",
    inputWhPer1kTokens: 0.03,
    outputWhPer1kTokens: 0.18,
    source:
      "Placed below GPT-4o because the 'mini' class is expected to require materially less compute per request.",
  },
  "gpt-4.1": {
    params: "~120B+",
    inputWhPer1kTokens: 0.08,
    outputWhPer1kTokens: 0.5,
    source:
      "Set near the GPT-4o reference, but slightly rebalanced for a mainstream general model with similar chat behavior and slightly lower assumed output cost.",
  },
  "gpt-4.1-mini": {
    params: "~8B-12B",
    inputWhPer1kTokens: 0.025,
    outputWhPer1kTokens: 0.14,
    source:
      "Lightweight sibling to GPT-4.1, positioned below the full model because it should need less compute per token.",
  },
  o1: {
    params: "unknown",
    inputWhPer1kTokens: 0.12,
    outputWhPer1kTokens: 0.9,
    source:
      "Raised above the GPT-4o baseline because reasoning-heavy models tend to spend more compute internally and generate longer outputs per request.",
  },
  "o3-mini": {
    params: "unknown",
    inputWhPer1kTokens: 0.05,
    outputWhPer1kTokens: 0.28,
    source:
      "Placed below o1 but above ordinary mini chat models because it is still reasoning-oriented, just with a smaller footprint.",
  },
  "gemini-2.0": {
    params: "~180B+",
    inputWhPer1kTokens: 0.08,
    outputWhPer1kTokens: 0.5,
    source:
      "Estimated from the same general chat baseline as GPT-4o, with a similar order of magnitude because Gemini-class assistants behave like mainstream chat workloads.",
  },
  "llama-3.1-405b": {
    params: "~405B",
    inputWhPer1kTokens: 0.4,
    outputWhPer1kTokens: 2.8,
    source:
      "Anchored to the public ~2,800 mWh per 1k output-token figure, then extended to an input-side proxy because the source clearly covers output tokens but not the full prompt mix.",
  },
  "mixtral-8x22b": {
    params: "~141B active",
    inputWhPer1kTokens: 0.18,
    outputWhPer1kTokens: 1.2,
    source:
      "Set above smaller open models because MoE chat models still pay routing and generation cost, but below dense frontier models because only part of the network is active at a time.",
  },
  "grok-3": {
    params: "~314B",
    inputWhPer1kTokens: 0.12,
    outputWhPer1kTokens: 0.8,
    source:
      "Estimated from frontier-model scaling: heavier than mainstream chat models, but still in the same broad class as other large hosted assistants.",
  },
  "palm-2": {
    params: "~340B",
    inputWhPer1kTokens: 0.15,
    outputWhPer1kTokens: 0.95,
    source:
      "Legacy Google model placed above modern optimized chat models because it reflects older efficiency assumptions and earlier-generation serving stacks.",
  },
  "qwen-2.5-72b": {
    params: "~72B",
    inputWhPer1kTokens: 0.14,
    outputWhPer1kTokens: 0.7,
    source:
      "Positioned as a strong open-source instruct model: heavier than small open models, lighter than the largest frontier systems.",
  },
};
