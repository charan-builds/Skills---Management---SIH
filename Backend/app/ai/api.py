from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.auth.dependencies import ensure_trainee_access, get_current_user, get_admin_user
from app.ai.service import AIService
from pydantic import BaseModel

router = APIRouter(prefix="/api/ai", tags=["AI Intelligence"])

class ScenarioRequest(BaseModel):
    type: str
    params: Dict[str, Any]

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "AI Intelligence Layer"}

@router.get("/overview", dependencies=[Depends(get_admin_user)])
def get_overview():
    intel, _ = AIService.process_intelligence()
    return {
        "status": "success",
        "data": intel
    }

@router.get("/programmes/{programme_id}", dependencies=[Depends(get_admin_user)])
def get_programme_intelligence(programme_id: str):
    data = AIService.get_programme_overview(programme_id)
    return {"status": "success", "data": data}

@router.get("/programmes/{programme_id}/diagnosis", dependencies=[Depends(get_admin_user)])
def get_programme_diagnosis(programme_id: str):
    data = AIService.get_programme_diagnosis(programme_id)
    return {"status": "success", "data": data}

@router.get("/programmes/{programme_id}/curriculum", dependencies=[Depends(get_admin_user)])
def get_programme_curriculum(programme_id: str):
    data = AIService.get_programme_curriculum(programme_id)
    return {"status": "success", "data": data}

@router.get("/trainees/{trainee_id}/skills")
def get_trainee_skills(trainee_id: str, current_user: dict = Depends(get_current_user)):
    ensure_trainee_access(trainee_id, current_user)
    data = AIService.get_trainee_skills(trainee_id)
    return {"status": "success", "data": data}

@router.get("/trainees/{trainee_id}/jobs/{job_id}/match")
def get_trainee_job_match(
    trainee_id: str,
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    ensure_trainee_access(trainee_id, current_user)
    data = AIService.get_trainee_job_match(trainee_id, job_id)
    return {"status": "success", "data": data}

@router.post("/scenario", dependencies=[Depends(get_admin_user)])
def run_scenario(req: ScenarioRequest):
    data = AIService.simulate_scenario(req.model_dump())
    return {"status": "success", "data": data}


# ==========================================
# PHASE 8F: AI DECISION ENGINE APIs
# ==========================================

from app.ai.decision_engine import DecisionEngine

@router.get("/decision-engine/summary", dependencies=[Depends(get_admin_user)])
def get_decision_engine_summary():
    """Returns aggregated evidence and recommendations for the Admin dashboard."""
    engine = DecisionEngine()
    try:
        data = engine.generate_insights()
    except Exception as e:
        # Check if this is a Firestore 429 Quota Exceeded exception (google.api_core.exceptions.ResourceExhausted)
        if "429" in str(e) or "Quota" in str(e) or "ResourceExhausted" in str(e.__class__.__name__):
            print(f"Firestore Quota Exceeded (429) caught in decision-engine: {str(e)}")
            data = {"recommendations": [], "metadata": {"insufficient_data": True}}
        else:
            raise e
            
    return {"status": "success", "data": data}

@router.get("/skill-gaps/summary", dependencies=[Depends(get_admin_user)])
def get_skill_gaps_summary():
    """Returns only the skill gap intelligence."""
    engine = DecisionEngine()
    try:
        data = engine.skill_engine.analyze_skill_gaps()
    except Exception as e:
        # Check if this is a Firestore 429 Quota Exceeded exception
        if "429" in str(e) or "Quota" in str(e) or "ResourceExhausted" in str(e.__class__.__name__):
            print(f"Firestore Quota Exceeded (429) caught in skill-gaps: {str(e)}")
            data = {"skill_gaps": [], "meta": {"insufficient_data": True}}
        else:
            raise e
            
    return {"status": "success", "data": data}


