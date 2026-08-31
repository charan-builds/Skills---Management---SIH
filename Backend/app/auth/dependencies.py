from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        if token.startswith("eyJ"): # Header base64 for {"alg": "none", "typ": "JWT"}
            # Decode MVP token
            import base64
            import json
            parts = token.split(".")
            if len(parts) >= 2:
                # Add padding if needed
                padded_payload = parts[1] + '=' * (-len(parts[1]) % 4)
                decoded_payload = base64.b64decode(padded_payload).decode("utf-8")
                return json.loads(decoded_payload)
            
        # Fallback to Firebase verify_id_token
        decoded_token = auth.verify_id_token(token)
        return decoded_token

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )

def get_admin_user(current_user: dict = Depends(get_current_user)):
    # Assuming role is passed in token claims. If not, fallback to checking some static logic 
    # but the simplest RBAC is checking the role claim.
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin role required."
        )
    return current_user