import { useState } from 'react';
import { Check, Loader2, Pencil, Search, Trash2, X } from 'lucide-react';
import { deleteRoute, updateRoute } from '../api/commuteApi';
import {
  MODE_META,
  RouteRead,
  TransportMode,
  Weather,
  WEATHER_META,
} from '../types/commute';

interface SavedRoutesListProps {
  routes: RouteRead[];
  loading: boolean;
  onRouteUpdated: (updated: RouteRead) => void;
  onRouteDeleted: (id: number) => void;
  onError: (message: string | null) => void;
}

export function SavedRoutesList({
  routes,
  loading,
  onRouteUpdated,
  onRouteDeleted,
  onError,
}: SavedRoutesListProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editOrigin, setEditOrigin] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editDistance, setEditDistance] = useState<number>(1);
  const [editTripsPerWeek, setEditTripsPerWeek] = useState<number>(10);

  const startEditing = (route: RouteRead) => {
    setEditingId(route.id);
    setEditName(route.name);
    setEditOrigin(route.origin);
    setEditDestination(route.destination);
    setEditDistance(route.distance_km);
    setEditTripsPerWeek(route.trips_per_week);
    onError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdate = async (
    id: number,
    patch: {
      name?: string;
      origin?: string;
      destination?: string;
      distance_km?: number;
      trips_per_week?: number;
      weather?: Weather;
      selected_mode?: TransportMode;
    }
  ) => {
    try {
      setUpdatingId(id);
      onError(null);
      const updated = await updateRoute(id, patch);
      onRouteUpdated(updated);
      if (editingId === id) {
        setEditingId(null);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error updating route.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (
      !editName.trim() ||
      !editOrigin.trim() ||
      !editDestination.trim() ||
      editDistance <= 0 ||
      editTripsPerWeek < 1
    ) {
      onError('Please provide valid route details, distance, and weekly trips.');
      return;
    }

    await handleUpdate(id, {
      name: editName.trim(),
      origin: editOrigin.trim(),
      destination: editDestination.trim(),
      distance_km: Number(editDistance),
      trips_per_week: Number(editTripsPerWeek),
    });
  };

  const handleDelete = async (id: number) => {
    try {
      setUpdatingId(id);
      onError(null);
      await deleteRoute(id);
      onRouteDeleted(id);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error deleting route.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRoutes = routes.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q)
    );
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Saved Commute Routes
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Edit route details, weekly frequency, or toggle weather and mode inline
          </p>
        </div>

        {routes.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter routes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 flex justify-center">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          {routes.length === 0
            ? 'No saved routes yet. Use the Route Analyzer above to add your first commute!'
            : 'No routes match your search filter.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRoutes.map((route) => {
            const activeMetric = route.modes.find(
              (m) => m.mode === route.selected_mode
            );
            const isBusy = updatingId === route.id;
            const isEditing = editingId === route.id;

            return (
              <div
                key={route.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition p-5 shadow-sm ${
                  isEditing
                    ? 'border-emerald-500/70 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800'
                } ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Route Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Origin
                        </label>
                        <input
                          type="text"
                          value={editOrigin}
                          onChange={(e) => setEditOrigin(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Destination
                        </label>
                        <input
                          type="text"
                          value={editDestination}
                          onChange={(e) => setEditDestination(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Distance (km)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="500"
                          value={editDistance}
                          onChange={(e) =>
                            setEditDistance(Math.max(0.5, Number(e.target.value)))
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Trips / Week
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={editTripsPerWeek}
                          onChange={(e) =>
                            setEditTripsPerWeek(
                              Math.min(50, Math.max(1, Number(e.target.value)))
                            )
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(route.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {route.name}
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {route.distance_km} km
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          {route.trips_per_week}× / week
                        </span>
                        {route.selected_mode ===
                          route.smart_recommendation.mode && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            ✓ Optimal Choice
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {route.origin} → {route.destination}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 pt-0.5">
                        <span className="font-semibold">Tip:</span>{' '}
                        {route.smart_recommendation.explanation}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 self-start md:self-center">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          {(Object.keys(WEATHER_META) as Weather[]).map((w) => {
                            const Icon = WEATHER_META[w].icon;
                            const active = route.weather === w;
                            return (
                              <button
                                key={w}
                                title={WEATHER_META[w].label}
                                onClick={() =>
                                  handleUpdate(route.id, { weather: w })
                                }
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  active
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          {(Object.keys(MODE_META) as TransportMode[]).map(
                            (m) => {
                              const Icon = MODE_META[m].icon;
                              const active = route.selected_mode === m;
                              return (
                                <button
                                  key={m}
                                  title={MODE_META[m].label}
                                  onClick={() =>
                                    handleUpdate(route.id, { selected_mode: m })
                                  }
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    active
                                      ? 'bg-emerald-700 text-white shadow-sm'
                                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </button>
                              );
                            }
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditing(route)}
                            title="Edit route details"
                            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(route.id)}
                            title="Delete route"
                            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {activeMetric && (
                        <div className="flex items-center justify-around gap-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          <span>{Math.round(activeMetric.time_minutes)} min</span>
                          <span className="text-slate-300 dark:text-slate-600">
                            |
                          </span>
                          <span>{activeMetric.cost_pln.toFixed(2)} PLN</span>
                          <span className="text-slate-300 dark:text-slate-600">
                            |
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {Math.round(activeMetric.co2_grams)} g CO₂
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}