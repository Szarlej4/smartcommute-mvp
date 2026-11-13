"""Sample Gdańsk routes inserted when the database has no rows."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Route

SAMPLE_ROUTES: tuple[dict[str, object], ...] = (
    {
        "name": "Morning Commute",
        "origin": "Wrzeszcz",
        "destination": "Oliwa Business Centre",
        "distance_km": 4.2,
        "trips_per_week": 10,
        "weather": "sunny",
        "selected_mode": "bike",
    },
    {
        "name": "Sopot to the Station",
        "origin": "Sopot",
        "destination": "Gdańsk Główny",
        "distance_km": 12.0,
        "trips_per_week": 4,
        "weather": "rainy",
        "selected_mode": "public_transport",
    },
    {
        "name": "Coastal Commute",
        "origin": "Gdynia Orłowo",
        "destination": "Wrzeszcz",
        "distance_km": 18.5,
        "trips_per_week": 2,
        "weather": "cold",
        "selected_mode": "public_transport",
    },
)


def seed_if_empty(db: Session) -> None:
    """Insert the three sample routes when the routes table is empty."""
    has_routes = db.scalar(select(Route.id).limit(1))
    if has_routes is not None:
        return

    for payload in SAMPLE_ROUTES:
        db.add(Route(**payload))
    db.commit()