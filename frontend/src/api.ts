import type {
  AnalyzeResult,
  RouteInput,
  RoutePatch,
  SavedRoute,
  Weather,
} from "./types";

const API_BASE = "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function listRoutes(): Promise<SavedRoute[]> {
  return request<SavedRoute[]>("/routes");
}

export function createRoute(input: RouteInput): Promise<SavedRoute> {
  return request<SavedRoute>("/routes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateRoute(
  id: number,
  patch: RoutePatch,
): Promise<SavedRoute> {
  return request<SavedRoute>(`/routes/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export function deleteRoute(id: number): Promise<void> {
  return request<void>(`/routes/${id}`, { method: "DELETE" });
}

export function analyzeCommute(
  input: { distance_km: number; weather: Weather },
  signal?: AbortSignal,
): Promise<AnalyzeResult> {
  return request<AnalyzeResult>("/analyze", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: init?.body
        ? { "Content-Type": "application/json", ...init.headers }
        : init?.headers,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError(
      "Can't reach SmartCommute. Check that the backend is running on port 8000.",
    );
  }

  if (!response.ok) {
    throw new ApiError(await readError(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === "string" && body.detail.trim()) {
      return body.detail;
    }
    if (Array.isArray(body.detail) && body.detail.length > 0) {
      return "Some route details are invalid. Check the name, places, and distance.";
    }
  } catch {
    // The response body was not JSON.
  }
  if (response.status === 404) return "Route not found";
  return "Something went wrong. Please try again.";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
