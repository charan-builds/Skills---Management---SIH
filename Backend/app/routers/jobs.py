from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from app.firebase.repository import FirestoreRepository
from app.schemas.job import JobResponse, JobCreate
from app.schemas.skill import ThreeWayGapResponse

router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs & Requirements"]
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
def create_job(job: JobCreate):
    return FirestoreRepository.create_job(job.model_dump())

@router.get("/{job_id}/match/{trainee_id}", response_model=ThreeWayGapResponse)
def match_trainee_to_job(job_id: str, trainee_id: str, programme_id: Optional[str] = Query(None)):
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

@router.get("/{job_id}/candidates")
def get_job_candidates(job_id: str):
    job = FirestoreRepository.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    all_trainees = FirestoreRepository.get_trainees()
    results = []
    
    for t in all_trainees:
        if not t.get("programme_id"):
            continue
            
        gap_data = FirestoreRepository.calculate_3way_skill_gap(t["programme_id"], t["id"], job_id)
        if not gap_data or gap_data.get("overall_match_percentage") is None:
            continue
            
        match_score = gap_data["overall_match_percentage"]
        
        # Only show decent matches
        if match_score >= 65:
            matched_skills = [s["skill_name"] for s in gap_data.get("skills_analysis", []) if s["status"] == "Met"]
            missing_skills = [s["skill_name"] for s in gap_data.get("skills_analysis", []) if s["status"] != "Met"]
            
            recommendation = "Excellent Match" if match_score >= 90 else ("Strong Match" if match_score >= 80 else "Potential Match")
            
            reasons = gap_data.get("recommendations", [])
            reasoning = reasons[0] if reasons else f"Strong alignment with {len(matched_skills)} required skills."
            
            results.append({
                "trainee_id": t.get("id"),
                "name": t.get("name"),
                "programme": t.get("programme_name", "Unknown Programme"),
                "district": t.get("district", "Hyderabad"),
                "match_percentage": round(match_score),
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "readiness": "Employment Ready",
                "recommendation": recommendation,
                "reasoning": reasoning,
                "skills_analysis": gap_data.get("skills_analysis", [])
            })
            
    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results[:20]
