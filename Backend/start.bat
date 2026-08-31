@echo off
echo Starting Skilling Impact Intelligence Backend...
echo.
call venv\Scripts\activate
uvicorn app.main:app --reload --port 8001
pause
