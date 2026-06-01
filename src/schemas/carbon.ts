import * as z from "zod/v4";
import { LLM_ENERGY_ESTIMATES } from "../data/models";

const modelNames = Object.keys(LLM_ENERGY_ESTIMATES) as [
  keyof typeof LLM_ENERGY_ESTIMATES,
  ...(keyof typeof LLM_ENERGY_ESTIMATES)[],
];

export const carbonRequestShape = {
  model: z.enum(modelNames),
  input_tokens: z.number().int().min(0).max(1000000),
  output_tokens: z.number().int().min(0).max(1000000),
};

export const carbonResponseShape = {
  energy_wh: z.number().min(0),
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
};

export const carbonRequestSchema = z.object(carbonRequestShape);
export const carbonResponseSchema = z.object(carbonResponseShape);
