@echo off
title SIH Frontend Server
echo ============================================
echo   SIH Skilling Platform - Frontend Server
echo ============================================
echo.

REM -- Navigate to this script's directory --
cd /d "%~dp0"

REM -- Check Node.js is available --
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM -- Install node_modules if missing --
if not exist "node_modules" (
    echo [SETUP] node_modules not found. Running npm install...
    npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo [SETUP] npm install complete.
    echo.
)

REM -- Set demo mode env var --
set VITE_ENABLE_DEMO_MODE=true
set VITE_API_BASE=http://localhost:8000

REM -- Start the frontend dev server --
echo [START] Launching Vite frontend dev server...
echo         App will open at http://localhost:5173
echo         Press Ctrl+C to stop.
echo.
npx vite

pause
