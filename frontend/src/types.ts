export type Weather = "sunny" | "rainy" | "cold";

export type TransportMode = "car" | "public_transport" | "bike" | "scooter";

export interface ModeMetrics {
  mode: TransportMode;
  time_minutes: number;
  cost_pln: number;
  co2_grams: number;
}

export interface SmartRecommendation {
  mode: TransportMode;
  explanation: string;
}

export interface SavedRoute {
  id: number;
  name: string;
  origin: string;
  destination: string;
  distance_km: number;
  weather: Weather;
  selected_mode: TransportMode;
  created_at: string;
  modes: ModeMetrics[];
  smart_recommendation: SmartRecommendation;
}

export interface RouteInput {
  name: string;
  origin: string;
  destination: string;
  distance_km: number;
  weather: Weather;
  selected_mode: TransportMode;
}

export interface RoutePatch {
  name?: string;
  origin?: string;
  destination?: string;
  distance_km?: number;
  weather?: Weather;
  selected_mode?: TransportMode;
}

export interface AnalyzeResult {
  distance_km: number;
  weather: Weather;
  modes: ModeMetrics[];
  smart_recommendation: SmartRecommendation;
}
