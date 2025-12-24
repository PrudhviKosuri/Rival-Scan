import os
import json
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.genai import Client, types

# --- CONFIG ---
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "AIzaSyCGfc9qYKaWRsDOuYB9Z2_rpRdDcAOta_o")
MODEL_NAME = "gemini-2.0-flash"

def get_gemini_client():
    if not GOOGLE_API_KEY:
        print("⚠️ WARNING: GOOGLE_API_KEY not found. Agent logic will fail.")
       
        return None
    return Client(api_key=GOOGLE_API_KEY)

# --- SCHEMAS ---
COMPANY_PROFILE_SCHEMA = {
    "type": "object",
    "properties": {
        "schema_version": {"type": "string"},
        "company_name": {"type": "string"},
        "industry": {"type": "string"},
        "headquarters": {"type": "string"},
        "founded_year": {"type": "integer"},
        "business_model": {"type": "array", "items": {"type": "string"}},
        "key_products": {"type": "array", "items": {"type": "string"}},
        "market_position": {"type": "string"},
        "geographic_presence": {"type": "array", "items": {"type": "string"}},
        "strategic_focus_areas": {"type": "array", "items": {"type": "string"}},
        "confidence_score": {"type": "number"},
        "data_sources": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["company_name", "industry", "headquarters", "key_products", "business_model"]
}

PRICE_CHANGE_SCHEMA = {
    "type": "object",
    "properties": {
        "schema_version": {"type": "string"},
        "company": {"type": "string"},
        "product": {"type": "string", "nullable": True},
        "price_change_detected": {"type": "boolean"},
        "change_type": {"type": "string", "enum": ["increase", "decrease", "stable", "unknown"]},
        "change_percentage": {"type": "number"},
        "effective_date": {"type": "string", "nullable": True},
        "price_before": {
            "type": "object",
            "properties": {"value": {"type": "number"}, "currency": {"type": "string"}, "confidence": {"type": "number"}}
        },
        "price_after": {
            "type": "object",
            "properties": {"value": {"type": "number"}, "currency": {"type": "string"}, "confidence": {"type": "number"}}
        },
        "drivers": {"type": "array", "items": {"type": "string"}},
        "market_context": {
            "type": "object", 
            "properties": {"industry_trend": {"type": "string"}, "competitor_alignment": {"type": "string"}}
        },
        "confidence_score": {"type": "number"},
        "data_sources": {"type": "array", "items": {"type": "string"}},
        "notes": {"type": "string"}
    },
    "required": ["company", "price_change_detected", "change_type"]
}

PRODUCT_LAUNCH_SCHEMA = {
    "type": "object",
    "properties": {
        "schema_version": {"type": "string"},
        "company": {"type": "string"},
        "product_name": {"type": "string"},
        "product_category": {"type": "string"},
        "launch_type": {"type": "string", "enum": ["new_product", "variant", "relaunch", "soft_launch", "unknown"]},
        "launch_status": {"type": "string", "enum": ["announced", "launched", "rumored", "unknown"]},
        "launch_date": {"type": "string", "nullable": True},
        "key_features": {"type": "array", "items": {"type": "string"}},
        "target_segment": {"type": "string"},
        "expected_price_range": {
             "type": "object",
             "properties": {"min": {"type": "number"}, "max": {"type": "number"}, "currency": {"type": "string"}}
        },
        "strategic_intent": {"type": "array", "items": {"type": "string"}},
        "confidence_score": {"type": "number"},
        "data_sources": {"type": "array", "items": {"type": "string"}},
        "notes": {"type": "string"}
    },
    "required": ["company", "product_name", "launch_status"]
}

FINANCIAL_SCHEMA = {
    "type": "object",
    "properties": {
        "schema_version": {"type": "string"},
        "company": {"type": "string"},
        "fiscal_year": {"type": "string"},
        "annual_turnover": {
            "type": "object",
            "properties": {"value": {"type": "number"}, "unit": {"type": "string"}, "currency": {"type": "string"}}
        },
        "growth_rate": {"type": "number"},
        "revenue_trend": {"type": "string", "enum": ["growing", "stable", "declining", "unknown"]},
        "profitability_indicator": {"type": "string"},
        "key_drivers": {"type": "array", "items": {"type": "string"}},
        "confidence_score": {"type": "number"},
        "data_sources": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["company", "annual_turnover", "revenue_trend"]
}

# --- AGENT LOGIC ---
def generate_content(prompt: str, schema: Dict[str, Any]) -> Dict[str, Any]:
    client = get_gemini_client()
    if not client:
        return {"error": "GOOGLE_API_KEY not configured"}
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[prompt],
            config=types.GenerateContentConfig(
                system_instruction=f"Return ONLY valid JSON matching schema. No markdown.",
                tools=[types.Tool(google_search={})],
                response_mime_type="application/json",
                response_schema=schema,
                temperature=0.0,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": str(e)}

# --- WEB SERVER ---
app = FastAPI(title="Unified Agent Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

@app.get("/.well-known/agent-card.json")
async def agent_card():
    return {
        "name": "Unified Agent Server",
        "description": "Hosts multiple agents: Profile, Financial, Pricing, Launch",
        "version": "1.0.0"
    }

# --- AGENT ENDPOINTS - PATH BASED ROUTING ---

@app.post("/agent_ac/chat")
async def chat_ac(request: ChatRequest):
    """Company Profile Agent"""
    # Simply pass the message as prompt to Gemini with Profile Schema
    return generate_content(request.message, COMPANY_PROFILE_SCHEMA)

@app.post("/agent_at/chat")
async def chat_at(request: ChatRequest):
    """Financial/Turnover Agent"""
    return generate_content(request.message, FINANCIAL_SCHEMA)

@app.post("/agent_pc/chat")
async def chat_pc(request: ChatRequest):
    """Pricing Change Agent"""
    return generate_content(request.message, PRICE_CHANGE_SCHEMA)

@app.post("/agent_sc/chat")
async def chat_sc(request: ChatRequest):
    """Product Launch Agent (Primary)"""
    return generate_content(request.message, PRODUCT_LAUNCH_SCHEMA)

@app.post("/agent_pl/chat")
async def chat_pl(request: ChatRequest):
    """Product Launch Agent (Fallback)"""
    return generate_content(request.message, PRODUCT_LAUNCH_SCHEMA)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("A2A_PORT", 9001))
    print(f"🚀 Unified Agent Server running on http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
