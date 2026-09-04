"""Authentication and authorization dependencies shared by API routers."""

from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth

from app.auth.tokens import TokenValidationError, decode_access_token, is_local_access_token


security = HTTPBearer(auto_error=False)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_user_id(current_user: dict[str, Any]) -> str | None:
    """Return the canonical identifier from either local or Firebase claims."""
    for key in ("user_id", "uid", "sub"):
        value = current_user.get(key)
        if isinstance(value, str) and value:
            return value
    return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict[str, Any]:
    """Verify either a signed local access token or a Firebase ID token.

    An HS256-shaped token is always treated as a local token and must carry a valid
    HMAC signature. It never falls through to Firebase verification, preventing
    the previous unsigned-JWT authentication bypass.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized()

    token = credentials.credentials
    try:
        if is_local_access_token(token):
            return decode_access_token(token)

        firebase_claims = firebase_auth.verify_id_token(token)
        user_id = firebase_claims.get("uid") or firebase_claims.get("sub")
        if not isinstance(user_id, str) or not user_id:
            raise TokenValidationError("Firebase token is missing a user id")
        return {**firebase_claims, "user_id": user_id}
    except (TokenValidationError, ValueError, TypeError):
        raise _unauthorized()
    except Exception:
        # Firebase verification deliberately has the same public failure message.
        raise _unauthorized()


def get_admin_user(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin role required.",
        )
    return current_user


def get_employer_user(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Employer role required.",
        )
    return current_user


def ensure_trainee_access(trainee_id: str, current_user: dict[str, Any]) -> None:
    """Permit admins, or a trainee accessing only their own portal data."""
    if current_user.get("role") == "admin":
        return
    if current_user.get("role") == "trainee" and get_user_id(current_user) == trainee_id:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to access this trainee record.",
    )


def ensure_organization_access(organization_id: str, current_user: dict[str, Any]) -> None:
    """Permit admins or an employer acting only for its own organization."""
    if current_user.get("role") == "admin":
        return
    if (
        current_user.get("role") == "employer"
        and current_user.get("organization_id") == organization_id
    ):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to access this organization.",
    )
