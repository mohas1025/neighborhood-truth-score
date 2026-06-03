from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/api/search")
def search_neighborhood(q: str = Query(..., description="Address, city, or ZIP code")):
    return {
        "query": q,
        "location": q,
        "score": 72,
        "summary": "This is a sample result. Real data coming soon.",
        "categories": {
            "crime": 65,
            "traffic": 80,
            "schools": 75,
            "parks": 70
        }
    }