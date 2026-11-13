# SmartCommute MVP

A full-stack web application designed to help commuters plan and compare daily routes in terms of travel time, cost (PLN), and carbon footprint (CO2). The app features a weather-aware smart recommendation engine and dynamically aggregates weekly and monthly savings based on customizable commute frequencies.

## ✨ Key Features
- **Interactive Route Analyzer:** Live calculation of travel time, cost, and CO2 emissions across 4 transport modes (`car`, `public_transport`, `bike`, `scooter`) using distance sliders and weather conditions (`sunny`, `rainy`, `cold`).
- **Weather-Aware Recommendation Engine:** Evaluates conditions and distance to recommend the optimal transport mode (e.g., suggesting biking on sunny short trips, or public transit during rain/cold) with natural-language explanations.
- **Frequency-Based Aggregations:** Supports customizable weekly trip frequencies (`trips_per_week`) to compute real-time weekly and monthly (~4.33 weeks factor) financial and CO2 savings compared to driving a car.
- **Full CRUD & Live KPI Updates:** Save routes to the database, toggle transport modes, weather, or weekly frequencies inline, and watch global KPI cards recalculate immediately.

---

## 🛠 Tech Stack & Architecture
- **Backend:** Python 3.12, FastAPI, SQLAlchemy, Pydantic, SQLite
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons

### Notable Implementation Details
- **Zero-Config Database Seeding:** Uses SQLite with automatic startup initialization and realistic sample routes so reviewers can run the entire stack locally without Docker or external database setup.
- **Calendar-Accurate Monthly Projections:** Instead of multiplying weekly stats by a flat `4`, monthly cost and CO2 savings use a `4.33` weeks factor to better reflect real-world monthly schedules.
- **End-to-End Type Safety:** Strict Pydantic schemas on the backend paired with mirrored TypeScript interfaces on the frontend.

---

## 🚀 Local Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup (FastAPI)
Open a terminal in the project root directory and run:
```bash
cd backend
python -m venv .venv

# Activate virtual environment (Windows PowerShell):
.\.venv\Scripts\Activate.ps1
# (macOS/Linux): source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
* The API will be available at `http://127.0.0.1:8000`
* Interactive Swagger UI documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup (React + Vite)
Open a second terminal in the project root directory and run:
```bash
cd frontend
npm install
npm run dev
```
* The application will be available at `http://localhost:5173`

---

## 📡 API Overview
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze` | Calculate metrics for all 4 modes and get a smart recommendation for a given distance & weather |
| `GET` | `/api/routes` | Retrieve all saved commute routes with calculated mode metrics |
| `POST` | `/api/routes` | Create and persist a new commute route (including `trips_per_week`) |
| `PUT` | `/api/routes/{id}` | Update route parameters (name, distance, weather, mode, or weekly frequency) |
| `DELETE` | `/api/routes/{id}` | Delete a saved route |

---

## 🤖 How AI Tools Were Used
This project was built using an AI-first workflow (Cursor + LLM pair programming). I used AI to generate the full-stack codebase (FastAPI backend and React/TypeScript frontend), while my role focused on defining the product logic, reviewing the output, catching calculation gaps (such as adding customizable `trips_per_week` and the `4.33` monthly weighting factor), testing endpoints via Swagger UI, and managing the project environment and repository setup.

## 🎥 Demo
You can watch the application walkthrough directly below (`demo.mp4` is included in the root of this repository) or via YouTube:

https://github.com/Szarlej4/smartcommute-mvp/raw/main/demo.mp4

https://github.com/user-attachments/assets/022f9c08-f30a-4b47-8dda-3a72c7e5c686

* **YouTube:** [Watch SmartCommute MVP Demo](https://www.youtube.com/watch?v=zKoftxYs0SE)
