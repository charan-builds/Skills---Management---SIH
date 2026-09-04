from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import List, Optional
from app.firebase.repository import FirestoreRepository
from app.auth.dependencies import ensure_trainee_access, get_admin_user, get_current_user
from app.schemas.trainee import (
    TraineeCreate, TraineeBase, TraineeEmploymentCreate, TraineeFollowupSubmit, TraineeUpdate
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
    _current_user: dict = Depends(get_admin_user),
):
    return FirestoreRepository.get_trainees(
        district=district,
        course_name=course_name,
        outcome=outcome,
        search=search
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
    return FirestoreRepository.create_trainee(trainee)

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
    # Submit trainee response for a longitudinal checkpoint
    updated_trainee = FirestoreRepository.add_trainee_followup(id, followup)
    if not updated_trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )
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
    updated = FirestoreRepository.update_trainee(id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )
    return updated
