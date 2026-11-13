import React, { useEffect, useState } from 'react';
import { Clock, Leaf, Loader2, Minus, Plus, Sparkles, Wallet } from 'lucide-react';
import { analyzeRoute, createRoute } from '../api/commuteApi';
import {
  AnalyzeResponse,
  MODE_META,
  RouteRead,
  TransportMode,
  Weather,
  WEATHER_META,
} from '../types/commute';

interface RouteAnalyzerProps {
  onRouteCreated: (route: RouteRead) => void;
  onError: (message: string | null) => void;
}

export function RouteAnalyzer({ onRouteCreated, onError }: RouteAnalyzerProps) {
  const [name, setName] = useState('Daily Office Commute');
  const [origin, setOrigin] = useState('Wrzeszcz');
  const [destination, setDestination] = useState('Oliwa Business Centre');
  const [distanceKm, setDistanceKm] = useState<number>(6.5);
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(10);
  const [weather, setWeather] = useState<Weather>('sunny');
  const [chosenMode, setChosenMode] = useState<TransportMode>('bike');

  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (distanceKm <= 0 || distanceKm > 500) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setAnalyzing(true);
        const data = await analyzeRoute(distanceKm, weather, controller.signal);
        setAnalysis(data);
        setChosenMode(data.smart_recommendation.mode);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          onError('Could not calculate route metrics. Check if backend is running.');
        }
      } finally {
        setAnalyzing(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [distanceKm, weather, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !origin.trim() || !destination.trim() || distanceKm <= 0) {
      onError('Please fill in all route fields with valid values.');
      return;
    }

    try {
      setSaving(true);
      onError(null);
      const created = await createRoute({
        name: name.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        distance_km: Number(distanceKm),
        trips_per_week: Number(tripsPerWeek),
        weather,
        selected_mode: chosenMode,
      });
      onRouteCreated(created);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error saving route.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Route Analyzer
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Compare transport modes and get weather-aware smart recommendations
          </p>
        </div>
        {analyzing && <Loader2 className="w-5 h-5 text-emerald-500/80 animate-spin" />}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Route Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Commute"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Origin
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Wrzeszcz"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Oliwa Business Centre"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Trips / Week
            </label>
            <div className="inline-flex w-full items-center justify-between rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 overflow-hidden">
              <button
                type="button"
                onClick={() => setTripsPerWeek((prev) => Math.max(1, prev - 1))}
                aria-label="Decrease weekly trips"
                className="px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={tripsPerWeek}
                onChange={(e) =>
                  setTripsPerWeek(Math.min(50, Math.max(1, Number(e.target.value))))
                }
                className="w-full py-1.5 text-center text-sm font-semibold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setTripsPerWeek((prev) => Math.min(50, prev + 1))}
                aria-label="Increase weekly trips"
                className="px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Distance (km)
              </label>
              <div className="flex items-center gap-1.5">
                <div className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setDistanceKm((prev) =>
                        Math.max(0.5, Number((prev - 0.5).toFixed(1)))
                      )
                    }
                    aria-label="Decrease distance"
                    className="px-2 py-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={distanceKm}
                    onChange={(e) =>
                      setDistanceKm(Math.max(0.5, Number(e.target.value)))
                    }
                    className="w-14 py-1 text-center text-sm font-semibold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDistanceKm((prev) =>
                        Math.min(100, Number((prev + 0.5).toFixed(1)))
                      )
                    }
                    aria-label="Increase distance"
                    className="px-2 py-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">km</span>
              </div>
            </div>
            <input
              type="range"
              min="0.5"
              max="35"
              step="0.5"
              value={Math.min(35, distanceKm)}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              <span>0.5 km</span>
              <span>15 km</span>
              <span>35+ km</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Weather Conditions
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(Object.keys(WEATHER_META) as Weather[]).map((w) => {
                const Icon = WEATHER_META[w].icon;
                const active = weather === w;
                return (
                  <button
                    type="button"
                    key={w}
                    onClick={() => setWeather(w)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition cursor-pointer ${
                      active
                        ? 'bg-emerald-700/90 text-white border-emerald-600/80 shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {WEATHER_META[w].label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {analysis && (
          <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-700/80 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300/90">
                  Smart AI Recommendation
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-semibold">
                  {MODE_META[analysis.smart_recommendation.mode].label}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {analysis.smart_recommendation.explanation}
              </p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysis.modes.map((m) => {
              const Icon = MODE_META[m.mode].icon;
              const isRecommended = analysis.smart_recommendation.mode === m.mode;
              const isSelected = chosenMode === m.mode;

              return (
                <div
                  key={m.mode}
                  onClick={() => setChosenMode(m.mode)}
                  className={`relative cursor-pointer rounded-2xl p-4 border transition ${
                    isSelected
                      ? 'border-emerald-500/70 bg-emerald-50/40 dark:bg-emerald-950/25 ring-1 ring-emerald-500/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-emerald-50 rounded-full shadow-sm">
                      Recommended
                    </span>
                  )}

                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-emerald-700/90 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {MODE_META[m.mode].label}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />{' '}
                        Time
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        {Math.round(m.time_minutes)} min
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />{' '}
                        Cost
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        {m.cost_pln.toFixed(2)} PLN
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />{' '}
                        CO₂
                      </span>
                      <span
                        className={`font-semibold ${
                          m.co2_grams === 0
                            ? 'text-emerald-600 dark:text-emerald-400/90'
                            : 'text-slate-900 dark:text-slate-200'
                        }`}
                      >
                        {Math.round(m.co2_grams)} g
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Save Route ({MODE_META[chosenMode].label})
          </button>
        </div>
      </form>
    </section>
  );
}