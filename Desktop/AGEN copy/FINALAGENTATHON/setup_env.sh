#!/bin/bash
# setup_env.sh

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Setting up development environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "$DIR/venv" ]; then
    echo "Creating virtual environment 'venv'..."
    python3 -m venv "$DIR/venv"
else
    echo "Virtual environment 'venv' already exists."
fi

# Install requirements
echo "Installing dependencies..."
"$DIR/venv/bin/pip" install -r "$DIR/requirements.txt"

echo "Setup complete. Run ./run_orchestrator.sh to start."
