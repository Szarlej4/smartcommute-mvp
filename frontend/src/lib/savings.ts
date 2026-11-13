import type { ModeMetrics, SavedRoute, TransportMode } from "../types";

export interface SavingsSummary {
  routeCount: number;
  co2SavedKg: number;
  moneySavedPln: number;
}

export function summarizeRoutes(routes: SavedRoute[]): SavingsSummary {
  let co2Grams = 0;
  let money = 0;

  for (const route of routes) {
    const car = findMode(route.modes, "car");
    const selected = findMode(route.modes, route.selected_mode);
    if (!car || !selected) continue;
    co2Grams += car.co2_grams - selected.co2_grams;
    money += car.cost_pln - selected.cost_pln;
  }

  return {
    routeCount: routes.length,
    co2SavedKg: co2Grams / 1000,
    moneySavedPln: money,
  };
}

export function findMode(
  modes: ModeMetrics[],
  mode: TransportMode,
): ModeMetrics | undefined {
  return modes.find((item) => item.mode === mode);
}

export function savingsVersusCar(
  modes: ModeMetrics[],
  mode: TransportMode,
): { co2Kg: number; moneyPln: number } | null {
  const car = findMode(modes, "car");
  const selected = findMode(modes, mode);
  if (!car || !selected) return null;
  return {
    co2Kg: (car.co2_grams - selected.co2_grams) / 1000,
    moneyPln: car.cost_pln - selected.cost_pln,
  };
}
