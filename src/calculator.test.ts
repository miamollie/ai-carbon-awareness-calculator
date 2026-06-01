import { describe, expect, it } from "vitest";
import {
  calculate,
  energyWhFromTokens,
  isValidModel,
  validateRequest,
} from "./calculator";

describe("calculator", () => {
  it("validates known models", () => {
    expect(isValidModel("gpt-4o")).toBe(true);
    expect(isValidModel("sonnet")).toBe(false);
  });

  it("returns unknown model validation error", () => {
    const result = validateRequest({
      model: "not-a-model",
      input_tokens: 100,
      output_tokens: 100,
    } as any);

    expect(result).toBe("unknown model");
  });

  it("returns token bounds validation error", () => {
    const result = validateRequest({
      model: "gpt-4o",
      input_tokens: -1,
      output_tokens: 100,
    } as any);

    expect(result).toBe("token counts must be integers between 0 and 1000000");
  });

  it("computes energy in Wh from token counts", () => {
    const energyWh = energyWhFromTokens(1000, 500, "gpt-4o");
    expect(energyWh).toBeCloseTo(0.15, 10);
  });

  it("calculates a response with energy, carbon range, and equivalencies", () => {
    const result = calculate({
      model: "claude-sonnet-4.6",
      input_tokens: 1_000_000,
      output_tokens: 1_000_000,
    });

    expect(result.model).toBe("claude-sonnet-4.6");
    expect(result.energy_wh).toBe(120);
    expect(result.carbon_kg_co2e_range.low).toBe(0.006);
    expect(result.carbon_kg_co2e_range.high).toBe(0.084);
    expect(result.equivalencies).toHaveProperty("smartphoneCharges");
    expect(result.equivalencies.smartphoneCharges.value).toBe(10);
  });
});
