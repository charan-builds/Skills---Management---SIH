from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from app.firebase.repository import FirestoreRepository
from app.schemas.skill import (
    SkillMasterResponse,
    SkillMasterCreate,
    SkillAssessmentResponse,
    SkillAssessmentCreate
)

router = APIRouter(
    prefix="/api",
    tags=["Skills & Assessments"]
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
def create_skill(skill: SkillMasterCreate):
    return FirestoreRepository.create_skill(skill.model_dump())

# --- Skill Assessments Endpoints ---
@router.get("/assessments", response_model=List[SkillAssessmentResponse])
def get_assessments(
    trainee_id: Optional[str] = Query(None),
    skill_id: Optional[str] = Query(None)
):
    return FirestoreRepository.get_assessments(trainee_id=trainee_id, skill_id=skill_id)

@router.get("/assessments/trainee/{trainee_id}", response_model=List[SkillAssessmentResponse])
def get_trainee_assessments(trainee_id: str):
    return FirestoreRepository.get_trainee_assessments(trainee_id)

@router.post("/assessments", response_model=SkillAssessmentResponse, status_code=status.HTTP_201_CREATED)
def record_assessment(assessment: SkillAssessmentCreate):
    return FirestoreRepository.create_assessment(assessment.model_dump())
