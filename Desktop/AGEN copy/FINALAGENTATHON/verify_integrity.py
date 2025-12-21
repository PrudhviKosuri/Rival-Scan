import asyncio
import httpx
import json
import sys
import os

# Configuration
ORCHESTRATOR_URL = "http://localhost:8000"
AGENT_SERVER_URL = "http://localhost:9001"

async def check_health():
    print(f"Checking connectivity...")
    
    # Check Agents
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{AGENT_SERVER_URL}/.well-known/agent-card.json")
            if resp.status_code == 200:
                print(f"✅ Agent Server is UP at {AGENT_SERVER_URL}")
            else:
                print(f"❌ Agent Server returned {resp.status_code}")
    except Exception as e:
        print(f"❌ Agent Server unreachable: {e}")

    # Check Orchestrator
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{ORCHESTRATOR_URL}/")
            if resp.status_code == 200:
                print(f"✅ Orchestrator is UP at {ORCHESTRATOR_URL}")
            else:
                print(f"❌ Orchestrator returned {resp.status_code}")
    except Exception as e:
        print(f"❌ Orchestrator unreachable: {e}")

async def verify_contract(entity="Tata Motors"):
    print(f"\nVerifying Contract for Entity: {entity}")
    payload = {
        "entity": entity,
        "agent_types": ["company_overview", "revenue_turnover", "pricing_change", "product_launch"],
        "include_context": True,
        "use_router": True
    }
    
    print(f"Sending payload: {json.dumps(payload, indent=2)}")
    
    start_time = asyncio.get_event_loop().time()
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{ORCHESTRATOR_URL}/orchestrate", json=payload)
            duration = asyncio.get_event_loop().time() - start_time
            
            print(f"Response Time: {duration:.2f}s")
            
            if resp.status_code != 200:
                print(f"❌ Request Failed: {resp.status_code}")
                print(resp.text)
                return False
                
            data = resp.json()
            print("Response Payload:")
            print(json.dumps(data, indent=2))
            
            # --- CONTRACT VALIDATION ---
            print("\nValidating Response Contract...")
            
            # Expected Top Level Keys
            expected_keys = ["orchestration_id", "entity", "results", "aggregated_summary"]
            for k in expected_keys:
                if k not in data:
                    print(f"❌ Missing key: {k}")
                else:
                    print(f"✅ Key present: {k}")
            
            # Check Results
            results = data.get("results", {})
            errors = data.get("errors", {})
            
            if not results and not errors:
                print("❌ No results AND no errors returned from agents!")
                return False
            
            if errors:
                print(f"⚠️  Errors returned (Expected if API Key missing): {json.dumps(errors, indent=2)}")
                # If we have errors, we consider integration 'working' but agents failing
            
            if results:
                print(f"✅ Results returned: {list(results.keys())}")
            
            # Deep Check: Revenue Data (Financial)
            # Map legacy names if needed. Protocol maps 'revenue_turnover' -> 'agent_at' -> 'financial_analysis'
            # The Orchestrator returns results keyed by 'agent_name' or 'agent_type'.
            # Let's see what we get.
            
            # Check for nulls/errors
            for agent, res in results.items():
                if "error" in res:
                    print(f"⚠️ Agent {agent} returned error: {res['error']}")
                else:
                    print(f"✅ Agent {agent} success")
                    # Check if detailed fields exist
                    if agent == "agent_at" or agent == "revenue_turnover":
                         # Check strict schema fields
                         if "annual_turnover" in res:
                             print(f"   - Found annual_turnover: {res['annual_turnover']}")
                         else:
                             print(f"   ❌ Missing 'annual_turnover' in {agent} response")

            print("\n✅ Contract Verification Complete (See logs for warnings)")
            return True
            
    except Exception as e:
        print(f"❌ Verification Exception: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        entity = sys.argv[1]
    else:
        entity = "Tata Motors"
        
    print(f"Running Integrity Verification for: {entity}")
    async def main():
        await check_health()
        await verify_contract(entity)

    asyncio.run(main())
