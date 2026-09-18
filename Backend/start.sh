#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "===================================================="
echo " Starting Skilling Impact Intelligence Backend"
echo "===================================================="
echo ""

# 1. Check/Create Virtual Environment
if [ ! -f "venv/bin/activate" ]; then
    echo "[NOTICE] Python virtual environment (venv) not found."
    echo "Creating virtual environment in Backend/venv..."
    python3 -m venv venv || python -m venv venv || true
fi

if [ -f "venv/bin/activate" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# 2. Verify and install requirements before starting
echo ""
echo "Verifying Backend Python requirements..."
pip install -r requirements.txt || python -m pip install -r requirements.txt

echo ""
echo "Launching FastAPI Backend Server on http://localhost:8001..."
echo ""
uvicorn app.main:app --reload --port 8001 || python -m uvicorn app.main:app --reload --port 8001
