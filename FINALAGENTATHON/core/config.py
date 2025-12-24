"""
Production-ready configuration for Orchestrator
"""
import os
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class Config:
    """Production-ready orchestrator configuration"""
    
    # Required API Keys - Must be set in production
    GOOGLE_API_KEY: Optional[str] = os.environ.get("GOOGLE_API_KEY")
    
    # Server settings - Production compatible
    PORT: int = int(os.environ.get("PORT", os.environ.get("ORCHESTRATOR_PORT", 8000)))
    HOST: str = os.environ.get("HOST", os.environ.get("ORCHESTRATOR_HOST", "0.0.0.0"))
    
    # CORS settings - Configurable for production
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "*")
    CORS_ORIGINS: str = os.environ.get("CORS_ORIGINS", "*")
    
    # Database settings - Use absolute paths in production
    ORCHESTRATOR_DB: str = os.environ.get("ORCHESTRATOR_DB", "orchestrator_context.db")
    MANAGED_STORAGE_DB: str = os.environ.get("MANAGED_STORAGE_DB", "managed_storage.db")
    
    # Performance & timeout settings
    REQUEST_TIMEOUT: int = int(os.environ.get("REQUEST_TIMEOUT", 30))
    GEMINI_TIMEOUT: int = int(os.environ.get("GEMINI_TIMEOUT", 60))
    MAX_CONCURRENT_JOBS: int = int(os.environ.get("MAX_CONCURRENT_JOBS", 10))
    
    # Logging configuration
    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "INFO")
    STRUCTURED_LOGGING: bool = os.environ.get("STRUCTURED_LOGGING", "true").lower() == "true"
    
    # Application metadata
    APP_NAME: str = os.environ.get("APP_NAME", "ACIA-Backend")
    VERSION: str = os.environ.get("VERSION", "1.0.0")
    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "development")
    
    @classmethod
    def validate_required_config(cls) -> None:
        """Validate that all required configuration is present"""
        if not cls.GOOGLE_API_KEY:
            if cls.ENVIRONMENT == "production":
                raise ValueError("GOOGLE_API_KEY is required in production environment")
            else:
                logger.warning("⚠️ GOOGLE_API_KEY not found. Gemini calls will fail.")
    
    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production environment"""
        return cls.ENVIRONMENT.lower() in ("production", "prod")
    
    @classmethod 
    def get_cors_origins(cls) -> list:
        """Get parsed CORS origins"""
        if cls.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in cls.CORS_ORIGINS.split(",")]
    
    # Legacy agent registry (optional - not used in current implementation)
    DEFAULT_AGENTS: Dict[str, str] = {
        "agent_ac": os.environ.get("AGENT_AC_URL", "http://localhost:9001/agent_ac"),
        "agent_at": os.environ.get("AGENT_AT_URL", "http://localhost:9001/agent_at"), 
        "agent_pc": os.environ.get("AGENT_PC_URL", "http://localhost:9001/agent_pc"),
        "agent_sc": os.environ.get("AGENT_SC_URL", "http://localhost:9001/agent_sc"),
        "agent_pl": os.environ.get("AGENT_PL_URL", "http://localhost:9001/agent_pl"),
    }

