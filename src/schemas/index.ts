import * as z from "zod/v4";
import { LLM_ENERGY_ESTIMATES } from "../data/models";

const modelNames = Object.keys(LLM_ENERGY_ESTIMATES) as [
  keyof typeof LLM_ENERGY_ESTIMATES,
  ...(keyof typeof LLM_ENERGY_ESTIMATES)[],
];

export const requestShape = {
  model: z.enum(modelNames),
  input_tokens: z.number().int().min(0).max(1000000),
  output_tokens: z.number().int().min(0).max(1000000),
};

export const responseShape = {
  energy_wh: z.number().min(0),
  impact_level: z.enum(["light", "moderate", "heavy", "very_heavy"]),
  model: z.enum(modelNames),
  carbon_kg_co2e_range: z.object({
    low: z.number().min(0),
    high: z.number().min(0),
  }),
  grid_intensity_assumptions_gco2e_per_kwh: z.object({
    low: z.number().positive(),
    high: z.number().positive(),
  }),
  equivalencies: z.record(
    z.string(),
    z.object({
      value: z.number(),
      unit: z.string(),
    }),
  ),
  methodology: z.object({
    source_type: z.enum(["estimated", "benchmark_proxy", "measured"]),
    confidence: z.enum(["low", "medium", "high"]),
    notes: z.string(),
  }),
};

export const requestSchema = z.object(requestShape);
export const responseSchema = z.object(responseShape);
