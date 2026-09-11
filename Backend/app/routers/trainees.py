from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import List, Optional
from app.firebase.repository import FirestoreRepository
from app.auth.dependencies import ensure_trainee_access, get_admin_user, get_current_user
from app.schemas.trainee import (
    TraineeCreate, TraineeBase, TraineeEmploymentCreate, TraineeFollowupSubmit, TraineeUpdate,
    EmploymentHistorySchema, ConsentRecordSchema, TraineeConsentUpdate
)

router = APIRouter(
    prefix="/api/trainees",
    tags=["Trainees"],
    dependencies=[Depends(get_current_user)]
)

@router.get("", response_model=List[TraineeBase])
def get_trainees(
    district: Optional[str] = Query(None, description="Filter by trainee district"),
    course_name: Optional[str] = Query(None, description="Filter by course name"),
    outcome: Optional[str] = Query(None, description="Filter by current outcome status"),
    search: Optional[str] = Query(None, description="Search by name, ID or course"),
    cohort: Optional[str] = Query(None, description="Filter by cohort"),
    _current_user: dict = Depends(get_admin_user),
):
    return FirestoreRepository.get_trainees(
        district=district,
        course_name=course_name,
        outcome=outcome,
        search=search,
        cohort=cohort
    )

@router.get("/{id}", response_model=TraineeBase)
def get_trainee(id: str, current_user: dict = Depends(get_current_user)):
    ensure_trainee_access(id, current_user)
    trainee = FirestoreRepository.get_trainee(id)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )
    return trainee

@router.post("", response_model=TraineeBase, status_code=status.HTTP_201_CREATED)
def create_trainee(trainee: TraineeCreate, _current_user: dict = Depends(get_admin_user)):
    existing = FirestoreRepository.get_trainee(trainee.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trainee with ID {trainee.id} already exists"
        )
    try:
        return FirestoreRepository.create_trainee(trainee)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

@router.post("/bulk", response_model=List[TraineeBase], status_code=status.HTTP_201_CREATED)
def create_trainees_bulk(trainees: List[TraineeCreate], _current_user: dict = Depends(get_admin_user)):
    # Simple duplicate check
    existing_ids = {t.id for t in FirestoreRepository.get_trainees()}
    for t in trainees:
        if t.id in existing_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Trainee with ID {t.id} already exists"
            )
    try:
        return FirestoreRepository.create_trainees_bulk(trainees)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))


@router.post("/{id}/employment", response_model=TraineeBase)
def add_employment(
    id: str,
    employment: TraineeEmploymentCreate,
    current_user: dict = Depends(get_current_user),
):
    ensure_trainee_access(id, current_user)
    # Log employment and create a pending verification request if verified=False
    updated_trainee = FirestoreRepository.add_trainee_employment(id, employment)
    if not updated_trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )

    # If the employment is not self-employed and end_date is null, let's trigger an employer verification entry
    if employment.employment_type in ["Employed", "Apprentice"] and employment.employer_name != "Self-Employed":
        from app.schemas.employer import EmployerVerificationCreate
        verify_data = EmployerVerificationCreate(
            trainee_id=id,
            employer_email="hr@employer.com", # Default fallback hr email
            employer_name=employment.employer_name,
            role=employment.role,
            salary=employment.salary
        )
        FirestoreRepository.create_verification(verify_data)

    return updated_trainee

@router.post("/{id}/followup", response_model=TraineeBase)
def submit_followup(
    id: str,
    followup: TraineeFollowupSubmit,
    current_user: dict = Depends(get_current_user),
):
    ensure_trainee_access(id, current_user)
    
    trainee = FirestoreRepository.get_trainee(id)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )
        
    timeline = trainee.get("outcomes_timeline", [])
    
    # 1. Prevent duplicate follow-ups
    for chk in timeline:
        if chk.get("checkpoint", "").lower() == followup.checkpoint.lower() and chk.get("status") == "Recorded":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Follow-up for {followup.checkpoint} is already recorded."
            )
            
    # 2. Validate chronological dependencies
    checkpoints = ["Day 0", "Day 7", "Day 14", "Day 21"]
    chk_lower = [c.lower() for c in checkpoints]
    
    if followup.checkpoint.lower() in chk_lower:
        idx = chk_lower.index(followup.checkpoint.lower())
        if idx > 0: # If Day 7, Day 14, Day 21
            prev_checkpoint = chk_lower[idx-1]
            prev_recorded = any(
                c.get("checkpoint", "").lower() == prev_checkpoint and c.get("status") == "Recorded"
                for c in timeline
            )
            if not prev_recorded:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Prerequisite follow-up {checkpoints[idx-1]} is missing."
                )

    # Submit trainee response for a longitudinal checkpoint
    updated_trainee = FirestoreRepository.add_trainee_followup(id, followup)
    return updated_trainee

@router.get("/{id}/outcome-history", response_model=List[EmploymentHistorySchema])
def get_outcome_history(id: str, current_user: dict = Depends(get_current_user)):
    ensure_trainee_access(id, current_user)
    trainee = FirestoreRepository.get_trainee(id)
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")
    return trainee.get("employment_history", [])

@router.get("/{id}/outcome-current", response_model=Optional[EmploymentHistorySchema])
def get_current_outcome(id: str, current_user: dict = Depends(get_current_user)):
    ensure_trainee_access(id, current_user)
    trainee = FirestoreRepository.get_trainee(id)
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")
    t_model = TraineeBase(**trainee)
    return t_model.current_outcome

@router.post("/{id}/outcome", response_model=TraineeBase)
def add_outcome(
    id: str,
    employment: TraineeEmploymentCreate,
    current_user: dict = Depends(get_current_user),
):
    ensure_trainee_access(id, current_user)
    
    # 1. Force verification state for trainees
    if current_user.get("role") != "admin":
        employment.verification_state = "SELF_REPORTED"

    # 2. Require start_date when status is EMPLOYED or APPRENTICESHIP
    if employment.status in ["EMPLOYED", "APPRENTICESHIP"] and not employment.start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start_date is required when status is EMPLOYED or APPRENTICESHIP"
        )
        
    trainee = FirestoreRepository.get_trainee(id)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )

    # 3. Prevent impossible state transitions (e.g., EMPLOYED to IN_TRAINING)
    t_model = TraineeBase(**trainee)
    current_outcome = t_model.current_outcome
    if current_outcome and current_outcome.status == "EMPLOYED" and employment.status == "IN_TRAINING":
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot transition directly from EMPLOYED to IN_TRAINING"
            )

    updated_trainee = FirestoreRepository.add_trainee_employment(id, employment)

    if not updated_trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )

    # Trigger employer verification entry for specific statuses
    if employment.status in ["EMPLOYED", "APPRENTICESHIP"] and employment.employer_name and employment.employer_name.lower() != "self-employed":
        from app.schemas.employer import EmployerVerificationCreate
        verify_data = EmployerVerificationCreate(
            trainee_id=id,
            employer_email="hr@employer.com",
            employer_name=employment.employer_name,
            role=employment.role or "Unknown",
            salary=float(employment.salary) if employment.salary else 0.0
        )
        FirestoreRepository.create_verification(verify_data)

    return updated_trainee

@router.get("/{id}/consent-history", response_model=List[ConsentRecordSchema])
def get_consent_history(id: str, current_user: dict = Depends(get_current_user)):
    ensure_trainee_access(id, current_user)
    trainee = FirestoreRepository.get_trainee(id)
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")
    return trainee.get("consent_history", [])

@router.post("/{id}/consent", response_model=TraineeBase)
def update_consent(
    id: str,
    consent: TraineeConsentUpdate,
    current_user: dict = Depends(get_current_user),
):
    ensure_trainee_access(id, current_user)
    updated_trainee = FirestoreRepository.add_trainee_consent(id, consent)
    if not updated_trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")
    return updated_trainee

@router.patch("/{id}", response_model=TraineeBase)
@router.put("/{id}", response_model=TraineeBase)
def update_trainee_endpoint(
    id: str,
    trainee_update: TraineeUpdate,
    current_user: dict = Depends(get_current_user),
):
    ensure_trainee_access(id, current_user)
    update_data = trainee_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field is required to update a trainee.",
        )
    try:
        updated = FirestoreRepository.update_trainee(id, update_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )
    return updated


@router.get("/{id}/follow-ups")
def get_trainee_follow_ups(id: str, current_user = Depends(get_current_user)):
    from app.firebase.repository import FirestoreRepository

    # Only allow Admin or the Trainee themselves
    if current_user.get("role") != "admin" and current_user.get("uid") != id:
        raise HTTPException(status_code=403, detail="Not authorized to view these follow-ups")

    return FirestoreRepository.get_trainee_follow_ups(id)
