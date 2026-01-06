#!/bin/bash

# Start Pangea Backend on a specific port
# Usage: ./scripts/start-backend.sh [port]
# Default: 3001

PORT=${1:-3001}

echo "Starting Pangea Backend on port ${PORT}..."
echo ""

# Check if port is already in use
if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "⚠️  Port ${PORT} is already in use!"
  echo "   Please choose a different port or stop the process using port ${PORT}"
  exit 1
fi

# Start the backend
cd "$(dirname "$0")/.."
PORT=${PORT} npm run start:dev






