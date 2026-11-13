"""One-off commute comparison, without saving a route."""

from fastapi import APIRouter

from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services import calculate_modes, smart_recommendation

router = APIRouter(tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_commute(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Compare all four modes and return a weather-aware recommendation."""
    modes = calculate_modes(payload.distance_km)
    recommendation = smart_recommendation(payload.distance_km, payload.weather, modes)
    return AnalyzeResponse(
        distance_km=payload.distance_km,
        weather=payload.weather,
        modes=modes,
        smart_recommendation=recommendation,
    )
