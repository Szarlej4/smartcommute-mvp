import {
    AnalyzeResponse,
    RouteRead,
    TransportMode,
    Weather,
  } from "../types/commute";
  
  const API_BASE = "http://localhost:8000/api";
  
  export async function analyzeRoute(
    distance_km: number,
    weather: Weather,
    signal?: AbortSignal,
  ): Promise<AnalyzeResponse> {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ distance_km, weather }),
      signal,
    });
    if (!res.ok) throw new Error("Failed to analyze route.");
    return res.json();
  }
  
  export async function getRoutes(): Promise<RouteRead[]> {
    const res = await fetch(`${API_BASE}/routes`);
    if (!res.ok) throw new Error("Failed to fetch routes.");
    return res.json();
  }
  
  export async function createRoute(payload: {
    name: string;
    origin: string;
    destination: string;
    distance_km: number;
    trips_per_week: number;
    weather: Weather;
    selected_mode: TransportMode;
  }): Promise<RouteRead> {
    const res = await fetch(`${API_BASE}/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save route.");
    return res.json();
  }
  
  export async function updateRoute(
    id: number,
    patch: {
      name?: string;
      origin?: string;
      destination?: string;
      distance_km?: number;
      trips_per_week?: number;
      weather?: Weather;
      selected_mode?: TransportMode;
    },
  ): Promise<RouteRead> {
    const res = await fetch(`${API_BASE}/routes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to update route.");
    return res.json();
  }
  
  export async function deleteRoute(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/routes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete route.");
  }