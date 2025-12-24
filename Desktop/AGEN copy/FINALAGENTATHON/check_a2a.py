import asyncio
import os
import sys
from core.config import Config
from core.a2a_client import AgentRegistry
from core.a2a_router import A2AAgentRouter, AgentType

# Ensure we use the right API Key logic if needed, but config handles it.

async def main():
    print("Initializing Agent Registry and Router...")
    registry = AgentRegistry()
    for name, url in Config.DEFAULT_AGENTS.items():
        registry.register_agent(name, url)
    router = A2AAgentRouter(registry)

    print("\n--- 1. Testing A2A Router Intent Classification & Routing ---")
    scenarios = [
        ("pricing", AgentType.PRICING_CHANGE),
        ("launch", AgentType.PRODUCT_LAUNCH),
        ("revenue", AgentType.REVENUE_TURNOVER),
        ("overview", AgentType.COMPANY_OVERVIEW),
        ("unknown_intent_defaults_to_overview", AgentType.COMPANY_OVERVIEW) 
    ]

    for keyword, expected in scenarios:
        print(f"Testing intent keyword: '{keyword}'")
        # Route by intent
        result = await router.route_by_intent("Microsoft", f"Please check {keyword}")
        
        # Extract agent type from result (success) or error
        # Success: result["routing_metadata"]["agent_type"]
        # Error: result["agent_type"]
        
        actual_type = None
        if "routing_metadata" in result:
             actual_type = result["routing_metadata"].get("agent_type")
        elif "agent_type" in result:
             actual_type = result.get("agent_type")
        
        if actual_type == expected.value:
            print(f"✅ Routed '...{keyword}...' -> {actual_type}")
        else:
            print(f"❌ FAILED. Expected {expected.value}, got {actual_type}")
            print(f"Debug Result: {result}")

    print("\n--- 2. Testing Direct Agent Layer Connectivity (agent_ac) ---")
    client = registry.get_agent("agent_ac")
    if client:
        print("Invoking Agent AC (Company Overview) directly...")
        try:
             res = await client.invoke_agent("Analyze Microsoft")
             # We expect either a real result or a 429 error, both mean connectivity is good.
             print("Response received.")
             if "error" in res:
                 print(f"Agent returned error (expected if quota full): {str(res['error'])[:100]}...")
             else:
                 print(f"Agent returned success: {str(res)[:100]}...")
        except Exception as e:
             print(f"❌ Exception invoking agent: {e}")
    else:
        print("❌ agent_ac client could not be created")

if __name__ == "__main__":
    asyncio.run(main())
