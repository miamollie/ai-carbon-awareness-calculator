// ASSUMPTION: equivalency multipliers are approximate
// and may be tuned with better regional data
import { Equivalencies } from "../types";

// Source-backed constants (directional, not universal):
// - EV: ~25 kWh / 100 miles from EPA fuel economy examples => 250 Wh / mile.
// - Kettle: 1500 W from DOE appliance example.
// - Paper shredder: 360 W from DOE appliance example.
// - LED bulb: common 10 W household LED replacement class.
const EV_WH_PER_MILE = 250;
const KETTLE_WATTS = 1500;
const SHREDDER_WATTS = 360;
const LED_WATTS = 10;

/**
 * Get equivalencies for an energy amount.
 */
export function getEquivalencies(energyWh: number): Equivalencies {
  return {
    evMilesDriven: {
      value: Number((energyWh / EV_WH_PER_MILE).toFixed(4)),
      unit: "miles in a typical EV (~250 Wh/mile)",
    },
    kettleMinutesBoiled: {
      value: Math.round((energyWh / KETTLE_WATTS) * 60),
      unit: "minutes boiling water in a 1500W electric kettle",
    },
    shredderMinutes: {
      value: Math.round((energyWh / SHREDDER_WATTS) * 60),
      unit: "minutes running a 360W paper shredder",
    },
    ledBulbHours: {
      value: Number((energyWh / LED_WATTS).toFixed(2)),
      unit: "hours at 10W",
    },
  };
}
