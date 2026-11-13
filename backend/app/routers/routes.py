"""CRUD endpoints for saved commute routes."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Route
from app.schemas import RouteCreate, RouteRead, RouteUpdate
from app.services import calculate_modes, smart_recommendation

router = APIRouter(prefix="/routes", tags=["routes"])


def to_route_read(route: Route) -> RouteRead:
    """Attach calculated mode metrics and the smart recommendation."""
    modes = calculate_modes(route.distance_km)
    recommendation = smart_recommendation(route.distance_km, route.weather, modes)
    return RouteRead(
        id=route.id,
        name=route.name,
        origin=route.origin,
        destination=route.destination,
        distance_km=route.distance_km,
        trips_per_week=route.trips_per_week,
        weather=route.weather,
        selected_mode=route.selected_mode,
        created_at=route.created_at,
        modes=modes,
        smart_recommendation=recommendation,
    )


def get_route_or_404(db: Session, route_id: int) -> Route:
    route = db.get(Route, route_id)
    if route is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    return route


@router.get("", response_model=list[RouteRead])
def list_routes(db: Session = Depends(get_db)) -> list[RouteRead]:
    """List saved routes, newest first, with metrics for all four modes."""
    routes = db.scalars(select(Route).order_by(Route.created_at.desc(), Route.id.desc())).all()
    return [to_route_read(route) for route in routes]


@router.post("", response_model=RouteRead, status_code=status.HTTP_201_CREATED)
def create_route(payload: RouteCreate, db: Session = Depends(get_db)) -> RouteRead:
    """Persist a new route and return it with calculated metrics."""
    route = Route(**payload.model_dump())
    db.add(route)
    db.commit()
    db.refresh(route)
    return to_route_read(route)


@router.put("/{route_id}", response_model=RouteRead)
def update_route(
    route_id: int,
    payload: RouteUpdate,
    db: Session = Depends(get_db),
) -> RouteRead:
    """Update name, places, distance, weather, or the selected mode."""
    route = get_route_or_404(db, route_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        if value is not None:
            setattr(route, field, value)
    db.commit()
    db.refresh(route)
    return to_route_read(route)


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route(route_id: int, db: Session = Depends(get_db)) -> Response:
    """Delete a saved route."""
    route = get_route_or_404(db, route_id)
    db.delete(route)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
