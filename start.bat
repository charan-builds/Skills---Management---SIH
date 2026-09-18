@echo off
title SIH Launcher
echo ====================================================
echo  Skilling Impact Intelligence — Full System Launcher
echo ====================================================
echo.

cd /d "%~dp0"

echo Starting Backend server...
start "SIH Backend Server" cmd /k "cd /d "%~dp0Backend" && start.bat"

echo Starting Frontend server...
cd /d "%~dp0Frontend"
call start.bat
