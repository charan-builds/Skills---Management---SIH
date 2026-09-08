from fastapi import APIRouter, Depends, HTTPException, Header
from app.services.followup_service import FollowUpService

router = APIRouter()

# In a real setup, store this in env config. Hardcoded here as this is prototype mode.
import os

CRON_SECRET = os.environ.get("CRON_SECRET", "cron-secret-token")

def verify_cron_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    if token != CRON_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid cron secret")

@router.post("/evaluate-followups", dependencies=[Depends(verify_cron_token)])
def evaluate_followups():
    results = FollowUpService.evaluate_followups()
    return {"status": "success", "data": results}
