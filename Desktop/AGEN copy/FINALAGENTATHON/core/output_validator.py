"""
Structured Output Validator
Validates JSON outputs against strict schemas
"""
import json
from typing import Dict, Any, Optional, List, Tuple
import jsonschema
from jsonschema import validate, ValidationError
from pydantic import BaseModel, create_model, ValidationError as PydanticValidationError

class OutputValidator:
    """Validates structured outputs against schemas"""
    
    def __init__(self):
        self.validation_cache = {}
    
    def validate_json_schema(
        self,
        data: Dict[str, Any],
        schema: Dict[str, Any],
        strict: bool = True
    ) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Validate data against JSON Schema
        
        Args:
            data: Data to validate
            schema: JSON Schema dict
            strict: If True, use strict mode (no additional properties)
        
        Returns:
            Tuple of (is_valid, error_message, validated_data)
        """
        try:
            # Ensure strict mode
            if strict and "additionalProperties" not in schema:
                schema = schema.copy()
                schema["additionalProperties"] = False
            
            # Validate
            validate(instance=data, schema=schema)
            
            return True, None, data
            
        except ValidationError as e:
            return False, str(e), None
        except Exception as e:
            return False, f"Validation error: {str(e)}", None
    
    def validate_against_schema_string(
        self,
        data: Dict[str, Any],
        schema_str: str,
        strict: bool = True
    ) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Validate data against schema string
        
        Args:
            data: Data to validate
            schema_str: Schema as JSON string
            strict: Use strict mode
        
        Returns:
            Tuple of (is_valid, error_message, validated_data)
        """
        try:
            schema = json.loads(schema_str)
            return self.validate_json_schema(data, schema, strict)
        except json.JSONDecodeError as e:
            return False, f"Schema parsing error: {str(e)}", None
    
    def validate_and_fix(
        self,
        data: Dict[str, Any],
        schema: Dict[str, Any],
        fix_errors: bool = False
    ) -> Tuple[bool, Optional[str], Dict[str, Any]]:
        """
        Validate and optionally fix common errors
        
        Args:
            data: Data to validate
            schema: JSON Schema
            fix_errors: Attempt to fix common errors
        
        Returns:
            Tuple of (is_valid, error_message, fixed_data)
        """
        is_valid, error, validated_data = self.validate_json_schema(data, schema, strict=True)
        
        if is_valid:
            return True, None, validated_data
        
        if not fix_errors:
            return False, error, data
        
        # Attempt to fix common issues
        fixed_data = data.copy()
        
        # Remove additional properties if in strict mode
        if "additionalProperties" in schema and schema["additionalProperties"] is False:
            allowed_props = set(schema.get("properties", {}).keys())
            fixed_data = {k: v for k, v in fixed_data.items() if k in allowed_props}
        
        # Validate again
        is_valid, error, validated_data = self.validate_json_schema(fixed_data, schema, strict=True)
        
        return is_valid, error, validated_data if is_valid else fixed_data
    
    def check_required_fields(
        self,
        data: Dict[str, Any],
        schema: Dict[str, Any]
    ) -> Tuple[bool, List[str]]:
        """
        Check if all required fields are present
        
        Args:
            data: Data to check
            schema: JSON Schema
        
        Returns:
            Tuple of (all_present, missing_fields)
        """
        required = schema.get("required", [])
        missing = [field for field in required if field not in data]
        return len(missing) == 0, missing
    
    def get_schema_info(self, schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract information about a schema
        
        Args:
            schema: JSON Schema
        
        Returns:
            Schema information dict
        """
        properties = schema.get("properties", {})
        required = schema.get("required", [])
        
        return {
            "total_fields": len(properties),
            "required_fields": len(required),
            "optional_fields": len(properties) - len(required),
            "field_names": list(properties.keys()),
            "required_field_names": required,
            "strict_mode": schema.get("additionalProperties", True) is False
        }

