#!/bin/bash
# Production startup script for ACIA Backend

echo "🚀 Starting ACIA Backend in production mode..."

# Set production environment
export ENVIRONMENT=production
export LOG_LEVEL=INFO

# Use PORT from environment (Railway/Render) or default to 8000
export PORT=${PORT:-8000}

# Ensure required environment variables are set
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️ WARNING: GOOGLE_API_KEY not set. Gemini functionality will be disabled."
fi

# Start the application
echo "📡 Starting server on port $PORT..."
exec python -m uvicorn core.orchestrator:app \
    --host 0.0.0.0 \
    --port $PORT \
    --workers 1 \
    --log-level info \
    --access-log
