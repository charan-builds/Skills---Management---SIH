from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.firebase.repository import FirestoreRepository

router = APIRouter(
    prefix="/api/trainee-portal",
    tags=["Trainee Portal"]
)

# In-memory prototype state for trainee profiles, applications, saved jobs, and assessments
demo_trainee_state: Dict[str, Dict[str, Any]] = {}

def get_default_trainee_state(trainee_id: str, trainee_data: Optional[Dict[str, Any]] = None):
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
        "saved_jobs": ["JOB-DEMO-008"],
        "applications": [
            {
                "id": "app_1",
                "job_id": "JOB-DEMO-007",
                "role": "Cybersecurity Analyst",
                "company": "TechFlow Solutions",
                "location": "Hyderabad",
                "work_mode": "Hybrid",
                "salary_range": "₹5.5–7 LPA",
                "applied_date": "24 Aug 2026",
                "match_percentage": 92,
                "status": "Shortlisted",
                "next_step": "Employer interview scheduled for 28 Aug 2026",
                "notes": "Shortlisted by hiring manager for technical interview round."
            },
            {
                "id": "app_2",
                "job_id": "JOB-DEMO-008",
                "role": "Security Operations Associate",
                "company": "SecureNet Systems",
                "location": "Hyderabad",
                "work_mode": "On-site",
                "salary_range": "₹4.5–6 LPA",
                "applied_date": "21 Aug 2026",
                "match_percentage": 87,
                "status": "Under Review",
                "next_step": "Awaiting screening decision by 02 Sep 2026",
                "notes": "Profile under review by Security Operations team."
            },
            {
                "id": "app_3",
                "job_id": "JOB-DEMO-009",
                "role": "Junior SOC Analyst",
                "company": "CyberShield Technologies",
                "location": "Bengaluru",
                "work_mode": "Remote",
                "salary_range": "₹5–7 LPA",
                "applied_date": "18 Aug 2026",
                "match_percentage": 84,
                "status": "Application Submitted",
                "next_step": "Initial resume & skill verification",
                "notes": "Application successfully recorded."
            }
        ],
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
        demo_trainee_state[trainee_id] = get_default_trainee_state(trainee_id, trainee)
    return demo_trainee_state[trainee_id]


# Pydantic Request Models
class ApplicationCreate(BaseModel):
    job_id: str
    role: Optional[str] = "Cybersecurity Analyst"
    company: Optional[str] = "Partner Employer"
    location: Optional[str] = "Hyderabad"
    work_mode: Optional[str] = "Hybrid"
    salary_range: Optional[str] = "₹5–7 LPA"
    match_percentage: int
    cover_note: Optional[str] = ""

class WithdrawApplication(BaseModel):
    application_id: str

class SaveJobPayload(BaseModel):
    job_id: str

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


# Demo Jobs List with Consistent Requirements & Details
DEMO_JOBS_CATALOG = [
    {
        "id": "JOB-DEMO-007",
        "role": "Cybersecurity Analyst",
        "company": "TechFlow Solutions",
        "location": "Hyderabad",
        "work_mode": "Hybrid",
        "salary_range": "₹5.5–7 LPA",
        "experience_req": "0–2 Years",
        "openings": 3,
        "deadline": "15 Sep 2026",
        "required_skills": ["Linux", "Cybersecurity Fundamentals", "Python", "Problem Solving", "Communication", "SIEM"],
        "preferred_skills": ["Network Security", "Bash Scripting", "Wireshark"],
        "description": "Monitor enterprise security alerts, conduct periodic vulnerability scans, and maintain Linux-based security monitoring infrastructures.",
        "responsibilities": [
            "Triage real-time security alerts from endpoint and network monitoring tools.",
            "Assist in vulnerability management, patch auditing, and compliance verification.",
            "Write lightweight Python/Bash scripts for log parsing and repetitive task automation.",
            "Prepare clear incident summaries for cross-functional engineering teams."
        ]
    },
    {
        "id": "JOB-DEMO-008",
        "role": "Security Operations Associate",
        "company": "SecureNet Systems",
        "location": "Hyderabad",
        "work_mode": "On-site",
        "salary_range": "₹4.5–6 LPA",
        "experience_req": "0–1 Years",
        "openings": 2,
        "deadline": "20 Sep 2026",
        "required_skills": ["Linux", "Networking", "Cybersecurity Fundamentals", "Problem Solving", "Security Operations"],
        "preferred_skills": ["Firewalls", "TCP/IP Analysis", "Syslog"],
        "description": "Assist Tier-1 incident triaging, log analysis, firewall policy monitoring, and perimeter defense operations.",
        "responsibilities": [
            "Perform initial investigation of suspicious network connection attempts and anomalies.",
            "Maintain operational runbooks and track escalation tickets with senior analysts.",
            "Review firewall and VPN access logs to detect unauthorized access patterns."
        ]
    },
    {
        "id": "JOB-DEMO-009",
        "role": "Junior SOC Analyst",
        "company": "CyberShield Technologies",
        "location": "Bengaluru",
        "work_mode": "Remote",
        "salary_range": "₹5–7 LPA",
        "experience_req": "Entry Level",
        "openings": 4,
        "deadline": "18 Sep 2026",
        "required_skills": ["Linux", "Cybersecurity Fundamentals", "Python", "SIEM", "Networking"],
        "preferred_skills": ["Splunk", "Suricata", "Threat Intelligence"],
        "description": "Real-time threat monitoring, IOC ingestion, and alert response within 24/7 Security Operations Center.",
        "responsibilities": [
            "Monitor SIEM dashboards (Splunk / QRadar) and investigate anomalous security events.",
            "Correlate threat intelligence indicators with internal access telemetry.",
            "Participate in tabletop crisis response exercises and security documentation."
        ]
    },
    {
        "id": "JOB-DEMO-010",
        "role": "Information Security Associate",
        "company": "Enterprise Defense Corp",
        "location": "Remote",
        "work_mode": "Remote",
        "salary_range": "₹5–6.5 LPA",
        "experience_req": "0–2 Years",
        "openings": 2,
        "deadline": "25 Sep 2026",
        "required_skills": ["Python", "SQL", "Cybersecurity Fundamentals", "Linux"],
        "preferred_skills": ["Data Privacy", "ISO 27001", "Access Control"],
        "description": "Perform security audits, access control verification, identity governance, and automated scripting.",
        "responsibilities": [
            "Audit user role assignments and database permissions across cloud environments.",
            "Develop automated SQL queries to extract access metrics for quarterly compliance audits.",
            "Review security configurations of internal applications and web endpoints."
        ]
    },
    {
        "id": "JOB-DEMO-011",
        "role": "Cloud Security Associate",
        "company": "CloudShield India",
        "location": "Hyderabad",
        "work_mode": "Hybrid",
        "salary_range": "₹6–8 LPA",
        "experience_req": "1–2 Years",
        "openings": 2,
        "deadline": "30 Sep 2026",
        "required_skills": ["Linux", "Python", "Cloud Security", "Cybersecurity Fundamentals", "Networking"],
        "preferred_skills": ["AWS IAM", "Docker Security", "Terraform"],
        "description": "Ensure secure cloud deployments, IAM posture management, and container security compliance.",
        "responsibilities": [
            "Monitor cloud security posture (CSPM) alerts and remediate open security group configurations.",
            "Audit cloud storage bucket permissions and enforce least-privilege IAM policies.",
            "Collaborate with DevOps teams to secure CI/CD build pipelines."
        ]
    },
    {
        "id": "JOB-DEMO-012",
        "role": "IT Security Specialist",
        "company": "InfraGuard Systems",
        "location": "Warangal",
        "work_mode": "On-site",
        "salary_range": "₹4–5.5 LPA",
        "experience_req": "0–1 Years",
        "openings": 3,
        "deadline": "22 Sep 2026",
        "required_skills": ["Linux", "Cybersecurity Fundamentals", "Problem Solving", "Troubleshooting"],
        "preferred_skills": ["Active Directory", "Endpoint Antivirus", "Hardware Security"],
        "description": "Maintain workplace IT security hygiene, workstation encryption, endpoint detection, and staff training.",
        "responsibilities": [
            "Configure BitLocker / LUKS disk encryption across corporate laptops.",
            "Deploy endpoint detection and response (EDR) agents to new user machines.",
            "Conduct basic phishing awareness simulations for non-technical employees."
        ]
    }
]


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
    return {"status": "success", "skills": state["skills"]}


@router.post("/{trainee_id}/skills/remove")
def remove_skill(trainee_id: str, data: SkillPayload):
    state = get_trainee_state(trainee_id)
    target_name = data.skill.lower().strip()
    state["skills"] = [
        s for s in state["skills"]
        if (s["name"].lower() if isinstance(s, dict) else s.lower()) != target_name
    ]
    return {"status": "success", "skills": state["skills"]}


@router.post("/{trainee_id}/assessment/submit")
def submit_assessment(trainee_id: str, data: AssessmentSubmitPayload):
    state = get_trainee_state(trainee_id)
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
    return {
        "status": "success",
        "message": f"Assessment '{data.assessment_name}' completed with score {data.score}%",
        "assessments": state["assessments"]
    }


@router.get("/{trainee_id}/dashboard")
def get_trainee_dashboard(trainee_id: str):
    trainee = FirestoreRepository.get_trainee(trainee_id)
    if not trainee:
        trainee = {"id": trainee_id, "name": "Priya Gupta", "status": "Certified", "outcome": "Employed"}

    state = get_trainee_state(trainee_id)
    
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
        "job_readiness": 78,
        "experience": 74,
        "certification": 100
    }

    # Extract skill names set
    current_skills_set = set(
        (s["name"].lower() if isinstance(s, dict) else s.lower()) for s in state["skills"]
    )

    # Job Matching logic
    recommended_jobs = []
    for j in DEMO_JOBS_CATALOG:
        matched = [s for s in j["required_skills"] if s.lower() in current_skills_set]
        missing = [s for s in j["required_skills"] if s.lower() not in current_skills_set]
        
        total_req = len(j["required_skills"])
        match_pct = int((len(matched) / total_req) * 100) if total_req > 0 else 85
        match_pct = max(75, min(match_pct, 98))

        recommended_jobs.append({
            "job": j,
            "match_percentage": match_pct,
            "matched_skills": matched,
            "missing_skills": missing,
            "is_saved": j["id"] in state["saved_jobs"],
            "reasoning": f"Matches your foundation in {', '.join(matched[:3])}."
        })

    recommended_jobs.sort(key=lambda x: x["match_percentage"], reverse=True)

    # Target Role metric card data
    target_role_name = state["personal_info"].get("target_role", "Cybersecurity Analyst")
    target_role_data = {
        "role": target_role_name,
        "match": recommended_jobs[0]["match_percentage"] if recommended_jobs else 92,
        "critical_skill_gap": "Communication" if "communication" not in current_skills_set else ("SIEM" if "siem" not in current_skills_set else "Security Operations"),
        "active_applications": len(state["applications"]),
        "shortlisted_applications": sum(1 for a in state["applications"] if a.get("status") == "Shortlisted"),
        "interview_applications": sum(1 for a in state["applications"] if a.get("status") == "Interview" or "interview" in a.get("next_step", "").lower()),
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

    # Recommended Next Steps
    recommended_next_steps = [
        {
            "step": 1,
            "title": "Improve Communication",
            "why": "Required by 8 of your top 10 matching jobs.",
            "action": "Take Communication Assessment",
            "action_route": "/trainee/skills"
        },
        {
            "step": 2,
            "title": "Learn SIEM Fundamentals",
            "why": "Frequently requested by SOC and Cybersecurity Analyst roles.",
            "action": "Start Course Module",
            "action_route": "/trainee/skills"
        },
        {
            "step": 3,
            "title": "Apply to High-Match Roles",
            "why": f"Cybersecurity Analyst at TechFlow Solutions has 92% match.",
            "action": "Explore Opportunities",
            "action_route": "/trainee/jobs"
        }
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
        "recommended_next_steps": recommended_next_steps,
        "recommended_jobs": recommended_jobs[:3], # Top 3 for Overview summary
        "all_jobs": recommended_jobs,
        "skill_gap_analysis": skill_gap_analysis,
        "assessments": state["assessments"]
    }


@router.get("/{trainee_id}/jobs")
def get_jobs_page_data(trainee_id: str):
    state = get_trainee_state(trainee_id)
    current_skills_set = set(
        (s["name"].lower() if isinstance(s, dict) else s.lower()) for s in state["skills"]
    )

    jobs_result = []
    for j in DEMO_JOBS_CATALOG:
        matched = [s for s in j["required_skills"] if s.lower() in current_skills_set]
        missing = [s for s in j["required_skills"] if s.lower() not in current_skills_set]
        
        total_req = len(j["required_skills"])
        match_pct = int((len(matched) / total_req) * 100) if total_req > 0 else 85
        match_pct = max(75, min(match_pct, 98))

        jobs_result.append({
            "job": j,
            "match_percentage": match_pct,
            "matched_skills": matched,
            "missing_skills": missing,
            "is_saved": j["id"] in state["saved_jobs"],
            "reasoning": f"Matches your background in {', '.join(matched[:3])}."
        })

    jobs_result.sort(key=lambda x: x["match_percentage"], reverse=True)
    return {
        "jobs": jobs_result,
        "saved_job_ids": state["saved_jobs"],
        "target_role": state["personal_info"].get("target_role", "Cybersecurity Analyst")
    }


@router.post("/{trainee_id}/jobs/save")
def toggle_save_job(trainee_id: str, data: SaveJobPayload):
    state = get_trainee_state(trainee_id)
    if data.job_id in state["saved_jobs"]:
        state["saved_jobs"].remove(data.job_id)
        is_saved = False
    else:
        state["saved_jobs"].append(data.job_id)
        is_saved = True
    return {"status": "success", "is_saved": is_saved, "saved_jobs": state["saved_jobs"]}


@router.get("/{trainee_id}/skills-growth")
def get_skills_growth_data(trainee_id: str):
    state = get_trainee_state(trainee_id)
    current_skills_set = set(
        (s["name"].lower() if isinstance(s, dict) else s.lower()) for s in state["skills"]
    )

    skill_gaps = [
        {"skill": "Linux", "current": 90, "target": 90, "gap": 0, "priority": "Strong", "status": "Met"},
        {"skill": "Cybersecurity Fundamentals", "current": 88, "target": 90, "gap": 2, "priority": "Strong", "status": "Met"},
        {"skill": "Python", "current": 82, "target": 85, "gap": 3, "priority": "Medium", "status": "Met"},
        {"skill": "Communication", "current": 62 if "communication" not in current_skills_set else 90, "target": 85, "gap": 23 if "communication" not in current_skills_set else 0, "priority": "High", "status": "Gap" if "communication" not in current_skills_set else "Met"},
        {"skill": "Security Operations", "current": 58, "target": 85, "gap": 27, "priority": "Critical", "status": "Gap"},
        {"skill": "SIEM", "current": 48 if "siem" not in current_skills_set else 85, "target": 80, "gap": 32 if "siem" not in current_skills_set else 0, "priority": "Critical", "status": "Gap" if "siem" not in current_skills_set else "Met"}
    ]

    ai_recommendations = [
        {
            "id": "rec_1",
            "title": "SIEM Fundamentals",
            "skill": "SIEM",
            "why": "Required by 8 of your top 10 matched jobs.",
            "impact": "+8 Readiness Potential",
            "duration": "6 hours",
            "difficulty": "Intermediate",
            "provider": "CyberDefense Academy",
            "progress": 0,
            "type": "course"
        },
        {
            "id": "rec_2",
            "title": "Security Operations & Incident Triage",
            "skill": "Security Operations",
            "why": "Your largest technical gap for SOC Analyst roles.",
            "impact": "+11 Readiness Potential",
            "duration": "10 hours",
            "difficulty": "Intermediate",
            "provider": "FutureSkills Prime",
            "progress": 25,
            "type": "course"
        },
        {
            "id": "rec_3",
            "title": "Communication for Technical Interviews",
            "skill": "Communication",
            "why": "Appears in several high-match target roles.",
            "impact": "+5 Readiness Potential",
            "duration": "3 hours",
            "difficulty": "Beginner",
            "provider": "Skills India Lab",
            "progress": 0,
            "type": "assessment"
        }
    ]

    course_catalog = [
        {
            "id": "crs_1",
            "title": "SIEM Fundamentals & Log Telemetry",
            "provider": "CyberDefense Academy",
            "skill": "SIEM",
            "level": "Intermediate",
            "duration": "6 hours",
            "progress": 0,
            "recommended": True
        },
        {
            "id": "crs_2",
            "title": "Hands-on Security Operations",
            "provider": "FutureSkills Prime",
            "skill": "Security Operations",
            "level": "Intermediate",
            "duration": "10 hours",
            "progress": 25,
            "recommended": True
        },
        {
            "id": "crs_3",
            "title": "Professional Communication for Tech Roles",
            "provider": "Skills India Lab",
            "skill": "Communication",
            "level": "Beginner",
            "duration": "3 hours",
            "progress": 0,
            "recommended": True
        },
        {
            "id": "crs_4",
            "title": "Network Security & Wireshark Triage",
            "provider": "NASSCOM FutureSkills",
            "skill": "Networking",
            "level": "Advanced",
            "duration": "8 hours",
            "progress": 0,
            "recommended": False
        }
    ]

    return {
        "skill_growth_plan": {
            "current_readiness": 95 + state.get("readiness_boost", 0),
            "target_role": state["personal_info"].get("target_role", "Cybersecurity Analyst"),
            "target_readiness": 98,
            "skills_remaining": 2,
            "estimated_effort": "16 hours"
        },
        "skill_gaps": skill_gaps,
        "ai_recommendations": ai_recommendations,
        "course_catalog": course_catalog,
        "assessments": state["assessments"]
    }


@router.get("/{trainee_id}/applications")
def get_applications(trainee_id: str):
    state = get_trainee_state(trainee_id)
    return state["applications"]


@router.post("/{trainee_id}/apply")
def apply_for_job(trainee_id: str, data: ApplicationCreate):
    state = get_trainee_state(trainee_id)
    for app in state["applications"]:
        if app.get("job_id") == data.job_id:
            return {"status": "already_applied", "message": "You have already applied to this position."}
            
    new_app = {
        "id": f"app_{len(state['applications']) + 1}",
        "job_id": data.job_id,
        "role": data.role,
        "company": data.company,
        "location": data.location,
        "work_mode": data.work_mode,
        "salary_range": data.salary_range,
        "match_percentage": data.match_percentage,
        "status": "Applied",
        "applied_date": datetime.now().strftime("%d %b %Y"),
        "next_step": "Under employer screening review",
        "notes": "Application submitted with verified demo resume."
    }
    state["applications"].insert(0, new_app)
    return {"status": "success", "message": "Application submitted successfully!", "application": new_app}


@router.post("/{trainee_id}/applications/withdraw")
def withdraw_application(trainee_id: str, data: WithdrawApplication):
    state = get_trainee_state(trainee_id)
    state["applications"] = [a for a in state["applications"] if a.get("id") != data.application_id and a.get("job_id") != data.application_id]
    return {"status": "success", "message": "Application withdrawn successfully", "applications": state["applications"]}
