import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { getRoutes } from "./api/commuteApi";
import { KpiCards } from "./components/KpiCards";
import { Navbar } from "./components/Navbar";
import { RouteAnalyzer } from "./components/RouteAnalyzer";
import { SavedRoutesList } from "./components/SavedRoutesList";
import { RouteRead } from "./types/commute";

export function App() {
  const [routes, setRoutes] = useState<RouteRead[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dark mode enabled by default, persisted in localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("smartcommute-theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("smartcommute-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("smartcommute-theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    getRoutes()
      .then(setRoutes)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unexpected network error.",
        ),
      )
      .finally(() => setLoadingRoutes(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {error && (
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold underline hover:text-red-950 dark:hover:text-red-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <KpiCards routes={routes} />

        <RouteAnalyzer
          onRouteCreated={(created) => setRoutes((prev) => [created, ...prev])}
          onError={setError}
        />

        <SavedRoutesList
          routes={routes}
          loading={loadingRoutes}
          onRouteUpdated={(updated) =>
            setRoutes((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r)),
            )
          }
          onRouteDeleted={(id) =>
            setRoutes((prev) => prev.filter((r) => r.id !== id))
          }
          onError={setError}
        />
      </main>
    </div>
  );
}

export default App;
