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

app = FastAPI(title="Weekend Travellers AI", root_path="/api")

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
    user_query: Optional[str] = None
from destinations_data import INDIAN_DESTINATIONS
import random

@app.post("/search")
async def search_destinations(query: SearchQuery):
    """
    Hybrid Search:
    1. Filter local database for matches.
    2. If matches found, ask AI to enrich them.
    3. If no matches, ask AI to suggest.
    """
    
    # 1. Local Search
    q_lower = query.query.lower()
    local_matches = [d for d in INDIAN_DESTINATIONS if q_lower in d.lower()]
    
    # Limit to top 3 matches to keep it focused
    top_matches = local_matches[:3] if local_matches else []
    
    if not client:
        # Fallback if no API key
        results = []
        source_list = top_matches if top_matches else ["Munnar", "Goa", "Jaipur"]
        for i, name in enumerate(source_list):
            results.append({
                "id": i + 1,
                "name": name,
                "description": f"Beautiful destination matching '{query.query}'",
                "tags": ["Travel", "Weekend"],
                "distance": "Calculate from Location",
                "drive_time": "5-6 hrs",
                "best_time_drive": "Morning",
                "best_time_visit": "All Year",
                "estimated_cost": "₹5,000 - ₹10,000",
                "famous_for": "Sightseeing",
                "ideal_for": "Everyone"
            })
        return {"results": results}

    try:
        user_context = f"The user is located at {query.user_location}." if query.user_location else "The user's location is unknown."
        
        # Construct prompt based on whether we found local matches
        if top_matches:
            focus_instruction = f"The user search matched these specific Indian cities/towns: {', '.join(top_matches)}. YOU MUST GENERATE DETAILS FOR THESE SPECIFIC PLACES ONLY."
        else:
            focus_instruction = f"The user search '{query.query}' did not match popular list. Suggest 3-4 best relevant destinations."

        system_prompt = """
        You are an expert travel assistant.
        
        CRITICAL INSTRUCTION FOR LOCATION:
        - Convert 'Lat,Long' to nearest City Name if provided.
        - Distance should be 'X km from [City]'.
        
        Output JSON format strictly:
        {
            "results": [
                {
                    "id": 1,
                    "name": "Exact Name",
                    "description": "Catchy 1-line description",
                    "tags": ["Tag1", "Tag2"],
                    "distance": "...",
                    "drive_time": "...",
                    "best_time_drive": "...",
                    "best_time_visit": "...",
                    "estimated_cost": "...",
                    "famous_for": "...",
                    "ideal_for": "..."
                }
            ]
        }
        """

        user_prompt = f"""
        {user_context}
        Query: "{query.query}"
        {focus_instruction}
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
        
        # Ensure IDs are unique
        for idx, item in enumerate(data.get("results", [])):
            item["id"] = idx + 1
            
        return data

    except Exception as e:
        print(f"Search API Error: {e}")
        return {"results": [], "error": str(e)}

@app.get("/suggestions")
async def get_suggestions(q: str):
    if not q:
        return {"suggestions": []}
    
    # Fast local autocomplete
    q_lower = q.lower()
    matches = [d for d in INDIAN_DESTINATIONS if q_lower in d.lower()]
    
    # Sort by length to give exact matches priority, limit to 5
    matches.sort(key=len)
    return {"suggestions": matches[:5]}

@app.post("/plan")
async def generate_itinerary(request: PlanRequest):
    # Fallback Mock Itinerary (used if API fails)
    mock_itinerary = {
        "destination": request.destination,
        "itinerary": [
            {
                "day": "Day 1",
                "activities": [
                    {"time": "10:00 AM", "activity": f"Arrive in {request.destination} and check into hotel"},
                    {"time": "01:00 PM", "activity": "Local cuisine lunch at a popular spot"},
                    {"time": "03:00 PM", "activity": "Sightseeing at main local attractions"},
                    {"time": "07:00 PM", "activity": "Sunset view and dinner"}
                ]
            },
            {
                "day": "Day 2",
                "activities": [
                    {"time": "09:00 AM", "activity": "Breakfast and local market visit"},
                    {"time": "11:00 AM", "activity": "Visit nearby scenic spots or temples"},
                    {"time": "02:00 PM", "activity": "Departure preparation"}
                ]
            }
        ],
        "estimated_cost": "₹6,000 - ₹8,000 (Estimated w/o API)",
        "note": "This is a generated fallback itinerary as our AI service is currently busy."
    }

    if not client:
        return mock_itinerary

    try:
        system_prompt = """
        You are an expert travel planner. 
        
        CRITICAL DURATION INSTRUCTION:
        1. Check the "User's original query" first.
        2. If it contains number of days (e.g. "3 days", "4 days"), you MUST generate an itinerary for EXACTLY that many days.
        3. If no duration is mentioned, default to standard 2 Days (Weekend).
        4. Max duration allowed is 4 Days.
        
        Output Structure:
        - Use "Day 1", "Day 2" etc.
        - NO markdown formatting.
        
        Response strictly as JSON.
        """

        user_prompt = f"""
        Plan a trip to {request.destination}.
        User's original query: "{request.user_query or ''}"
        
        Output format:
        {{
            "destination": "{request.destination}",
            "itinerary": [
                {{
                    "day": "Day 1",
                    "activities": [ {{ "time": "...", "activity": "..." }} ]
                }}
            ],
            "estimated_cost": "..."
        }}
        """

        # Set a timeout for the API call to prevent long hangs (e.g., 10 seconds)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" },
            timeout=15.0 
        )

        content = response.choices[0].message.content
        return json.loads(content)

    except Exception as e:
        print(f"OpenAI API Error in /plan: {e}")
        # Return fallback instead of error message so user experience isn't broken
        return mock_itinerary

class ChatRequest(BaseModel):
    message: str
    destination: str
    context: Optional[dict] = None

@app.post("/chat")
async def chat_followup(request: ChatRequest):
    if not client:
        return {"response": "I'm offline right now (No API Key), but I'd suggest checking out the local food!"}

    try:
        system_prompt = f"""
        You are a helpful travel assistant for {request.destination}.
        The user has already received an itinerary. Now they are asking follow-up questions.
        
        Guidelines:
        - Use DOUBLE LINE BREAKS between sections/days to paragraphs.
        - If listing a plan, format as:
          Day 1: [Activity]
          
          Day 2: [Activity]
        - Do not use markdown bolding (like **text**). Use Capital Letters for emphasis if needed.
        - Be concise, friendly, and helpful.
        """
        
        user_prompt = f"User asks: {request.message}"
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
        )
        
        return {"response": response.choices[0].message.content}

    except Exception as e:
        print(f"Chat Error: {e}")
        return {"response": "I'm having trouble connecting to my travel brain right now. But generally, local drivers and hotel concierges are great sources for on-the-ground info!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
