from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import List, Optional
from app.firebase.repository import FirestoreRepository
from app.auth.dependencies import get_current_user
from app.schemas.trainee import (
    TraineeCreate, TraineeBase, TraineeEmploymentCreate, TraineeFollowupSubmit
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
    search: Optional[str] = Query(None, description="Search by name, ID or course")
):
    return FirestoreRepository.get_trainees(
        district=district,
        course_name=course_name,
        outcome=outcome,
        search=search
    )

@router.get("/{id}", response_model=TraineeBase)
def get_trainee(id: str):
    trainee = FirestoreRepository.get_trainee(id)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )
    return trainee

@router.post("", response_model=TraineeBase, status_code=status.HTTP_201_CREATED)
def create_trainee(trainee: TraineeCreate):
    existing = FirestoreRepository.get_trainee(trainee.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trainee with ID {trainee.id} already exists"
        )
    return FirestoreRepository.create_trainee(trainee)

@router.post("/{id}/employment", response_model=TraineeBase)
def add_employment(id: str, employment: TraineeEmploymentCreate):
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
def submit_followup(id: str, followup: TraineeFollowupSubmit):
    # Submit trainee response for a longitudinal checkpoint
    updated_trainee = FirestoreRepository.add_trainee_followup(id, followup)
    if not updated_trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {id} not found"
        )
    return updated_trainee
