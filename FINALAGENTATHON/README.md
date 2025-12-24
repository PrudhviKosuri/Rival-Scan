# ACIA Backend - AI Orchestrator

🚀 **FastAPI-based orchestrator service that coordinates AI analysis tasks using Google Gemini AI.**

## 🏗️ Architecture

### Core Components

- **`core/orchestrator.py`** - Main FastAPI application with API endpoints
- **`core/config.py`** - Configuration management and environment variables
- **`core/gemini_client.py`** - Google Gemini AI integration client
- **`core/storage.py`** - Database operations and data persistence
- **`core/context_builder.py`** - Context management for analysis jobs
- **`core/managed_storage.py`** - Advanced storage management with TTL
- **`agents/agent_service.py`** - Agent orchestration and coordination

### Key Features

- ✅ **RESTful API** with FastAPI and automatic OpenAPI documentation
- ✅ **Background Job Processing** for scalable analysis tasks
- ✅ **Google Gemini AI Integration** for intelligent content generation
- ✅ **SQLite Database** for job management and result storage
- ✅ **CORS Support** for cross-origin requests from frontend
- ✅ **Automatic Model Detection** to find working Gemini models
- ✅ **Comprehensive Logging** for monitoring and debugging
- ✅ **Error Handling** with graceful fallbacks and recovery

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env and add your Google API key
```

### 3. Start the Server

**Development:**
```bash
python -m uvicorn core.orchestrator:app --host 0.0.0.0 --port 8000 --reload
```

**Production:**
```bash
gunicorn core.orchestrator:app --host 0.0.0.0 --port 8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

## 📚 API Endpoints

### Analysis Management
- `POST /api/analysis/create` - Create new analysis job
- `GET /api/jobs/{job_id}/status` - Get job status and progress
- `GET /api/jobs` - List all jobs

### Analysis Results
- `GET /api/analysis/{job_id}/overview` - Company overview data
- `GET /api/analysis/{job_id}/offerings` - Product launches and pricing
- `GET /api/analysis/{job_id}/market-signals` - Market trends and signals
- `GET /api/analysis/{job_id}/sentiment` - Brand sentiment analysis
- `GET /api/analysis/{job_id}/documentation` - Generated reports

### Utility
- `GET /health` - Service health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## 🔧 Configuration

### Environment Variables

```env
# Required
GOOGLE_API_KEY=your_google_api_key_here

# Optional
ORCHESTRATOR_PORT=8000
ORCHESTRATOR_HOST=0.0.0.0
ORCHESTRATOR_DB=orchestrator_context.db
MANAGED_STORAGE_DB=managed_storage.db
```

### Gemini AI Configuration

The system automatically detects available Gemini models and uses the first working one. Supported models:
- `models/gemini-2.5-flash` (latest)
- `models/gemini-1.5-pro`
- `models/gemini-1.5-flash`

## 🛠️ Development

### Project Structure

```
FINALAGENTATHON/
├── core/
│   ├── orchestrator.py      # Main FastAPI app
│   ├── config.py           # Configuration
│   ├── gemini_client.py    # Gemini AI client
│   ├── storage.py          # Database operations
│   ├── context_builder.py  # Context management
│   ├── managed_storage.py  # Advanced storage
│   ├── a2a_client.py       # Agent-to-agent client
│   ├── a2a_router.py       # Agent routing
│   └── output_validator.py # Output validation
├── agents/
│   ├── agent_service.py    # Agent orchestration
│   └── unified_agent_server.py # Unified agent server
├── docs/                   # Documentation
├── examples/              # Example usage
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
└── README.md             # This file
```

### Adding New Analysis Types

1. **Create analysis function** in `orchestrator.py`
2. **Add API endpoint** for the new analysis type
3. **Update job processing** in `run_analysis_job()`
4. **Add response model** using Pydantic
5. **Update frontend** to consume the new endpoint

### Testing

```bash
# Run tests
python -m pytest tests/

# Test API endpoints
curl http://localhost:8000/health
curl -X POST "http://localhost:8000/api/analysis/create" \
  -H "Content-Type: application/json" \
  -d '{"domain": "www.example.com", "competitor": "Example Inc"}'
```

### Logging

The application uses Python's built-in logging with different levels:
- `INFO` - General operation information
- `DEBUG` - Detailed debugging information  
- `WARNING` - Non-critical issues
- `ERROR` - Error conditions that need attention

## 🚢 Deployment

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "core.orchestrator:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Considerations

- **Use Gunicorn** with multiple workers for better performance
- **Set up reverse proxy** (nginx) for SSL and load balancing
- **Configure monitoring** and health checks
- **Set up log aggregation** for distributed deployments
- **Use environment-specific configs** for different stages

## 📊 Monitoring

### Health Checks

The `/health` endpoint provides service status and can be used for:
- Load balancer health checks
- Container orchestration health probes
- Monitoring system integration

### Logs

Key log events to monitor:
- Job creation and completion
- Gemini API call success/failure
- Database operations
- Error conditions and exceptions

## 🤝 Contributing

1. Follow **PEP 8** Python style guidelines
2. Add **type hints** for all function parameters and returns
3. Include **docstrings** for all public functions and classes
4. Write **tests** for new features
5. Update **API documentation** when adding endpoints

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Part of the ACIA AI-Powered Business Intelligence Platform**
