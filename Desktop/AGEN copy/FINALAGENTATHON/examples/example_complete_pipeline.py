"""
Example: Complete Pipeline Usage
Demonstrates Gemini 1.5 Pro + Validation + Managed Storage
"""
import asyncio
import httpx
import json
from agents.agent_service import AgentService

# Example schemas
COMPANY_PROFILE_SCHEMA = {
    "type": "object",
    "properties": {
        "schema_version": {"type": "string"},
        "company_name": {"type": "string"},
        "industry": {"type": "string"},
        "headquarters": {"type": "string"},
        "founded_year": {"type": "integer"},
        "business_model": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["manufacturing", "services", "digital", "platform"]
            }
        },
        "key_products": {
            "type": "array",
            "items": {"type": "string"}
        },
        "market_position": {
            "type": "string",
            "enum": ["leader", "challenger", "niche"]
        },
        "geographic_presence": {
            "type": "array",
            "items": {"type": "string"}
        },
        "strategic_focus_areas": {
            "type": "array",
            "items": {"type": "string"}
        },
        "confidence_score": {
            "type": "number",
            "minimum": 0.0,
            "maximum": 1.0
        },
        "data_sources": {
            "type": "array",
            "items": {"type": "string"}
        }
    },
    "required": ["company_name", "industry", "confidence_score"],
    "additionalProperties": False
}

PRICING_CHANGE_SCHEMA = {
    "type": "object",
    "properties": {
        "schema_version": {"type": "string"},
        "company": {"type": "string"},
        "product": {"type": ["string", "null"]},
        "price_change_detected": {"type": "boolean"},
        "change_type": {
            "type": "string",
            "enum": ["increase", "decrease", "stable", "unknown"]
        },
        "change_percentage": {"type": "number"},
        "effective_date": {"type": ["string", "null"]},
        "price_before": {
            "type": "object",
            "properties": {
                "value": {"type": "number"},
                "currency": {"type": "string"},
                "confidence": {"type": "number"}
            },
            "required": ["value", "currency"]
        },
        "price_after": {
            "type": "object",
            "properties": {
                "value": {"type": "number"},
                "currency": {"type": "string"},
                "confidence": {"type": "number"}
            },
            "required": ["value", "currency"]
        },
        "confidence_score": {"type": "number"},
        "data_sources": {
            "type": "array",
            "items": {"type": "string"}
        }
    },
    "required": ["company", "price_change_detected", "change_type", "confidence_score"],
    "additionalProperties": False
}

def example_direct_service():
    """Example: Using Agent Service directly"""
    print("=" * 60)
    print("Example: Direct Agent Service Usage")
    print("=" * 60)
    
    # Initialize service
    service = AgentService()
    
    # Process company overview request
    print("\n1. Processing Company Overview...")
    result = service.process_agent_request(
        entity="Tata Motors",
        agent_type="company_overview",
        prompt="Provide a comprehensive corporate profile for Tata Motors including industry, headquarters, founded year, business model, key products, market position, geographic presence, and strategic focus areas.",
        schema=COMPANY_PROFILE_SCHEMA,
        system_instruction="You are a Company Profile Agent. Extract high-level corporate data accurately.",
        use_search=True,
        store_result=True,
        validate_output=True,
        min_confidence=0.5,
        expires_in_hours=720  # 30 days
    )
    
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Confidence Score: {result['confidence_score']}")
        print(f"Storage Key: {result['storage_key']}")
        print(f"Data Preview: {json.dumps(result['data'], indent=2)[:500]}...")
    else:
        print(f"Error: {result.get('error')}")
    
    # Process pricing change request
    print("\n2. Processing Pricing Change...")
    result = service.process_agent_request(
        entity="Tata Motors",
        agent_type="pricing_change",
        prompt="Check for recent price changes in Tata Motors products in the last 7 days. Include change percentage, effective date, price before and after, and drivers.",
        schema=PRICING_CHANGE_SCHEMA,
        system_instruction="You are a Pricing Change Agent. Detect and analyze recent price changes accurately.",
        use_search=True,
        store_result=True,
        validate_output=True
    )
    
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Confidence Score: {result['confidence_score']}")
        print(f"Storage Key: {result['storage_key']}")
        print(f"Data Preview: {json.dumps(result['data'], indent=2)[:500]}...")
    
    # Retrieve from managed storage
    print("\n3. Retrieving from Managed Storage...")
    stored = service.retrieve_agent_output(
        entity="Tata Motors",
        agent_type="company_overview",
        use_cache=True
    )
    
    if stored:
        print(f"Found stored data:")
        print(f"  Storage Key: {stored['storage_key']}")
        print(f"  Created At: {stored['created_at']}")
        print(f"  Confidence: {stored['metadata']['confidence_score']}")
    else:
        print("No stored data found")

async def example_orchestrator_api():
    """Example: Using Orchestrator API"""
    print("\n" + "=" * 60)
    print("Example: Orchestrator API Usage")
    print("=" * 60)
    
    BASE_URL = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        # Check health
        try:
            health = await client.get(f"{BASE_URL}/health")
            print(f"\n✅ Orchestrator Health: {health.json()}")
        except Exception as e:
            print(f"\n❌ Orchestrator not available: {e}")
            print("Start orchestrator with: python orchestrator.py")
            return
        
        # Process through agent service endpoint
        print("\n1. Processing via Agent Service endpoint...")
        try:
            response = await client.post(
                f"{BASE_URL}/agent-service/process",
                json={
                    "entity": "Tata Motors",
                    "agent_type": "company_overview",
                    "prompt": "Provide a corporate profile for Tata Motors",
                    "schema": COMPANY_PROFILE_SCHEMA,
                    "system_instruction": "You are a Company Profile Agent.",
                    "use_search": True,
                    "store_result": True
                }
            )
            result = response.json()
            print(f"Success: {result.get('success')}")
            if result.get('success'):
                print(f"Storage Key: {result.get('storage_key')}")
        except Exception as e:
            print(f"Error: {e}")
        
        # Retrieve from managed storage
        print("\n2. Retrieving from Managed Storage...")
        try:
            response = await client.get(
                f"{BASE_URL}/managed-storage/Tata%20Motors",
                params={"agent_type": "company_overview", "limit": 5}
            )
            results = response.json()
            print(f"Found {results['count']} stored items")
            for item in results['results'][:2]:
                print(f"  - {item['agent_type']}: {item['metadata']['confidence_score']} confidence")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    print("Complete Pipeline Examples")
    print("=" * 60)
    
    # Example 1: Direct service usage
    try:
        example_direct_service()
    except Exception as e:
        print(f"Error in direct service example: {e}")
        import traceback
        traceback.print_exc()
    
    # Example 2: Orchestrator API usage
    asyncio.run(example_orchestrator_api())

