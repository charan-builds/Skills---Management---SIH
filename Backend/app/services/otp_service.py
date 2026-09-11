"""
Production-grade OTP Service for Skilling Impact Intelligence (SII).
Guarantees:
1. Cryptographically secure 6-digit numeric OTP generation.
2. Hashed storage only (HMAC-SHA256 with server private secret). Plaintext OTP is NEVER persisted.
3. 5-minute expiration policy.
4. 60-second resend cooldown rate limiting.
5. Max 5 verification attempts per OTP; automatically revokes on exhaustion.
6. Immediate invalidation upon successful verification (single-use).
7. Zero OTP exposure in logs or public API responses.
"""

import hmac
import uuid
import secrets
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Tuple

from app.core.config import settings
from app.firebase.repository import FirestoreRepository
from app.services.email_service import send_otp_email

logger = logging.getLogger("app.otp_service")


def generate_secure_otp() -> str:
    """Generate a cryptographically secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def hash_otp(otp: str, email: str) -> str:
    """
    Computes an HMAC-SHA256 hash of the OTP bound to the user's normalized email
    and the server's private token secret.
    """
    secret = settings.get_token_secret()
    payload = f"{otp.strip()}:{email.strip().lower()}".encode("utf-8")
    return hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()


def verify_otp_hash(entered_otp: str, email: str, stored_hash: str) -> bool:
    """Constant-time comparison of the entered OTP hash against the stored hash."""
    expected = hash_otp(entered_otp, email)
    return hmac.compare_digest(expected, stored_hash)


def _parse_iso(timestamp_str: Optional[str]) -> Optional[datetime]:
    if not timestamp_str:
        return None
    try:
        # Standardize ISO string with timezone
        clean = timestamp_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def request_otp(email: str, user: Dict[str, Any]) -> Tuple[bool, str, Optional[int]]:
    """
    Handles an OTP request for a verified account.
    Enforces 60-second resend cooldown, generates secure OTP, persists hash to database,
    and dispatches via Resend API.
    
    Returns:
        (success: bool, message: str, cooldown_seconds_remaining: Optional[int])
    """
    email_clean = email.strip().lower()
    now_utc = datetime.now(timezone.utc)

    # 1. Enforce 60-second Resend Cooldown
    latest_record = FirestoreRepository.get_latest_otp_record(email_clean)
    if latest_record:
        created_at = _parse_iso(latest_record.get("createdAt"))
        if created_at:
            elapsed = (now_utc - created_at).total_seconds()
            cooldown = settings.OTP_RESEND_COOLDOWN_SECONDS
            if elapsed < cooldown:
                remaining = int(cooldown - elapsed)
                return False, f"Please wait {remaining}s before requesting another verification code.", remaining

    # 2. Invalidate any previously active OTPs for this email (ensure single active OTP)
    FirestoreRepository.revoke_active_otps_for_email(email_clean)

    # 3. Generate Cryptographically Secure 6-digit OTP & Hash it
    otp_code = generate_secure_otp()
    otp_hash = hash_otp(otp_code, email_clean)

    # 4. Set 5-Minute Expiry
    expires_at = now_utc + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    otp_id = str(uuid.uuid4())

    otp_record = {
        "id": otp_id,
        "userId": user.get("id"),
        "email": email_clean,
        "role": user.get("role"),
        "name": user.get("name", "User"),
        "organization_id": user.get("organization_id"),
        "otpHash": otp_hash,
        "expiresAt": expires_at.isoformat(),
        "attemptCount": 0,
        "createdAt": now_utc.isoformat(),
        "usedAt": None,
        "status": "ACTIVE"
    }

    # 5. Persist Hashed OTP Record to Database
    FirestoreRepository.save_otp_record(otp_record)

    # 6. Deliver Real Email via Resend API
    try:
        send_otp_email(
            to_email=email_clean,
            otp_code=otp_code,
            user_name=user.get("name", "")
        )
        logger.info(f"Successfully generated and delivered OTP to {email_clean} (Role: {user.get('role')})")
    except Exception as e:
        logger.error(f"Failed to deliver OTP to {email_clean}: {e}")
        # Mark record as revoked if email fails
        FirestoreRepository.update_otp_record(otp_id, {"status": "REVOKED"})
        return False, "Failed to deliver verification code. Please check your email address or try again.", None

    return True, "If eligible, a verification code has been sent.", None


def verify_otp_attempt(email: str, entered_otp: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Verifies the user-entered OTP against the stored hash in the database.
    Enforces expiration (5 min), max attempt limits (5 attempts), and single-use invalidation.
    
    Returns:
        (success: bool, error_message_or_success: str, user_metadata: Optional[dict])
    """
    email_clean = (email or "").strip().lower()
    code = (entered_otp or "").strip()

    if not email_clean:
        return False, "Email address is required.", None

    if not code or len(code) != 6 or not code.isdigit():
        return False, "Verification code must be exactly 6 numeric digits.", None

    # 1. Fetch Latest OTP Record
    record = FirestoreRepository.get_latest_otp_record(email_clean)
    if not record or record.get("status") != "ACTIVE" or record.get("usedAt") is not None:
        return False, "No active verification code found. Please request a new code.", None

    now_utc = datetime.now(timezone.utc)
    expires_at = _parse_iso(record.get("expiresAt"))

    # 2. Check Expiration
    if not expires_at or now_utc > expires_at:
        FirestoreRepository.update_otp_record(record["id"], {"status": "EXPIRED"})
        return False, "Verification code has expired. Please request a new one.", None

    # 3. Check Attempt Count
    current_attempts = record.get("attemptCount", 0)
    if current_attempts >= settings.OTP_MAX_ATTEMPTS:
        FirestoreRepository.update_otp_record(record["id"], {"status": "REVOKED"})
        return False, "Too many incorrect attempts. This code has been invalidated. Please request a new one.", None

    # 4. Verify Hash (Constant-Time)
    is_valid = verify_otp_hash(code, email_clean, record.get("otpHash", ""))
    if not is_valid:
        new_attempts = current_attempts + 1
        updates = {"attemptCount": new_attempts}
        
        if new_attempts >= settings.OTP_MAX_ATTEMPTS:
            updates["status"] = "REVOKED"
            FirestoreRepository.update_otp_record(record["id"], updates)
            return False, "Too many incorrect attempts. This code has been invalidated. Please request a new one.", None

        FirestoreRepository.update_otp_record(record["id"], updates)
        rem = settings.OTP_MAX_ATTEMPTS - new_attempts
        return False, f"Incorrect verification code. {rem} attempt{'s' if rem != 1 else ''} remaining.", None

    # 5. Success: Invalidate OTP immediately (Single-Use Guarantee)
    FirestoreRepository.update_otp_record(
        record["id"],
        {
            "status": "USED",
            "usedAt": now_utc.isoformat()
        }
    )

    return True, "Verification successful.", record


