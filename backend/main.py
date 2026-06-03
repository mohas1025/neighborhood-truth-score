from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(
    title="Neighborhood Truth Score API",
    description="A public safety and livability dashboard API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Neighborhood Truth Score API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/geocode")
def geocode(q: str = Query(..., description="Address, city, or ZIP code")):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": q,
        "format": "json",
        "limit": 1,
        "countrycodes": "us"
    }
    headers = {"User-Agent": "NeighborhoodTruthScore/1.0"}
    response = requests.get(url, params=params, headers=headers)
    data = response.json()
    if not data:
        raise HTTPException(status_code=404, detail="Location not found")
    result = data[0]
    return {
        "display_name": result["display_name"],
        "lat": float(result["lat"]),
        "lon": float(result["lon"]),
        "query": q
    }

@app.get("/api/search")
def search_neighborhood(q: str = Query(..., description="Address, city, or ZIP code")):
    # Step 1: Geocode the location
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": q, "format": "json", "limit": 1, "countrycodes": "us"}
    headers = {"User-Agent": "NeighborhoodTruthScore/1.0"}
    response = requests.get(url, params=params, headers=headers)
    data = response.json()
    if not data:
        raise HTTPException(status_code=404, detail="Location not found")
    location = data[0]
    return {
        "query": q,
        "display_name": location["display_name"],
        "lat": float(location["lat"]),
        "lon": float(location["lon"]),
        "score": 72,
        "summary": "Sample data — real crime data coming next.",
        "categories": {
            "crime": 65,
            "traffic": 80,
            "schools": 75,
            "parks": 70
        }
    }