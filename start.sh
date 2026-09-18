#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "===================================================="
echo " Skilling Impact Intelligence — Full System Launcher"
echo "===================================================="
echo ""

echo "[1/2] Verifying Backend Python requirements..."
cd Backend
if [ ! -f "venv/bin/activate" ]; then
    echo "Creating virtual environment in Backend/venv..."
    python3 -m venv venv || python -m venv venv || true
fi
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi
pip install -r requirements.txt || python -m pip install -r requirements.txt
cd ..

echo ""
echo "[2/2] Verifying Frontend npm requirements..."
cd Frontend
if [ ! -d "node_modules" ]; then
    echo "Downloading Frontend node_modules..."
    npm install
else
    if ! npm ls --depth=0 >/dev/null 2>&1; then
        echo "Updating Frontend node_modules..."
        npm install
    else
        echo "[OK] Frontend requirements verified."
    fi
fi
cd ..

echo ""
echo "===================================================="
echo " Requirements verified! Starting Backend & Frontend..."
echo "===================================================="
echo ""

(cd Backend && ./start.sh) &
BACKEND_PID=$!

(cd Frontend && ./start.sh) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
