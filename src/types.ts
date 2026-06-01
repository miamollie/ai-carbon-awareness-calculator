// Model affects carbon calculation due to number of parameters
export type ModelName =
  | "claude-haiku-4.5"
  | "claude-sonnet-4.6"
  | "claude-opus-4.6"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4.1"
  | "gpt-4.1-mini"
  | "o1"
  | "o3-mini"
  | "gemini-2.0"
  | "llama-3.1-405b"
  | "mixtral-8x22b"
  | "grok-3"
  | "palm-2"
  | "qwen-2.5-72b";

export type Equivalencies = Record<
  string,
  {
    value: number;
    unit: string;
  }
>;

export type ImpactLevel = "light" | "moderate" | "heavy" | "very_heavy";

export type MethodologySourceType =
  | "estimated"
  | "benchmark_proxy"
  | "measured";

export type MethodologyConfidence = "low" | "medium" | "high";

export interface Methodology {
  source_type: MethodologySourceType;
  confidence: MethodologyConfidence;
  notes: string;
}

export interface CarbonRange {
  low: number;
  high: number;
}

export interface GridIntensityAssumptions {
  low: number;
  high: number;
}

export interface CarbonRequest {
  model: ModelName;
  input_tokens: number;
  output_tokens: number;
}

export interface CarbonResponse {
  energy_wh: number;
  impact_level: ImpactLevel;
  model: ModelName;
  carbon_kg_co2e_range: CarbonRange;
  grid_intensity_assumptions_gco2e_per_kwh: GridIntensityAssumptions;
  equivalencies: Equivalencies;
  methodology: Methodology;
}
