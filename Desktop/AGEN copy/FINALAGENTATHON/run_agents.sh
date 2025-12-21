#!/bin/bash
# run_agents.sh

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Activate virtual environment
if [ -d "$DIR/venv" ]; then
    source "$DIR/venv/bin/activate"
fi

# Set PYTHONPATH
export PYTHONPATH="$DIR"

# Run the Quad Agent Server
# This server hosts:
# - agent_ac (Company Profile) on port 9004 (or configured port)
# Note: config.py expects agents on:
# 9001 (AC), 9002 (AT), 9003 (PC), 9004 (SC)
# But `agentserv_sc.py` starts ONE server on 9004 by default (via A2A_PORT env)
# We need to make sure the Router can find them.
# Functional fix: We will run this single server on 9001 and map everything to it? 
# OR we need to update `agentserv_sc.py` to serve all tools on one port and update config to point to that one port.
# Let's check `agentserv_sc.py` again. It registers ALL tools on one server.
# So we should update `core/config.py` to point all agents to the SAME URL if possible, or run multiple instances.
# running on 9001
export A2A_PORT=9001
echo "Starting Unified Agent Server on port 9001..."
python agents/unified_agent_server.py
