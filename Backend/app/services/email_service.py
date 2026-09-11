"""Transactional email service powered by Resend API."""

import json
import logging
import urllib.request
import urllib.error
from app.core.config import settings

logger = logging.getLogger("app.email_service")
RESEND_API_URL = "https://api.resend.com/emails"


def send_otp_email(to_email: str, otp_code: str, user_name: str = "") -> dict:
    """
    Sends a cryptographically generated 6-digit OTP to the user's verified email address
    via the Resend transactional email API.
    
    Security Guarantee:
    - Never logs the OTP code.
    - Only accesses RESEND_API_KEY from backend server environment.
    """
    api_key = (settings.RESEND_API_KEY or "").strip()
    if not api_key:
        logger.error("RESEND_API_KEY is not configured in backend environment.")
        raise RuntimeError("Transactional email provider is not configured.")

    from_address = (settings.EMAIL_FROM or "SII Platform <onboarding@resend.dev>").strip()
    greeting = f"Hello {user_name}," if user_name else "Hello,"

    plain_text = f"""{greeting}

Your verification code for SII login is:
{otp_code}

This code expires in {settings.OTP_EXPIRY_MINUTES} minutes.
If you did not request this code, you can safely ignore this email.

Regards,
SII Platform
"""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your SII Verification Code</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background: #1e3a8a; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Skilling Impact Intelligence</h1>
      <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 13px;">Government of India &bull; State Skill Mission</p>
    </div>
    <div style="padding: 32px 24px;">
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">{greeting}</p>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.5;">
        Your verification code for SII login is:
      </p>
      <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: monospace;">{otp_code}</span>
      </div>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">
        &bull; This code expires in <strong>{settings.OTP_EXPIRY_MINUTES} minutes</strong>.
      </p>
      <p style="margin: 0; font-size: 13px; color: #64748b;">
        &bull; If you did not request this code, you can safely ignore this email.
      </p>
    </div>
    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 12px; color: #64748b;">
        Regards,<br>
        <strong>SII Platform</strong> &bull; Secure Authentication Service
      </p>
    </div>
  </div>
</body>
</html>"""

    payload = {
        "from": from_address,
        "to": [to_email.strip().lower()],
        "subject": "Your SII Verification Code",
        "text": plain_text,
        "html": html_content
    }

    req = urllib.request.Request(
        RESEND_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "SII-Backend/1.0"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            resp_body = response.read().decode("utf-8")
            data = json.loads(resp_body) if resp_body else {}
            logger.info(f"Verification email dispatched via Resend to {to_email} (ID: {data.get('id')})")
            return {"success": True, "message_id": data.get("id")}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        logger.error(f"Resend HTTP {e.code} error: {err_msg}")
        raise RuntimeError(f"Email delivery failed: {err_msg}")
    except Exception as e:
        logger.error(f"Unexpected email delivery exception: {e}")
        raise RuntimeError(f"Email service error: {str(e)}")

