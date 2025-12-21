# Orchestrator API

FastAPI-based orchestrator that coordinates A2A agents with intelligent context building.

## Architecture

```
Orchestrator API (FastAPI / Cloud Run)
   |
   |---> Context Builder
   |       ├─ Cached facts (long-term storage)
   |       ├─ Historical signals (time-series)
   |       └─ Recent outputs (short-term cache)
   |
   |---> A2A Agent Router
           |
           ├─ Pricing Change Agent (agent_pc, port 9003)
           ├─ Product Launch Agent (agent_sc/agent_pl, ports 9004/9005)
           ├─ Sentiment Agent (to be implemented)
           ├─ Company Overview Agent (agent_ac, port 9001)
           └─ Revenue / Turnover Agent (agent_at, port 9002)
```

## Features

- **Context Building**: Aggregates cached facts, historical signals, and recent outputs
- **A2A Agent Router**: Intelligent routing to specialized agents based on agent type or intent
- **Agent Orchestration**: Coordinates multiple A2A agents with context-aware routing
- **Gemini 1.5 Pro Integration**: Uses Gemini 1.5 Pro with JSON-mode and strict schema validation
- **Structured Output Validation**: Validates all outputs against JSON Schema with strict mode
- **Managed Storage**: Indexed storage and retrieval system for agent outputs
- **Intelligent Caching**: Stores facts with confidence scores and expiration
- **Signal Tracking**: Time-series data for historical analysis
- **Output Management**: TTL-based caching of recent agent outputs
- **Intent-Based Routing**: Natural language intent detection for automatic agent selection

## Installation

```bash
pip install -r requirements.txt
```

## Configuration

Set environment variables:

```bash
# Orchestrator settings
export ORCHESTRATOR_PORT=8000
export ORCHESTRATOR_DB=orchestrator_context.db

# Agent URLs (optional, defaults to localhost)
export AGENT_AC_URL=http://localhost:9001
export AGENT_AT_URL=http://localhost:9002
export AGENT_PC_URL=http://localhost:9003

# Context settings
export SIGNAL_HOURS_BACK=168  # 7 days
export OUTPUT_TTL_SECONDS=3600  # 1 hour
export FACT_EXPIRY_HOURS=720  # 30 days
export CONFIDENCE_THRESHOLD=0.5
```

## Running

```bash
# Start orchestrator
python orchestrator.py

# Or with uvicorn
uvicorn orchestrator:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST `/orchestrate`
Main orchestration endpoint. Invokes agents via router and builds context.

**Request (using agent types - recommended):**
```json
{
  "entity": "Tata Motors",
  "agent_types": ["company_overview", "revenue_turnover", "pricing_change"],
  "include_context": true,
  "store_outputs": true,
  "extract_facts": true,
  "use_router": true
}
```

**Request (legacy - direct agent names):**
```json
{
  "entity": "Tata Motors",
  "agents": ["agent_ac", "agent_at"],
  "include_context": true,
  "store_outputs": true,
  "extract_facts": true,
  "use_router": false
}
```

**Available Agent Types:**
- `company_overview` - Company Overview Agent
- `revenue_turnover` - Revenue/Turnover Agent
- `pricing_change` - Pricing Change Agent
- `product_launch` - Product Launch Agent
- `sentiment` - Sentiment Agent (to be implemented)

**Response:**
```json
{
  "request_id": "uuid",
  "entity": "Tata Motors",
  "context": {
    "cached_facts": [...],
    "historical_signals": [...],
    "recent_outputs": [...]
  },
  "agent_results": {
    "agent_ac": {...},
    "agent_at": {...}
  }
}
```

### GET `/context/{entity}`
Get context for an entity.

**Query Parameters:**
- `include_facts` (bool): Include cached facts
- `include_signals` (bool): Include historical signals
- `include_outputs` (bool): Include recent outputs
- `signal_hours_back` (int): Hours back for signals (default: 168)

### GET `/agents`
List all registered agents.

### GET `/facts/{entity}`
Get cached facts for an entity.

### GET `/signals/{entity}`
Get historical signals for an entity.

### GET `/outputs/{entity}`
Get recent outputs for an entity.

### POST `/invoke-agent`
Invoke a specific agent directly (legacy endpoint).

### GET `/router/agents`
List all available agent types via router.

### POST `/router/route`
Route to a specific agent type via router.

**Request:**
```json
{
  "entity": "Tata Motors",
  "agent_type": "pricing_change",
  "message": "Check recent price changes"
}
```

### POST `/router/route-by-intent`
Route based on natural language intent.

**Request:**
```json
{
  "entity": "Tata Motors",
  "intent": "What are the recent price changes for their products?"
}
```

## Usage Examples

### Python

```python
import httpx

# Orchestrate analysis
response = httpx.post("http://localhost:8000/orchestrate", json={
    "entity": "Tata Motors",
    "agents": ["agent_ac", "agent_at"],
    "include_context": True
})
print(response.json())

# Get context
context = httpx.get("http://localhost:8000/context/Tata%20Motors")
print(context.json())
```

### cURL

```bash
# Orchestrate
curl -X POST http://localhost:8000/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "entity": "Tata Motors",
    "agents": ["agent_ac", "agent_at"]
  }'

# Get context
curl http://localhost:8000/context/Tata%20Motors

# List agents
curl http://localhost:8000/agents
```

## Cloud Run Deployment

The orchestrator is Cloud Run compatible. Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "orchestrator:app", "--host", "0.0.0.0", "--port", "8080"]
```

Deploy:
```bash
gcloud run deploy orchestrator \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars ORCHESTRATOR_PORT=8080
```

## Storage

The orchestrator uses SQLite by default. For production, consider:
- PostgreSQL for multi-instance deployments
- Redis for distributed caching
- Cloud SQL for managed database

Modify `storage.py` to use different backends.

