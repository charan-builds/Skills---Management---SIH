@echo off
title SIH Backend Server
echo ============================================
echo   SIH Skilling Platform - Backend Server
echo ============================================
echo.

REM -- Navigate to this script's directory --
cd /d "%~dp0"

REM -- Check Python is available --
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo         Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

REM -- Create virtual environment if it doesn't exist --
if not exist "venv\Scripts\activate.bat" (
    echo [SETUP] Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [SETUP] Virtual environment created.
    echo.
)

REM -- Activate virtual environment --
call venv\Scripts\activate.bat

REM -- Install / update requirements --
echo [SETUP] Installing/verifying Python dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install requirements.
    pause
    exit /b 1
)
echo [SETUP] Dependencies OK.
echo.

REM -- Set demo mode env var --
set ENABLE_DEMO_MODE=true

REM -- Start the backend server --
echo [START] Launching FastAPI backend on http://localhost:8000 ...
echo         API Docs available at http://localhost:8000/docs
echo         Press Ctrl+C to stop.
echo.
uvicorn app.main:app --reload --port 8000

pause
