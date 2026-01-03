#!/bin/bash

# Start OASIS API locally for testing
# Usage: ./scripts/start-oasis-api.sh [port]
# Default: 5003

PORT=${1:-5003}
# Get the absolute path to OASIS_CLEAN directory
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OASIS_API_DIR="${SCRIPT_DIR}/ONODE/NextGenSoftware.OASIS.API.ONODE.WebAPI"

echo "=========================================="
echo "Starting OASIS API"
echo "=========================================="
echo ""
echo "Port: ${PORT}"
echo "Directory: ${OASIS_API_DIR}"
echo ""

# Check if port is already in use
if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "⚠️  Port ${PORT} is already in use!"
  echo "   Process: $(lsof -Pi :${PORT} -sTCP:LISTEN | tail -1)"
  echo ""
  read -p "Kill existing process and start new one? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    kill -9 $(lsof -ti:${PORT}) 2>/dev/null
    sleep 2
  else
    echo "Exiting. Please choose a different port or stop the existing process."
    exit 1
  fi
fi

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
  echo "❌ .NET SDK not found!"
  echo "   Please install .NET 8 SDK: https://dotnet.microsoft.com/download"
  exit 1
fi

# Check if OASIS API directory exists
if [ ! -d "$OASIS_API_DIR" ]; then
  echo "❌ OASIS API directory not found: ${OASIS_API_DIR}"
  echo "   Please make sure you're running from the pangea-repo directory"
  exit 1
fi

# Navigate to OASIS API directory
cd "$OASIS_API_DIR"

echo "🔨 Building OASIS API..."
dotnet build --configuration Debug --verbosity quiet
if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "🚀 Starting OASIS API on http://localhost:${PORT}..."
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the API
dotnet run --urls "http://localhost:${PORT}"

