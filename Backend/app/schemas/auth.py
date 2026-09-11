from pydantic import BaseModel
from typing import Optional, Dict, Any

class SendOtpRequest(BaseModel):
    email: str
    trainee_id: Optional[str] = None

class SendOtpResponse(BaseModel):
    success: bool
    message: str

class UserSummary(BaseModel):
    id: str
    email: str
    name: str
    role: str
    organization_id: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str
    trainee_id: Optional[str] = None

class VerifyOtpResponse(BaseModel):
    success: bool
    token: str
    user: UserSummary

class LoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None # "admin", "employer", "trainee"
    organization_id: Optional[str] = None
    trainee_id: Optional[str] = None
    otp: Optional[str] = None

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



