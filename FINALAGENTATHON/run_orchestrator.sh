#!/bin/bash
# run_orchestrator.sh

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Activate virtual environment
if [ -d "$DIR/venv" ]; then
    source "$DIR/venv/bin/activate"
else
    echo "Virtual environment not found. Running setup..."
    "$DIR/setup_env.sh"
    source "$DIR/venv/bin/activate"
fi

# Set PYTHONPATH
export PYTHONPATH="$DIR"

# Load environment variables from .env if it exists
if [ -f "$DIR/.env" ]; then
    export $(grep -v '^#' "$DIR/.env" | xargs)
fi

# Set API key if not already set (replace with your actual key)
if [ -z "$GOOGLE_API_KEY" ]; then
    export GOOGLE_API_KEY="your-actual-google-api-key-here"
fi

# Run orchestrator
echo "Starting Orchestrator..."
uvicorn core.orchestrator:app --host 0.0.0.0 --port 8000 --reload
