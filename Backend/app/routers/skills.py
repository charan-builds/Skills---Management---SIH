from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from app.firebase.repository import FirestoreRepository
from app.auth.dependencies import ensure_trainee_access, get_admin_user, get_current_user
from app.schemas.skill import (
    SkillMasterResponse,
    SkillMasterCreate,
    SkillAssessmentResponse,
    SkillAssessmentCreate,
    ThreeWayGapResponse
)

router = APIRouter(
    prefix="/api",
    tags=["Skills & Assessments"],
    dependencies=[Depends(get_current_user)],
)

# --- Skill Master Endpoints ---
@router.get("/skills", response_model=List[SkillMasterResponse])
def get_skills():
    return FirestoreRepository.get_skills()

@router.get("/skills/{skill_id}", response_model=SkillMasterResponse)
def get_skill(skill_id: str):
    skill = FirestoreRepository.get_skill(skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill with ID {skill_id} not found"
        )
    return skill

@router.post("/skills", response_model=SkillMasterResponse, status_code=status.HTTP_201_CREATED)
def create_skill(skill: SkillMasterCreate, _current_user: dict = Depends(get_admin_user)):
    if FirestoreRepository.get_skill(skill.skill_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Skill with ID {skill.skill_id} already exists",
        )
    return FirestoreRepository.create_skill(skill.model_dump())

# --- Skill Assessments Endpoints ---
@router.get("/assessments", response_model=List[SkillAssessmentResponse])
def get_assessments(
    trainee_id: Optional[str] = Query(None),
    skill_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    if trainee_id:
        ensure_trainee_access(trainee_id, current_user)
    elif current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators may list assessments across trainees.",
        )
    return FirestoreRepository.get_assessments(trainee_id=trainee_id, skill_id=skill_id)

@router.get("/assessments/trainee/{trainee_id}", response_model=List[SkillAssessmentResponse])
def get_trainee_assessments(trainee_id: str, current_user: dict = Depends(get_current_user)):
    ensure_trainee_access(trainee_id, current_user)
    return FirestoreRepository.get_trainee_assessments(trainee_id)

@router.post("/assessments", response_model=SkillAssessmentResponse, status_code=status.HTTP_201_CREATED)
def record_assessment(
    assessment: SkillAssessmentCreate,
    current_user: dict = Depends(get_current_user),
):
    ensure_trainee_access(assessment.trainee_id, current_user)
    return FirestoreRepository.create_assessment(assessment.model_dump())

@router.get("/skills/3way-gap/{programme_id}/{trainee_id}/{job_id}", response_model=ThreeWayGapResponse)
def get_3way_skill_gap(
    programme_id: str,
    trainee_id: str,
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    ensure_trainee_access(trainee_id, current_user)
    gap_analysis = FirestoreRepository.calculate_3way_skill_gap(programme_id, trainee_id, job_id)
    if not gap_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unable to calculate 3-way skill gap for the requested entities"
        )
    return gap_analysis
