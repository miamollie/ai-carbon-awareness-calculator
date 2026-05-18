// ASSUMPTION: equivalency multipliers are approximate
// and may be tuned with better regional data
import { Equivalencies } from "../types";

/**
 * Get equivalencies for a CO₂ amount
 */
export function getEquivalencies(kgCo2e: number): Equivalencies {
  return {
    microwaveRuns: {
      value: Math.round(kgCo2e * 17.5),
      range: `${Math.round(kgCo2e * 17.5)}-${Math.round(kgCo2e * 20)}`,
      unit: "runs (2 min each)",
    },
    drivingKm: {
      value: (kgCo2e * 3.5).toFixed(2),
      unit: "km",
    },
    flyingKmRoundtrip: {
      value: (kgCo2e * 0.3).toFixed(2),
      unit: "km",
    },
    videoHours: {
      value: Math.round(kgCo2e * 40),
      unit: "hours streaming",
    },
    beefKg: {
      value: (kgCo2e * 0.1).toFixed(2),
      unit: "kg",
    },
    smartphoneCharges: {
      value: Math.round(kgCo2e * 175),
      unit: "charges",
    },
  };
}
