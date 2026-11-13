import {
  Bike,
  Bus,
  Car,
  CloudRain,
  Scooter,
  Snowflake,
  Sun,
  type LucideIcon,
} from "lucide-react";

import type { TransportMode, Weather } from "../types";

export const TRANSPORT_MODES: TransportMode[] = [
  "car",
  "public_transport",
  "bike",
  "scooter",
];

export const WEATHER_OPTIONS: Weather[] = ["sunny", "rainy", "cold"];

export const MODE_DETAILS: Record<
  TransportMode,
  { label: string; shortLabel: string; icon: LucideIcon }
> = {
  car: { label: "Car", shortLabel: "Car", icon: Car },
  public_transport: {
    label: "Public Transport",
    shortLabel: "Transit",
    icon: Bus,
  },
  bike: { label: "Bike", shortLabel: "Bike", icon: Bike },
  scooter: { label: "E-Scooter", shortLabel: "Scooter", icon: Scooter },
};

export const WEATHER_DETAILS: Record<
  Weather,
  { label: string; icon: LucideIcon }
> = {
  sunny: { label: "Sunny", icon: Sun },
  rainy: { label: "Rainy", icon: CloudRain },
  cold: { label: "Cold", icon: Snowflake },
};
