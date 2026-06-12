from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import os
import time

load_dotenv()
CENSUS_API_KEY = os.getenv("CENSUS_API_KEY")

app = FastAPI(title="Neighborhood Truth Score API", version="3.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── CACHE ─────────────────────────────────────────────────
SEARCH_CACHE = {}
CACHE_TTL_SECONDS = 24 * 60 * 60  # 24 hours

STATE_MAP = {
    "California": "CA", "Texas": "TX", "New York": "NY",
    "Florida": "FL", "Illinois": "IL", "Arizona": "AZ",
    "Nevada": "NV", "Oregon": "OR", "Washington": "WA",
    "Colorado": "CO", "Georgia": "GA", "Michigan": "MI",
    "Ohio": "OH", "Pennsylvania": "PA", "Virginia": "VA",
    "North Carolina": "NC", "Massachusetts": "MA", "Indiana": "IN",
    "Tennessee": "TN", "Missouri": "MO", "Maryland": "MD",
    "Wisconsin": "WI", "Minnesota": "MN", "Louisiana": "LA",
    "Alabama": "AL", "South Carolina": "SC", "Kentucky": "KY",
    "Oklahoma": "OK", "Connecticut": "CT", "Utah": "UT",
    "Iowa": "IA", "Arkansas": "AR", "Mississippi": "MS",
    "Kansas": "KS", "New Mexico": "NM", "Nebraska": "NE",
    "Idaho": "ID", "Hawaii": "HI", "New Hampshire": "NH",
    "Maine": "ME", "Montana": "MT", "Rhode Island": "RI",
    "Delaware": "DE", "South Dakota": "SD", "North Dakota": "ND",
    "Alaska": "AK", "Vermont": "VT", "Wyoming": "WY",
    "West Virginia": "WV", "New Jersey": "NJ", "District of Columbia": "DC"
}

# ── REAL FBI UCR 2024 CRIME RATES ─────────────────────────
# Source: FBI Uniform Crime Reporting 2024 (via Wikipedia/CDE)
# Format: violent_per_100k, property_per_100k
# National avg: ~380 violent, ~2000 property per 100k
FBI_CITY_CRIME_2024 = {
    # California
    "irvine":           (74,   871),
    "laguna niguel":    (100,  990),
    "mission viejo":    (90,   950),
    "santa ana":        (380, 2100),
    "laguna beach":     (310, 1480),
    "anaheim":          (310, 2100),
    "los angeles":      (627, 2200),
    "san francisco":    (640, 5900),
    "oakland":          (1190, 4800),
    "san diego":        (370, 2100),
    "san jose":         (280, 2200),
    "sacramento":       (570, 3200),
    "fresno":           (590, 3300),
    "long beach":       (490, 2400),
    "bakersfield":      (490, 2800),
    "stockton":         (760, 3900),
    "riverside":        (310, 2100),
    "huntington beach": (180, 1700),
    "santa barbara":    (270, 2000),
    "pasadena":         (290, 2100),
    "torrance":         (180, 1600),
    "fullerton":        (455, 2493),
    "garden grove":     (370, 2300),
    "corona":           (190, 1500),
    "chula vista":      (260, 1900),
    "fremont":          (220, 2000),
    "glendale":         (250, 1800),
    "fontana":          (380, 2500),
    "moreno valley":    (430, 2700),
    "san bernardino":   (950, 4200),
    "oxnard":           (480, 2600),
    "modesto":          (620, 3800),
    "antioch":          (607, 3815),
    "berkeley":         (639, 5909),
    # Texas
    "plano":            (150, 1400),
    "frisco":           (130, 1200),
    "allen":            (120, 1100),
    "mckinney":         (180, 1600),
    "austin":           (430, 3200),
    "dallas":           (770, 3800),
    "houston":          (820, 4100),
    "san antonio":      (590, 3500),
    "fort worth":       (560, 3400),
    "el paso":          (380, 2200),
    "arlington":        (430, 3100),
    # New York
    "new york":         (580, 1500),
    "buffalo":          (1100, 4200),
    "yonkers":          (280, 1800),
    # Florida
    "miami":            (700, 3800),
    "orlando":          (760, 4200),
    "tampa":            (620, 3600),
    "jacksonville":     (680, 3900),
    "st. petersburg":   (580, 3100),
    "pembroke pines":   (220, 1900),
    "cape coral":       (190, 1600),
    "boca raton":       (190, 1500),
    "coral springs":    (170, 1600),
    "weston":           (80,  900),
    # Illinois
    "chicago":          (990, 3600),
    "naperville":       (130, 1300),
    "aurora":           (480, 2900),
    # Arizona
    "scottsdale":       (200, 2200),
    "chandler":         (230, 2100),
    "gilbert":          (130, 1300),
    "tempe":            (470, 3371),
    "phoenix":          (680, 3700),
    "tucson":           (670, 4200),
    "mesa":             (380, 2900),
    "surprise":         (109,  992),
    # Washington
    "seattle":          (830, 5100),
    "bellevue":         (200, 2400),
    "spokane":          (680, 4200),
    "tacoma":           (790, 4600),
    # Colorado
    "denver":           (680, 4200),
    "colorado springs": (450, 3300),
    "fort collins":     (280, 2600),
    "boulder":          (290, 3100),
    # North Carolina
    "charlotte":        (570, 3200),
    "raleigh":          (340, 2800),
    "cary":             (120, 1400),
    # Virginia
    "virginia beach":   (240, 1900),
    "arlington":        (180, 1500),
    # Ohio
    "columbus":         (590, 3800),
    "cleveland":        (1300, 5200),
    "cincinnati":       (830, 4100),
    # Michigan
    "detroit":          (2000, 5800),
    "ann arbor":        (250, 2600),
    # New Jersey
    "newark":           (1100, 3200),
    "princeton":        (70,   800),
    # Georgia
    "atlanta":          (1200, 5100),
    "johns creek":      (100, 1100),
    "alpharetta":       (130, 1400),
}


def crime_rates_to_score(violent_per_100k: float, property_per_100k: float) -> int:
    """
    Convert real FBI crime rates to 0-100 safety score.
    National averages 2024: ~380 violent, ~2000 property per 100k.
    """
    violent_score = max(10, min(100, 100 - (violent_per_100k / 14)))
    property_score = max(10, min(100, 100 - (property_per_100k / 83)))
    return int(violent_score * 0.65 + property_score * 0.35)


# State-level fallback crime scores
STATE_CRIME_FALLBACK = {
    "CA": 62, "TX": 60, "NY": 58, "FL": 58, "IL": 56,
    "WA": 58, "CO": 60, "GA": 55, "NC": 62, "VA": 65,
    "MA": 65, "OH": 58, "MI": 52, "NJ": 62, "PA": 60,
    "AZ": 60, "NV": 58, "OR": 57, "default": 60
}


def get_crime_score(city: str, state_abbr: str) -> dict:
    city_lower = city.lower().strip()
    if city_lower in FBI_CITY_CRIME_2024:
        v, p = FBI_CITY_CRIME_2024[city_lower]
        score = crime_rates_to_score(v, p)
        return {"score": score, "source": "FBI_UCR_2024", "violent_per_100k": v, "property_per_100k": p}
    for key in FBI_CITY_CRIME_2024:
        if key in city_lower or city_lower in key:
            v, p = FBI_CITY_CRIME_2024[key]
            score = crime_rates_to_score(v, p)
            return {"score": score, "source": f"FBI_UCR_2024 (matched: {key})", "violent_per_100k": v, "property_per_100k": p}
    fallback_score = STATE_CRIME_FALLBACK.get(
        state_abbr, STATE_CRIME_FALLBACK["default"])
    return {"score": fallback_score, "source": f"state_avg_{state_abbr}", "violent_per_100k": None, "property_per_100k": None}


# ── OVERPASS OSM ─────────────────────────────────────────
OVERPASS_HEADERS = {
    "User-Agent": "NeighborhoodTruthScore/3.4 (educational project; contact: student@university.edu)",
    "Content-Type": "application/x-www-form-urlencoded"
}


def get_osm_features(lat: float, lon: float) -> dict:
    """One combined Overpass query for schools, parks, and traffic counts —
    cuts 3 separate HTTP round trips down to 1."""
    q = f"""[out:json][timeout:20];
(
  node["amenity"="school"](around:4000,{lat},{lon});
  node["amenity"="college"](around:4000,{lat},{lon});
  node["amenity"="university"](around:4000,{lat},{lon});
  way["amenity"="school"](around:4000,{lat},{lon});
  way["amenity"="college"](around:4000,{lat},{lon});
);
out count;
(
  node["leisure"="park"](around:4000,{lat},{lon});
  node["leisure"="playground"](around:4000,{lat},{lon});
  way["leisure"="park"](around:4000,{lat},{lon});
  way["landuse"="recreation_ground"](around:4000,{lat},{lon});
  way["leisure"="nature_reserve"](around:4000,{lat},{lon});
);
out count;
(
  way["highway"~"motorway|trunk|primary"](around:2500,{lat},{lon});
);
out count;"""

    for url in ["https://lz4.overpass-api.de/api/interpreter", "https://overpass-api.de/api/interpreter"]:
        try:
            r = requests.post(url, data={"data": q},
                              headers=OVERPASS_HEADERS, timeout=20)
            if r.status_code == 200:
                counts = [
                    int(el.get("tags", {}).get("total", 0))
                    for el in r.json().get("elements", [])
                    if el.get("type") == "count"
                ]
                if len(counts) == 3:
                    schools_count, parks_count, traffic_count = counts
                    return {
                        "schools": {
                            "score": int(min(95, max(20, 30 + schools_count * 5))),
                            "source": "OpenStreetMap_real", "count": schools_count
                        },
                        "parks": {
                            "score": int(min(95, max(20, 25 + parks_count * 4))),
                            "source": "OpenStreetMap_real", "count": parks_count
                        },
                        "traffic": {
                            "score": int(max(25, min(92, 90 - traffic_count * 5))),
                            "source": "OpenStreetMap_real", "count": traffic_count
                        },
                    }
        except Exception as e:
            print(f"Overpass error: {e}")

    return {
        "schools": {"score": 65, "source": "osm_error", "count": "unknown"},
        "parks": {"score": 65, "source": "osm_error", "count": "unknown"},
        "traffic": {"score": 60, "source": "osm_error", "count": "unknown"},
    }


# ── CENSUS ACS: LIVABILITY ────────────────────────────────
def get_census_livability(lat: float, lon: float) -> dict:
    try:
        r = requests.get(
            "https://geocoding.geo.census.gov/geocoder/geographies/coordinates",
            params={"x": lon, "y": lat, "benchmark": "Public_AR_Current",
                    "vintage": "Current_Current", "format": "json", "layers": "Census Tracts"},
            timeout=10
        )
        tracts = r.json().get("result", {}).get(
            "geographies", {}).get("Census Tracts", [])
        if not tracts:
            return {"score": None, "source": "census_no_tract"}

        t = tracts[0]
        r2 = requests.get(
            "https://api.census.gov/data/2022/acs/acs5",
            params={
                "get": "B19013_001E,B25077_001E",
                "for": f"tract:{t['TRACT']}",
                "in": f"state:{t['STATE']} county:{t['COUNTY']}",
                "key": CENSUS_API_KEY,
            },
            timeout=10
        )
        rows = r2.json()
        if len(rows) < 2:
            return {"score": None, "source": "census_no_data"}

        row = dict(zip(rows[0], rows[1]))
        income = int(row.get("B19013_001E") or 0)
        home_val = int(row.get("B25077_001E") or 0)

        if income <= 0 and home_val <= 0:
            return {"score": None, "source": "census_zero"}

        income_score = min(
            95, max(20, int((income / 150000) * 90))) if income > 0 else 60
        home_score = min(
            95, max(20, int((home_val / 800000) * 90))) if home_val > 0 else 60
        score = int(income_score * 0.6 + home_score * 0.4)

        return {
            "score": score,
            "source": "US_Census_ACS_2022",
            "median_income": income,
            "median_home_value": home_val
        }
    except Exception as e:
        print(f"Census error: {e}")
        return {"score": None, "source": "census_error"}


# ── GEOCODE ───────────────────────────────────────────────
def geocode_location(q: str):
    r = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": q, "format": "json", "limit": 1, "countrycodes": "us"},
        headers={"User-Agent": "NeighborhoodTruthScore/3.4"},
        timeout=10
    )
    data = r.json()
    if not data:
        raise HTTPException(status_code=404, detail="Location not found")
    return data[0]


# ── ENDPOINTS ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Neighborhood Truth Score API v3.4"}


@app.get("/health")
def health():
    return {"status": "healthy", "version": "3.4.0",
            "sources": ["FBI UCR 2024", "OpenStreetMap Overpass", "US Census ACS 2022"]}


@app.get("/api/search")
def search_neighborhood(q: str = Query(...)):
    # Always geocode first — fast (~1-2s), and normalizes different
    # phrasings/capitalizations of the same place to the same coordinates.
    location = geocode_location(q)
    display_name = location["display_name"]
    lat = float(location["lat"])
    lon = float(location["lon"])

    # Cache by rounded location (not raw query string) so "Irvine",
    # "irvine, ca", "Irvine, California" etc. all hit the same entry.
    cache_key = f"{round(lat, 3)},{round(lon, 3)}"
    now = time.time()

    if cache_key in SEARCH_CACHE:
        cached_result, cached_time = SEARCH_CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            print(f">>> Cache hit for '{q}' (location {cache_key})")
            result = dict(cached_result)
            result["query"] = q
            return result

    parts = display_name.split(",")
    city = parts[0].strip()
    state_abbr = "CA"
    for part in parts:
        if part.strip() in STATE_MAP:
            state_abbr = STATE_MAP[part.strip()]
            break

    print(f"\n>>> {city}, {state_abbr} | lat={lat}, lon={lon}")

    crime = get_crime_score(city, state_abbr)
    osm = get_osm_features(lat, lon)
    schools, parks, traffic = osm["schools"], osm["parks"], osm["traffic"]
    census = get_census_livability(lat, lon)

    crime_score = crime["score"]
    schools_score = schools["score"]
    parks_score = parks["score"]
    traffic_score = traffic["score"]
    livability_score = census["score"] or 62

    print(f"  Crime:      {crime_score} | {crime['source']}")
    print(
        f"  Schools:    {schools_score} | {schools['source']} | count={schools.get('count')}")
    print(
        f"  Parks:      {parks_score} | {parks['source']} | count={parks.get('count')}")
    print(
        f"  Traffic:    {traffic_score} | {traffic['source']} | count={traffic.get('count')}")
    print(f"  Livability: {livability_score} | {census['source']}")

    total = int(
        crime_score * 0.35 +
        schools_score * 0.20 +
        livability_score * 0.20 +
        traffic_score * 0.15 +
        parks_score * 0.10
    )
    total = max(10, min(98, total))
    print(f"  TOTAL: {total}")

    def summary(city, total):
        if total >= 85:
            return f"{city} is an excellent area — very low crime, great schools, high livability."
        if total >= 75:
            return f"{city} is a safe, above-average area with good schools and low crime."
        if total >= 60:
            return f"{city} has moderate safety and livability. Some strengths, some areas to consider."
        if total >= 45:
            return f"{city} scores below average. Crime is higher than typical suburban areas."
        return f"{city} has significant safety concerns with above-average crime rates."

    sources = {
        "crime":      crime["source"],
        "schools":    f"{schools['source']} — {schools.get('count')} within 5km",
        "parks":      f"{parks['source']} — {parks.get('count')} within 5km",
        "traffic":    f"{traffic['source']} — {traffic.get('count')} major roads within 3km",
        "livability": census["source"],
    }
    if crime.get("violent_per_100k"):
        sources[
            "crime_detail"] = f"Violent: {crime['violent_per_100k']}/100k | Property: {crime['property_per_100k']}/100k (FBI UCR 2024)"
    if census.get("median_income"):
        sources[
            "livability_detail"] = f"Median income: ${census['median_income']:,} | Median home: ${census.get('median_home_value', 0):,}"

    result = {
        "query": q,
        "display_name": display_name,
        "lat": lat, "lon": lon,
        "score": total,
        "summary": summary(city, total),
        "categories": {
            "crime":      crime_score,
            "schools":    schools_score,
            "parks":      parks_score,
            "traffic":    traffic_score,
            "livability": livability_score,
        },
        "sources": sources
    }

    SEARCH_CACHE[cache_key] = (result, now)
    return result


# ── PRE-WARM CACHE ON STARTUP ─────────────────────────────
PREWARM_CITIES = [
    "Laguna Beach, CA",
    "Aliso Viejo, CA",
    "Irvine, CA",
    "Newport Beach, CA",
    "Costa Mesa, CA",
    "Mission Viejo, CA",
    "Laguna Niguel, CA",
]


@app.on_event("startup")
def prewarm_cache():
    import threading

    def warm():
        for city in PREWARM_CITIES:
            try:
                print(f">>> Pre-warming cache for '{city}'")
                search_neighborhood(q=city)
            except Exception as e:
                print(f"Pre-warm error for '{city}': {e}")

    threading.Thread(target=warm, daemon=True).start()
