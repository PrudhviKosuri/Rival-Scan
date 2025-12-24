"""
Example usage of the Orchestrator API
"""
import httpx
import json
import asyncio

BASE_URL = "http://localhost:8000"

async def example_orchestrate():
    """Example: Orchestrate analysis for a company using agent types"""
    async with httpx.AsyncClient() as client:
        # Orchestrate analysis using agent types (recommended)
        response = await client.post(
            f"{BASE_URL}/orchestrate",
            json={
                "entity": "Tata Motors",
                "agent_types": ["company_overview", "revenue_turnover", "pricing_change"],
                "include_context": True,
                "store_outputs": True,
                "extract_facts": True,
                "use_router": True
            }
        )
        result = response.json()
        print("Orchestration Result (using router):")
        print(json.dumps(result, indent=2))
        return result

async def example_route_agent():
    """Example: Route to a specific agent type"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/router/route",
            json={
                "entity": "Tata Motors",
                "agent_type": "pricing_change",
                "message": "Check recent price changes"
            }
        )
        result = response.json()
        print("\nRouter Result:")
        print(json.dumps(result, indent=2))
        return result

async def example_route_by_intent():
    """Example: Route by natural language intent"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/router/route-by-intent",
            json={
                "entity": "Tata Motors",
                "intent": "What are the recent price changes for their products?"
            }
        )
        result = response.json()
        print("\nIntent-Based Routing Result:")
        print(json.dumps(result, indent=2))
        return result

async def example_list_router_agents():
    """Example: List available agent types via router"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/router/agents")
        agents = response.json()
        print("\nAvailable Agent Types (Router):")
        print(json.dumps(agents, indent=2))
        return agents

async def example_get_context():
    """Example: Get context for an entity"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/context/Tata%20Motors",
            params={
                "include_facts": True,
                "include_signals": True,
                "include_outputs": True,
                "signal_hours_back": 168
            }
        )
        context = response.json()
        print("\nContext:")
        print(json.dumps(context, indent=2))
        return context

async def example_list_agents():
    """Example: List all registered agents"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/agents")
        agents = response.json()
        print("\nRegistered Agents:")
        print(json.dumps(agents, indent=2))
        return agents

async def example_get_facts():
    """Example: Get cached facts"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/facts/Tata%20Motors")
        facts = response.json()
        print("\nCached Facts:")
        print(json.dumps(facts, indent=2))
        return facts

async def example_invoke_agent():
    """Example: Invoke a specific agent"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/invoke-agent",
            json={
                "agent_name": "agent_ac",
                "message": "Analyze Tata Motors",
                "entity": "Tata Motors"
            }
        )
        result = response.json()
        print("\nAgent Invocation Result:")
        print(json.dumps(result, indent=2))
        return result

async def main():
    """Run all examples"""
    print("=" * 60)
    print("Orchestrator API Examples")
    print("=" * 60)
    
    # Check health
    async with httpx.AsyncClient() as client:
        try:
            health = await client.get(f"{BASE_URL}/health")
            print("\n✅ Orchestrator is healthy")
            print(json.dumps(health.json(), indent=2))
        except Exception as e:
            print(f"\n❌ Orchestrator not available: {e}")
            print("Make sure the orchestrator is running on port 8000")
            return
    
    # List agents
    await example_list_agents()
    
    # List router agent types
    await example_list_router_agents()
    
    # Get context (may be empty initially)
    await example_get_context()
    
    # Route to specific agent type
    # Uncomment when agents are running:
    # await example_route_agent()
    
    # Route by intent
    # await example_route_by_intent()
    
    # Orchestrate (this will call agents via router)
    # Uncomment when agents are running:
    # await example_orchestrate()
    
    # Get facts after orchestration
    # await example_get_facts()

if __name__ == "__main__":
    asyncio.run(main())

