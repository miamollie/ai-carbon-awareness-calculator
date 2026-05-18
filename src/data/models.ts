// NOTE: The conversion factor is Wh * 2.4 (approx) based on ecologits calculator

import { ModelName } from "../types";


export interface ModelEmissions {
  params: string;
  inputCo2PerToken: number; // kg CO₂e per token
  outputCo2PerToken: number; // kg CO₂e per token
  source: string;
}

export const LLM_CARBON_EMISSIONS: Record<ModelName, ModelEmissions> = {
  "claude-haiku-4.5": {
    params: "~8B",
    inputCo2PerToken: 0.000004,
    outputCo2PerToken: 0.000012,
    source: "Anthropic pricing ratio",
  },
  "claude-sonnet-4.6": {
    params: "~50B",
    inputCo2PerToken: 0.000012,
    outputCo2PerToken: 0.000036,
    source: "Anthropic pricing ratio (3.6x output)",
  },
  "claude-opus-4.6": {
    params: "~100B+",
    inputCo2PerToken: 0.00002,
    outputCo2PerToken: 0.00006,
    source: "Extrapolated from pricing + FLOP scaling",
  },
  "gpt-4o": {
    params: "~120B+",
    inputCo2PerToken: 0.000024,
    outputCo2PerToken: 0.000072,
    source: "Epoch AI (ChatGPT 0.34 Wh/query avg)",
  },
  "gemini-2.0": {
    params: "~180B+",
    inputCo2PerToken: 0.000031,
    outputCo2PerToken: 0.000093,
    source: "Google Aug 2025 (0.24 Wh median)",
  },
  "llama-3.1-405b": {
    params: "~405B",
    inputCo2PerToken: 0.000056,
    outputCo2PerToken: 0.000168,
    source: "Llama 405B measured ~2,800 mWh/1k output tokens",
  },
  "mixtral-8x22b": {
    params: "~141B active",
    inputCo2PerToken: 0.000018,
    outputCo2PerToken: 0.000054,
    source: "MoE scaling (40% less than dense equivalent)",
  },
  "grok-3": {
    params: "~314B",
    inputCo2PerToken: 0.000044,
    outputCo2PerToken: 0.000132,
    source: "xAI inference benchmarks",
  },
  "palm-2": {
    params: "~340B",
    inputCo2PerToken: 0.000048,
    outputCo2PerToken: 0.000144,
    source: "Google 2023 data (pre-efficiency gains)",
  },
  "qwen-2.5-72b": {
    params: "~72B",
    inputCo2PerToken: 0.000016,
    outputCo2PerToken: 0.000048,
    source: "Alibaba benchmarks + scaling laws",
  },
};
