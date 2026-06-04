# Neighborhood Truth Score

A full-stack public safety and livability dashboard.

## Tech Stack
Frontend: React 19, Vite, Tailwind CSS, Leaflet.js, Recharts
Backend: Python FastAPI

## Data Sources
- Crime: FBI UCR 2024
- Schools/Parks/Traffic: OpenStreetMap Overpass API (Live)
- Livability: US Census ACS 2022 (Live)

## Setup

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Author
Mohammad - CS Student
GitHub: @mohas1025
