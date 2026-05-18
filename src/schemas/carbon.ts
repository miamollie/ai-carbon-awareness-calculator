import * as z from "zod/v4";
import { LLM_CARBON_EMISSIONS } from "../data/models";

const modelNames = Object.keys(LLM_CARBON_EMISSIONS) as [
  keyof typeof LLM_CARBON_EMISSIONS,
  ...(keyof typeof LLM_CARBON_EMISSIONS)[],
];

export const carbonRequestShape = {
  model: z.enum(modelNames),
  input_tokens: z.number().int().min(0).max(1000000),
  output_tokens: z.number().int().min(0).max(1000000),
};

export const carbonResponseShape = {
  carbon_kg_co2e: z.number().min(0),
  model: z.enum(modelNames),
  equivalencies: z.record(
    z.string(),
    z.object({
      value: z.union([z.number(), z.string()]),
      unit: z.string(),
      range: z.string().optional(),
    }),
  ),
};

export const carbonRequestSchema = z.object(carbonRequestShape);
export const carbonResponseSchema = z.object(carbonResponseShape);
