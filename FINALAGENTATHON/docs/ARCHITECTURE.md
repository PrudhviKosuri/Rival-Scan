# Orchestrator Architecture

## System Structure

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

## Complete Pipeline

```
1. Request → Orchestrator API
   ↓
2. Context Builder retrieves cached data
   ↓
3. A2A Agent Router routes to appropriate agent
   ↓
4. Agent Service processes request:
   ├─ Gemini 1.5 Pro generates structured output
   ├─ Output Validator validates against strict schema
   └─ Managed Storage stores validated output
   ↓
5. Results enriched with context
   ↓
6. Response returned
```

## Component Details

### 1. Orchestrator API (`orchestrator.py`)
- FastAPI application
- Main entry point for all requests
- Coordinates Context Builder and A2A Agent Router
- Provides RESTful API endpoints

### 2. Context Builder (`context_builder.py`)
- **Cached Facts**: Long-term storage of company facts with confidence scores
- **Historical Signals**: Time-series data for trend analysis
- **Recent Outputs**: Short-term cache of agent outputs (TTL-based)

### 3. Storage Layer (`storage.py`)
- SQLite database backend
- Tables: `cached_facts`, `historical_signals`, `recent_outputs`
- Automatic expiration and cleanup

### 4. A2A Agent Router (`a2a_router.py`)
- Intelligent routing to specialized agents
- Agent type enumeration
- Intent-based routing (natural language)
- Parallel agent invocation

### 5. A2A Client (`a2a_client.py`)
- HTTP client for A2A protocol
- Agent registry management
- Async communication with agent servers

## Request Flow

```
1. Client Request
   ↓
2. Orchestrator API receives request
   ↓
3. Context Builder retrieves:
   - Cached facts
   - Historical signals
   - Recent outputs
   ↓
4. A2A Agent Router determines:
   - Which agent types to invoke
   - Routes to appropriate agent servers
   ↓
5. Agents process request:
   - Company Overview Agent
   - Revenue/Turnover Agent
   - Pricing Change Agent
   - Product Launch Agent
   ↓
6. Results enriched with context
   ↓
7. Store outputs and extract facts (background)
   ↓
8. Return aggregated response
```

## Agent Mapping

| Agent Type | Agent Name | Port | Tool | Description |
|------------|------------|------|------|-------------|
| Company Overview | agent_ac | 9001 | company_profile | Company profile, industry, HQ, products |
| Revenue/Turnover | agent_at | 9002 | financial_analysis | Financial metrics, turnover, growth rates |
| Pricing Change | agent_pc | 9003 | price_changes | Recent price changes for products |
| Product Launch | agent_sc | 9004 | product_launches | New product launches (primary) |
| Product Launch | agent_pl | 9005 | product_launches | New product launches (fallback) |
| Sentiment | - | - | - | To be implemented |

## API Endpoints

### Core Endpoints
- `POST /orchestrate` - Main orchestration endpoint
- `GET /context/{entity}` - Get context for entity
- `GET /health` - Health check

### Router Endpoints
- `GET /router/agents` - List available agent types
- `POST /router/route` - Route to specific agent type
- `POST /router/route-by-intent` - Route by natural language intent

### Data Endpoints
- `GET /facts/{entity}` - Get cached facts
- `GET /signals/{entity}` - Get historical signals
- `GET /outputs/{entity}` - Get recent outputs

## Configuration

Environment variables:
- `ORCHESTRATOR_PORT` - API port (default: 8000)
- `ORCHESTRATOR_DB` - Database path
- `AGENT_AC_URL` - Company Overview Agent URL
- `AGENT_AT_URL` - Revenue/Turnover Agent URL
- `AGENT_PC_URL` - Pricing Change Agent URL
- `AGENT_SC_URL` - Product Launch Agent URL (primary)
- `AGENT_PL_URL` - Product Launch Agent URL (fallback)

## Deployment

### Local Development
```bash
python orchestrator.py
```

### Cloud Run
```bash
gcloud run deploy orchestrator \
  --source . \
  --platform managed \
  --region us-central1
```

## Data Flow Example

```python
# Request
POST /orchestrate
{
  "entity": "Tata Motors",
  "agent_types": ["company_overview", "pricing_change"]
}

# Flow:
1. Context Builder retrieves cached data for "Tata Motors"
2. Router routes to:
   - Company Overview Agent (agent_ac)
   - Pricing Change Agent (agent_pc)
3. Agents process in parallel
4. Results enriched with context
5. Facts extracted and stored
6. Response returned with aggregated results
```

