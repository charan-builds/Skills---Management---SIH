import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.firebase.config import db
from app.auth.dependencies import get_admin_user, get_current_user
from app.core.config import BASE_DIR, settings

# Import Routers
from app.routers import programmes, trainees, employers, analytics, interventions, auth, skills, jobs, trainee_portal
from app.ai.api import router as ai_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Validate deployment-only requirements before accepting requests."""
    settings.validate_runtime_configuration(firebase_available=db is not None)
    yield


app = FastAPI(
    title="Skilling Impact Intelligence API",
    description="Backend API for tracking skilling outcomes and employment impact.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS to allow frontend communication
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
# A regex is opt-in because credentials + a broad origin regex can unintentionally
# authorize arbitrary preview domains. Set this only for domains you control.
allowed_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX") or None

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(programmes.router)
app.include_router(trainees.router)
app.include_router(auth.router)
app.include_router(auth.router, prefix="/api")  # Also support /api/auth prefix
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
def firebase_test(_current_user: dict = Depends(get_admin_user)):
    if settings.ENABLE_DEMO_MODE or db is None:
        return {
            "status": "demo_mode",
            "message": "Firebase writes are disabled in Demo Mode. Running with the local JSON data store."
        }
    try:
        test_ref = db.collection("system").document("test")
        test_ref.set({
            "message": "Firebase connection successful"
        })
        return {
            "status": "success",
            "message": "Data written to Firebase"
        }
    except Exception as e:
        logger.exception("Firebase connectivity check failed")
        return {
            "status": "error",
            "message": "Firebase connectivity check failed. Review server logs for details."
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
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Endpoint not found")
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

