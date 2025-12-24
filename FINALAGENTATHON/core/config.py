"""
Configuration for Orchestrator
"""
import os
from typing import Dict

class Config:
    """Orchestrator configuration"""
    
    # API Keys
    GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
    
    # Server settings
    ORCHESTRATOR_PORT = int(os.environ.get("ORCHESTRATOR_PORT", 8000))
    ORCHESTRATOR_HOST = os.environ.get("ORCHESTRATOR_HOST", "0.0.0.0")
    
    # Storage settings
    ORCHESTRATOR_DB = os.environ.get("ORCHESTRATOR_DB", "orchestrator_context.db")
    
    # Agent registry (can be overridden via environment)
    # Maps to A2A Agent Router structure:
    # - agent_ac: Company Overview Agent (port 9001)
    # - agent_at: Revenue/Turnover Agent (port 9002)
    # - agent_pc: Pricing Change Agent (port 9003)
    # - agent_sc: Product Launch Agent (port 9004, primary)
    # - agent_pl: Product Launch Agent (port 9005, fallback)
    DEFAULT_AGENTS: Dict[str, str] = {
        "agent_ac": os.environ.get("AGENT_AC_URL", "http://localhost:9001/agent_ac"),  # Company Overview
        "agent_at": os.environ.get("AGENT_AT_URL", "http://localhost:9001/agent_at"),  # Revenue/Turnover
        "agent_pc": os.environ.get("AGENT_PC_URL", "http://localhost:9001/agent_pc"),  # Pricing Change
        "agent_sc": os.environ.get("AGENT_SC_URL", "http://localhost:9001/agent_sc"),  # Product Launch (primary)
        "agent_pl": os.environ.get("AGENT_PL_URL", "http://localhost:9001/agent_pl"),  # Product Launch (fallback)
    }
    
    # Context settings
    DEFAULT_SIGNAL_HOURS_BACK = int(os.environ.get("SIGNAL_HOURS_BACK", 168))  # 7 days
    DEFAULT_OUTPUT_TTL_SECONDS = int(os.environ.get("OUTPUT_TTL_SECONDS", 3600))  # 1 hour
    DEFAULT_FACT_EXPIRY_HOURS = int(os.environ.get("FACT_EXPIRY_HOURS", 720))  # 30 days
    
    # Confidence threshold for storing facts
    CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", 0.5))
    
    # Timeout for agent calls
    AGENT_TIMEOUT = int(os.environ.get("AGENT_TIMEOUT", 30))

