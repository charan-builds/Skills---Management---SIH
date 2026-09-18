@echo off
setlocal
echo ====================================================
echo  Starting Skilling Impact Intelligence Frontend
echo ====================================================
echo.

cd /d "%~dp0"

echo Verifying Frontend npm dependencies...
if not exist "node_modules\" (
    echo [NOTICE] node_modules folder not found.
    echo Downloading and installing Frontend dependencies...
    call npm install
) else (
    call npm ls --depth=0 >nul 2>&1
    if errorlevel 1 (
        echo [NOTICE] Missing or incomplete npm dependencies detected.
        echo Downloading and updating Frontend dependencies...
        call npm install
    ) else (
        echo [OK] All Frontend npm requirements verified.
    )
)

echo.
echo Launching Vite Development Server...
echo.
call npm run dev
pause
