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
    inputWhPer1kTokens: 0.01,
    outputWhPer1kTokens: 0.03,
    source: "Anthropic pricing ratio",
  },
  "claude-sonnet-4.6": {
    params: "~50B",
    inputWhPer1kTokens: 0.03,
    outputWhPer1kTokens: 0.09,
    source: "Anthropic pricing ratio (3.6x output)",
  },
  "claude-opus-4.6": {
    params: "~100B+",
    inputWhPer1kTokens: 0.05,
    outputWhPer1kTokens: 0.15,
    source: "Extrapolated from pricing + FLOP scaling",
  },
  "gpt-4o": {
    params: "~120B+",
    inputWhPer1kTokens: 0.06,
    outputWhPer1kTokens: 0.18,
    source: "Epoch AI (ChatGPT 0.34 Wh/query avg)",
  },
  "gemini-2.0": {
    params: "~180B+",
    inputWhPer1kTokens: 0.078,
    outputWhPer1kTokens: 0.234,
    source: "Google Aug 2025 (0.24 Wh median)",
  },
  "llama-3.1-405b": {
    params: "~405B",
    inputWhPer1kTokens: 0.14,
    outputWhPer1kTokens: 0.42,
    source: "Llama 405B measured ~2,800 mWh/1k output tokens",
  },
  "mixtral-8x22b": {
    params: "~141B active",
    inputWhPer1kTokens: 0.045,
    outputWhPer1kTokens: 0.135,
    source: "MoE scaling (40% less than dense equivalent)",
  },
  "grok-3": {
    params: "~314B",
    inputWhPer1kTokens: 0.11,
    outputWhPer1kTokens: 0.33,
    source: "xAI inference benchmarks",
  },
  "palm-2": {
    params: "~340B",
    inputWhPer1kTokens: 0.12,
    outputWhPer1kTokens: 0.36,
    source: "Google 2023 data (pre-efficiency gains)",
  },
  "qwen-2.5-72b": {
    params: "~72B",
    inputWhPer1kTokens: 0.04,
    outputWhPer1kTokens: 0.12,
    source: "Alibaba benchmarks + scaling laws",
  },
};
