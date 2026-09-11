from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from app.auth.dependencies import ensure_trainee_access, get_admin_user, get_current_user
from app.firebase.repository import FirestoreRepository

router = APIRouter(
    prefix="/api/intelligence",
    tags=["Intelligence"]
)

MIN_COHORT_THRESHOLD = 5

@router.get("/trainees/{trainee_id}/skill-gaps")
def get_trainee_skill_gaps(trainee_id: str, current_user: dict = Depends(get_current_user)):
    """
    Returns deterministic skill gaps for a specific trainee based on their assessments.
    """
    ensure_trainee_access(trainee_id, current_user)
    
    # Fetch all assessments for this trainee
    assessments = FirestoreRepository.get_assessments(trainee_id=trainee_id)
    
    if not assessments:
        return {
            "status": "success",
            "data": [],
            "meta": {"insufficient_data": True, "reason": "No assessments found"}
        }
        
    gaps = []
    for asm in assessments:
        score = asm.get("proficiency_score")
        if score is None:
            continue
            
        # Deterministic threshold for deficiency
        if score < 50:
            gaps.append({
                "skill_name": asm.get("skill_name") or asm.get("skill_id", "Unknown"),
                "current_proficiency": score,
                "threshold": 50,
                "evidence_date": asm.get("created_at") or asm.get("date")
            })
            
    return {
        "status": "success",
        "data": gaps,
        "meta": {"insufficient_data": len(gaps) == 0}
    }


@router.get("/trainees/{trainee_id}/upskilling")
def get_trainee_upskilling(trainee_id: str, current_user: dict = Depends(get_current_user)):
    """
    Returns targeted upskilling recommendations derived from observed skill gaps.
    Strictly restricted to upskilling (no job recommendations).
    """
    ensure_trainee_access(trainee_id, current_user)
    
    # Reuse skill gap logic
    gaps_response = get_trainee_skill_gaps(trainee_id, current_user)
    gaps = gaps_response.get("data", [])
    
    if not gaps:
        return {
            "status": "success",
            "data": [],
            "meta": {"insufficient_data": True, "reason": "No skill gaps identified"}
        }
        
    # Map gaps to potential courses/modules
    recommendations = []
    for gap in gaps:
        recommendations.append({
            "skill_name": gap["skill_name"],
            "recommended_action": f"Enroll in upskilling module for {gap['skill_name']}",
            "priority": "HIGH" if gap["current_proficiency"] < 30 else "MEDIUM"
        })
        
    return {
        "status": "success",
        "data": recommendations,
        "meta": {"insufficient_data": False}
    }


@router.get("/cohorts/{cohort_id}")
def get_cohort_intelligence(cohort_id: str, current_user: dict = Depends(get_admin_user)):
    """
    Returns aggregated cohort trends. Enforces MIN_COHORT_THRESHOLD.
    """
    trainees = FirestoreRepository.get_trainees(cohort=cohort_id)
    
    if len(trainees) < MIN_COHORT_THRESHOLD:
        return {
            "status": "success",
            "data": None,
            "meta": {
                "suppressed": True,
                "reason": f"minimum_cohort_threshold (N={len(trainees)} < {MIN_COHORT_THRESHOLD})"
            }
        }
        
    # Aggregate data
    certified = len([t for t in trainees if t.get("status") == "Certified"])
    employed = len([t for t in trainees if t.get("outcome") in ["Employed", "Self-Employed", "Apprentice"]])
    
    return {
        "status": "success",
        "data": {
            "cohort_id": cohort_id,
            "total_trainees": len(trainees),
            "certified_count": certified,
            "employed_count": employed,
            "employment_rate": round(employed / len(trainees) * 100, 2) if len(trainees) > 0 else 0
        },
        "meta": {"suppressed": False}
    }


@router.get("/programmes/{programme_id}/impact")
def get_programme_impact(programme_id: str, current_user: dict = Depends(get_admin_user)):
    """
    Returns aggregated programme impact indicators. Enforces MIN_COHORT_THRESHOLD.
    """
    trainees = FirestoreRepository.get_trainees(programme_id=programme_id)
    
    if len(trainees) < MIN_COHORT_THRESHOLD:
        return {
            "status": "success",
            "data": None,
            "meta": {
                "suppressed": True,
                "reason": f"minimum_cohort_threshold (N={len(trainees)} < {MIN_COHORT_THRESHOLD})"
            }
        }
        
    certified = [t for t in trainees if t.get("status") == "Certified"]
    employed_trainees = [t for t in certified if t.get("outcome") in ["Employed", "Self-Employed", "Apprentice"]]
    
    # 6 Month Retention logic
    retention_6m = 0
    has_6m_data = 0
    
    for t in certified:
        for chk in t.get("outcomes_timeline", []):
            if chk.get("checkpoint") == "6 Month Follow-up" and chk.get("status") == "Recorded":
                has_6m_data += 1
                if chk.get("employment_status") in ["Employed", "Self-Employed", "Apprentice"]:
                    retention_6m += 1
                    
    # Note: Even aggregates inside the programme need to respect thresholds if we expose them
    if has_6m_data < MIN_COHORT_THRESHOLD and has_6m_data > 0:
        retention_rate = None  # Suppressed
    else:
        retention_rate = round(retention_6m / has_6m_data * 100, 2) if has_6m_data > 0 else None
        
    return {
        "status": "success",
        "data": {
            "programme_id": programme_id,
            "total_trainees": len(trainees),
            "employment_rate": round(len(employed_trainees) / len(certified) * 100, 2) if len(certified) > 0 else 0,
            "retention_6m_rate": retention_rate
        },
        "meta": {"suppressed": False}
    }
