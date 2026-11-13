import { useMemo } from "react";
import { CalendarRange, Leaf, MapPin, Wallet } from "lucide-react";
import { RouteRead } from "../types/commute";

interface KpiCardsProps {
  routes: RouteRead[];
}

const WEEKS_PER_MONTH = 4.33;

export function KpiCards({ routes }: KpiCardsProps) {
  const kpis = useMemo(() => {
    let weeklyCo2SavedGrams = 0;
    let weeklyMoneySavedPln = 0;
    let totalWeeklyTrips = 0;

    for (const route of routes) {
      totalWeeklyTrips += route.trips_per_week;
      const carMetric = route.modes.find((m) => m.mode === "car");
      const selectedMetric = route.modes.find(
        (m) => m.mode === route.selected_mode,
      );
      if (carMetric && selectedMetric) {
        const tripCo2Saved = Math.max(
          0,
          carMetric.co2_grams - selectedMetric.co2_grams,
        );
        const tripMoneySaved = Math.max(
          0,
          carMetric.cost_pln - selectedMetric.cost_pln,
        );
        weeklyCo2SavedGrams += tripCo2Saved * route.trips_per_week;
        weeklyMoneySavedPln += tripMoneySaved * route.trips_per_week;
      }
    }

    const monthlyCo2SavedKg = (weeklyCo2SavedGrams * WEEKS_PER_MONTH) / 1000;
    const monthlySavingsPln = weeklyMoneySavedPln * WEEKS_PER_MONTH;

    return {
      totalRoutes: routes.length,
      totalWeeklyTrips,
      weeklySavingsPln: weeklyMoneySavedPln.toFixed(2),
      monthlyCo2SavedKg: monthlyCo2SavedKg.toFixed(1),
      monthlySavingsPln: monthlySavingsPln.toFixed(0),
    };
  }, [routes]);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Saved Routes
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {kpis.totalRoutes}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {kpis.totalWeeklyTrips} trips / week
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400/90">
          <Leaf className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Est. Monthly CO₂
          </p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400/90 mt-0.5">
            {kpis.monthlyCo2SavedKg} kg
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            saved vs. driving
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400/90">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Saved / Week
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {kpis.weeklySavingsPln} PLN
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            based on weekly trips
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400/90">
          <CalendarRange className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Est. Monthly
          </p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-0.5">
            {kpis.monthlySavingsPln} PLN
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            weekly × 4.33 weeks
          </p>
        </div>
      </div>
    </section>
  );
}