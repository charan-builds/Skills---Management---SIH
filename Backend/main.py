"""
Root ASGI application entrypoint.
Allows running:
    uvicorn main:app --reload
    uvicorn main:app --reload --port 8000
    uvicorn main:app --reload --port 8001
    python main.py
directly from the Backend directory.
"""

import sys
from pathlib import Path

# Ensure Backend root is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import FastAPI instance from app.main
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
