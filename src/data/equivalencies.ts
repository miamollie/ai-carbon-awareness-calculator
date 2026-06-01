// ASSUMPTION: equivalency multipliers are approximate
// and may be tuned with better regional data
import { Equivalencies } from "../types";

/**
 * Get equivalencies for an energy amount.
 */
export function getEquivalencies(energyWh: number): Equivalencies {
  return {
    evMilesDriven: {
      value: Number((energyWh / 300).toFixed(4)),
      unit: "miles in a typical EV (~300 Wh/mile)",
    },
    iphoneCharges: {
      value: Number((energyWh / 12).toFixed(2)),
      unit: "iPhone battery charges (~12 Wh each)",
    },
    microwaveSeconds: {
      value: Math.round((energyWh / 1200) * 3600),
      unit: "seconds at 1200W",
    },
    laptopMinutes: {
      value: Math.round((energyWh / 60) * 60),
      unit: "minutes at 60W",
    },
    ledBulbHours: {
      value: Number((energyWh / 10).toFixed(2)),
      unit: "hours at 10W",
    },
  };
}
