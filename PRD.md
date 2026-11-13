# SmartCommute MVP - Project Specification

## Application Goal
A web tool for planning and comparing daily commutes in terms of travel time, cost, and carbon footprint, featuring an intelligent weather-aware recommendation engine and recurring weekly/monthly impact tracking.

## Backend Features (`/backend`)
1. `Route` model in SQLite:
   - `id` (int, PK)
   - `name` (str, e.g., "Morning Commute")
   - `origin` (str, e.g., "Wrzeszcz")
   - `destination` (str, e.g., "Oliwa Business Centre")
   - `distance_km` (float)
   - `trips_per_week` (int, default e.g. 5, configurable weekly commute frequency)
   - `weather` (str: "sunny", "rainy", "cold")
   - `selected_mode` (str: "car", "public_transport", "bike", "scooter")
   - `created_at` (datetime)
2. Calculation & Smart Recommendation Logic (`services.py`):
   - For a given `distance_km`, calculate travel time (minutes), cost (PLN), and CO2 emissions (grams) for 4 transport modes:
     - `car`: ~30 km/h city average, 0.85 PLN/km, 170g CO2/km
     - `public_transport`: ~22 km/h + 5 min wait time, flat ticket 4.80 PLN (or 6.00 PLN above 10 km), 45g CO2/km
     - `bike`: ~16 km/h, 0.00 PLN, 0g CO2/km
     - `scooter`: ~18 km/h, 3.00 PLN unlock + 0.80 PLN/min, 15g CO2/km
   - `smart_recommendation`: selects the optimal transport mode and generates a clear, natural English explanation considering weather and distance (e.g., discourages bike/scooter during rain or cold weather and recommends public transport or car; recommends bike on sunny days for distances up to 8 km as zero-emission and free).
3. REST API Endpoints:
   - `GET /api/routes`: list all saved routes along with calculated metrics for all 4 transport modes.
   - `POST /api/routes`: create a new saved route (including `trips_per_week`).
   - `PUT /api/routes/{id}`: update an existing route (name, distance, trips per week, weather, or selected mode).
   - `DELETE /api/routes/{id}`: delete a route.
   - `POST /api/analyze`: accepts `distance_km` and `weather`, returns the 4-mode comparison plus `smart_recommendation`.

## Frontend Features (`/frontend`)
1. KPI Header Summary:
   - Displays total saved routes alongside aggregated **weekly** and **monthly** (`~4.33` weeks factor) CO2 saved (in kg compared to driving a car) and money saved (in PLN), weighted by each route's `trips_per_week`.
2. Interactive "Route Analyzer" Calculator:
   - Inputs: Route Name, Origin, Destination, Distance in km (range slider + numeric input), Trips per week frequency selector, and Weather selector (3 icon buttons: Sunny, Rainy, Cold).
   - Live comparison displaying 4 cards (Car, Public Transport, Bike, E-Scooter) with per-trip and weekly/monthly projections, visually highlighting the Smart Recommended card with its English explanation.
   - "Save Route" button to persist the route with the chosen transport mode and weekly frequency to the database.
3. Saved Routes List (CRUD):
   - Displays saved routes in clean cards/rows with their weekly trip frequency and aggregated impact.
   - Allows quick inline toggling of weather, selected transport mode, or weekly trip frequency (triggers `PUT /api/routes/{id}` and recalculates KPIs live) and deleting a route (`DELETE /api/routes/{id}`).