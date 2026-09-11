@echo off
title SIH Platform - Full Setup
echo ============================================
echo   SIH Skilling Platform - Full Installer
echo ============================================
echo.
echo This will install ALL dependencies for both
echo the Backend (Python) and Frontend (Node.js).
echo.

REM -- Navigate to root directory --
cd /d "%~dp0"

REM ==========================================
REM  BACKEND SETUP
REM ==========================================
echo [BACKEND] Setting up Python environment...
echo.

cd Backend

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org and re-run.
    pause
    exit /b 1
)

if not exist "venv\Scripts\activate.bat" (
    echo [BACKEND] Creating virtual environment...
    python -m venv venv
    echo [BACKEND] Virtual environment created.
)

call venv\Scripts\activate.bat

echo [BACKEND] Installing Python packages (this may take a minute)...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Backend pip install failed!
    pause
    exit /b 1
)
echo [BACKEND] Python dependencies installed successfully!
echo.

cd ..

REM ==========================================
REM  FRONTEND SETUP
REM ==========================================
echo [FRONTEND] Setting up Node.js environment...
echo.

cd Frontend

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org and re-run.
    pause
    exit /b 1
)

echo [FRONTEND] Running npm install (this may take a minute)...
npm install
if errorlevel 1 (
    echo [ERROR] Frontend npm install failed!
    pause
    exit /b 1
)
echo [FRONTEND] Node.js dependencies installed successfully!
echo.

cd ..

REM ==========================================
REM  DONE
REM ==========================================
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo To start the application:
echo   1. Double-click  Backend\start.bat   (starts API on port 8001)
echo   2. Double-click  Frontend\start.bat  (starts UI  on port 5173)
echo.
echo Demo login credentials:
echo   Admin    : demo.admin@sih.gov.in  /  admin123
echo   Trainee  : ID T102, OTP 123456
echo   Employer : EMP-DEMO-001 / demo123
echo.
pause
