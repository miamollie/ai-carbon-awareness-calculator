import { describe, expect, it } from "vitest";
import { calculate, carbonPerToken, isValidModel, validateRequest } from "./calculator";

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

  it("computes carbon per token in kilograms", () => {
    const carbonKg = carbonPerToken(1000, 500, "gpt-4o");
    expect(carbonKg).toBeCloseTo(0.00006, 10);
  });

  it("calculates a response with rounded carbon and equivalencies", () => {
    const result = calculate({
      model: "claude-sonnet-4.6",
      input_tokens: 1_000_000,
      output_tokens: 1_000_000,
    });

    expect(result.model).toBe("claude-sonnet-4.6");
    expect(result.carbon_kg_co2e).toBe(0.048);
    expect(result.equivalencies).toHaveProperty("smartphoneCharges");
    expect(result.equivalencies.smartphoneCharges.value).toBe(8);
  });
});
