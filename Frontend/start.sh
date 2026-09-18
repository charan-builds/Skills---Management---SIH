#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "===================================================="
echo " Starting Skilling Impact Intelligence Frontend"
echo "===================================================="
echo ""

echo "Verifying Frontend npm dependencies..."
if [ ! -d "node_modules" ]; then
    echo "[NOTICE] node_modules folder not found."
    echo "Downloading and installing Frontend dependencies..."
    npm install
else
    if ! npm ls --depth=0 >/dev/null 2>&1; then
        echo "[NOTICE] Missing or incomplete npm dependencies detected."
        echo "Downloading and updating Frontend dependencies..."
        npm install
    else
        echo "[OK] All Frontend npm requirements verified."
    fi
fi

echo ""
echo "Launching Vite Development Server..."
echo ""
npm run dev
