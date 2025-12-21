"""
A2A Agent Router
Intelligently routes requests to specialized agents
"""
from typing import Dict, Any, Optional, List
from enum import Enum
from .a2a_client import A2AClient, AgentRegistry

class AgentType(str, Enum):
    """Types of specialized agents"""
    PRICING_CHANGE = "pricing_change"
    PRODUCT_LAUNCH = "product_launch"
    SENTIMENT = "sentiment"
    COMPANY_OVERVIEW = "company_overview"
    REVENUE_TURNOVER = "revenue_turnover"

class A2AAgentRouter:
    """
    Router that maps agent types to specific A2A agent servers
    
    Maps:
    - Pricing Change Agent → agent_pc (port 9003) - price_changes tool
    - Product Launch Agent → agent_sc/agent_pl (port 9004/9005) - product_launches tool
    - Sentiment Agent → (to be implemented or mapped)
    - Company Overview Agent → agent_ac (port 9001) - company_profile tool
    - Revenue/Turnover Agent → agent_at (port 9002) - financial_analysis tool
    """
    
    def __init__(self, agent_registry: AgentRegistry):
        self.registry = agent_registry
        self._setup_routing()
    
    def _setup_routing(self):
        """Setup routing mappings"""
        # Map agent types to agent names and their specific tools
        self.routing_map = {
            AgentType.COMPANY_OVERVIEW: {
                "agent_name": "agent_ac",
                "tool": "company_profile",
                "description": "Company Overview Agent - provides company profile, industry, HQ, products"
            },
            AgentType.REVENUE_TURNOVER: {
                "agent_name": "agent_at",
                "tool": "financial_analysis",
                "description": "Revenue/Turnover Agent - provides financial metrics, annual turnover, growth rates"
            },
            AgentType.PRICING_CHANGE: {
                "agent_name": "agent_pc",
                "tool": "price_changes",
                "description": "Pricing Change Agent - detects recent price changes for company products"
            },
            AgentType.PRODUCT_LAUNCH: {
                "agent_name": "agent_sc",  # Primary: agent_sc has product_launches tool
                "fallback": "agent_pl",    # Fallback: agent_pl also has product_launches
                "tool": "product_launches",
                "description": "Product Launch Agent - tracks new product launches and announcements"
            },
            AgentType.SENTIMENT: {
                "agent_name": None,  # Not yet implemented
                "tool": None,
                "description": "Sentiment Agent - analyzes market sentiment (to be implemented)"
            }
        }
    
    def get_agent_for_type(self, agent_type: AgentType) -> Optional[Dict[str, Any]]:
        """Get routing information for an agent type"""
        return self.routing_map.get(agent_type)
    
    async def route_to_agent(self, agent_type: AgentType, entity: str, 
                            message: Optional[str] = None) -> Dict[str, Any]:
        """
        Route a request to the appropriate agent
        
        Args:
            agent_type: Type of agent to route to
            entity: Company/entity name
            message: Optional custom message
        
        Returns:
            Agent response
        """
        routing_info = self.get_agent_for_type(agent_type)
        
        if not routing_info or not routing_info.get("agent_name"):
            return {
                "error": f"Agent type '{agent_type}' not available",
                "agent_type": agent_type.value,
                "available_types": [at.value for at in AgentType]
            }
        
        agent_name = routing_info["agent_name"]
        tool = routing_info.get("tool")
        
        # Get agent client
        agent_client = self.registry.get_agent(agent_name)
        
        if not agent_client:
            # Try fallback if available
            fallback = routing_info.get("fallback")
            if fallback:
                agent_client = self.registry.get_agent(fallback)
                if agent_client:
                    agent_name = fallback
            
            if not agent_client:
                return {
                    "error": f"Agent '{agent_name}' not found in registry",
                    "agent_type": agent_type.value,
                    "routing_info": routing_info
                }
        
        # Build message
        if not message:
            if tool:
                message = f"Use {tool} tool to analyze {entity}"
            else:
                message = f"Analyze {entity}"
        else:
            # Ensure entity is mentioned
            if entity.lower() not in message.lower():
                message = f"{message} for {entity}"
        
        # Invoke agent
        try:
            response = await agent_client.invoke_agent(message)
            
            # Add routing metadata
            if isinstance(response, dict):
                response["routing_metadata"] = {
                    "agent_type": agent_type.value,
                    "agent_name": agent_name,
                    "tool_used": tool,
                    "description": routing_info.get("description")
                }
            
            return response
        except Exception as e:
            return {
                "error": str(e),
                "agent_type": agent_type.value,
                "agent_name": agent_name
            }
    
    async def route_multiple(self, agent_types: List[AgentType], entity: str,
                           message: Optional[str] = None) -> Dict[str, Any]:
        """
        Route to multiple agents in parallel
        
        Args:
            agent_types: List of agent types to invoke
            entity: Company/entity name
            message: Optional custom message
        
        Returns:
            Dictionary with results from each agent
        """
        import asyncio
        
        # Create tasks for parallel execution
        tasks = [
            self.route_to_agent(agent_type, entity, message)
            for agent_type in agent_types
        ]
        
        # Execute in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Build response
        response = {
            "entity": entity,
            "agent_results": {},
            "errors": {}
        }
        
        for i, agent_type in enumerate(agent_types):
            result = results[i]
            if isinstance(result, Exception):
                response["errors"][agent_type.value] = str(result)
            elif isinstance(result, dict) and "error" in result:
                response["errors"][agent_type.value] = result["error"]
            else:
                response["agent_results"][agent_type.value] = result
        
        response["success_count"] = len(response["agent_results"])
        response["error_count"] = len(response["errors"])
        
        return response
    
    def list_available_agents(self) -> List[Dict[str, Any]]:
        """List all available agent types and their routing info"""
        available = []
        for agent_type, routing_info in self.routing_map.items():
            agent_name = routing_info.get("agent_name")
            agent_client = self.registry.get_agent(agent_name) if agent_name else None
            
            available.append({
                "agent_type": agent_type.value,
                "description": routing_info.get("description"),
                "agent_name": agent_name,
                "tool": routing_info.get("tool"),
                "available": agent_client is not None,
                "fallback": routing_info.get("fallback")
            })
        
        return available
    
    async def route_by_intent(self, entity: str, intent: str) -> Dict[str, Any]:
        """
        Route based on natural language intent
        
        Args:
            entity: Company/entity name
            intent: Natural language description of what's needed
        
        Returns:
            Agent response
        """
        intent_lower = intent.lower()
        
        # Determine agent type from intent
        if any(word in intent_lower for word in ["price", "pricing", "cost", "price change"]):
            return await self.route_to_agent(AgentType.PRICING_CHANGE, entity, intent)
        
        elif any(word in intent_lower for word in ["launch", "product launch", "new product", "announcement"]):
            return await self.route_to_agent(AgentType.PRODUCT_LAUNCH, entity, intent)
        
        elif any(word in intent_lower for word in ["sentiment", "feeling", "opinion", "mood"]):
            return await self.route_to_agent(AgentType.SENTIMENT, entity, intent)
        
        elif any(word in intent_lower for word in ["overview", "profile", "company info", "about"]):
            return await self.route_to_agent(AgentType.COMPANY_OVERVIEW, entity, intent)
        
        elif any(word in intent_lower for word in ["revenue", "turnover", "financial", "earnings", "profit"]):
            return await self.route_to_agent(AgentType.REVENUE_TURNOVER, entity, intent)
        
        else:
            # Default: try company overview
            return await self.route_to_agent(AgentType.COMPANY_OVERVIEW, entity, intent)

