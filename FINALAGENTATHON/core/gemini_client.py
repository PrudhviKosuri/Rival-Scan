"""
Gemini 1.5 Pro Client with JSON-mode and Strict Schema Validation
"""
import os
import json
from typing import Dict, Any, Optional, List
from google.genai import Client, types
from pydantic import BaseModel, ValidationError
import jsonschema

class GeminiClient:
    """Client for Gemini 1.5 Pro with strict JSON schema validation"""
    
    def __init__(self, api_key: Optional[str] = None):
        # User provided key fallback (no hardcoded keys)
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            print("⚠️ WARNING: GOOGLE_API_KEY not found. Gemini calls will fail.")
        # self.client is initialized lazily or with None if key is missing
        if self.api_key:
            self.client = Client(api_key=self.api_key)
        else:
            self.client = None
        # Prefer modern model names; will fall back dynamically
        self.model_candidates: List[str] = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-pro",
            "gemini-flash",
        ]
    
    def _convert_schema_to_json_schema(self, schema_str: str) -> Dict[str, Any]:
        """
        Convert simple schema string to JSON Schema format for strict validation
        
        Args:
            schema_str: Simple schema description string
        
        Returns:
            JSON Schema dict
        """
        # Parse the schema string to extract structure
        # This is a simplified parser - in production, use a proper schema parser
        try:
            # Try to parse as JSON first
            schema_dict = json.loads(schema_str)
            return self._enhance_json_schema(schema_dict)
        except:
            # If not JSON, parse the string format
            return self._parse_schema_string(schema_str)
    
    def _enhance_json_schema(self, schema_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance a basic schema dict with JSON Schema validation rules"""
        json_schema = {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False  # Strict mode - no extra fields
        }
        
        for key, value in schema_dict.items():
            if key == "schema_version":
                continue
            
            prop_schema = {}
            
            if isinstance(value, str):
                if "|" in value:
                    # Enum type (e.g., "leader | challenger | niche")
                    prop_schema = {
                        "type": "string",
                        "enum": [v.strip() for v in value.split("|")]
                    }
                else:
                    prop_schema = {"type": "string"}
            elif isinstance(value, int):
                prop_schema = {"type": "integer"}
            elif isinstance(value, float):
                prop_schema = {"type": "number"}
            elif isinstance(value, bool):
                prop_schema = {"type": "boolean"}
            elif isinstance(value, list):
                if value and isinstance(value[0], str):
                    prop_schema = {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                else:
                    prop_schema = {"type": "array"}
            elif isinstance(value, dict):
                prop_schema = {
                    "type": "object",
                    "properties": self._enhance_json_schema(value).get("properties", {}),
                    "additionalProperties": False
                }
            elif value is None:
                prop_schema = {"type": ["string", "null"]}
            
            json_schema["properties"][key] = prop_schema
            json_schema["required"].append(key)
        
        return json_schema
    
    def _parse_schema_string(self, schema_str: str) -> Dict[str, Any]:
        """Parse schema from string format (fallback)"""
        # Basic implementation - can be enhanced
        return {
            "type": "object",
            "additionalProperties": False
        }
    
    def generate_structured_output(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_instruction: Optional[str] = None,
        use_search: bool = True,
        temperature: float = 0.0,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Generate structured output using Gemini 1.5 Pro with strict schema validation
        
        Args:
            prompt: User prompt
            schema: JSON Schema dict for validation
            system_instruction: Optional system instruction
            use_search: Enable Google Search tool
            temperature: Temperature setting (0.0 for deterministic)
            max_retries: Maximum retry attempts for validation failures
        
        Returns:
            Validated JSON output matching schema
        """
        # Convert schema to JSON Schema format
        json_schema = self._enhance_json_schema(schema) if isinstance(schema, dict) else schema
        
        # Build system instruction with schema
        full_system_instruction = system_instruction or ""
        full_system_instruction += (
            f"\n\nCRITICAL: You MUST return ONLY valid JSON that strictly matches this JSON Schema:\n"
            f"{json.dumps(json_schema, indent=2)}\n\n"
            f"Rules:\n"
            f"1. Return ONLY valid JSON, no markdown, no code blocks\n"
            f"2. All required fields must be present\n"
            f"3. No additional properties beyond the schema\n"
            f"4. Enum values must match exactly\n"
            f"5. Types must match exactly (string, number, integer, boolean, array, object)\n"
        )
        
        tools = []
        if use_search:
            # Tools support varies across APIs; include only in generate_content path
            tools.append(types.Tool(google_search={}))
        
        # Retry loop for validation
        if not self.client:
             if self.api_key:
                 self.client = Client(api_key=self.api_key)
             else:
                 return {"error": "GOOGLE_API_KEY not configured"}

        for attempt in range(max_retries):
            try:
                response_text = None
                last_error = None
                for model_name in self.model_candidates:
                    try:
                        if hasattr(self.client, "responses"):
                            resp = self.client.responses.generate(
                                model=model_name,
                                system_instruction=full_system_instruction,
                                input=prompt,
                                response_schema=json_schema,
                                temperature=temperature,
                            )
                            response_text = getattr(resp, "output_text", None) or getattr(resp, "text", None)
                        else:
                            resp = self.client.models.generate_content(
                                model=model_name,
                                contents=[prompt],
                                config=types.GenerateContentConfig(
                                    system_instruction=full_system_instruction,
                                    response_mime_type="application/json",
                                    temperature=temperature,
                                    response_schema=json_schema,
                                ),
                            )
                            response_text = resp.text
                        if response_text:
                            break
                    except Exception as e_inner:
                        last_error = e_inner
                        continue
                
                if not response_text:
                    raise Exception(f"All model candidates failed: {last_error}")
                
                rt = response_text.strip()
                if rt.startswith("```json"):
                    rt = rt[7:]
                if rt.startswith("```"):
                    rt = rt[3:]
                if rt.endswith("```"):
                    rt = rt[:-3]
                rt = rt.strip()
                
                output_data = json.loads(rt)
                jsonschema.validate(instance=output_data, schema=json_schema)
                return output_data
                
            except json.JSONDecodeError as e:
                if attempt < max_retries - 1:
                    continue
                return {
                    "error": f"JSON parsing failed: {str(e)}",
                    "raw_response": response_text if 'response_text' in locals() else None
                }
            except jsonschema.ValidationError as e:
                if attempt < max_retries - 1:
                    continue
                return {
                    "error": f"Schema validation failed: {str(e)}",
                    "invalid_data": output_data if 'output_data' in locals() else None
                }
            except Exception as e:
                if attempt < max_retries - 1:
                    continue
                return {
                    "error": f"Generation failed: {str(e)}"
                }
        
        return {"error": "Max retries exceeded"}
    
    def generate_with_schema_string(
        self,
        prompt: str,
        schema_str: str,
        system_instruction: Optional[str] = None,
        use_search: bool = True,
        temperature: float = 0.0
    ) -> Dict[str, Any]:
        """
        Generate structured output from schema string
        
        Args:
            prompt: User prompt
            schema_str: Schema as string (will be parsed)
            system_instruction: Optional system instruction
            use_search: Enable Google Search tool
            temperature: Temperature setting
        
        Returns:
            Validated JSON output
        """
        try:
            schema_dict = json.loads(schema_str)
        except:
            # If not JSON, try to parse as dict literal
            schema_dict = eval(schema_str) if isinstance(schema_str, str) else schema_str
        
        return self.generate_structured_output(
            prompt=prompt,
            schema=schema_dict,
            system_instruction=system_instruction,
            use_search=use_search,
            temperature=temperature
        )

