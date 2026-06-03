from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Neighborhood Truth Score API",
    description="A public safety and livability dashboard API",
    version="1.0.0"
)

# Allow React frontend to talk to this backend
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