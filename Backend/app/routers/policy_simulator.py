from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/api/admin/policy-simulator",
    tags=["Policy Simulator"],
)

# In-memory store for backend scenarios persistence
SAVED_SCENARIOS: Dict[str, Dict[str, Any]] = {}

class ScenarioRequest(BaseModel):
    scenario_name: str
    intervention_type: str
    parameters: Dict[str, Any]
    baseline_metrics: Optional[Dict[str, Any]] = None

def run_simulation_engine(
    intervention_type: str,
    parameters: Dict[str, Any],
    baseline: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Deterministic Policy Simulation Engine.
    Calculates projected skilling & employment outcomes based on scenario parameters.
    """
    # Extract baseline metrics with safe defaults
    base_placement = float(baseline.get("placement_rate", 68.0))
    base_employment = float(baseline.get("employment_rate", 64.0))
    base_completion = float(baseline.get("completion_rate", 81.0))
    base_relevance = float(baseline.get("job_relevance", 72.0))
    base_satisfaction = float(baseline.get("employer_satisfaction", 75.0))
    base_income = float(baseline.get("average_income", 18500.0))
    total_trainees = int(baseline.get("total_trainees", 5240))

    # Parameter extraction
    affected_trainees = int(parameters.get("affected_trainees", total_trainees))
    if affected_trainees <= 0:
        affected_trainees = total_trainees
    scope_ratio = min(affected_trainees / float(total_trainees or 1), 1.0)
    
    additional_hours = float(parameters.get("additional_hours", 20))
    cost_per_trainee = float(parameters.get("cost_per_trainee", 2500))
    relevance_level = str(parameters.get("relevance_level", "High")).lower()
    duration_months = float(parameters.get("duration_months", 3))
    employer_count = int(parameters.get("employer_count", 15))

    relevance_multiplier = 1.25 if relevance_level == "high" else (1.0 if relevance_level == "medium" else 0.7)

    # Calculate specific impacts based on intervention type
    placement_boost = 0.0
    employment_boost = 0.0
    completion_boost = 0.0
    relevance_boost = 0.0
    satisfaction_boost = 0.0
    income_boost = 0.0

    if intervention_type == "add_module" or intervention_type == "Add Training Module":
        placement_boost = (additional_hours * 0.28 * relevance_multiplier) * scope_ratio
        relevance_boost = (additional_hours * 0.45 * relevance_multiplier) * scope_ratio
        satisfaction_boost = (additional_hours * 0.2 * relevance_multiplier) * scope_ratio
        income_boost = additional_hours * 85.0 * scope_ratio

    elif intervention_type == "increase_hours" or intervention_type == "Increase Training Hours":
        placement_boost = (additional_hours * 0.20) * scope_ratio
        completion_boost = (additional_hours * 0.15) * scope_ratio
        relevance_boost = (additional_hours * 0.25) * scope_ratio
        income_boost = additional_hours * 50.0 * scope_ratio

    elif intervention_type == "industry_certification" or intervention_type == "Industry Certification":
        placement_boost = 7.5 * scope_ratio
        satisfaction_boost = 11.0 * scope_ratio
        relevance_boost = 9.0 * scope_ratio
        income_boost = 1800.0 * scope_ratio

    elif intervention_type == "apprenticeship" or intervention_type == "Apprenticeship Program":
        placement_boost = 11.0 * scope_ratio
        employment_boost = 12.5 * scope_ratio
        satisfaction_boost = 14.0 * scope_ratio
        income_boost = 2400.0 * scope_ratio
        completion_boost = 4.0 * scope_ratio

    elif intervention_type == "employer_mentorship" or intervention_type == "Employer Mentorship":
        placement_boost = 6.0 * scope_ratio
        satisfaction_boost = 9.5 * scope_ratio
        income_boost = 1200.0 * scope_ratio

    elif intervention_type == "placement_assistance" or intervention_type == "Placement Assistance":
        placement_boost = 9.0 * scope_ratio
        employment_boost = 8.0 * scope_ratio

    elif intervention_type == "soft_skills" or intervention_type == "Soft Skills Training":
        placement_boost = 5.5 * scope_ratio
        completion_boost = 6.0 * scope_ratio
        satisfaction_boost = 7.0 * scope_ratio

    elif intervention_type == "trainer_capacity" or intervention_type == "Trainer Capacity Increase":
        completion_boost = 7.0 * scope_ratio
        relevance_boost = 5.0 * scope_ratio
        placement_boost = 4.5 * scope_ratio

    elif intervention_type == "employer_partnerships" or intervention_type == "Employer Partnership Expansion":
        placement_boost = (employer_count * 0.35) * scope_ratio
        employment_boost = (employer_count * 0.30) * scope_ratio
        satisfaction_boost = 5.0 * scope_ratio

    elif intervention_type == "post_training_followup" or intervention_type == "Post-Training Follow-up":
        employment_boost = 8.5 * scope_ratio
        satisfaction_boost = 6.0 * scope_ratio

    elif intervention_type == "transportation_support" or intervention_type == "Transportation Support":
        completion_boost = 9.5 * scope_ratio
        placement_boost = 4.0 * scope_ratio

    else: # Custom Intervention
        placement_boost = (additional_hours * 0.15 + 4.0) * scope_ratio
        employment_boost = (additional_hours * 0.12 + 3.0) * scope_ratio
        completion_boost = 4.0 * scope_ratio
        income_boost = 1000.0 * scope_ratio

    # Clamp results to realistic bounds
    proj_placement = round(min(base_placement + placement_boost, 98.0), 1)
    proj_employment = round(min(base_employment + employment_boost, 96.0), 1)
    proj_completion = round(min(base_completion + completion_boost, 99.0), 1)
    proj_relevance = round(min(base_relevance + relevance_boost, 98.0), 1)
    proj_satisfaction = round(min(base_satisfaction + satisfaction_boost, 97.0), 1)
    proj_income = round(base_income + income_boost)

    # Additional outcome counts
    placement_delta_pct = proj_placement - base_placement
    employment_delta_pct = proj_employment - base_employment
    
    additional_placements = round((placement_delta_pct / 100.0) * affected_trainees)
    additional_employed = round((employment_delta_pct / 100.0) * affected_trainees)
    
    total_cost = round(affected_trainees * cost_per_trainee)
    cost_per_additional_placement = round(total_cost / max(additional_placements, 1))

    # Estimated projection confidence range (+/- 2.2%)
    range_min = round(max(proj_placement - 2.2, base_placement), 1)
    range_max = round(min(proj_placement + 2.2, 100.0), 1)

    # Generate explanation statements based on actual inputs
    why_statements = [
        f"The intervention directly addresses employer skill alignment across {affected_trainees:,} targeted trainees.",
        f"Adding {additional_hours:g} training hours boosts practical technical competencies and interview readiness.",
        f"Alignment with {relevance_level.capitalize()} industry demand increases hiring velocity among partner firms.",
        f"Model projects {additional_placements:,} additional formal job placements at an estimated cost of ₹{cost_per_trainee:,.0f} per candidate."
    ]

    ai_synthesis = (
        f"Implementing this intervention is model-projected to improve program placement rate from "
        f"{base_placement}% to {proj_placement}% (+{placement_delta_pct:.1f} percentage points). "
        f"Across the targeted {affected_trainees:,} trainees, this scenario yields approximately "
        f"{additional_placements:,} additional placements with a total estimated investment of ₹{total_cost / 10000000:.2f} Cr."
    )

    return {
        "baseline": {
            "placement_rate": base_placement,
            "employment_rate": base_employment,
            "completion_rate": base_completion,
            "job_relevance": base_relevance,
            "employer_satisfaction": base_satisfaction,
            "average_income": base_income,
            "total_trainees": total_trainees
        },
        "projected": {
            "placement_rate": proj_placement,
            "employment_rate": proj_employment,
            "completion_rate": proj_completion,
            "job_relevance": proj_relevance,
            "employer_satisfaction": proj_satisfaction,
            "average_income": proj_income,
            "placement_delta_pct": round(placement_delta_pct, 1),
            "employment_delta_pct": round(employment_delta_pct, 1),
            "completion_delta_pct": round(proj_completion - base_completion, 1),
            "income_delta": round(proj_income - base_income)
        },
        "impact": {
            "affected_trainees": affected_trainees,
            "additional_placements": additional_placements,
            "additional_employed": additional_employed,
            "total_cost": total_cost,
            "cost_per_additional_placement": cost_per_additional_placement,
            "range_min": range_min,
            "range_max": range_max
        },
        "explanation": {
            "why_statements": why_statements,
            "ai_synthesis": ai_synthesis
        }
    }


@router.post("/simulate")
def run_simulation(payload: ScenarioRequest):
    try:
        baseline = payload.baseline_metrics or {
            "placement_rate": 68.0,
            "employment_rate": 64.0,
            "completion_rate": 81.0,
            "job_relevance": 72.0,
            "employer_satisfaction": 75.0,
            "average_income": 18500,
            "total_trainees": 5240
        }
        res = run_simulation_engine(payload.intervention_type, payload.parameters, baseline)
        return {
            "status": "success",
            "scenario_name": payload.scenario_name,
            "intervention_type": payload.intervention_type,
            "parameters": payload.parameters,
            "result": res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@router.get("/scenarios")
def get_scenarios():
    return list(SAVED_SCENARIOS.values())


@router.post("/scenarios")
def save_scenario(payload: Dict[str, Any]):
    scenario_id = str(uuid.uuid4())[:8]
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    saved_item = {
        "id": scenario_id,
        "scenario_name": payload.get("scenario_name", "Custom Scenario"),
        "intervention_type": payload.get("intervention_type", "Add Training Module"),
        "parameters": payload.get("parameters", {}),
        "baseline": payload.get("baseline", {}),
        "projected": payload.get("projected", {}),
        "impact": payload.get("impact", {}),
        "created_at": now,
        "created_by": "Government Admin"
    }
    SAVED_SCENARIOS[scenario_id] = saved_item
    return saved_item


@router.get("/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    if scenario_id not in SAVED_SCENARIOS:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return SAVED_SCENARIOS[scenario_id]


@router.delete("/scenarios/{scenario_id}")
def delete_scenario(scenario_id: str):
    if scenario_id in SAVED_SCENARIOS:
        del SAVED_SCENARIOS[scenario_id]
        return {"status": "deleted", "id": scenario_id}
    raise HTTPException(status_code=404, detail="Scenario not found")


@router.post("/scenarios/{scenario_id}/duplicate")
def duplicate_scenario(scenario_id: str):
    if scenario_id not in SAVED_SCENARIOS:
        raise HTTPException(status_code=404, detail="Scenario not found")
    original = SAVED_SCENARIOS[scenario_id]
    new_id = str(uuid.uuid4())[:8]
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    duplicated = dict(original)
    duplicated["id"] = new_id
    duplicated["scenario_name"] = f"{original['scenario_name']} (Copy)"
    duplicated["created_at"] = now
    
    SAVED_SCENARIOS[new_id] = duplicated
    return duplicated
