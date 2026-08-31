from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.firebase.repository import FirestoreRepository
from app.schemas.employer import (
    EmployerVerificationResponse, VerificationApprovalSchema, EmployerFeedbackResponse, EmployerFeedbackCreate,
    EmployerOutcomeResponse, EmployerOutcomeUpdate
)
from app.ai.skill_intelligence import SkillIntelligenceEngine

router = APIRouter(
    prefix="/api/employers",
    tags=["Employers"]
)

# Demo in-memory state for shortlists, contacts, profiles, and verifications
demo_shortlists = set([("EMP-DEMO-001", "T102", "JOB-DEMO-007"), ("EMP-DEMO-001", "TR-DEMO-1001", "JOB-DEMO-001")])
demo_contacts = set([("EMP-DEMO-001", "T102")])
demo_outcomes_state = {}

demo_org_profiles = {
    "EMP-DEMO-001": {
        "organization_id": "EMP-DEMO-001",
        "name": "TechFlow Solutions",
        "industry": "Information Technology & Cybersecurity",
        "company_size": "250–500 Employees",
        "location": "Hyderabad, Telangana",
        "website": "https://techflowsolutions.demo",
        "contact_person": "Vikram Malhotra",
        "contact_email": "recruitment@techflowsolutions.demo",
        "contact_phone": "+91 40 4890 1200",
        "hiring_preferences": {
            "employment_types": ["Full-time", "Apprenticeship"],
            "preferred_locations": ["Hyderabad", "Warangal", "Nalgonda"],
            "preferred_skills": ["Python", "Machine Learning", "Cybersecurity", "SQL", "Power BI", "Linux"],
            "salary_budget_range": "₹4.5–7.5 LPA",
            "work_mode": "Hybrid / On-site"
        }
    }
}

demo_integrations = {
    "EMP-DEMO-001": [
        {
            "id": "int-skilling",
            "name": "State Skilling & Workforce Platform",
            "category": "Training / Skilling Platform",
            "status": "Connected",
            "last_synced": "Today, 10:30 AM",
            "candidates_synced": 120,
            "skills_mapped": 38,
            "description": "Direct synchronization with state certified trainee talent pool and skill assessment transcripts."
        },
        {
            "id": "int-ats",
            "name": "Enterprise Applicant Tracking System (ATS)",
            "category": "Recruitment & ATS",
            "status": "Connected",
            "last_synced": "Today, 09:15 AM",
            "candidates_synced": 45,
            "skills_mapped": 24,
            "description": "Automated shortlist ingestion and interview schedule synchronization."
        },
        {
            "id": "int-hris",
            "name": "Corporate HR / HRIS Core",
            "category": "HRIS & Payroll",
            "status": "Connected",
            "last_synced": "Yesterday, 06:00 PM",
            "candidates_synced": 12,
            "skills_mapped": 18,
            "description": "Employment verification, onboarding record ingestion, and 3M/6M/12M retention tracking."
        },
        {
            "id": "int-jobs",
            "name": "National Job Portal Gateway",
            "category": "Job Portal",
            "status": "Connected",
            "last_synced": "Today, 08:00 AM",
            "candidates_synced": 78,
            "skills_mapped": 29,
            "description": "Automated vacancy syndication and candidate discovery."
        },
        {
            "id": "int-assess",
            "name": "AI Benchmark Assessment Engine",
            "category": "Assessment Platform",
            "status": "Connected",
            "last_synced": "Today, 11:45 AM",
            "candidates_synced": 94,
            "skills_mapped": 42,
            "description": "Real-time verification of technical competencies and coding assessments."
        }
    ]
}

demo_api_configs = {
    "EMP-DEMO-001": {
        "api_base_url": "https://api.workforce-intelligence.internal/v1",
        "client_id": "CLIENT_TECHFLOW_PROD_8849",
        "api_key": "sk_live_9984****************************",
        "webhook_url": "https://techflowsolutions.demo/webhooks/talent-sync",
        "environment": "Production Demo",
        "status": "Verified & Connected"
    }
}

class ShortlistRequest(BaseModel):
    trainee_id: str
    job_id: Optional[str] = "JOB-DEMO-001A"

class ContactRequest(BaseModel):
    trainee_id: str
    message: Optional[str] = "Demo interview outreach"

class OrgProfileUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    hiring_preferences: Optional[Dict[str, Any]] = None

class IntegrationConfigUpdate(BaseModel):
    api_base_url: Optional[str] = None
    client_id: Optional[str] = None
    api_key: Optional[str] = None
    webhook_url: Optional[str] = None
    environment: Optional[str] = None

@router.get("", response_model=List[Dict])
def get_employers():
    return FirestoreRepository.get_employers()

@router.get("/{org_id}/dashboard")
def get_employer_dashboard(org_id: str):
    jobs = FirestoreRepository.get_jobs()
    org_jobs = [j for j in jobs if j.get("employer_id") == org_id]
    if not org_jobs:
        # Fallback to realistic demo jobs count
        open_jobs_count = 4
    else:
        open_jobs_count = len(org_jobs)
    
    # Calculate available candidates
    all_trainees = FirestoreRepository.get_trainees()
    available_candidates_count = len([t for t in all_trainees if t.get("programme_id")])
    if available_candidates_count == 0:
        available_candidates_count = 17
    
    # Shortlisted count
    shortlisted_count = len([s for s in demo_shortlists if s[0] == org_id])
    if shortlisted_count == 0:
        shortlisted_count = 6
        
    hired_count = 3

    return {
        "open_vacancies": open_jobs_count,
        "available_candidates": available_candidates_count,
        "shortlisted_candidates": shortlisted_count,
        "hired_trainees": hired_count,
        "recruitment_funnel": {
            "sourced": 45,
            "matched": 24,
            "shortlisted": shortlisted_count,
            "contacted_interview": 4,
            "hired": hired_count,
            "retention_rate": "100%"
        },
        "recruitment_outcome": {
            "hired": hired_count,
            "selection_rate": "75%",
            "avg_skill_match": "92%",
            "retention": "100%"
        },
        "skill_intelligence": [
            {"skill": "Python", "demand": "High", "supply": 12, "gap": "Moderate", "coverage": 150},
            {"skill": "Machine Learning", "demand": "Very High", "supply": 7, "gap": "High", "coverage": 70},
            {"skill": "SQL", "demand": "High", "supply": 14, "gap": "Low", "coverage": 175},
            {"skill": "Power BI", "demand": "Medium", "supply": 5, "gap": "Moderate", "coverage": 62},
            {"skill": "Cybersecurity", "demand": "High", "supply": 4, "gap": "High", "coverage": 80}
        ],
        "ai_insights": {
            "training_recommendation": "Machine Learning and Cybersecurity talent pools have the highest hiring demand. Recommend partnering with state programs offering specialized ML and SIEM security modules.",
            "ai_hiring_insight": "Candidates possessing Python + Linux fundamentals demonstrate a 92% placement success rate and 100% 12-month retention in your organization.",
            "skill_gap_alert": "Power BI & Statistics are the most frequent gaps in your Data Analyst applicant pool. Consider candidates with strong SQL and provide self-paced Power BI upskilling."
        }
    }

@router.get("/{org_id}/active-vacancies")
def get_active_vacancies(org_id: str):
    jobs = FirestoreRepository.get_jobs()
    org_jobs = [j for j in jobs if j.get("employer_id") == org_id]
    
    # If no jobs or fewer than 3, provide comprehensive demo enterprise jobs
    if len(org_jobs) < 3:
        org_jobs = [
            {
                "id": "JOB-DEMO-001",
                "title": "ML/AI Associate",
                "location": "Nalgonda",
                "openings": 4,
                "salary_range": "₹4.5–6 LPA",
                "skills_required": ["Python", "Statistics", "Machine Learning", "SQL"],
                "experience_required": "0–2 years",
                "status": "Active",
                "matching_candidates": 7,
                "description": "Build, evaluate, and deploy predictive machine learning pipelines and data transformation workflows."
            },
            {
                "id": "JOB-DEMO-007",
                "title": "Cybersecurity Analyst",
                "location": "Hyderabad",
                "openings": 2,
                "salary_range": "₹5–7 LPA",
                "skills_required": ["Linux", "Networking", "Cybersecurity", "Python"],
                "experience_required": "0–2 years",
                "status": "Active",
                "matching_candidates": 4,
                "description": "Perform security event triage, vulnerability assessments, and endpoint security configuration."
            },
            {
                "id": "JOB-DEMO-002",
                "title": "Data Analyst",
                "location": "Warangal",
                "openings": 3,
                "salary_range": "₹4–6 LPA",
                "skills_required": ["Python", "SQL", "Excel", "Power BI"],
                "experience_required": "0–2 years",
                "status": "Active",
                "matching_candidates": 12,
                "description": "Analyze workforce metrics, author interactive KPI dashboards, and deliver operational reports."
            },
            {
                "id": "JOB-DEMO-004",
                "title": "Cloud Infrastructure Engineer",
                "location": "Hyderabad",
                "openings": 2,
                "salary_range": "₹5.5–8 LPA",
                "skills_required": ["Linux", "Cloud Security", "Docker", "Python"],
                "experience_required": "1–3 years",
                "status": "Active",
                "matching_candidates": 5,
                "description": "Maintain scalable containerized infrastructure and automated CI/CD deployments."
            }
        ]
    else:
        all_trainees = FirestoreRepository.get_trainees()
        for job in org_jobs:
            match_count = 0
            for t in all_trainees:
                if not t.get("programme_id"): continue
                gap_data = FirestoreRepository.calculate_3way_skill_gap(t["programme_id"], t["id"], job["id"])
                if gap_data and gap_data.get("overall_match_percentage", 0) >= 65:
                    match_count += 1
            job["matching_candidates"] = max(match_count, 3)
            
    return org_jobs

@router.get("/{org_id}/recommended-candidates")
def get_recommended_candidates(org_id: str):
    all_trainees = FirestoreRepository.get_trainees()
    
    # Curated high-match recommended candidates with full AI explanations
    curated = [
        {
            "trainee_id": "T102",
            "name": "Priya Gupta",
            "programme": "Cybersecurity Specialist",
            "district": "Hyderabad",
            "experience": "Fresher / Certified",
            "match_percentage": 94,
            "job_match": 91,
            "target_role": "Cybersecurity Analyst",
            "matched_skills": ["Linux", "Python", "Cybersecurity Fundamentals", "Problem Solving", "SQL"],
            "missing_skills": ["Cloud Security", "SIEM"],
            "strengths": ["Linux administration", "Threat analysis", "Python scripting"],
            "certification_status": "Certified",
            "readiness": "Employment Ready",
            "recommendation": "Strong Match",
            "reasoning": "Strong candidate for Cybersecurity Analyst roles. Linux and security fundamentals align closely with the vacancy. Completing Cloud Security training would increase role readiness."
        },
        {
            "trainee_id": "TR-DEMO-1001",
            "name": "Anjali Joshi",
            "programme": "AI & Data Science Professional",
            "district": "Nalgonda",
            "experience": "6+ months Internship",
            "match_percentage": 92,
            "job_match": 89,
            "target_role": "ML/AI Associate",
            "matched_skills": ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-Learn"],
            "missing_skills": ["Statistics"],
            "strengths": ["Model training", "Feature engineering", "SQL query optimization"],
            "certification_status": "Certified",
            "readiness": "Employment Ready",
            "recommendation": "High Priority",
            "reasoning": "High-priority candidate for ML/AI Associate. Demonstrates exceptional Python model training capabilities. Statistics foundations are solid and easily refined."
        },
        {
            "trainee_id": "TR-DEMO-1002",
            "name": "Manoj Das",
            "programme": "Data Analytics Specialist",
            "district": "Warangal",
            "experience": "Fresher / Certified",
            "match_percentage": 88,
            "job_match": 86,
            "target_role": "Data Analyst",
            "matched_skills": ["SQL", "Excel", "Data Visualization", "Python"],
            "missing_skills": ["Power BI"],
            "strengths": ["Relational schemas", "Exploratory data analysis", "Report automation"],
            "certification_status": "Certified",
            "readiness": "Employment Ready",
            "recommendation": "Strong Match",
            "reasoning": "Solid match for Data Analyst opening. SQL and analytical problem solving are top-tier. Power BI gap can be addressed via introductory module."
        },
        {
            "trainee_id": "TR-DEMO-1003",
            "name": "Rahul Verma",
            "programme": "Cloud Infrastructure & DevOps",
            "district": "Hyderabad",
            "experience": "1 year Experience",
            "match_percentage": 86,
            "job_match": 85,
            "target_role": "Cloud Infrastructure Engineer",
            "matched_skills": ["Linux", "Docker", "Python", "Networking"],
            "missing_skills": ["Kubernetes"],
            "strengths": ["Containerization", "Linux automation", "Shell scripting"],
            "certification_status": "Certified",
            "readiness": "Employment Ready",
            "recommendation": "Recommended",
            "reasoning": "Excellent fit for Cloud and DevOps positions. Strong hands-on containerization and Linux server configuration."
        }
    ]
    
    return curated

@router.get("/{org_id}/candidates")
def get_all_employer_candidates(org_id: str):
    all_trainees = FirestoreRepository.get_trainees()
    
    # Map all candidates with calculated match scores, skills, and AI reasons
    results = []
    
    # Ensure our top demo trainees are included first
    rec_list = get_recommended_candidates(org_id)
    for r in rec_list:
        results.append({
            "id": r["trainee_id"],
            "name": r["name"],
            "programme": r["programme"],
            "location": r["district"],
            "skills": r["matched_skills"],
            "match": r["match_percentage"],
            "job_match": r["job_match"],
            "experience": r["experience"],
            "status": r["certification_status"],
            "readiness": r["readiness"],
            "reasoning": r["reasoning"],
            "is_shortlisted": (org_id, r["trainee_id"], "JOB-DEMO-001A") in demo_shortlists or (org_id, r["trainee_id"], "JOB-DEMO-007") in demo_shortlists,
            "is_contacted": (org_id, r["trainee_id"]) in demo_contacts
        })
        
    for t in all_trainees:
        if t.get("id") in [r["id"] for r in results]:
            continue
        
        skills = t.get("skills", ["Python", "SQL", "Problem Solving"])
        prog_name = t.get("programme_name") or t.get("course_name") or "Technical Skills"
        district = t.get("district") or "Hyderabad"
        match_score = 75 + (hash(t.get("id", "0")) % 18)
        
        results.append({
            "id": t.get("id"),
            "name": t.get("name", "Candidate"),
            "programme": prog_name,
            "location": district,
            "skills": skills if skills else ["Python", "SQL"],
            "match": match_score,
            "job_match": match_score - 3,
            "experience": "Fresher / Certified",
            "status": t.get("status", "Certified"),
            "readiness": "Employment Ready",
            "reasoning": f"Good baseline alignment with {prog_name} curriculum and core technical competencies.",
            "is_shortlisted": (org_id, t.get("id"), "JOB-DEMO-001A") in demo_shortlists,
            "is_contacted": (org_id, t.get("id")) in demo_contacts
        })
        
    return results

@router.get("/{org_id}/candidates/{candidate_id}")
def get_employer_candidate_profile(org_id: str, candidate_id: str):
    trainee = FirestoreRepository.get_trainee(candidate_id)
    
    # Fallback to demo profile details if not in firestore
    if candidate_id == "T102":
        return {
            "id": "T102",
            "traineeId": "T102",
            "name": "Priya Gupta",
            "initials": "PG",
            "email": "priya.gupta@example.com",
            "phone": "+91 98765 43210",
            "programme": "Cybersecurity Specialist",
            "location": "Hyderabad, Telangana",
            "readiness": "Employment Ready",
            "trainingStatus": "Certified",
            "outcome": "Certified Trainee",
            "match": 94,
            "job_match": 91,
            "education": [
                {"degree": "B.Tech in Computer Science & Engineering", "college": "JNTU Hyderabad", "year": "2021–2025", "grade": "8.6 CGPA"},
                {"degree": "Higher Secondary (MPC)", "college": "Telangana State Board", "year": "2019–2021", "grade": "94.2%"}
            ],
            "experience": [
                {"role": "Cybersecurity Trainee & Lab Analyst", "company": "State Advanced Skilling Academy", "period": "Aug 2024 – Present", "description": "Conducted automated vulnerability scans, configured snort IDS rules, and simulated defense exercises."},
                {"role": "Technical Support Intern", "company": "Telangana IT Hub", "period": "May 2024 – Jul 2024", "description": "Assisted network administration team in hardening Linux servers and monitoring active firewall sessions."}
            ],
            "certifications": [
                {"name": "Certified Cybersecurity Specialist", "issuer": "State IT & Skilling Mission", "date": "Jan 2025", "id": "CERT-CYBER-8891"},
                {"name": "CompTIA Security+ Prep Verified", "issuer": "National Tech Council", "date": "Dec 2024", "id": "COMP-SEC-102"}
            ],
            "skills": [
                {"name": "Linux Administration", "proficiency": 90, "status": "Met"},
                {"name": "Cybersecurity Fundamentals", "proficiency": 88, "status": "Met"},
                {"name": "Python Scripting", "proficiency": 82, "status": "Met"},
                {"name": "Problem Solving", "proficiency": 85, "status": "Met"},
                {"name": "SQL Database Security", "proficiency": 78, "status": "Met"},
                {"name": "Communication & Reporting", "proficiency": 62, "status": "Developing"},
                {"name": "Cloud Security (AWS/Azure)", "proficiency": 58, "status": "Gap"},
                {"name": "SIEM & Log Correlation", "proficiency": 48, "status": "Gap"}
            ],
            "projects": [
                {"title": "Automated Network Incident Response Pipeline", "tech": "Python, Linux, Suricata, Telegram API", "description": "Built an automated detection script parsing auth logs and blocking suspicious IP addresses in real-time."},
                {"title": "Web Application Security Audit Framework", "tech": "OWASP ZAP, Burp Suite, SQLMap", "description": "Executed penetration tests on demo microservices to discover and remediate SQL injection and XSS flaws."}
            ],
            "eligibleRoles": ["Cybersecurity Analyst", "SOC Analyst Tier 1", "Information Security Specialist", "Network Security Engineer"],
            "ai_recommendation": {
                "summary": "Priya Gupta is an exceptional match (94% Skill Match, 91% Job Match) for your Cybersecurity Analyst position.",
                "strengths": ["Strong Linux command-line expertise", "Proven Python automation skills", "Verified security incident triage experience"],
                "skill_gaps": ["Cloud Security (58%)", "SIEM Tools (48%)"],
                "intervention_recommendation": "Recommend offering candidate 2-week SIEM & Cloud Security onboarding module upon hiring to achieve 98% operational capacity."
            },
            "is_shortlisted": (org_id, "T102", "JOB-DEMO-007") in demo_shortlists,
            "is_contacted": (org_id, "T102") in demo_contacts
        }
    
    # Generic rich candidate structure
    cand_name = trainee.get("name", "Candidate") if trainee else "Candidate"
    prog = trainee.get("programme_name") or trainee.get("course_name") or "Technical Skills" if trainee else "Data Science"
    loc = trainee.get("district", "Hyderabad") if trainee else "Hyderabad"
    
    return {
        "id": candidate_id,
        "traineeId": candidate_id,
        "name": cand_name,
        "initials": "".join([n[0] for n in cand_name.split()]),
        "email": f"{candidate_id.lower()}@example.com",
        "phone": "+91 98123 45678",
        "programme": prog,
        "location": f"{loc}, Telangana",
        "readiness": "Employment Ready",
        "trainingStatus": "Certified",
        "outcome": "Certified Trainee",
        "match": 88,
        "job_match": 85,
        "education": [
            {"degree": f"B.Tech in {prog}", "college": "Telangana Technical University", "year": "2021–2025", "grade": "8.4 CGPA"}
        ],
        "experience": [
            {"role": f"{prog} Trainee", "company": "Skilling Center of Excellence", "period": "Sep 2024 – Jan 2025", "description": "Hands-on projects and end-to-end industry assignments."}
        ],
        "certifications": [
            {"name": f"Certified {prog} Specialist", "issuer": "State IT Mission", "date": "Jan 2025", "id": f"CERT-{candidate_id}"}
        ],
        "skills": [
            {"name": "Python", "proficiency": 86, "status": "Met"},
            {"name": "SQL", "proficiency": 84, "status": "Met"},
            {"name": "Data Analysis", "proficiency": 80, "status": "Met"},
            {"name": "Problem Solving", "proficiency": 82, "status": "Met"}
        ],
        "projects": [
            {"title": f"{prog} Capstone Project", "tech": "Python, SQL, Cloud", "description": "Delivered verified project demonstrating core competencies."}
        ],
        "eligibleRoles": [f"{prog} Associate", "Technical Analyst", "Junior Engineer"],
        "ai_recommendation": {
            "summary": f"{cand_name} demonstrates strong technical competency in {prog} and is recommended for your open vacancies.",
            "strengths": ["Verified curriculum completion", "Hands-on lab practicals"],
            "skill_gaps": ["Advanced Frameworks"],
            "intervention_recommendation": "Candidate is ready for immediate recruitment and team onboarding."
        },
        "is_shortlisted": (org_id, candidate_id, "JOB-DEMO-001A") in demo_shortlists,
        "is_contacted": (org_id, candidate_id) in demo_contacts
    }

@router.post("/{org_id}/shortlist")
def shortlist_candidate(org_id: str, req: ShortlistRequest):
    key = (org_id, req.trainee_id, req.job_id)
    if key in demo_shortlists:
        demo_shortlists.remove(key)
        return {"status": "success", "shortlisted": False, "message": "Candidate removed from shortlist"}
    else:
        demo_shortlists.add(key)
        return {"status": "success", "shortlisted": True, "message": "Candidate shortlisted successfully"}

@router.post("/{org_id}/contact")
def contact_candidate(org_id: str, req: ContactRequest):
    demo_contacts.add((org_id, req.trainee_id))
    return {
        "status": "success",
        "message": f"Introduction and interview request sent to candidate {req.trainee_id} via verified portal gateway."
    }

@router.get("/{org_id}/shortlisted")
def get_shortlisted(org_id: str):
    shortlisted_trainees = []
    for s in demo_shortlists:
        if s[0] == org_id:
            shortlisted_trainees.append({
                "trainee_id": s[1],
                "job_id": s[2]
            })
    return shortlisted_trainees

@router.get("/{org_id}/outcomes", response_model=List[EmployerOutcomeResponse])
def get_employer_outcomes(org_id: str):
    # Standard hired trainees for employer verification
    default_records = [
        {
            "trainee_id": "T102",
            "trainee_name": "Priya Gupta",
            "programme_name": "Cybersecurity Specialist",
            "district": "Hyderabad",
            "verification_status": "Verified",
            "employment_status": "Employed",
            "employment_type": "Full-time",
            "joining_date": "2025-01-15",
            "salary": 55000.0,
            "job_role": "Cybersecurity Analyst",
            "retention_6m": "Retained (Verified)",
            "retention_12m": "On Track (Active)",
            "employer_remarks": "Exceptional technical execution in SIEM and vulnerability remediation."
        },
        {
            "trainee_id": "TR-DEMO-1001",
            "trainee_name": "Anjali Joshi",
            "programme_name": "AI & Data Science Professional",
            "district": "Nalgonda",
            "verification_status": "Pending Verification",
            "employment_status": "Employed",
            "employment_type": "Full-time",
            "joining_date": "2025-02-01",
            "salary": 50000.0,
            "job_role": "ML/AI Associate",
            "retention_6m": "Due in 30 days",
            "retention_12m": "Not yet due",
            "employer_remarks": "Strong foundational mathematics and Python pipeline integration."
        },
        {
            "trainee_id": "TR-DEMO-1002",
            "trainee_name": "Manoj Das",
            "programme_name": "Data Analytics Specialist",
            "district": "Warangal",
            "verification_status": "Pending Verification",
            "employment_status": "Employed",
            "employment_type": "Full-time",
            "joining_date": "2025-02-15",
            "salary": 45000.0,
            "job_role": "Data Analyst",
            "retention_6m": "Not yet due",
            "retention_12m": "Not yet due",
            "employer_remarks": "Proficient in SQL reporting and interactive dashboard authoring."
        },
        {
            "trainee_id": "TR-DEMO-1003",
            "trainee_name": "Rahul Verma",
            "programme_name": "Cloud Infrastructure & DevOps",
            "district": "Hyderabad",
            "verification_status": "Verified",
            "employment_status": "Employed",
            "employment_type": "Full-time",
            "joining_date": "2024-11-01",
            "salary": 60000.0,
            "job_role": "Cloud Associate",
            "retention_6m": "Retained (Verified)",
            "retention_12m": "Retained (Verified)",
            "employer_remarks": "Completed 12-month retention milestone successfully."
        }
    ]
    
    # Merge with in-memory overrides
    results = []
    for rec in default_records:
        tid = rec["trainee_id"]
        override = demo_outcomes_state.get(f"emp_{tid}_1", {})
        merged = {**rec, **override}
        results.append(merged)
        
    return results

@router.patch("/{org_id}/outcomes/{trainee_id}/verify", response_model=EmployerOutcomeResponse)
def verify_outcome(org_id: str, trainee_id: str, update: EmployerOutcomeUpdate):
    outcome_id = f"emp_{trainee_id}_1"
    
    # Store updated state
    demo_outcomes_state[outcome_id] = {
        "verification_status": "Verified",
        "employment_status": update.employment_status,
        "employment_type": update.employment_type,
        "joining_date": update.joining_date,
        "salary": update.salary,
        "job_role": update.job_role,
        "retention_6m": update.retention_6m,
        "retention_12m": update.retention_12m,
        "employer_remarks": update.employer_remarks
    }
    
    outcomes = get_employer_outcomes(org_id)
    matched = next((o for o in outcomes if o["trainee_id"] == trainee_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail="Outcome record not found")
        
    return matched

# Profile & Settings Endpoints
@router.get("/{org_id}/profile")
def get_employer_profile(org_id: str):
    profile = demo_org_profiles.get(org_id, demo_org_profiles["EMP-DEMO-001"])
    return profile

@router.post("/{org_id}/profile")
def update_employer_profile(org_id: str, update: OrgProfileUpdate):
    profile = demo_org_profiles.get(org_id, {**demo_org_profiles["EMP-DEMO-001"], "organization_id": org_id})
    if update.name: profile["name"] = update.name
    if update.industry: profile["industry"] = update.industry
    if update.company_size: profile["company_size"] = update.company_size
    if update.location: profile["location"] = update.location
    if update.website: profile["website"] = update.website
    if update.contact_person: profile["contact_person"] = update.contact_person
    if update.contact_email: profile["contact_email"] = update.contact_email
    if update.contact_phone: profile["contact_phone"] = update.contact_phone
    if update.hiring_preferences: profile["hiring_preferences"] = update.hiring_preferences
    
    demo_org_profiles[org_id] = profile
    return {"status": "success", "message": "Organization profile updated successfully", "profile": profile}

# Integrations Endpoints
@router.get("/{org_id}/integrations")
def get_employer_integrations(org_id: str):
    integrations = demo_integrations.get(org_id, demo_integrations["EMP-DEMO-001"])
    config = demo_api_configs.get(org_id, demo_api_configs["EMP-DEMO-001"])
    return {
        "integrations": integrations,
        "api_config": config
    }

@router.post("/{org_id}/integrations/{integration_id}/sync")
def sync_employer_integration(org_id: str, integration_id: str):
    integrations = demo_integrations.get(org_id, demo_integrations["EMP-DEMO-001"])
    for item in integrations:
        if item["id"] == integration_id:
            item["last_synced"] = "Just now"
            item["status"] = "Connected"
            return {"status": "success", "message": f"{item['name']} synchronized successfully."}
    return {"status": "success", "message": "Integration synchronized."}

@router.post("/{org_id}/integrations/config")
def update_employer_integration_config(org_id: str, config: IntegrationConfigUpdate):
    current = demo_api_configs.get(org_id, {**demo_api_configs["EMP-DEMO-001"]})
    if config.api_base_url: current["api_base_url"] = config.api_base_url
    if config.client_id: current["client_id"] = config.client_id
    if config.api_key: current["api_key"] = config.api_key
    if config.webhook_url: current["webhook_url"] = config.webhook_url
    if config.environment: current["environment"] = config.environment
    
    demo_api_configs[org_id] = current
    return {"status": "success", "message": "API credentials and configuration updated successfully", "config": current}
