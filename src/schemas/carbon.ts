import * as z from "zod/v4";

export const carbonRequestShape = {
  model: z.enum(["haiku", "sonnet", "opus"]),
  task: z.enum(["chat", "coding", "document-generation", "agentic"]),
  input_tokens: z.number().int().min(0).max(1000000),
  output_tokens: z.number().int().min(0).max(1000000),
};

export const carbonResponseShape = {
  carbon_kg_co2e: z.number().min(0),
  model: z.enum(["haiku", "sonnet", "opus"]),
  task: z.enum(["chat", "coding", "document-generation", "agentic"]),
  equivalencies: z.record(z.string(), z.string()),
};

export const carbonRequestSchema = z.object(carbonRequestShape);
export const carbonResponseSchema = z.object(carbonResponseShape);
