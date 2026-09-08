from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from app.firebase.repository import FirestoreRepository
from app.auth.dependencies import ensure_organization_access, ensure_trainee_access, get_current_user
from app.schemas.job import JobResponse, JobCreate
from app.schemas.skill import ThreeWayGapResponse

router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs & Requirements"],
    dependencies=[Depends(get_current_user)],
)

@router.get("", response_model=List[JobResponse])
def get_jobs(
    industry: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    role: Optional[str] = Query(None)
):
    return FirestoreRepository.get_jobs(industry=industry, location=location, role=role)

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str):
    job = FirestoreRepository.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    return job

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job: JobCreate, current_user: dict = Depends(get_current_user)):
    if FirestoreRepository.get_job(job.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Job with ID {job.id} already exists",
        )
    if current_user.get("role") != "admin":
        if current_user.get("role") != "employer" or not job.employer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators or the owning employer may create a vacancy.",
            )
        ensure_organization_access(job.employer_id, current_user)
    return FirestoreRepository.create_job(job.model_dump())

@router.get("/{job_id}/match/{trainee_id}", response_model=ThreeWayGapResponse)
def match_trainee_to_job(
    job_id: str,
    trainee_id: str,
    programme_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    ensure_trainee_access(trainee_id, current_user)
    trainee = FirestoreRepository.get_trainee(trainee_id)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trainee with ID {trainee_id} not found"
        )
    prog_id = programme_id or trainee.get("programme_id")
    if not prog_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trainee does not have an associated programme_id and none was provided."
        )
    return FirestoreRepository.calculate_3way_skill_gap(programme_id=prog_id, trainee_id=trainee_id, job_id=job_id)
