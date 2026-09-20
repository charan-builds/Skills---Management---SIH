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
            "course_name": trainee_data.get("course_name") or "",
            "provider": trainee_data.get("provider") or "",
            "status": trainee_data.get("status") or "",
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
    if trainee_data and not settings.ENABLE_DEMO_MODE:
        return _production_default_trainee_state(trainee_id, trainee_data)
    name = trainee_data.get("name", "Priya Gupta") if trainee_data else "Priya Gupta"
    
    return {
        "personal_info": {
            "name": name,
            "email": "priya.gupta@example.com",
            "phone": "+91 98765 43210",
            "location": "Hyderabad, Telangana",
            "career_goal": "Cybersecurity Analyst",
            "target_role": "Cybersecurity Analyst",
            "current_role": "Cybersecurity Specialist (Trainee)",
            "work_mode": "Hybrid / Remote",
            "expected_salary": "₹5.5–7.5 LPA",
            "resume_name": "Priya_Gupta_Cybersecurity_Resume.pdf"
        },
        "education": [
            {
                "id": "edu_1",
                "degree": "B.Tech",
                "specialization": "Computer Science & Engineering",
                "college": "Example Institute of Technology, Hyderabad",
                "graduation_year": "2021–2025"
            }
        ],
        "skills": [
            {"name": "Linux", "level": 90, "category": "Operating Systems", "primary": True},
            {"name": "Cybersecurity Fundamentals", "level": 88, "category": "Security", "primary": True},
            {"name": "Python", "level": 82, "category": "Programming", "primary": True},
            {"name": "Problem Solving", "level": 85, "category": "General", "primary": False},
            {"name": "SQL", "level": 78, "category": "Databases", "primary": False}
        ],
        "experience": [
            {
                "id": "exp_1",
                "role": "Cybersecurity Intern",
                "company": "TechFlow Labs",
                "period": "Jun 2025 – Aug 2025",
                "responsibilities": "Security log monitoring, Linux system hardening, baseline vulnerability scanning with OpenVAS."
            }
        ],
        "certifications": [
            {
                "id": "cert_1",
                "name": "Cybersecurity Fundamentals (Level 2)",
                "issuer": "FutureSkills Prime / NASSCOM",
                "date": "Jan 2025",
                "status": "Verified",
                "credential_id": "FSP-SEC-2025-8849"
            }
        ],
        "career_preferences": {
            "target_roles": ["Cybersecurity Analyst", "SOC Analyst", "Security Operations Associate", "Junior Security Engineer"],
            "preferred_locations": ["Hyderabad", "Bengaluru", "Remote"],
            "expected_salary": "₹5.5–7.5 LPA",
            "employment_preference": "Full-time",
            "work_mode": "Hybrid / Remote"
        },
        "assessments": {
            "Communication Assessment": {
                "name": "Communication for Technical Roles",
                "completed": False,
                "score": None,
                "impact": "+8% Career Readiness",
                "questions_count": 3
            },
            "Security Fundamentals Assessment": {
                "name": "Security Fundamentals Assessment",
                "completed": True,
                "score": 88,
                "impact": "Completed",
                "questions_count": 5
            },
            "Linux System Administration Test": {
                "name": "Linux Administration Benchmark",
                "completed": True,
                "score": 92,
                "impact": "Completed",
                "questions_count": 5
            }
        },
        "readiness_boost": 0
    }

def get_trainee_state(trainee_id: str) -> Dict[str, Any]:
    if trainee_id not in demo_trainee_state:
        trainee = FirestoreRepository.get_trainee(trainee_id)
        if not trainee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainee not found")
        persisted_state = trainee.get("portal_state") if isinstance(trainee.get("portal_state"), dict) else None
        demo_trainee_state[trainee_id] = (
            deepcopy(persisted_state)
            if persisted_state and not settings.ENABLE_DEMO_MODE
            else get_default_trainee_state(trainee_id, trainee)
        )
    return demo_trainee_state[trainee_id]


def persist_trainee_state(trainee_id: str, state: Dict[str, Any]) -> None:
    """Persist portal changes outside the explicitly session-only demo mode."""
    if not settings.ENABLE_DEMO_MODE:
        FirestoreRepository.update_trainee(trainee_id, {"portal_state": state})


# Pydantic Request Models


class SkillPayload(BaseModel):
    skill: str
    level: Optional[int] = 80
    category: Optional[str] = "Technical"

    model_config = {
        "extra": "forbid"
    }

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
        "readiness": {"overall": None, "technical_skills": None, "benchmark_readiness": None, "experience": None, "certification": None},
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
    import hashlib
    state = get_trainee_state(trainee_id)
    if data.personal_info is not None:
        p_info = dict(data.personal_info)
        raw_aadhaar = p_info.pop("aadhaar_number", None) or p_info.pop("aadhaarNumber", None)
        if raw_aadhaar:
            clean_num = "".join(c for c in str(raw_aadhaar) if c.isdigit())
            if len(clean_num) >= 12:
                p_info["aadhaar_hash"] = hashlib.sha256(clean_num.encode('utf-8')).hexdigest()
                p_info["aadhaar_last4"] = clean_num[-4:]
                p_info["aadhaar_linked"] = True
        state["personal_info"].update(p_info)
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
        {"item": "Personal Information", "completed": bool(state["personal_info"].get("name") and state["personal_info"].get("email"))},
        {"item": "Education Qualifications", "completed": len(state["education"]) > 0},
        {"item": "Skills & Competencies", "completed": len(state["skills"]) >= 3},
        {"item": "Verified Certifications", "completed": len(state["certifications"]) > 0},
        {"item": "Internship / Work Experience", "completed": len(state["experience"]) > 0}
    ]
    completed_count = sum(1 for c in checklist if c["completed"])
    profile_completeness = int((completed_count / len(checklist)) * 100) if checklist else 88

    # Career Readiness Score
    base_readiness = 95 + state.get("readiness_boost", 0)
    readiness = {
        "overall": min(base_readiness, 100),
        "technical_skills": 86,
        "benchmark_readiness": 78,
        "experience": 74,
        "certification": 100
    }

    # Extract skill names set
    current_skills_set = set(
        (s["name"].lower() if isinstance(s, dict) else s.lower()) for s in state["skills"]
    )

    # Target Role metric card data
    target_role_name = state["personal_info"].get("target_role", "Cybersecurity Analyst")
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
        "personal_info": state["personal_info"],
        "education": state["education"],
        "skills": state["skills"],
        "experience": state["experience"],
        "certifications": state["certifications"],
        "career_preferences": state["career_preferences"],
        "profile_completeness": profile_completeness,
        "profile_checklist": checklist,
        "readiness": readiness,
        "target_role_metrics": target_role_data,
        "ai_insights": ai_insights,
        "skill_gap_analysis": skill_gap_analysis,
        "assessments": state["assessments"]
    }
