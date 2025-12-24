"""
Unified Agent Service
Integrates Gemini 1.5 Pro, Output Validator, and Managed Storage
"""
from typing import Dict, Any, Optional
from ..core.gemini_client import GeminiClient
from ..core.output_validator import OutputValidator
from ..core.managed_storage import ManagedStorage, StorageType
from datetime import datetime

class AgentService:
    """
    Unified service that combines:
    - Gemini 1.5 Pro (JSON-mode, strict schema)
    - Structured Output Validation
    - Managed Storage + Retrieval
    """
    
    def __init__(
        self,
        gemini_api_key: Optional[str] = None,
        storage_db_path: str = "managed_storage.db"
    ):
        self.gemini = GeminiClient(api_key=gemini_api_key)
        self.validator = OutputValidator()
        self.storage = ManagedStorage(db_path=storage_db_path)
    
    def process_agent_request(
        self,
        entity: str,
        agent_type: str,
        prompt: str,
        schema: Dict[str, Any],
        system_instruction: Optional[str] = None,
        use_search: bool = True,
        store_result: bool = True,
        validate_output: bool = True,
        min_confidence: float = 0.0,
        expires_in_hours: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Process an agent request with full pipeline:
        1. Generate with Gemini 1.5 Pro (strict schema)
        2. Validate structured output
        3. Store in managed storage
        
        Args:
            entity: Entity name
            agent_type: Type of agent
            prompt: User prompt
            schema: JSON Schema for validation
            system_instruction: Optional system instruction
            use_search: Enable Google Search
            store_result: Store result in managed storage
            validate_output: Validate output against schema
            min_confidence: Minimum confidence to store
            expires_in_hours: Expiration time
        
        Returns:
            Processed result with metadata
        """
        # Step 1: Generate structured output with Gemini 1.5 Pro
        result = self.gemini.generate_structured_output(
            prompt=prompt,
            schema=schema,
            system_instruction=system_instruction,
            use_search=use_search,
            temperature=0.0  # Deterministic for structured outputs
        )
        
        # Check for errors
        if "error" in result:
            return {
                "success": False,
                "error": result["error"],
                "entity": entity,
                "agent_type": agent_type,
                "timestamp": datetime.now().isoformat()
            }
        
        # Step 2: Validate structured output
        if validate_output:
            is_valid, error_msg, validated_data = self.validator.validate_json_schema(
                data=result,
                schema=schema,
                strict=True
            )
            
            if not is_valid:
                return {
                    "success": False,
                    "error": f"Validation failed: {error_msg}",
                    "entity": entity,
                    "agent_type": agent_type,
                    "invalid_data": result,
                    "timestamp": datetime.now().isoformat()
                }
            
            result = validated_data
        
        # Extract confidence score
        confidence_score = result.get("confidence_score", 0.0)
        
        # Step 3: Store in managed storage (if confidence meets threshold)
        storage_key = None
        if store_result and confidence_score >= min_confidence:
            # Determine storage type based on agent type
            storage_type_map = {
                "company_overview": StorageType.FACT,
                "revenue_turnover": StorageType.FACT,
                "pricing_change": StorageType.SIGNAL,
                "product_launch": StorageType.FACT,
                "sentiment": StorageType.SIGNAL
            }
            storage_type = storage_type_map.get(agent_type, StorageType.OUTPUT)
            
            # Index key fields for fast retrieval
            index_fields = ["company_name", "company", "fiscal_year", "product_name"]
            
            storage_key = self.storage.store(
                entity=entity,
                agent_type=agent_type,
                data=result,
                storage_type=storage_type,
                schema_version=result.get("schema_version", "1.0"),
                confidence_score=confidence_score,
                expires_in_hours=expires_in_hours,
                tags=[agent_type, entity.lower()],
                source="gemini_1.5_pro",
                index_fields=index_fields
            )
        
        return {
            "success": True,
            "entity": entity,
            "agent_type": agent_type,
            "data": result,
            "confidence_score": confidence_score,
            "storage_key": storage_key,
            "validated": validate_output,
            "timestamp": datetime.now().isoformat()
        }
    
    def retrieve_agent_output(
        self,
        entity: str,
        agent_type: str,
        use_cache: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve latest agent output from managed storage
        
        Args:
            entity: Entity name
            agent_type: Agent type
            use_cache: Return cached result if available
        
        Returns:
            Stored output or None
        """
        if not use_cache:
            return None
        
        result = self.storage.get_latest(
            entity=entity,
            agent_type=agent_type
        )
        
        return result
    
    def process_with_schema_string(
        self,
        entity: str,
        agent_type: str,
        prompt: str,
        schema_str: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Process request with schema as string
        
        Args:
            entity: Entity name
            agent_type: Agent type
            prompt: User prompt
            schema_str: Schema as JSON string
            **kwargs: Additional arguments for process_agent_request
        
        Returns:
            Processed result
        """
        import json
        try:
            schema = json.loads(schema_str)
        except:
            schema = eval(schema_str) if isinstance(schema_str, str) else schema_str
        
        return self.process_agent_request(
            entity=entity,
            agent_type=agent_type,
            prompt=prompt,
            schema=schema,
            **kwargs
        )

