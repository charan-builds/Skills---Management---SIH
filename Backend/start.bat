@echo off
title SIH Backend Server (Port 8001)
echo ====================================================
echo  Starting Skilling Impact Intelligence Backend
echo ====================================================
echo.

cd /d "%~dp0"

if exist "venv\Scripts\activate.bat" call venv\Scripts\activate.bat

echo Verifying Backend Python requirements...
python -m pip install -r requirements.txt

echo.
echo Launching FastAPI Backend Server on http://localhost:8001...
echo.
python -m uvicorn app.main:app --reload --port 8001
pause
