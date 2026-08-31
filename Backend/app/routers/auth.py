from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest

from app.firebase.auth_repo import AuthRepository
import uuid

import base64
import json

router = APIRouter(prefix="/auth", tags=["auth"])

def create_mock_jwt(payload: dict) -> str:
    # Extremely simple base64 mock JWT for MVP. DO NOT USE IN PRODUCTION.
    header = base64.b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).decode()
    payload_b64 = base64.b64encode(json.dumps(payload).encode()).decode()
    return f"{header}.{payload_b64}."

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    
    if req.role == "admin":
        user = AuthRepository.authenticate_admin(req.email, req.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        token = create_mock_jwt({"role": "admin", "user_id": user["id"], "name": user["name"]})
        return LoginResponse(token=token, role="admin", user_id=user["id"], name=user["name"])
        
    elif req.role == "employer":
        user = AuthRepository.authenticate_employer(req.organization_id, req.email, req.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid employer credentials")
        token = create_mock_jwt({"role": "employer", "user_id": user["id"], "name": user["name"], "organization_id": user["organization_id"]})
        return LoginResponse(token=token, role="employer", user_id=user["id"], name=user["name"], organization_id=user["organization_id"])
        
    elif req.role == "trainee":
        user = AuthRepository.authenticate_trainee(req.trainee_id, req.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid trainee credentials")
        token = create_mock_jwt({"role": "trainee", "user_id": user["id"], "name": user["name"]})
        return LoginResponse(token=token, role="trainee", user_id=user["id"], name=user["name"])
        
    raise HTTPException(status_code=400, detail="Invalid role specified")

@router.post("/register")
def register_trainee(req: RegisterRequest):
    try:
        user = AuthRepository.register_trainee(req.trainee_id, req.email, req.name)
        return {"status": "success", "message": "Trainee registered successfully", "user": user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

