#!/bin/bash
# Production startup script for backend

set -e

echo "🚀 Starting ACIA Backend in production mode..."

# Check required environment variables
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ ERROR: GOOGLE_API_KEY environment variable is required"
    exit 1
fi

# Set default values for deployment platforms
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-8000}
export ENVIRONMENT=${ENVIRONMENT:-production}

echo "📊 Configuration:"
echo "  - Host: $HOST"
echo "  - Port: $PORT"
echo "  - Environment: $ENVIRONMENT"
echo "  - Gemini API: $([ -n "$GOOGLE_API_KEY" ] && echo "✅ Configured" || echo "❌ Missing")"

# Start the application
echo "🎯 Starting FastAPI server..."
python -m uvicorn core.orchestrator:app --host $HOST --port $PORT --workers 1
