from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

load_dotenv()

# Configure OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

app = FastAPI(title="Weekend Travellers AI")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str
    user_location: Optional[str] = None

class PlanRequest(BaseModel):
    destination: str

@app.post("/search")
async def search_destinations(query: SearchQuery):
    """
    Uses OpenAI GPT-4o to find destinations based on natural language query 
    and returns detailed estimates (Cost, Distance, Time).
    """
    if not client:
        # Fallback to mock if no key
        return {
            "results": [
                {
                    "id": 1, 
                    "name": "Munnar", 
                    "description": "Lush green tea gardens and hills.", 
                    "tags": ["Hills", "Romantic"],
                    "distance": "130 km",
                    "drive_time": "4 hrs",
                    "best_time_drive": "Early Morning",
                    "best_time_visit": "Sep - Mar",
                    "estimated_cost": "₹6,000",
                    "famous_for": "Tea Gardens",
                    "ideal_for": "Couples"
                }
            ]
        }

    try:
        user_context = f"The user is located at {query.user_location}." if query.user_location else "The user's location is unknown, assume major nearby transport hub."
        
        # Custom prompt engineering to prioritize nearest destinations
        proximity_instruction = ""
        if query.user_location:
            proximity_instruction = "CRITICAL: The user has provided their location. You MUST prioritize destinations that are closest to this location (ideally within 300-500km or a convenient overnight drive/flight). Do NOT suggest far-off places unless explicitly asked."

        system_prompt = """
        You are an expert travel assistant for India.
        You suggest best weekend travel destinations based on user queries.
        You must ensure the following details are accurate:
        1. **Distance**: Calculate approximate distance from the user's location (if provided) or nearest major city.
        2. **Estimated Cost**: Provide a realistic cost range per person in INR for a weekend trip (2 days).
        3. **Best Time**: Be specific about the months (e.g., "Oct - Mar").
        
        Return the response strictly as valid JSON with this structure:
        {
            "results": [
                {
                    "id": 1,
                    "name": "Destination Name",
                    "description": "Brief catchy description",
                    "tags": ["Tag1", "Tag2"],
                    "distance": "e.g. 250 km from [Your Location]",
                    "drive_time": "e.g. 5 hrs by Car",
                    "best_time_drive": "Best time of day to start driving (e.g. 5 AM to beat traffic)",
                    "best_time_visit": "Best months to visit (e.g. Oct-Mar)",
                    "estimated_cost": "₹X,XXX - ₹X,XXX per person",
                    "famous_for": "Key attraction (e.g. Tigers, Tea Gardens)",
                    "ideal_for": "Target audience (e.g. Couples, Adventure)"
                }
            ]
        }
        """

        user_prompt = f"""
        {user_context}
        {proximity_instruction}
        
        Suggest 4-5 best weekend travel destinations for the query: "{query.query}".
        Focus on places reachable or relevant for weekend travel within India.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Ensure IDs are present
        for idx, item in enumerate(data.get("results", [])):
            item["id"] = idx + 1
            
        return data

    except Exception as e:
        print(f"OpenAI API Error: {e}")
        # Fallback in case of error
        return {"results": [], "error": str(e)}

@app.get("/suggestions")
async def get_suggestions(q: str):
    # Simple mock suggestions based on query or random
    # In a real app, this would query a DB or vector store
    destinations = ["Munnar", "Ooty", "Coorg", "Goa", "Rishikesh", "Manali", "Jaipur", "Udaipur", "Kerala", "Hampi"]
    filtered = [d for d in destinations if q.lower() in d.lower()]
    return {"suggestions": filtered[:5]}

@app.post("/plan")
async def generate_itinerary(request: PlanRequest):
    # Keep the existing mock or upgrade to AI later
    return {
        "destination": request.destination,
        "itinerary": [
            {
                "day": "Saturday",
                "activities": [
                    {"time": "09:00 AM", "activity": "Arrival and Check-in"},
                    {"time": "11:00 AM", "activity": "Local Sightseeing"},
                    {"time": "01:00 PM", "activity": "Lunch"},
                    {"time": "04:00 PM", "activity": "Sunset Point"}
                ]
            },
            {
                "day": "Sunday",
                "activities": [
                    {"time": "09:00 AM", "activity": "Breakfast & Adventure Activity"},
                    {"time": "01:00 PM", "activity": "Lunch"},
                    {"time": "04:00 PM", "activity": "Return Journey"}
                ]
            }
        ],
        "estimated_cost": "₹5,000 - ₹8,000 per person"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
