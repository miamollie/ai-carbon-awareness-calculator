// Model affects carbon calculation due to number of parameters
export type ModelName =
  | "claude-haiku-4.5"
  | "claude-sonnet-4.6"
  | "claude-opus-4.6"
  | "gpt-4o"
  | "gemini-2.0"
  | "llama-3.1-405b"
  | "mixtral-8x22b"
  | "grok-3"
  | "palm-2"
  | "qwen-2.5-72b";

export type Equivalencies = Record<
  string,
  {
    value: number | string;
    unit: string;
    range?: string;
  }
>;

export interface CarbonRequest {
  model: ModelName;
  input_tokens: number;
  output_tokens: number;
}

export interface CarbonResponse {
  carbon_kg_co2e: number;
  model: ModelName;
  equivalencies: Equivalencies;
}
