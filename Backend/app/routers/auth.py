from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest
from app.firebase.auth_repo import AuthRepository
from app.auth.dependencies import get_admin_user, get_current_user
from app.auth.tokens import create_access_token
from app.firebase.repository import FirestoreRepository

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's authoritative identity and role."""
    role = current_user.get("role")
    user_id = current_user.get("user_id") or current_user.get("uid") or current_user.get("sub")
    name = current_user.get("name")
    
    response = {
        "status": "success",
        "user_id": user_id,
        "role": role,
        "name": name,
    }
    
    if role == "employer":
        org_id = current_user.get("organization_id")
        if org_id:
            response["organization_id"] = org_id
            employer_data = FirestoreRepository.get_employer(org_id)
            if employer_data:
                response["name"] = employer_data.get("name", name)
                
    elif role == "trainee":
        trainee_data = FirestoreRepository.get_trainee(user_id)
        if trainee_data:
            response["name"] = trainee_data.get("name", name)
            
    return response

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    if req.role == "admin":
        user = AuthRepository.authenticate_admin(req.email, req.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        token = create_access_token({"role": "admin", "user_id": user["id"], "name": user["name"]})
        return LoginResponse(token=token, role="admin", user_id=user["id"], name=user["name"])

    if req.role == "employer":
        user = AuthRepository.authenticate_employer(req.organization_id, req.email, req.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid employer credentials")
        token = create_access_token(
            {
                "role": "employer",
                "user_id": user["id"],
                "name": user["name"],
                "organization_id": user["organization_id"],
            }
        )
        return LoginResponse(token=token, role="employer", user_id=user["id"], name=user["name"], organization_id=user["organization_id"])

    if req.role == "trainee":
        user = AuthRepository.authenticate_trainee(req.trainee_id, req.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid trainee credentials")
        token = create_access_token({"role": "trainee", "user_id": user["id"], "name": user["name"]})
        return LoginResponse(token=token, role="trainee", user_id=user["id"], name=user["name"])

    raise HTTPException(status_code=400, detail="Invalid role specified")

@router.post("/register")
def register_trainee(req: RegisterRequest, _current_user: dict = Depends(get_admin_user)):
    try:
        user = AuthRepository.register_trainee(req.trainee_id, req.email, req.name)
        return {"status": "success", "message": "Trainee registered successfully", "user": user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
