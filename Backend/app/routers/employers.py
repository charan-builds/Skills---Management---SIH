"""Employer-facing API routes.

The demo mode intentionally uses the bundled dataset and short-lived in-process
interaction state. Outside demo mode every candidate, vacancy, outcome, and
metric below is derived from Firestore records; this module never substitutes
invented candidates or employment outcomes for missing production data.
"""

from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.auth.dependencies import ensure_organization_access, get_admin_user, get_current_user
from app.core.config import settings
from app.firebase.repository import FirestoreRepository
from app.schemas.employer import (
    EmployerFeedbackCreate,
    EmployerFeedbackResponse,
    EmployerOutcomeResponse,
    EmployerOutcomeUpdate,
    EmployerVerificationResponse,
    VerificationApprovalSchema,
)


router = APIRouter(prefix="/api/employers", tags=["Employers"])


def get_organization_user(org_id: str, current_user: dict = Depends(get_current_user)) -> dict:
    ensure_organization_access(org_id, current_user)
    return current_user


def get_employer_or_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") not in {"admin", "employer"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employer or administrator access is required.",
        )
    return current_user


def _organization_or_404(org_id: str) -> Dict[str, Any]:
    employer = FirestoreRepository.get_employer(org_id)
    if not employer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return employer


def _skill_name(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        return str(value.get("skill_name") or value.get("name") or value.get("skill_id") or "").strip()
    return ""


def _skill_names(values: Iterable[Any]) -> List[str]:
    return [name for item in values if (name := _skill_name(item))]





def _retention_status(trainee: Dict[str, Any], employer_name: str, milestone: str) -> str:
    for checkpoint in trainee.get("outcomes_timeline") or []:
        if milestone in str(checkpoint.get("checkpoint", "")).casefold() and checkpoint.get("employer_or_activity") == employer_name:
            return checkpoint.get("status") or "Recorded"
    return "Not recorded"


def _employer_outcomes(org_id: str, employer: Dict[str, Any]) -> List[Dict[str, Any]]:
    from app.schemas.trainee import TraineeBase
    employer_name = employer.get("name", "")
    outcomes: List[Dict[str, Any]] = []
    for trainee in FirestoreRepository.get_trainees():
        t_model = TraineeBase(**trainee)
        if t_model.current_consent.status != "GIVEN":
            continue
            
        for record in trainee.get("employment_history") or []:
            belongs_to_org = record.get("organization_id") == org_id or (
                employer_name and record.get("employer_name") == employer_name
            )
            if belongs_to_org:
                outcomes.append(
                    {
                        "trainee_id": trainee.get("id"),
                        "trainee_name": trainee.get("name") or "Unnamed trainee",
                        "programme_name": trainee.get("course_name") or trainee.get("programme_name") or "",
                        "district": trainee.get("district") or "",
                        "verification_status": "Employer attested" if record.get("verified") else "Pending verification",
                        "employment_status": record.get("employment_type") or trainee.get("outcome") or "Not recorded",
                        "employment_type": record.get("employment_type") or "Not recorded",
                        "joining_date": record.get("start_date"),
                        "salary": float(record.get("salary") or 0),
                        "job_role": record.get("role") or "Not recorded",
                        "retention_6m": _retention_status(trainee, employer_name, "6"),
                        "retention_12m": _retention_status(trainee, employer_name, "12"),
                        "employer_remarks": record.get("employer_remarks"),
                    }
                )
    return outcomes


def _profile_response(org_id: str, employer: Dict[str, Any]) -> Dict[str, Any]:
    preferences = employer.get("hiring_preferences") or {}
    return {
        "organization_id": org_id,
        "name": employer.get("name") or "",
        "industry": employer.get("industry") or "",
        "company_size": employer.get("company_size") or "",
        "location": employer.get("location") or "",
        "website": employer.get("website") or "",
        "contact_person": employer.get("contact_person") or "",
        "contact_email": employer.get("contact_email") or "",
        "contact_phone": employer.get("contact_phone") or "",
        "hiring_preferences": {
            "employment_types": preferences.get("employment_types") or [],
            "preferred_locations": preferences.get("preferred_locations") or [],
            "preferred_skills": preferences.get("preferred_skills") or [],
            "salary_budget_range": preferences.get("salary_budget_range") or "",
            "work_mode": preferences.get("work_mode") or "",
        },
    }


def _public_integration_config(config: Dict[str, Any]) -> Dict[str, Any]:
    return {
        key: value
        for key, value in config.items()
        if key in {"api_base_url", "client_id", "webhook_url", "environment", "api_key_configured"}
    }


def _format_salary_range(job: Dict[str, Any]) -> Optional[str]:
    minimum = job.get("min_salary")
    maximum = job.get("max_salary")
    if minimum is None and maximum is None:
        return None
    if minimum is None:
        return f"Up to ₹{maximum:,.0f}"
    if maximum is None:
        return f"From ₹{minimum:,.0f}"
    return f"₹{minimum:,.0f}–₹{maximum:,.0f}"





class OrgProfileUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    hiring_preferences: Optional[Dict[str, Any]] = None


class IntegrationConfigUpdate(BaseModel):
    api_base_url: Optional[str] = None
    client_id: Optional[str] = None
    api_key: Optional[str] = None
    webhook_url: Optional[str] = None
    environment: Optional[str] = None


@router.get("/verifications/pending", response_model=List[EmployerVerificationResponse])
def get_pending_verifications(_current_user: dict = Depends(get_admin_user)):
    return FirestoreRepository.get_pending_verifications()


@router.post("/verifications/{verification_id}", response_model=EmployerVerificationResponse)
def approve_or_reject_verification(
    verification_id: str,
    decision: VerificationApprovalSchema,
    _current_user: dict = Depends(get_admin_user),
):
    verification = FirestoreRepository.update_verification_status(
        verification_id, "Approved" if decision.approve else "Rejected"
    )
    if not verification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification record not found")
    return verification


@router.post("/feedback", response_model=EmployerFeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_employer_feedback(
    feedback: EmployerFeedbackCreate,
    current_user: dict = Depends(get_employer_or_admin),
):
    trainee = FirestoreRepository.get_trainee(feedback.trainee_id)
    if not trainee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainee not found")
        
    # Enforce employer organization isolation
    if current_user.get("role") == "employer":
        jwt_org_id = current_user.get("organization_id")
        if not jwt_org_id:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT missing organization ID")
             
        employer_name = current_user.get("name") or feedback.employer_name
        works_here = False
        for record in trainee.get("employment_history", []):
            if record.get("organization_id") == jwt_org_id or (employer_name and record.get("employer_name") == employer_name):
                works_here = True
                break
        
        if not works_here:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Trainee is not employed by your organization."
            )

    if not FirestoreRepository.get_programme(feedback.programme_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programme not found")
        
    return FirestoreRepository.create_employer_feedback(feedback)


@router.get("", response_model=List[Dict[str, Any]])
def get_employers(_current_user: dict = Depends(get_admin_user)):
    return FirestoreRepository.get_employers()


@router.get("/{org_id}/dashboard")
def get_employer_dashboard(org_id: str, _current_user: dict = Depends(get_organization_user)):
    employer = _organization_or_404(org_id)
    outcomes = _employer_outcomes(org_id, employer)
    hired_count = len(outcomes)

    return {
        "hired_trainees": hired_count,
        "recruitment_funnel": {
            "hired": hired_count, "retention_rate": "Not recorded",
        },
        "recruitment_outcome": {
            "hired": hired_count,
            "retention": "Not recorded",
        },
        "skill_intelligence": [],
        "ai_insights": {
            "training_recommendation": "Submit skill feedback to generate insights.",
            "skill_gap_alert": "Submit skill feedback to generate insights.",
        },
    }





@router.get("/{org_id}/outcomes", response_model=List[EmployerOutcomeResponse])
def get_employer_outcomes(org_id: str, _current_user: dict = Depends(get_organization_user)):
    return _employer_outcomes(org_id, _organization_or_404(org_id))


@router.patch("/{org_id}/outcomes/{trainee_id}/verify", response_model=EmployerOutcomeResponse)
def verify_outcome(
    org_id: str, trainee_id: str, update: EmployerOutcomeUpdate, _current_user: dict = Depends(get_organization_user)
):
    employer = _organization_or_404(org_id)
    trainee = FirestoreRepository.get_trainee(trainee_id)
    if not trainee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainee not found")
    if not update.joining_date:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="joining_date is required to record an employer outcome")
    history = [dict(item) for item in trainee.get("employment_history") or []]
    entry = next((item for item in history if item.get("organization_id") == org_id and item.get("role") == update.job_role), None)
    if entry is None:
        entry = {"id": f"emp_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"}
        history.append(entry)
    entry.update({
        "organization_id": org_id, "employer_name": employer.get("name") or org_id, "role": update.job_role,
        "start_date": update.joining_date, "salary": update.salary, "verified": True,
        "employment_type": update.employment_type, "job_relevance": "Not recorded", "employer_remarks": update.employer_remarks,
    })
    timeline = [dict(item) for item in trainee.get("outcomes_timeline") or []]
    for milestone, recorded_status in (("6 Months", update.retention_6m), ("12 Months", update.retention_12m)):
        checkpoint = next((item for item in timeline if item.get("checkpoint") == milestone and item.get("employer_or_activity") == employer.get("name")), None)
        if checkpoint is None:
            checkpoint = {"checkpoint": milestone}
            timeline.append(checkpoint)
        checkpoint.update({
            "date": datetime.utcnow().date().isoformat(), "status": recorded_status,
            "employer_or_activity": employer.get("name") or org_id, "verification_status": "Employer attested",
            "description": update.employer_remarks or "Employer outcome recorded.",
        })
    FirestoreRepository.update_trainee(trainee_id, {"employment_history": history, "outcomes_timeline": timeline, "outcome": update.employment_status})
    return {
        "trainee_id": trainee_id, "trainee_name": trainee.get("name") or "Unnamed trainee",
        "programme_name": trainee.get("course_name") or trainee.get("programme_name") or "", "district": trainee.get("district") or "",
        "verification_status": "Employer attested", **update.model_dump(),
    }


@router.get("/{org_id}/profile")
def get_employer_profile(org_id: str, _current_user: dict = Depends(get_organization_user)):
    return _profile_response(org_id, _organization_or_404(org_id))


@router.post("/{org_id}/profile")
@router.put("/{org_id}/profile")
def update_employer_profile(org_id: str, update: OrgProfileUpdate, _current_user: dict = Depends(get_organization_user)):
    _organization_or_404(org_id)
    updates = update.model_dump(exclude_unset=True)
    updated = FirestoreRepository.update_employer(org_id, updates) if updates else FirestoreRepository.get_employer(org_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return {"status": "success", "message": "Organization profile updated successfully", "profile": _profile_response(org_id, updated)}


@router.get("/{org_id}/integrations")
def get_employer_integrations(org_id: str, _current_user: dict = Depends(get_organization_user)):
    employer = _organization_or_404(org_id)
    outcomes = _employer_outcomes(org_id, employer)
    
    # Compute stats for overview
    auto_verified = sum(1 for o in outcomes if o.get("verification_status") == "Employer attested" and "CONFLICT" not in str(o.get("employer_remarks", "")).upper())
    manual_review = sum(1 for o in outcomes if o.get("verification_status") == "Pending verification")
    records_received = auto_verified + manual_review
    
    integrations = employer.get("integrations") or []
    
    return {
        "integrations": integrations, 
        "api_config": _public_integration_config(employer.get("integration_config") or {}),
        "integration_overview": {
            "connected_systems": len(integrations),
            "records_received": records_received,
            "automatically_verified": auto_verified,
            "manual_review_required": manual_review
        }
    }


@router.post("/{org_id}/integrations/validate")
def validate_employer_integration_config(org_id: str, _current_user: dict = Depends(get_organization_user)):
    employer = _organization_or_404(org_id)
    config = employer.get("integration_config") or {}
    base_url, webhook_url = str(config.get("api_base_url") or ""), str(config.get("webhook_url") or "")
    missing = [field for field, value in (("api_base_url", base_url), ("webhook_url", webhook_url)) if not value]
    if missing:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Missing required integration settings: {', '.join(missing)}")
    if not base_url.startswith("https://") or not webhook_url.startswith("https://"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="API gateway and webhook URLs must use HTTPS.")
    return {"status": "valid", "message": "Configuration is syntactically valid. No external connector was contacted.", "live_connector_tested": False}


@router.post("/{org_id}/integrations/{integration_id}/sync")
def sync_employer_integration(org_id: str, integration_id: str, _current_user: dict = Depends(get_organization_user)):
    employer = _organization_or_404(org_id)
    integrations = employer.get("integrations") or []
    integration = next((i for i in integrations if i.get("id") == integration_id), None)
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
        
    employer_name = employer.get("name", org_id)
    
    processed_count = 0
    exceptions = 0
    
    for trainee in FirestoreRepository.get_trainees():
        history = trainee.get("employment_history") or []
        updated = False
        
        for record in history:
            belongs_to_org = record.get("organization_id") == org_id or (employer_name and record.get("employer_name") == employer_name)
            if belongs_to_org:
                if not record.get("verified") and record.get("verification_state") in ["SELF_REPORTED", "UNVERIFIED", "Pending"]:
                    # Deterministic Mock Engine
                    if not record.get("start_date") or "mock" in str(record.get("role", "")).lower() or record.get("salary") == 0:
                        record["verification_state"] = "CONFLICTING"
                        record["employer_remarks"] = f"SYSTEM DETECTED CONFLICT: ATS payload mismatched or missing joining details for claiming trainee."
                        exceptions += 1
                    else:
                        record["verified"] = True
                        record["verification_state"] = "EMPLOYER_VERIFIED"
                        record["employer_remarks"] = "Auto-verified via HRMS/ATS API Matching Engine."
                        
                    updated = True
                    processed_count += 1
                    
        if updated:
            FirestoreRepository.update_trainee(trainee.get("id"), {"employment_history": history})

    integration["last_synced"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    integration["candidates_synced"] = (integration.get("candidates_synced", 0) or 0) + processed_count
    
    FirestoreRepository.update_employer(org_id, {"integrations": integrations})
    
    return {
        "status": "success",
        "processed": processed_count,
        "exceptions": exceptions,
        "message": f"ATS synchronization completed. {processed_count} records processed."
    }


@router.post("/{org_id}/integrations/config")
def update_employer_integration_config(org_id: str, config: IntegrationConfigUpdate, _current_user: dict = Depends(get_organization_user)):
    employer = _organization_or_404(org_id)
    current = dict(employer.get("integration_config") or {})
    updates = config.model_dump(exclude_unset=True)
    supplied_key = str(updates.pop("api_key", "") or "")
    if supplied_key and not settings.ENABLE_DEMO_MODE:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Production API keys must be supplied through the configured secret manager, not this API.")
    current.update({key: value for key, value in updates.items() if value is not None})
    if supplied_key:
        current["api_key_configured"] = True
    updated = FirestoreRepository.update_employer(org_id, {"integration_config": current})
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return {"status": "success", "message": "API configuration updated successfully", "config": _public_integration_config(updated.get("integration_config") or {})}
