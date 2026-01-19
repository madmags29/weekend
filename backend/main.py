from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Configure Gemini with API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


app = FastAPI(title="Weekend Travellers AI")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str

class PlanRequest(BaseModel):
    destination: str
    interests: Optional[List[str]] = None

@app.get("/")
async def root():
    return {"message": "Welcome to Weekend Travellers AI API"}

@app.post("/search")
async def search_destinations(query: SearchQuery):
    # Mocked response for now
    return {
        "results": [
            {"id": 1, "name": "Munnar", "description": "Lush green tea gardens and hills.", "tags": ["Hills", "Romantic"]},
            {"id": 2, "name": "Gokarna", "description": "Serene beaches and temple town.", "tags": ["Beach", "Relaxing"]},
            {"id": 3, "name": "Coorg", "description": "Coffee plantations and waterfalls.", "tags": ["Nature", "Adventure"]}
        ]
    }

@app.post("/plan")
async def generate_itinerary(request: PlanRequest):
    # Mocked response for now
    return {
        "destination": request.destination,
        "itinerary": [
            {
                "day": "Saturday",
                "activities": [
                    {"time": "09:00 AM", "activity": "Arrival and Check-in"},
                    {"time": "11:00 AM", "activity": "Visit local view points"},
                    {"time": "01:00 PM", "activity": "Lunch at a local cafe"},
                    {"time": "04:00 PM", "activity": "Explore the spice plantations"}
                ]
            },
            {
                "day": "Sunday",
                "activities": [
                    {"time": "08:00 AM", "activity": "Morning trek to hidden waterfall"},
                    {"time": "12:00 PM", "activity": "Traditional lunch"},
                    {"time": "03:00 PM", "activity": "Shopping for local handicrafts"},
                    {"time": "06:00 PM", "activity": "Departure"}
                ]
            }
        ],
        "estimated_cost": "₹5,000 - ₹8,000 per person"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
