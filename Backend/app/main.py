import os
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.firebase.config import db
from app.auth.dependencies import get_current_user
from app.core.config import BASE_DIR

# Import Routers
from app.routers import programmes, trainees, employers, analytics, interventions, auth, skills, jobs, trainee_portal
from app.ai.api import router as ai_router
app = FastAPI(
    title="Skilling Impact Intelligence API",
    description="Backend API for tracking skilling outcomes and employment impact.",
    version="1.0.0"
)

# Configure CORS to allow frontend communication
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*(\.vercel\.app|\.ngrok-free\.app|\.ngrok\.app|\.ngrok\.io)",  # Support Vercel & ngrok dynamic tunnels
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(programmes.router)
app.include_router(trainees.router)
app.include_router(auth.router)
app.include_router(employers.router)
app.include_router(analytics.router)
app.include_router(interventions.router)
app.include_router(skills.router)
app.include_router(jobs.router)
app.include_router(ai_router)
app.include_router(trainee_portal.router)

@app.get("/api/status")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "Skilling Impact Intelligence API is running"
    }

@app.get("/api/protected")
def protected_route(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "message": "You are authenticated",
        "user": {
            "uid": current_user.get("uid"),
            "email": current_user.get("email")
        }
    }

@app.get("/firebase-test")
def firebase_test():
    test_ref = db.collection("system").document("test")
    test_ref.set({
        "message": "Firebase connection successful"
    })
    return {
        "status": "success",
        "message": "Data written to Firebase"
    }


# Check for Frontend/dist in multiple possible locations
frontend_dist_candidates = [
    BASE_DIR.parent / "Frontend" / "dist",
    Path("/app/Frontend/dist"),
    Path.cwd() / "Frontend" / "dist",
    Path.cwd().parent / "Frontend" / "dist",
]

frontend_dist = None
for candidate in frontend_dist_candidates:
    if candidate.exists() and (candidate / "index.html").exists():
        frontend_dist = candidate
        break

if frontend_dist:
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes, auth routes, or swagger documentation
        if (
            full_path.startswith("api")
            or full_path.startswith("auth")
            or full_path in ["docs", "redoc", "openapi.json", "health", "firebase-test"]
        ):
            return None
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        index_file = frontend_dist / "index.html"
        return FileResponse(str(index_file))
else:
    @app.get("/")
    def root():
        return {
            "message": "Skilling Impact Intelligence API is running"
        }

