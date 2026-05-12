// Model affects carbon calculation due to number of parameters
export type ModelName = "haiku" | "sonnet" | "opus";
// Task affects carbon calculation due to loading of skills (more input tokens) and output tokens
export type TaskName = "chat" | "coding" | "document-generation" | "agentic";

export interface CarbonRequest {
  model: ModelName;
  task: TaskName;
  input_tokens: number;
  output_tokens: number;
}

export interface CarbonResponse {
  carbon_kg_co2e: number;
  model: ModelName;
  task: TaskName;
  equivalencies: Record<string, string>;
}
