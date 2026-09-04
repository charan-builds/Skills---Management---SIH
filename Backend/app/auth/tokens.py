"""Minimal, dependency-free HS256 access-token support for local/demo sessions.

Production clients should present Firebase ID tokens.  These signed access tokens
exist only so the bundled demo can exercise the same Bearer-token contract without
accepting unsigned or forgeable tokens.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Any

from app.core.config import settings


ISSUER = "skilling-impact-intelligence"
ALGORITHM = "HS256"
VALID_ROLES = {"admin", "employer", "trainee"}


class TokenValidationError(ValueError):
    """Raised when a local access token cannot be trusted."""


def _b64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _b64url_decode(value: str) -> bytes:
    if not value or any(char.isspace() for char in value):
        raise TokenValidationError("Malformed access token")
    try:
        return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))
    except Exception as exc:  # pragma: no cover - exact decoder errors vary by Python version
        raise TokenValidationError("Malformed access token") from exc


def _json_part(value: str) -> dict[str, Any]:
    try:
        decoded = json.loads(_b64url_decode(value).decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise TokenValidationError("Malformed access token") from exc
    if not isinstance(decoded, dict):
        raise TokenValidationError("Malformed access token")
    return decoded


def is_local_access_token(token: str) -> bool:
    """Identify our HS256 token shape before attempting Firebase verification."""
    try:
        header_part = token.split(".", 2)[0]
        return _json_part(header_part).get("alg") == ALGORITHM
    except (AttributeError, TokenValidationError):
        return False


def create_access_token(claims: dict[str, Any]) -> str:
    role = claims.get("role")
    user_id = claims.get("user_id") or claims.get("uid")
    if role not in VALID_ROLES or not isinstance(user_id, str) or not user_id:
        raise ValueError("Access tokens require a valid role and user identifier")

    now = int(time.time())
    payload = {
        **claims,
        "user_id": user_id,
        "role": role,
        "iss": ISSUER,
        "iat": now,
        "exp": now + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }
    header = {"alg": ALGORITHM, "typ": "JWT"}
    encoded_header = _b64url_encode(json.dumps(header, separators=(",", ":"), sort_keys=True).encode())
    encoded_payload = _b64url_encode(json.dumps(payload, separators=(",", ":"), sort_keys=True).encode())
    signing_input = f"{encoded_header}.{encoded_payload}".encode("ascii")
    signature = hmac.new(
        settings.get_token_secret().encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    return f"{encoded_header}.{encoded_payload}.{_b64url_encode(signature)}"


def decode_access_token(token: str) -> dict[str, Any]:
    if not isinstance(token, str):
        raise TokenValidationError("Malformed access token")
    parts = token.split(".")
    if len(parts) != 3:
        raise TokenValidationError("Malformed access token")

    header = _json_part(parts[0])
    if header.get("alg") != ALGORITHM or header.get("typ") != "JWT":
        raise TokenValidationError("Unsupported access token")

    signing_input = f"{parts[0]}.{parts[1]}".encode("ascii")
    expected_signature = hmac.new(
        settings.get_token_secret().encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    supplied_signature = _b64url_decode(parts[2])
    if not hmac.compare_digest(expected_signature, supplied_signature):
        raise TokenValidationError("Invalid access token signature")

    payload = _json_part(parts[1])
    now = int(time.time())
    if payload.get("iss") != ISSUER:
        raise TokenValidationError("Invalid access token issuer")
    if not isinstance(payload.get("exp"), int) or payload["exp"] <= now:
        raise TokenValidationError("Expired access token")
    if not isinstance(payload.get("iat"), int) or payload["iat"] > now + 60:
        raise TokenValidationError("Invalid access token issuance time")
    if payload.get("role") not in VALID_ROLES:
        raise TokenValidationError("Invalid access token role")
    if not isinstance(payload.get("user_id"), str) or not payload["user_id"]:
        raise TokenValidationError("Invalid access token subject")
    return payload
