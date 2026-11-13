"""Travel metrics and weather-aware commute recommendations."""

from app.schemas import ModeMetrics, SmartRecommendation, TransportMode, Weather

TRANSPORT_MODES: tuple[TransportMode, ...] = (
    "car",
    "public_transport",
    "bike",
    "scooter",
)

# Public transport is recommended in bad weather when it is at most this
# many minutes slower than driving. Beyond that, the car saves enough time
# to be the better practical choice.
BAD_WEATHER_PT_EXTRA_MINUTES = 20.0

# On a sunny day a bike is the default up to this distance: free and emission-free.
SUNNY_BIKE_MAX_KM = 8.0


def calculate_modes(distance_km: float) -> list[ModeMetrics]:
    """Return time, cost, and CO2 for every transport mode.

    Assumptions (city averages):
    - car: 30 km/h, 0.85 PLN/km, 170 g CO2/km
    - public transport: 22 km/h plus 5 min wait; 4.80 PLN up to 10 km, else 6.00 PLN; 45 g/km
    - bike: 16 km/h, free, 0 g CO2
    - scooter: 18 km/h, 3.00 PLN unlock + 0.80 PLN/min, 15 g CO2/km
    """
    car_minutes = _hours_to_minutes(distance_km / 30)
    pt_minutes = _hours_to_minutes(distance_km / 22) + 5
    bike_minutes = _hours_to_minutes(distance_km / 16)
    scooter_minutes = _hours_to_minutes(distance_km / 18)
    ticket_pln = 4.80 if distance_km <= 10 else 6.00

    raw: list[tuple[TransportMode, float, float, float]] = [
        ("car", car_minutes, 0.85 * distance_km, 170 * distance_km),
        ("public_transport", pt_minutes, ticket_pln, 45 * distance_km),
        ("bike", bike_minutes, 0.0, 0.0),
        ("scooter", scooter_minutes, 3.00 + 0.80 * scooter_minutes, 15 * distance_km),
    ]
    return [
        ModeMetrics(
            mode=mode,
            time_minutes=round(minutes, 1),
            cost_pln=round(cost, 2),
            co2_grams=round(co2, 1),
        )
        for mode, minutes, cost, co2 in raw
    ]


def smart_recommendation(
    distance_km: float,
    weather: Weather,
    modes: list[ModeMetrics] | None = None,
) -> SmartRecommendation:
    """Pick a transport mode and explain the choice in plain English.

    Rain and cold rule out bike and scooter. Public transport is preferred
    unless it is substantially slower than the car. On sunny days up to 8 km,
    the bike wins because it is free and emits nothing.
    """
    metrics = modes if modes is not None else calculate_modes(distance_km)
    by_mode = {item.mode: item for item in metrics}

    if weather in ("rainy", "cold"):
        return _recommend_for_bad_weather(distance_km, weather, by_mode)

    if distance_km <= SUNNY_BIKE_MAX_KM:
        bike = by_mode["bike"]
        return SmartRecommendation(
            mode="bike",
            explanation=(
                f"It's sunny and the route is only {_fmt_km(distance_km)} km, "
                f"so the bike is the best choice: about {_fmt_minutes(bike.time_minutes)} minutes, "
                "free, and zero emissions."
            ),
        )

    best = min(metrics, key=lambda item: _sunny_score(item, distance_km))
    return SmartRecommendation(
        mode=best.mode,
        explanation=_explain_sunny_choice(best, distance_km, by_mode),
    )


def _recommend_for_bad_weather(
    distance_km: float,
    weather: Weather,
    by_mode: dict[TransportMode, ModeMetrics],
) -> SmartRecommendation:
    car = by_mode["car"]
    transit = by_mode["public_transport"]
    extra_minutes = transit.time_minutes - car.time_minutes
    conditions = "rainy" if weather == "rainy" else "cold"

    if extra_minutes <= BAD_WEATHER_PT_EXTRA_MINUTES:
        return SmartRecommendation(
            mode="public_transport",
            explanation=(
                f"It's {conditions}, so a bike or scooter would be uncomfortable. "
                f"Public transport takes about {_fmt_minutes(transit.time_minutes)} minutes "
                f"— {_fmt_minutes(extra_minutes)} minutes longer than driving — "
                f"for {transit.cost_pln:.2f} PLN and about {_fmt_grams(transit.co2_grams)} g of CO2, "
                f"far less than the car's {_fmt_grams(car.co2_grams)} g."
            ),
        )

    return SmartRecommendation(
        mode="car",
        explanation=(
            f"It's {conditions}, so cycling or taking a scooter is a poor fit. "
            f"Public transport would add about {_fmt_minutes(extra_minutes)} minutes "
            f"compared with driving ({_fmt_minutes(car.time_minutes)} minutes, {car.cost_pln:.2f} PLN). "
            f"Over {_fmt_km(distance_km)} km that time gap makes the car the better choice, "
            f"even though it emits about {_fmt_grams(car.co2_grams)} g of CO2."
        ),
    )


def _sunny_score(metrics: ModeMetrics, distance_km: float) -> float:
    """Lower is better. Bike trips past 8 km pick up a fatigue penalty."""
    fatigue = 0.0
    if metrics.mode == "bike":
        fatigue = max(0.0, distance_km - SUNNY_BIKE_MAX_KM) * 4
    return (
        metrics.time_minutes
        + fatigue
        + metrics.cost_pln * 2.5
        + (metrics.co2_grams / 100) * 1.2
    )


def _explain_sunny_choice(
    best: ModeMetrics,
    distance_km: float,
    by_mode: dict[TransportMode, ModeMetrics],
) -> str:
    distance = _fmt_km(distance_km)
    minutes = _fmt_minutes(best.time_minutes)

    if best.mode == "bike":
        return (
            f"It's sunny and {distance} km is still a comfortable bike ride: "
            f"about {minutes} minutes, completely free, and zero emissions."
        )
    if best.mode == "public_transport":
        car = by_mode["car"]
        return (
            f"For a sunny {distance} km trip, public transport is the best balance: "
            f"about {minutes} minutes, {best.cost_pln:.2f} PLN, and about {_fmt_grams(best.co2_grams)} g of CO2. "
            f"Cycling this far gets tiring, and driving emits about {_fmt_grams(car.co2_grams)} g."
        )
    if best.mode == "car":
        return (
            f"At {distance} km, driving is the most practical option at about {minutes} minutes "
            f"and {best.cost_pln:.2f} PLN. It emits about {_fmt_grams(best.co2_grams)} g of CO2, "
            "but the time savings outweigh the other modes."
        )
    return (
        f"An e-scooter covers this sunny {distance} km trip in about {minutes} minutes "
        f"for {best.cost_pln:.2f} PLN, with low emissions ({_fmt_grams(best.co2_grams)} g of CO2)."
    )


def _hours_to_minutes(hours: float) -> float:
    return hours * 60


def _fmt_minutes(value: float) -> str:
    return str(int(round(value)))


def _fmt_km(value: float) -> str:
    if float(value).is_integer():
        return str(int(value))
    return f"{value:.1f}"


def _fmt_grams(value: float) -> str:
    return f"{round(value):,}"
