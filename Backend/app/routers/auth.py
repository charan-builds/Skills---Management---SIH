from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from app.schemas.auth import (
    LoginRequest, LoginResponse, RegisterRequest,
    SendOtpRequest, SendOtpResponse,
    VerifyOtpRequest, VerifyOtpResponse, UserSummary
)
from app.firebase.auth_repo import AuthRepository
from app.auth.dependencies import get_admin_user
from app.auth.tokens import create_access_token
from app.services.otp_service import request_otp, verify_otp_attempt

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-otp", response_model=SendOtpResponse)
def send_otp_endpoint(req: SendOtpRequest):
    """
    Validates account exists and dispatches cryptographically secure OTP via Resend API.
    Does NOT return the OTP in the response or logs.
    Generic response returned regardless of user existence to prevent account enumeration.
    """
    email_clean = (req.email or "").strip().lower()
    if not email_clean:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address is required.")

    user = AuthRepository.find_user_by_email(email_clean)
    if not user:
        # Prevent user enumeration attack — return identical success message
        return SendOtpResponse(
            success=True,
            message="If eligible, a verification code has been sent."
        )

    success, message, cooldown_remaining = request_otp(email_clean, user)
    if not success:
        if cooldown_remaining is not None and cooldown_remaining > 0:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=message)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=message)

    return SendOtpResponse(
        success=True,
        message="If eligible, a verification code has been sent."
    )


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def verify_otp_endpoint(req: VerifyOtpRequest):
    """
    Verifies user-entered 6-digit OTP against HMAC-SHA256 hash.
    Enforces expiry (5 min), max attempts (5), and single-use invalidation.
    Issues JWT session token with role determined strictly by server database.
    """
    email_clean = (req.email or "").strip().lower()
    if not email_clean:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address is required.")

    is_valid, err_msg, otp_record = verify_otp_attempt(email_clean, req.otp)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

    # Server-side role assignment from database record
    role = otp_record.get("role") or "trainee"
    user_id = otp_record.get("userId") or "user"
    name = otp_record.get("name", "User")
    org_id = otp_record.get("organization_id")

    token_payload = {
        "role": role,
        "user_id": user_id,
        "name": name,
        "organization_id": org_id
    }
    token = create_access_token(token_payload)

    return VerifyOtpResponse(
        success=True,
        token=token,
        user=UserSummary(
            id=user_id,
            email=email_clean,
            name=name,
            role=role,
            organization_id=org_id
        )
    )


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    """
    Legacy password login for Admin and Employer, or fallback credentials check.
    """
    if req.role == "admin":
        user = AuthRepository.authenticate_admin(req.email, req.password)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
        token = create_access_token({"role": "admin", "user_id": user["id"], "name": user["name"]})
        return LoginResponse(token=token, role="admin", user_id=user["id"], name=user["name"])

    if req.role == "employer":
        user = AuthRepository.authenticate_employer(req.organization_id, req.email, req.password)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid employer credentials")
        token = create_access_token(
            {
                "role": "employer",
                "user_id": user["id"],
                "name": user["name"],
                "organization_id": user["organization_id"],
            }
        )
        return LoginResponse(token=token, role="employer", user_id=user["id"], name=user["name"], organization_id=user["organization_id"])

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password login requires admin or employer role. Use OTP login for Trainees.")


@router.post("/register")
def register_trainee(req: RegisterRequest, _current_user: dict = Depends(get_admin_user)):
    """
    Admin endpoint to register a new trainee.
    """
    try:
        user = AuthRepository.register_trainee(req.trainee_id, req.email, req.name)
        return {"status": "success", "message": "Trainee registered successfully", "user": user}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
