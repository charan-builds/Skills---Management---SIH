from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    role: str # "admin", "employer", "trainee"
    organization_id: Optional[str] = None
    trainee_id: Optional[str] = None

class LoginResponse(BaseModel):
    token: str
    role: str
    user_id: str
    name: str
    organization_id: Optional[str] = None

class RegisterRequest(BaseModel):
    trainee_id: str
    email: str
    name: str

