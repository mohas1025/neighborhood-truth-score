# 🏘️ Neighborhood Truth Score

A full-stack public safety and livability dashboard that scores any US neighborhood using real government and open data.

🌐 **Live Demo:** [neighborhood-truth-score.vercel.app](https://neighborhood-truth-score.vercel.app)

![React](https://img.shields.io/badge/React-19-blue?logo=react) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-green?logo=fastapi) ![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 🌐 Features

- 🔍 Search any US address, city, or ZIP code
- 📊 5-category scoring: Crime, Schools, Parks, Traffic, Livability
- 🗺️ Interactive Leaflet.js map with real pin placement
- 📡 Radar chart score breakdown
- ⚖️ Side-by-side neighborhood comparison with winner banner
- 🏆 Score badges: Good / Moderate / Concerning

---

## 📡 Data Sources

| Category | Source | Type |
|---|---|---|
| 🔴 Crime | FBI Uniform Crime Report 2024 | Pre-loaded for 80+ US cities |
| 🏫 Schools | GreatSchools + NCES quality ratings | Pre-loaded for 80+ US cities |
| 🌳 Parks | OpenStreetMap Overpass API | ✅ Live API — real count within 5km |
| 🚗 Traffic | OpenStreetMap Overpass API | ✅ Live API — major roads within 3km |
| 💰 Livability | US Census Bureau ACS 2022 | ✅ Live API — median income + home value per census tract |

---

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Leaflet.js, Recharts, React Router DOM

**Backend:** Python FastAPI, OpenStreetMap Nominatim, Overpass API, US Census ACS API

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- FBI API key — free at [api.data.gov](https://api.data.gov/signup/)

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
FBI_API_KEY=your_key_here
```

```bash
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 🌍 Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys on every push to main |
| Backend | Railway | Auto-deploys on every push to main |

---

## 🔢 Scoring Algorithm

| Category | Weight | Source |
|---|---|---|
| Crime | 35% | FBI UCR 2024 — violent + property rates per 100k |
| Schools | 20% | GreatSchools + NCES quality ratings |
| Livability | 20% | US Census median income + home value |
| Traffic | 15% | OpenStreetMap — major road count within 3km |
| Parks | 10% | OpenStreetMap — park count within 5km |

🟢 Good (75+) · 🟡 Moderate (55–74) · 🔴 Concerning (below 55)

---

## 👨‍💻 Author

**Mohammad** — CS Student

GitHub: [@mohas1025](https://github.com/mohas1025)

---

## 📄 License

MIT
