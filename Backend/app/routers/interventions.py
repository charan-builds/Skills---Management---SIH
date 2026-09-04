from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.firebase.repository import FirestoreRepository
from app.auth.dependencies import get_admin_user
from app.schemas.intervention import InterventionResponse, InterventionCreate, InterventionImpactSchema, MetricsState
import dateutil.parser

router = APIRouter(
    prefix="/api/interventions",
    tags=["Interventions"],
    dependencies=[Depends(get_admin_user)],
)

def calculate_impact(intervention: dict) -> dict:
    """Calculate observed wage outcomes without inventing missing metrics."""
    intervention = dict(intervention)
    trainees = FirestoreRepository.get_trainees(programme_id=intervention.get("programme_id"))
    if not trainees:
        intervention["impact"] = {
            "before": {}, "after": {}
        }
        return intervention
        
    try:
        inv_date = dateutil.parser.isoparse(intervention.get("date", ""))
    except (TypeError, ValueError):
        intervention["impact"] = {"before": {}, "after": {}}
        return intervention
        
    before_salaries = []
    after_salaries = []
    
    for t in trainees:
        for job in t.get("employment_history", []):
            if not job.get("start_date") or not job.get("salary"):
                continue
            try:
                start_date = dateutil.parser.isoparse(job["start_date"])
                if start_date < inv_date:
                    before_salaries.append(job["salary"])
                else:
                    after_salaries.append(job["salary"])
            except (TypeError, ValueError):
                continue
                
    before_wage = f"{int(sum(before_salaries) / len(before_salaries))}" if before_salaries else None
    after_wage = f"{int(sum(after_salaries) / len(after_salaries))}" if after_salaries else None
    
    intervention["impact"] = {
        "before": {"skill_match": None, "retention_12m": None, "wage_growth": before_wage},
        "after": {"skill_match": None, "retention_12m": None, "wage_growth": after_wage}
    }
    return intervention

@router.get("", response_model=List[InterventionResponse])
def get_interventions():
    interventions = FirestoreRepository.get_interventions()
    return [calculate_impact(inv) for inv in interventions]

@router.get("/{id}", response_model=InterventionResponse)
def get_intervention(id: str):
    res = FirestoreRepository.get_intervention(id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Intervention with ID {id} not found"
        )
    return calculate_impact(res)

@router.post("", response_model=InterventionResponse, status_code=status.HTTP_201_CREATED)
def create_intervention(intervention: InterventionCreate):
    return FirestoreRepository.create_intervention(intervention)
