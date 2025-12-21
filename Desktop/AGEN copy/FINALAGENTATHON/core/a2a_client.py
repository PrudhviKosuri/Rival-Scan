"""
A2A Client for communicating with A2A agent servers
"""
import httpx
import json
from typing import Dict, Any, Optional
from datetime import datetime

class A2AClient:
    """Client for interacting with A2A agent servers"""
    
    def __init__(self, name: str, base_url: str, timeout: int = 30):
        self.name = name
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)
    
    async def get_agent_card(self) -> Dict[str, Any]:
        """Get agent card information"""
        try:
            response = await self.client.get(f"{self.base_url}/.well-known/agent-card.json")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    async def invoke_agent(self, message: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Invoke the A2A agent with a message
        
        Args:
            message: User message/query
            conversation_id: Optional conversation ID for context
        
        Returns:
            Agent response
        """
        try:
            # Try A2A protocol endpoint first
            payload = {
                "message": message,
                "conversation_id": conversation_id or f"conv_{datetime.now().timestamp()}"
            }
            
            # Try /chat endpoint (common A2A pattern)
            try:
                response = await self.client.post(
                    f"{self.base_url}/chat",
                    json=payload
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError:
                # Fallback: try /invoke or /message
                for endpoint in ["/invoke", "/message", "/"]:
                    try:
                        response = await self.client.post(
                            f"{self.base_url}{endpoint}",
                            json=payload
                        )
                        response.raise_for_status()
                        return response.json()
                    except httpx.HTTPStatusError:
                        continue
                raise
            
        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except Exception as e:
            return {"error": str(e)}
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

class AgentRegistry:
    """Registry for managing multiple A2A agents"""
    
    def __init__(self):
        self.agents: Dict[str, A2AClient] = {}
    
    def register_agent(self, name: str, base_url: str, timeout: int = 30):
        """Register an A2A agent"""
        self.agents[name] = A2AClient(name, base_url, timeout)
    
    def get_agent(self, name: str) -> Optional[A2AClient]:
        """Get an agent client by name"""
        return self.agents.get(name)
    
    def list_agents(self) -> list:
        """List all registered agent names"""
        return list(self.agents.keys())
    
    async def close_all(self):
        """Close all agent clients"""
        for agent in self.agents.values():
            await agent.close()

