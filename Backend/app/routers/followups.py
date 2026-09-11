from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.firebase.repository import FirestoreRepository
from app.auth.dependencies import get_admin_user
from app.schemas.followup import FollowUpStatus

router = APIRouter(
    prefix="/api/admin/follow-ups",
    tags=["Admin Follow-Ups"],
    dependencies=[Depends(get_admin_user)]
)

@router.get("/pending", response_model=List[Dict[str, Any]])
def get_pending_followups():
    all_followups = FirestoreRepository.get_follow_ups()
    return [f for f in all_followups if f.get("status") == FollowUpStatus.PENDING]

@router.get("/{id}/attempts", response_model=List[Dict[str, Any]])
def get_followup_attempts(id: str):
    return FirestoreRepository.get_follow_up_attempts(id)

@router.post("/{id}/cancel")
def cancel_followup(id: str):
    f_data = FirestoreRepository.get_follow_up(id)
    if not f_data:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    f_data["status"] = FollowUpStatus.CANCELLED
    FirestoreRepository.create_or_update_follow_up(f_data)
    return {"status": "success", "message": "Follow-up cancelled"}
