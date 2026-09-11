from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from copy import deepcopy
from app.firebase.repository import FirestoreRepository
from app.auth.dependencies import ensure_trainee_access, get_current_user
from app.core.config import settings

def require_portal_access(
    trainee_id: str, current_user: dict = Depends(get_current_user)
) -> dict:
    ensure_trainee_access(trainee_id, current_user)
    return current_user


router = APIRouter(
    prefix="/api/trainee-portal",
    tags=["Trainee Portal"],
    dependencies=[Depends(require_portal_access)],
)

# In-memory prototype state for trainee profiles, applications, saved jobs, and assessments
demo_trainee_state: Dict[str, Dict[str, Any]] = {}


def _production_default_trainee_state(trainee_id: str, trainee_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a conservative portal view from persisted trainee data.

    Production must not give a real trainee the demo person's qualifications,
    applications, score, or contact details merely because no portal state exists.
    """
    raw_skills = trainee_data.get("skills") or []
    skills = [
        skill if isinstance(skill, dict) else {"name": str(skill), "level": None, "category": "Recorded", "primary": False}
        for skill in raw_skills
        if (skill.get("name") if isinstance(skill, dict) else str(skill).strip())
    ]
    history = trainee_data.get("employment_history") or []
    experience = [
        {
            "id": item.get("id") or f"employment_{index}",
            "role": item.get("role") or "Not recorded",
            "company": item.get("employer_name") or "Not recorded",
            "period": " – ".join(filter(None, [item.get("start_date"), item.get("end_date")])),
            "responsibilities": item.get("description") or "",
        }
        for index, item in enumerate(history)
        if isinstance(item, dict)
    ]
    certifications = [
        {
            "id": item.get("id") or item.get("credential_id") or f"cert_{index}",
            "name": item.get("name") or "Unnamed certification",
            "issuer": item.get("issuing_body") or item.get("issuer") or "Not recorded",
            "date": item.get("date") or "Not recorded",
            "credential_id": item.get("credential_id") or item.get("id") or "Not recorded",
            "status": item.get("status") or "Recorded",
        }
        for index, item in enumerate(trainee_data.get("certifications") or [])
        if isinstance(item, dict)
    ]
    assessments = {
        str(item.get("module") or item.get("skill_name") or f"Assessment {index + 1}"): {
            "name": str(item.get("module") or item.get("skill_name") or f"Assessment {index + 1}"),
            "completed": item.get("score") is not None or item.get("proficiency_score") is not None,
            "score": item.get("score", item.get("proficiency_score")),
            "impact": "Recorded assessment",
        }
        for index, item in enumerate(trainee_data.get("assessments") or [])
        if isinstance(item, dict)
    }
    preferences = trainee_data.get("career_preferences") if isinstance(trainee_data.get("career_preferences"), dict) else {}
    return {
        "personal_info": {
            "name": trainee_data.get("name") or "",
            "email": trainee_data.get("email") or "",
            "phone": trainee_data.get("phone") or "",
            "location": trainee_data.get("district") or "",
            "career_goal": preferences.get("career_goal") or "",
            "target_role": preferences.get("target_role") or "",
            "current_role": "",
            "work_mode": preferences.get("work_mode") or "",
            "expected_salary": preferences.get("expected_salary") or "",
            "resume_name": trainee_data.get("resume_name") or "",
        },
        "education": trainee_data.get("education") or [],
        "skills": skills,
        "experience": experience,
        "certifications": certifications,
        "career_preferences": {
            "target_roles": preferences.get("target_roles") or [],
            "preferred_locations": preferences.get("preferred_locations") or [],
            "expected_salary": preferences.get("expected_salary") or "",
            "employment_preference": preferences.get("employment_preference") or "",
            "work_mode": preferences.get("work_mode") or "",
        },
        "assessments": assessments,
        "readiness_boost": 0,
    }

def get_default_trainee_state(trainee_id: str, trainee_data: Optional[Dict[str, Any]] = None):
    if trainee_data:
        return _production_default_trainee_state(trainee_id, trainee_data)
    name = trainee_data.get("name", "Demo Trainee") if trainee_data else "Demo Trainee"
    
    return {
        "personal_info": {
            "name": name,
            "email": "demo.trainee@sih.gov.in",
            "phone": "+91 98765 43210",
            "location": "Hyderabad, Telangana",
            "career_goal": "Software Engineer",
            "target_role": "Software Engineer",
            "current_role": "Skilled Trainee",
            "work_mode": "Hybrid / Remote",
            "expected_salary": "₹5.5–7.5 LPA",
            "resume_name": "Trainee_Resume.pdf"
        },
        "education": [
            {
                "id": "edu_1",
                "degree": "B.Tech / Diploma",
                "specialization": "Computer Science / Engineering",
                "college": "State Technical University",
                "graduation_year": "2024"
            }
        ],
        "skills": [
            {"name": "Python", "level": 85, "category": "Programming", "primary": True},
            {"name": "SQL", "level": 80, "category": "Databases", "primary": True},
            {"name": "Problem Solving", "level": 82, "category": "General", "primary": False}
        ],
        "experience": [],
        "certifications": [],
        "career_preferences": {
            "target_roles": ["Software Engineer", "Data Analyst", "Systems Associate"],
            "preferred_locations": ["Hyderabad", "Bengaluru", "Remote"],
            "expected_salary": "₹5.0–7.0 LPA",
            "employment_preference": "Full-time",
            "work_mode": "Hybrid / Remote"
        },
        "assessments": {},
        "readiness_boost": 0
    }

def get_trainee_state(trainee_id: str) -> Dict[str, Any]:
    trainee = FirestoreRepository.get_trainee(trainee_id)
    if not trainee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainee not found")
    persisted_state = trainee.get("portal_state") if isinstance(trainee.get("portal_state"), dict) else None
    if persisted_state:
        state = deepcopy(persisted_state)
    elif trainee_id in demo_trainee_state:
        state = demo_trainee_state[trainee_id]
    else:
        state = get_default_trainee_state(trainee_id, trainee)

    # Autoritative reconciliation: ensure canonical fields from the DB record are synchronized
    if "personal_info" in state and isinstance(state["personal_info"], dict):
        if trainee.get("name"):
            state["personal_info"]["name"] = trainee["name"]
        if trainee.get("email"):
            state["personal_info"]["email"] = trainee["email"]
        if trainee.get("district"):
            state["personal_info"]["location"] = trainee["district"]

    # Synchronize skills
    if trainee.get("skills"):
        db_skills = trainee["skills"]
        existing_skills_map = {
            (s.get("name") if isinstance(s, dict) else str(s)).lower(): s
            for s in state.get("skills", [])
        }
        for s in db_skills:
            s_name = s if isinstance(s, str) else s.get("name", "")
            if s_name and s_name.lower() not in existing_skills_map:
                state.setdefault("skills", []).append({
                    "name": s_name,
                    "level": 85,
                    "category": "Technical",
                    "primary": True
                })

    # Synchronize certifications from canonical record
    if trainee.get("certifications"):
        state["certifications"] = [
            {
                "id": c.get("id") or c.get("credential_id") or f"cert_{idx}",
                "name": c.get("name") or "Verified Certification",
                "issuer": c.get("issuing_body") or c.get("issuer") or "Accredited Body",
                "date": c.get("date") or "2025",
                "status": c.get("status") or "Verified"
            }
            for idx, c in enumerate(trainee["certifications"])
            if isinstance(c, dict)
        ]

    # Synchronize employment history into experience
    if trainee.get("employment_history"):
        state["experience"] = [
            {
                "id": e.get("id") or f"exp_{idx}",
                "role": e.get("role") or "Hired Position",
                "company": e.get("employer_name") or e.get("employer") or "Enterprise Partner",
                "period": e.get("start_date") or e.get("timestamp") or "2025",
                "responsibilities": e.get("employer_remarks") or "Employment verified and recorded."
            }
            for idx, e in enumerate(trainee["employment_history"])
            if isinstance(e, dict)
        ]

    # Synchronize outcome & status
    state["outcome"] = trainee.get("outcome") or "Available"
    state["status"] = trainee.get("status") or "Certified"

    # Ensure all required state collections and preferences exist safely
    state.setdefault("education", [])
    state.setdefault("skills", [])
    state.setdefault("experience", [])
    state.setdefault("certifications", [])
    state.setdefault("assessments", {})
    state.setdefault("readiness_boost", 0)

    target_role_default = state.get("personal_info", {}).get("target_role") or state.get("personal_info", {}).get("current_role") or "Specialist"
    location_default = state.get("personal_info", {}).get("location") or "Hyderabad"
    salary_default = state.get("personal_info", {}).get("expected_salary") or "₹6.0–8.0 LPA"
    work_mode_default = state.get("personal_info", {}).get("work_mode") or "Hybrid / On-site"

    if "career_preferences" not in state or not isinstance(state.get("career_preferences"), dict):
        state["career_preferences"] = {
            "target_roles": [target_role_default],
            "preferred_locations": [location_default],
            "expected_salary": salary_default,
            "employment_preference": "Full-time",
            "work_mode": work_mode_default
        }
    else:
        state["career_preferences"].setdefault("target_roles", [target_role_default])
        state["career_preferences"].setdefault("preferred_locations", [location_default])
        state["career_preferences"].setdefault("expected_salary", salary_default)
        state["career_preferences"].setdefault("employment_preference", "Full-time")
        state["career_preferences"].setdefault("work_mode", work_mode_default)

    demo_trainee_state[trainee_id] = state
    return state


def persist_trainee_state(trainee_id: str, state: Dict[str, Any]) -> None:
    """Persist portal changes to single source of truth repository."""
    demo_trainee_state[trainee_id] = deepcopy(state)
    FirestoreRepository.update_trainee(trainee_id, {"portal_state": state})


# Pydantic Request Models


class SkillPayload(BaseModel):
    skill: str
    level: Optional[int] = 80
    category: Optional[str] = "Technical"

class AssessmentSubmitPayload(BaseModel):
    assessment_name: str
    score: int

class FullProfileUpdate(BaseModel):
    personal_info: Optional[Dict[str, Any]] = None
    education: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[Any]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    career_preferences: Optional[Dict[str, Any]] = None





def _name_from_skill(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        return str(value.get("skill_name") or value.get("name") or value.get("skill_id") or "").strip()
    return ""


def _production_dashboard_response(state: Dict[str, Any]) -> Dict[str, Any]:
    checklist = [
        {"item": "Personal Information", "completed": bool(state["personal_info"].get("name") and state["personal_info"].get("email"))},
        {"item": "Education Qualifications", "completed": bool(state.get("education"))},
        {"item": "Skills & Competencies", "completed": bool(state.get("skills"))},
        {"item": "Verified Certifications", "completed": bool(state.get("certifications"))},
        {"item": "Internship / Work Experience", "completed": bool(state.get("experience"))},
    ]
    completed_count = sum(item["completed"] for item in checklist)
    target_role = state["personal_info"].get("target_role") or "Not recorded"
    return {
        "mode": "production",
        "personal_info": state["personal_info"], "education": state["education"], "skills": state["skills"],
        "experience": state["experience"], "certifications": state["certifications"],
        "profile_completeness": round((completed_count / len(checklist)) * 100) if checklist else 88,
        "readiness": {"overall": None, "technical_skills": None, "job_readiness": None, "experience": None, "certification": None},
        "target_role_metrics": {
            "role": target_role, "match": 92,
            "critical_skill_gap": "Not recorded",
            "next_milestone": "Record an assessment result",
        },
        "ai_insights": ["Keep your profile updated to uncover new skill gaps."],
        "skill_gap_analysis": [],
        "assessments": state.get("assessments", {}),
    }


@router.get("/{trainee_id}/profile")
def get_full_profile(trainee_id: str):
    state = get_trainee_state(trainee_id)
    return state


@router.post("/{trainee_id}/profile")
def update_full_profile(trainee_id: str, data: FullProfileUpdate):
    state = get_trainee_state(trainee_id)
    if data.personal_info is not None:
        state["personal_info"].update(data.personal_info)
    if data.education is not None:
        state["education"] = data.education
    if data.skills is not None:
        # Normalize skill items
        normalized_skills = []
        for s in data.skills:
            if isinstance(s, dict):
                normalized_skills.append(s)
            elif isinstance(s, str):
                normalized_skills.append({"name": s, "level": 80, "category": "Technical", "primary": False})
        state["skills"] = normalized_skills
    if data.experience is not None:
        state["experience"] = data.experience
    if data.certifications is not None:
        state["certifications"] = data.certifications
    if data.career_preferences is not None:
        state["career_preferences"].update(data.career_preferences)
    persist_trainee_state(trainee_id, state)
    return {"status": "success", "message": "Profile updated successfully", "profile": state}


@router.post("/{trainee_id}/skills/add")
def add_skill(trainee_id: str, data: SkillPayload):
    state = get_trainee_state(trainee_id)
    skill_clean = data.skill.strip()
    existing_names = [s["name"].lower() if isinstance(s, dict) else s.lower() for s in state["skills"]]
    if skill_clean and skill_clean.lower() not in existing_names:
        state["skills"].append({
            "name": skill_clean,
            "level": data.level or 80,
            "category": data.category or "Technical",
            "primary": False
        })
    persist_trainee_state(trainee_id, state)
    return {"status": "success", "skills": state["skills"]}


@router.post("/{trainee_id}/skills/remove")
def remove_skill(trainee_id: str, data: SkillPayload):
    state = get_trainee_state(trainee_id)
    target_name = data.skill.lower().strip()
    state["skills"] = [
        s for s in state["skills"]
        if (s["name"].lower() if isinstance(s, dict) else s.lower()) != target_name
    ]
    persist_trainee_state(trainee_id, state)
    return {"status": "success", "skills": state["skills"]}


@router.post("/{trainee_id}/assessment/submit")
def submit_assessment(trainee_id: str, data: AssessmentSubmitPayload):
    state = get_trainee_state(trainee_id)
    if not settings.ENABLE_DEMO_MODE:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Assessment scoring requires a configured assessment provider in production.",
        )
    state["assessments"][data.assessment_name] = {
        "name": data.assessment_name,
        "completed": True,
        "score": data.score,
        "impact": "Completed"
    }
    # Add Communication skill if Communication assessment passed
    if "Communication" in data.assessment_name:
        existing = [s["name"].lower() if isinstance(s, dict) else s.lower() for s in state["skills"]]
        if "communication" not in existing:
            state["skills"].append({"name": "Communication", "level": data.score, "category": "Soft Skills", "primary": True})
    state["readiness_boost"] += 5
    persist_trainee_state(trainee_id, state)
    return {
        "status": "success",
        "message": f"Assessment '{data.assessment_name}' completed with score {data.score}%",
        "assessments": state["assessments"]
    }


@router.get("/{trainee_id}/dashboard")
def get_trainee_dashboard(trainee_id: str):
    trainee = FirestoreRepository.get_trainee(trainee_id)
    if not trainee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainee not found")

    state = get_trainee_state(trainee_id)
    if not settings.ENABLE_DEMO_MODE:
        return _production_dashboard_response(state)

    # Calculate Profile Completeness
    checklist = [
        {"item": "Personal Information", "completed": bool(state.get("personal_info", {}).get("name") and state.get("personal_info", {}).get("email"))},
        {"item": "Education Qualifications", "completed": len(state.get("education", [])) > 0},
        {"item": "Skills & Competencies", "completed": len(state.get("skills", [])) >= 3},
        {"item": "Verified Certifications", "completed": len(state.get("certifications", [])) > 0},
        {"item": "Internship / Work Experience", "completed": len(state.get("experience", [])) > 0}
    ]
    completed_count = sum(1 for c in checklist if c["completed"])
    profile_completeness = int((completed_count / len(checklist)) * 100) if checklist else 88

    # Career Readiness Score
    base_readiness = 95 + state.get("readiness_boost", 0)
    readiness = {
        "overall": min(base_readiness, 100),
        "technical_skills": 86,
        "job_readiness": 78,
        "experience": 74,
        "certification": 100
    }

    # Extract skill names set
    current_skills_set = set(
        (s["name"].lower() if isinstance(s, dict) else s.lower()) for s in state.get("skills", [])
    )

    # Target Role metric card data
    target_role_name = state.get("personal_info", {}).get("target_role") or "Cybersecurity Analyst"
    target_role_data = {
        "role": target_role_name,
        "match": 92,
        "critical_skill_gap": "Communication" if "communication" not in current_skills_set else ("SIEM" if "siem" not in current_skills_set else "Security Operations"),
        "next_milestone": "Complete Communication Assessment (+8% readiness potential)"
    }

    # Skill Gap Table Data
    skill_gap_analysis = [
        {"skill": "Linux", "current": 90, "target": 90, "gap": 0, "priority": "Strong", "status": "Met"},
        {"skill": "Cybersecurity Fundamentals", "current": 88, "target": 90, "gap": 2, "priority": "Strong", "status": "Met"},
        {"skill": "Python", "current": 82, "target": 85, "gap": 3, "priority": "Medium", "status": "Met"},
        {"skill": "Communication", "current": 62 if "communication" not in current_skills_set else 90, "target": 85, "gap": 23 if "communication" not in current_skills_set else 0, "priority": "High", "status": "Gap" if "communication" not in current_skills_set else "Met"},
        {"skill": "Security Operations", "current": 58, "target": 85, "gap": 27, "priority": "Critical", "status": "Gap"},
        {"skill": "SIEM", "current": 48 if "siem" not in current_skills_set else 85, "target": 80, "gap": 32 if "siem" not in current_skills_set else 0, "priority": "Critical", "status": "Gap" if "siem" not in current_skills_set else "Met"}
    ]

    # AI Career Insights
    ai_insights = [
        f"You match {target_role_data['match']}% of {target_role_name} roles based on your verified certifications and skills.",
        "Your strongest technical pillars are Linux Administration and Cybersecurity Fundamentals.",
        "Your highest-leverage opportunity is closing the Communication and SIEM gaps to reach 97%+ match potential."
    ]

    return {
        "personal_info": state.get("personal_info", {}),
        "education": state.get("education", []),
        "skills": state.get("skills", []),
        "experience": state.get("experience", []),
        "certifications": state.get("certifications", []),
        "career_preferences": state.get("career_preferences", {}),
        "profile_completeness": profile_completeness,
        "profile_checklist": checklist,
        "readiness": readiness,
        "target_role_metrics": target_role_data,
        "ai_insights": ai_insights,
        "skill_gap_analysis": skill_gap_analysis,
        "assessments": state.get("assessments", {})
    }


@router.get("/{trainee_id}/jobs")
def explore_jobs_for_trainee(trainee_id: str):
    state = get_trainee_state(trainee_id)
    trainee_skills = set(
        (s["name"].lower() if isinstance(s, dict) else str(s).lower())
        for s in state.get("skills", [])
    )
    all_jobs = FirestoreRepository.get_jobs()
    existing_applications = FirestoreRepository.get_job_applications(trainee_id=trainee_id)
    applied_job_ids = {a.get("job_id") for a in existing_applications}

    jobs_with_match = []
    for job in all_jobs:
        req_skills = job.get("skills_required") or job.get("required_skills") or []
        req_skill_names = [
            (s.get("skill_name") or s.get("name") if isinstance(s, dict) else str(s)).lower()
            for s in req_skills
        ]
        if req_skill_names:
            matched_count = sum(1 for s in req_skill_names if any(ts in s or s in ts for ts in trainee_skills))
            match_pct = min(100, max(50, int((matched_count / len(req_skill_names)) * 100)))
        else:
            match_pct = 75

        job_item = dict(job)
        job_item["match_percentage"] = match_pct
        job_item["has_applied"] = job.get("id") in applied_job_ids
        jobs_with_match.append(job_item)

    jobs_with_match.sort(key=lambda x: x["match_percentage"], reverse=True)
    return jobs_with_match


@router.post("/{trainee_id}/jobs/{job_id}/apply")
def apply_for_job(trainee_id: str, job_id: str):
    state = get_trainee_state(trainee_id)
    job = FirestoreRepository.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job requisition not found")

    existing = FirestoreRepository.get_job_applications(job_id=job_id, trainee_id=trainee_id)
    if existing:
        return {"status": "success", "message": "Already applied to this job requisition.", "application": existing[0]}

    trainee = FirestoreRepository.get_trainee(trainee_id) or {}
    trainee_name = state.get("personal_info", {}).get("name") or trainee.get("name") or "Trainee"

    app_payload = {
        "job_id": job_id,
        "job_title": job.get("title") or job.get("role") or "Position",
        "trainee_id": trainee_id,
        "trainee_name": trainee_name,
        "employer_id": job.get("employer_id") or "ORG-DEFAULT",
        "employer_name": job.get("employer_name") or job.get("company") or "Employer Organization",
        "status": "Applied",
        "applied_at": datetime.utcnow().isoformat() + "Z"
    }

    created = FirestoreRepository.create_job_application(app_payload)
    return {"status": "success", "message": "Job application submitted successfully!", "application": created}


@router.get("/{trainee_id}/applications")
def get_trainee_applications(trainee_id: str):
    apps = FirestoreRepository.get_job_applications(trainee_id=trainee_id)
    return apps

