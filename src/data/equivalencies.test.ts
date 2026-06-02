import { describe, expect, it } from "vitest";
import { getEquivalencies } from "./equivalencies";

describe("getEquivalencies", () => {
  it("returns zeroes for zero energy", () => {
    const result = getEquivalencies(0);

    expect(result.evMilesDriven.value).toBe(0);
    expect(result.kettleMinutesBoiled.value).toBe(0);
    expect(result.shredderMinutes.value).toBe(0);
    expect(result.ledBulbHours.value).toBe(0);
  });

  it("uses configured constants for each equivalency", () => {
    const result = getEquivalencies(300);

    expect(result.evMilesDriven.value).toBe(1.2);
    expect(result.kettleMinutesBoiled.value).toBe(12);
    expect(result.shredderMinutes.value).toBe(50);
    expect(result.ledBulbHours.value).toBe(30);
  });

  it("applies expected rounding precision", () => {
    const result = getEquivalencies(1);

    expect(result.evMilesDriven.value).toBe(0.004);
    expect(result.kettleMinutesBoiled.value).toBe(0);
    expect(result.shredderMinutes.value).toBe(0);
    expect(result.ledBulbHours.value).toBe(0.1);
  });
});
