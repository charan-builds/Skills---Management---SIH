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


def _job_skill_names(job: Dict[str, Any]) -> List[str]:
    return _skill_names(job.get("skills_required") or job.get("required_skills") or [])


def _trainee_skill_names(trainee: Dict[str, Any]) -> List[str]:
    return _skill_names(trainee.get("skills") or [])


def _match_candidate_to_job(trainee: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
    required = _job_skill_names(job)
    available = {skill.casefold() for skill in _trainee_skill_names(trainee)}
    matched = [skill for skill in required if skill.casefold() in available]
    missing = [skill for skill in required if skill.casefold() not in available]
    return {
        "score": round((len(matched) / len(required)) * 100) if required else 0,
        "matched_skills": matched,
        "missing_skills": missing,
    }


def _organization_jobs(org_id: str) -> List[Dict[str, Any]]:
    return [
        dict(job)
        for job in FirestoreRepository.get_jobs()
        if job.get("employer_id") == org_id and job.get("status", "Active").casefold() == "active"
    ]


# Demo-only interaction state. Production uses repository-backed Firestore data.
demo_shortlists: set[tuple[str, str, str]] = set()
demo_contacts: set[tuple[str, str]] = set()


def _interaction_state(org_id: str) -> Dict[str, set]:
    if settings.ENABLE_DEMO_MODE:
        return {
            "shortlists": {(trainee_id, job_id) for oid, trainee_id, job_id in demo_shortlists if oid == org_id},
            "contacts": {trainee_id for oid, trainee_id in demo_contacts if oid == org_id},
        }
    return FirestoreRepository.get_employer_candidate_interactions(org_id)


def _experience_summary(trainee: Dict[str, Any]) -> str:
    history = trainee.get("employment_history") or []
    if not history:
        return "No recorded work history"
    return "1 recorded role" if len(history) == 1 else f"{len(history)} recorded roles"


def _candidate_record(
    trainee: Dict[str, Any], jobs: List[Dict[str, Any]], interactions: Dict[str, set]
) -> Dict[str, Any]:
    matches = [(_match_candidate_to_job(trainee, job), job) for job in jobs]
    match, job = max(
        matches,
        key=lambda item: item[0]["score"],
        default=({"score": 0, "matched_skills": [], "missing_skills": []}, None),
    )
    programme = trainee.get("programme_name") or trainee.get("course_name") or ""
    trainee_id = str(trainee.get("id", ""))
    target_role = (job or {}).get("role") or (job or {}).get("title") or None
    reasoning = (
        f"{len(match['matched_skills'])} of {len(_job_skill_names(job))} recorded required skills match {target_role}."
        if job
        else "No active vacancy is available for a role-specific match calculation."
    )
    return {
        "id": trainee_id,
        "trainee_id": trainee_id,
        "name": trainee.get("name") or "Unnamed candidate",
        "programme": programme,
        "location": trainee.get("district") or "",
        "district": trainee.get("district") or "",
        "skills": _trainee_skill_names(trainee),
        "match": match["score"],
        "match_percentage": match["score"],
        "job_match": match["score"],
        "recommended_job_id": (job or {}).get("id"),
        "target_role": target_role,
        "matched_skills": match["matched_skills"],
        "missing_skills": match["missing_skills"],
        "strengths": match["matched_skills"],
        "experience": _experience_summary(trainee),
        "status": trainee.get("status") or "Not recorded",
        "certification_status": trainee.get("status") or "Not recorded",
        "readiness": "Match calculated" if job else "Awaiting vacancy",
        "recommendation": "Strong match" if match["score"] >= 75 else "Review skill gaps",
        "reasoning": reasoning,
        "is_shortlisted": any(item[0] == trainee_id for item in interactions["shortlists"]),
        "is_contacted": trainee_id in interactions["contacts"],
    }


def _candidate_records(org_id: str) -> List[Dict[str, Any]]:
    jobs = _organization_jobs(org_id)
    interactions = _interaction_state(org_id)
    candidates = [
        _candidate_record(trainee, jobs, interactions)
        for trainee in FirestoreRepository.get_trainees()
        if trainee.get("id")
    ]
    return sorted(candidates, key=lambda candidate: (-candidate["match"], candidate["name"].casefold()))


def _retention_status(trainee: Dict[str, Any], employer_name: str, milestone: str) -> str:
    for checkpoint in trainee.get("outcomes_timeline") or []:
        if milestone in str(checkpoint.get("checkpoint", "")).casefold() and checkpoint.get("employer_or_activity") == employer_name:
            return checkpoint.get("status") or "Recorded"
    return "Not recorded"


def _employer_outcomes(org_id: str, employer: Dict[str, Any]) -> List[Dict[str, Any]]:
    employer_name = employer.get("name", "")
    outcomes: List[Dict[str, Any]] = []
    for trainee in FirestoreRepository.get_trainees():
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


class ShortlistRequest(BaseModel):
    trainee_id: str
    job_id: str


class ContactRequest(BaseModel):
    trainee_id: str
    message: Optional[str] = None


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
    _current_user: dict = Depends(get_employer_or_admin),
):
    if not FirestoreRepository.get_trainee(feedback.trainee_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainee not found")
    if not FirestoreRepository.get_programme(feedback.programme_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programme not found")
    return FirestoreRepository.create_employer_feedback(feedback)


@router.get("", response_model=List[Dict[str, Any]])
def get_employers(_current_user: dict = Depends(get_admin_user)):
    return FirestoreRepository.get_employers()


@router.get("/{org_id}/dashboard")
def get_employer_dashboard(org_id: str, _current_user: dict = Depends(get_organization_user)):
    employer = _organization_or_404(org_id)
    jobs = _organization_jobs(org_id)
    candidates = _candidate_records(org_id)
    interactions = _interaction_state(org_id)
    outcomes = _employer_outcomes(org_id, employer)
    matched_count = sum(candidate["match"] >= 65 for candidate in candidates)
    shortlisted_count = len(interactions["shortlists"])
    contacted_count = len(interactions["contacts"])
    hired_count = len(outcomes)
    avg_match = round(sum(candidate["match"] for candidate in candidates) / len(candidates)) if candidates else None
    selection_rate = round((hired_count / matched_count) * 100) if matched_count else None

    demand = Counter(skill for job in jobs for skill in _job_skill_names(job))
    supply = Counter(skill for candidate in FirestoreRepository.get_trainees() for skill in _trainee_skill_names(candidate))
    skill_intelligence = []
    for skill, demand_count in demand.most_common(10):
        supply_count = supply.get(skill, 0)
        coverage = round((supply_count / demand_count) * 100) if demand_count else 0
        skill_intelligence.append(
            {
                "skill": skill,
                "demand": "Very High" if demand_count >= 4 else "High" if demand_count >= 2 else "Medium",
                "supply": supply_count,
                "gap": "High" if coverage < 50 else "Moderate" if coverage < 100 else "Low",
                "coverage": coverage,
            }
        )
    top_gap = next((item for item in skill_intelligence if item["gap"] == "High"), None)
    training_recommendation = (
        f"{top_gap['skill']} has {top_gap['supply']} recorded candidates for {top_gap['demand'].lower()} demand across active vacancies."
        if top_gap
        else "No active vacancy skill-demand gap is available to analyze."
    )
    return {
        "open_vacancies": len(jobs),
        "available_candidates": len(candidates),
        "shortlisted_candidates": shortlisted_count,
        "hired_trainees": hired_count,
        "recruitment_funnel": {
            "sourced": len(candidates), "matched": matched_count, "shortlisted": shortlisted_count,
            "contacted_interview": contacted_count, "hired": hired_count, "retention_rate": "Not recorded",
        },
        "recruitment_outcome": {
            "hired": hired_count,
            "selection_rate": f"{selection_rate}%" if selection_rate is not None else "Not recorded",
            "avg_skill_match": f"{avg_match}%" if avg_match is not None else "Not recorded",
            "retention": "Not recorded",
        },
        "skill_intelligence": skill_intelligence,
        "ai_insights": {
            "training_recommendation": training_recommendation,
            "ai_hiring_insight": (
                f"{matched_count} of {len(candidates)} candidates meet the 65% recorded-skill threshold."
                if jobs else "Create an active vacancy to calculate candidate matching."
            ),
            "skill_gap_alert": (
                f"{top_gap['skill']} is the largest current recorded skill gap."
                if top_gap else "No current high skill gap is available from active vacancy data."
            ),
        },
    }


@router.get("/{org_id}/active-vacancies")
def get_active_vacancies(org_id: str, _current_user: dict = Depends(get_organization_user)):
    _organization_or_404(org_id)
    trainees = FirestoreRepository.get_trainees()
    vacancies: List[Dict[str, Any]] = []
    for job in _organization_jobs(org_id):
        vacancy = dict(job)
        vacancy["matching_candidates"] = sum(_match_candidate_to_job(trainee, vacancy)["score"] >= 65 for trainee in trainees)
        vacancy["salary_range"] = vacancy.get("salary_range") or _format_salary_range(vacancy)
        vacancies.append(vacancy)
    return vacancies


@router.get("/{org_id}/recommended-candidates")
def get_recommended_candidates(org_id: str, _current_user: dict = Depends(get_organization_user)):
    _organization_or_404(org_id)
    return _candidate_records(org_id)[:20]


@router.get("/{org_id}/candidates")
def get_all_employer_candidates(org_id: str, _current_user: dict = Depends(get_organization_user)):
    _organization_or_404(org_id)
    return _candidate_records(org_id)


@router.get("/{org_id}/candidates/{candidate_id}")
def get_employer_candidate_profile(
    org_id: str, candidate_id: str, _current_user: dict = Depends(get_organization_user)
):
    _organization_or_404(org_id)
    trainee = FirestoreRepository.get_trainee(candidate_id)
    if not trainee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    summary = next((candidate for candidate in _candidate_records(org_id) if candidate["id"] == candidate_id), None)
    if summary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    assessments = {
        _skill_name(assessment): assessment.get("proficiency_score")
        for assessment in FirestoreRepository.get_trainee_assessments(candidate_id)
        if isinstance(assessment, dict) and _skill_name(assessment)
    }
    skills = [
        {"name": skill, "proficiency": assessments.get(skill), "status": "Assessed" if assessments.get(skill) is not None else "Not assessed"}
        for skill in _trainee_skill_names(trainee)
    ]
    experience = [
        {
            "role": item.get("role") or "Not recorded", "company": item.get("employer_name") or "Not recorded",
            "period": " – ".join(filter(None, [item.get("start_date"), item.get("end_date")])),
            "description": item.get("description") or "No description recorded.",
        }
        for item in trainee.get("employment_history") or []
    ]
    certifications = [
        {
            "name": certificate.get("name") or "Unnamed certification",
            "issuer": certificate.get("issuing_body") or certificate.get("issuer") or "Not recorded",
            "date": certificate.get("date") or "Not recorded",
            "id": certificate.get("id") or certificate.get("credential_id") or "Not recorded",
        }
        for certificate in trainee.get("certifications") or []
        if isinstance(certificate, dict)
    ]
    missing = summary["missing_skills"]
    return {
        "id": candidate_id, "traineeId": candidate_id, "name": summary["name"],
        "initials": "".join(part[:1].upper() for part in summary["name"].split()) or "?",
        "email": trainee.get("email"), "phone": trainee.get("phone"), "programme": summary["programme"],
        "location": summary["location"], "readiness": summary["readiness"], "trainingStatus": summary["status"],
        "outcome": trainee.get("outcome") or "Not recorded", "match": summary["match"],
        "job_match": summary["job_match"], "recommended_job_id": summary["recommended_job_id"], "target_role": summary["target_role"],
        "education": trainee.get("education") or [], "experience": experience, "certifications": certifications,
        "skills": skills, "projects": trainee.get("projects") or [],
        "eligibleRoles": [
            job.get("role") or job.get("title") for job in _organization_jobs(org_id)
            if _match_candidate_to_job(trainee, job)["score"] >= 65
        ],
        "ai_recommendation": {
            "summary": summary["reasoning"], "strengths": summary["matched_skills"], "skill_gaps": missing,
            "intervention_recommendation": f"Prioritize training in {', '.join(missing)}." if missing else "No role-specific skill gap is recorded for the selected vacancy.",
        },
        "is_shortlisted": summary["is_shortlisted"], "is_contacted": summary["is_contacted"],
    }


@router.post("/{org_id}/shortlist")
def shortlist_candidate(org_id: str, req: ShortlistRequest, _current_user: dict = Depends(get_organization_user)):
    _organization_or_404(org_id)
    if not FirestoreRepository.get_trainee(req.trainee_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    job = FirestoreRepository.get_job(req.job_id)
    if not job or job.get("employer_id") != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization vacancy not found")
    if settings.ENABLE_DEMO_MODE:
        key = (org_id, req.trainee_id, req.job_id)
        if key in demo_shortlists:
            demo_shortlists.remove(key)
            shortlisted = False
        else:
            demo_shortlists.add(key)
            shortlisted = True
    else:
        shortlisted = FirestoreRepository.toggle_employer_shortlist(org_id, req.trainee_id, req.job_id)
    return {"status": "success", "shortlisted": shortlisted, "message": "Candidate shortlisted" if shortlisted else "Candidate removed from shortlist"}


@router.post("/{org_id}/contact")
def contact_candidate(org_id: str, req: ContactRequest, _current_user: dict = Depends(get_organization_user)):
    _organization_or_404(org_id)
    if not FirestoreRepository.get_trainee(req.trainee_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    if settings.ENABLE_DEMO_MODE:
        demo_contacts.add((org_id, req.trainee_id))
    else:
        FirestoreRepository.record_employer_candidate_contact(org_id, req.trainee_id, req.message)
    return {"status": "success", "message": "Contact request recorded. Configure a delivery provider to send external messages."}


@router.get("/{org_id}/shortlisted")
def get_shortlisted(org_id: str, _current_user: dict = Depends(get_organization_user)):
    _organization_or_404(org_id)
    return [{"trainee_id": trainee_id, "job_id": job_id} for trainee_id, job_id in _interaction_state(org_id)["shortlists"]]


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
    return {"integrations": employer.get("integrations") or [], "api_config": _public_integration_config(employer.get("integration_config") or {})}


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
    _organization_or_404(org_id)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="A production connector provider has not been configured for this integration.")


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
