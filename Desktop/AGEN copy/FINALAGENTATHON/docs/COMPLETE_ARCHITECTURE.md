# Complete Orchestrator Architecture

## Full System Flow

```
Orchestrator API (FastAPI / Cloud Run)
   |
   |---> Context Builder
   |       ├─ Cached facts (SQLite, long-term storage)
   |       ├─ Historical signals (time-series data)
   |       └─ Recent outputs (TTL-based cache)
   |
   |---> A2A Agent Router
           |
           ├─ Pricing Change Agent
           ├─ Product Launch Agent
           ├─ Sentiment Agent
           ├─ Company Overview Agent
           └─ Revenue / Turnover Agent
                   |
                   v
            Gemini 1.5 Pro (JSON-mode, strict schema)
                   |
                   v
          Structured Outputs (Validated JSON)
                   |
                   v
          Managed Storage + Retrieval
```

## Component Details

### 1. Orchestrator API (`orchestrator.py`)
- FastAPI application serving REST endpoints
- Coordinates all components
- Handles request routing and response aggregation

### 2. Context Builder (`context_builder.py`)
- Aggregates data from multiple sources
- **Cached Facts**: Long-term storage with confidence scores
- **Historical Signals**: Time-series data for trend analysis
- **Recent Outputs**: Short-term cache with TTL

### 3. A2A Agent Router (`a2a_router.py`)
- Intelligent routing to specialized agents
- Agent type enumeration
- Intent-based routing (natural language)
- Parallel agent invocation

### 4. Agent Service (`agent_service.py`)
Unified service combining:
- **Gemini 1.5 Pro Client** (`gemini_client.py`)
  - Uses `gemini-1.5-pro` model
  - JSON-mode with `response_mime_type="application/json"`
  - Strict schema validation via `response_schema`
  - Retry logic for validation failures
  
- **Output Validator** (`output_validator.py`)
  - JSON Schema validation
  - Strict mode (no additional properties)
  - Required field checking
  - Optional error fixing
  
- **Managed Storage** (`managed_storage.py`)
  - Structured storage with metadata
  - Indexed retrieval for fast lookups
  - Schema registry
  - Automatic expiration and cleanup

## Data Flow

### Request Processing

```
1. Client Request
   POST /orchestrate
   {
     "entity": "Tata Motors",
     "agent_types": ["company_overview", "pricing_change"]
   }
   ↓
2. Context Builder retrieves:
   - Cached facts for "Tata Motors"
   - Historical signals (last 7 days)
   - Recent outputs
   ↓
3. A2A Agent Router routes to:
   - Company Overview Agent
   - Pricing Change Agent
   ↓
4. Agent Service processes each request:
   
   a) Gemini 1.5 Pro Generation:
      - Model: gemini-1.5-pro
      - JSON-mode enabled
      - Strict schema enforcement
      - Google Search tool enabled
      ↓
   b) Output Validation:
      - JSON Schema validation
      - Required fields check
      - Type validation
      - Enum value validation
      ↓
   c) Managed Storage:
      - Store with metadata
      - Index key fields
      - Set expiration
      - Tag for retrieval
   ↓
5. Results aggregated and enriched with context
   ↓
6. Response returned to client
```

## Gemini 1.5 Pro Configuration

### Model Settings
```python
model = "gemini-1.5-pro"
response_mime_type = "application/json"
response_schema = <JSON Schema>
temperature = 0.0  # Deterministic
```

### Schema Enforcement
- **Strict Mode**: `additionalProperties: false`
- **Type Validation**: Exact type matching
- **Enum Validation**: Only allowed values
- **Required Fields**: All must be present

### Example Schema
```json
{
  "type": "object",
  "properties": {
    "company_name": {"type": "string"},
    "industry": {"type": "string"},
    "confidence_score": {"type": "number", "minimum": 0, "maximum": 1}
  },
  "required": ["company_name", "industry"],
  "additionalProperties": false
}
```

## Managed Storage Features

### Storage Types
- **FACT**: Long-term facts (company profiles, financial data)
- **SIGNAL**: Time-series signals (price changes, sentiment)
- **OUTPUT**: General agent outputs
- **SCHEMA**: Schema definitions

### Indexing
- Automatic indexing of key fields
- Fast retrieval by entity, agent_type, or indexed fields
- Support for complex queries

### Metadata
- Entity name
- Agent type
- Confidence score
- Timestamps (created, updated, expires)
- Tags for categorization
- Source tracking

## API Endpoints

### Core Orchestration
- `POST /orchestrate` - Main orchestration endpoint
- `GET /context/{entity}` - Get context for entity
- `GET /health` - Health check

### Router Endpoints
- `GET /router/agents` - List available agent types
- `POST /router/route` - Route to specific agent type
- `POST /router/route-by-intent` - Route by natural language

### Agent Service
- `POST /agent-service/process` - Process through full pipeline
- `GET /managed-storage/{entity}` - Retrieve from managed storage

### Data Endpoints
- `GET /facts/{entity}` - Get cached facts
- `GET /signals/{entity}` - Get historical signals
- `GET /outputs/{entity}` - Get recent outputs

## Configuration

### Environment Variables
```bash
# Orchestrator
ORCHESTRATOR_PORT=8000
ORCHESTRATOR_DB=orchestrator_context.db

# Gemini
GOOGLE_API_KEY=your_api_key

# Managed Storage
MANAGED_STORAGE_DB=managed_storage.db

# Agent URLs
AGENT_AC_URL=http://localhost:9001
AGENT_AT_URL=http://localhost:9002
AGENT_PC_URL=http://localhost:9003
AGENT_SC_URL=http://localhost:9004
AGENT_PL_URL=http://localhost:9005
```

## Usage Example

```python
from agent_service import AgentService
import json

# Initialize service
service = AgentService()

# Define schema
schema = {
    "type": "object",
    "properties": {
        "company_name": {"type": "string"},
        "industry": {"type": "string"},
        "confidence_score": {"type": "number"}
    },
    "required": ["company_name", "industry"],
    "additionalProperties": False
}

# Process request
result = service.process_agent_request(
    entity="Tata Motors",
    agent_type="company_overview",
    prompt="Provide a corporate profile",
    schema=schema,
    use_search=True,
    store_result=True
)

# Result includes:
# - Validated JSON data
# - Confidence score
# - Storage key
# - Validation status
```

## Benefits

1. **Strict Schema Validation**: Ensures data quality and consistency
2. **Managed Storage**: Fast retrieval with indexing
3. **Gemini 1.5 Pro**: High-quality structured outputs
4. **Context Awareness**: Enriched responses with historical data
5. **Scalability**: Cloud Run compatible, stateless design
6. **Reliability**: Retry logic, error handling, validation

