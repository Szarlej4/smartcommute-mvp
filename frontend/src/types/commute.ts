import React from "react";
import { Car, Bus, Bike, Zap, Sun, CloudRain, Snowflake } from "lucide-react";

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

export interface RouteRead {
    id: number;
    name: string;
    origin: string;
    destination: string;
    distance_km: number;
    trips_per_week: number;
    weather: Weather;
    selected_mode: TransportMode;
    created_at: string;
    modes: ModeMetrics[];
    smart_recommendation: SmartRecommendation;
  }

export interface RouteCreatePayload {
  name: string;
  origin: string;
  destination: string;
  distance_km: number;
  weather: Weather;
  selected_mode: TransportMode;
}

export interface AnalyzeResponse {
  distance_km: number;
  weather: Weather;
  modes: ModeMetrics[];
  smart_recommendation: SmartRecommendation;
}

export const MODE_META: Record<
  TransportMode,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  car: { label: "Car", icon: Car },
  public_transport: { label: "Public Transit", icon: Bus },
  bike: { label: "Bike", icon: Bike },
  scooter: { label: "E-Scooter", icon: Zap },
};

export const WEATHER_META: Record<
  Weather,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  sunny: { label: "Sunny", icon: Sun },
  rainy: { label: "Rainy", icon: CloudRain },
  cold: { label: "Cold", icon: Snowflake },
};
