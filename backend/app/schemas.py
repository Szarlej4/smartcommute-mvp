"""Pydantic request and response schemas."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Weather = Literal["sunny", "rainy", "cold"]
TransportMode = Literal["car", "public_transport", "bike", "scooter"]


def _strip_required(value: str) -> str:
    stripped = value.strip()
    if not stripped:
        raise ValueError("must not be blank")
    return stripped


def _strip_optional(value: str | None) -> str | None:
    if value is None:
        return None
    return _strip_required(value)


class ModeMetrics(BaseModel):
    """Travel time, cost, and emissions for one transport mode."""

    mode: TransportMode
    time_minutes: float
    cost_pln: float
    co2_grams: float


class SmartRecommendation(BaseModel):
    """Weather-aware mode choice and a short English explanation."""

    mode: TransportMode
    explanation: str


class RouteCreate(BaseModel):
    """Payload for saving a new route."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    origin: str = Field(min_length=1, max_length=120)
    destination: str = Field(min_length=1, max_length=120)
    distance_km: float = Field(gt=0, le=500)
    trips_per_week: int = Field(default=10, ge=1, le=50)
    weather: Weather
    selected_mode: TransportMode

    @field_validator("name", "origin", "destination")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return _strip_required(value)


class RouteUpdate(BaseModel):
    """Partial update. Only fields sent by the client are changed."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=120)
    origin: str | None = Field(default=None, min_length=1, max_length=120)
    destination: str | None = Field(default=None, min_length=1, max_length=120)
    distance_km: float | None = Field(default=None, gt=0, le=500)
    trips_per_week: int | None = Field(default=None, ge=1, le=50)
    weather: Weather | None = None
    selected_mode: TransportMode | None = None

    @field_validator("name", "origin", "destination")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return _strip_optional(value)


class RouteRead(BaseModel):
    """A saved route plus live metrics for every transport mode."""

    id: int
    name: str
    origin: str
    destination: str
    distance_km: float
    trips_per_week: int
    weather: Weather
    selected_mode: TransportMode
    created_at: datetime
    modes: list[ModeMetrics]
    smart_recommendation: SmartRecommendation


class AnalyzeRequest(BaseModel):
    """Distance and weather for a one-off comparison."""

    model_config = ConfigDict(extra="forbid")

    distance_km: float = Field(gt=0, le=500)
    weather: Weather


class AnalyzeResponse(BaseModel):
    """Four-mode comparison and the recommended choice."""

    distance_km: float
    weather: Weather
    modes: list[ModeMetrics]
    smart_recommendation: SmartRecommendation