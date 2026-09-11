import os
import sys
import random
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.firebase.config import db

print("Starting Skilling Impact Intelligence DEMO DATA Seed...")

# ==============================================================================
# DATASETS
# ==============================================================================
DISTRICTS = ["Hyderabad", "Ranga Reddy", "Medchal", "Warangal", "Nizamabad", "Karimnagar", 
             "Khammam", "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet",
             "Jagtial", "Mancherial", "Yadadri", "Sangareddy"]

SKILLS_MASTER = [
    {"skill_id": "SK-001", "skill_name": "Python", "category": "Programming"},
    {"skill_id": "SK-002", "skill_name": "SQL", "category": "Database"},
    {"skill_id": "SK-003", "skill_name": "Java", "category": "Programming"},
    {"skill_id": "SK-004", "skill_name": "JavaScript", "category": "Web"},
    {"skill_id": "SK-005", "skill_name": "React", "category": "Web"},
    {"skill_id": "SK-006", "skill_name": "FastAPI", "category": "Web"},
    {"skill_id": "SK-007", "skill_name": "REST APIs", "category": "Web"},
    {"skill_id": "SK-008", "skill_name": "Git", "category": "Tools"},
    {"skill_id": "SK-009", "skill_name": "Docker", "category": "DevOps"},
    {"skill_id": "SK-010", "skill_name": "Linux", "category": "OS"},
    {"skill_id": "SK-011", "skill_name": "AWS", "category": "Cloud"},
    {"skill_id": "SK-012", "skill_name": "Azure", "category": "Cloud"},
    {"skill_id": "SK-013", "skill_name": "Data Analysis", "category": "Analytics"},
    {"skill_id": "SK-014", "skill_name": "Statistics", "category": "Analytics"},
    {"skill_id": "SK-015", "skill_name": "Machine Learning", "category": "AI"},
    {"skill_id": "SK-016", "skill_name": "Deep Learning", "category": "AI"},
    {"skill_id": "SK-017", "skill_name": "NLP", "category": "AI"},
    {"skill_id": "SK-018", "skill_name": "Power BI", "category": "Analytics"},
    {"skill_id": "SK-019", "skill_name": "Excel", "category": "Office"},
    {"skill_id": "SK-020", "skill_name": "Communication", "category": "Soft Skills"},
    {"skill_id": "SK-021", "skill_name": "Problem Solving", "category": "Soft Skills"},
    {"skill_id": "SK-022", "skill_name": "Team Collaboration", "category": "Soft Skills"},
    {"skill_id": "SK-023", "skill_name": "Cybersecurity Fundamentals", "category": "Security"},
    {"skill_id": "SK-024", "skill_name": "Networking", "category": "IT"},
    {"skill_id": "SK-025", "skill_name": "Database Management", "category": "Database"},
    {"skill_id": "SK-026", "skill_name": "UI/UX", "category": "Design"},
    {"skill_id": "SK-027", "skill_name": "Digital Marketing", "category": "Business"},
    {"skill_id": "SK-028", "skill_name": "Financial Analysis", "category": "Business"},
    {"skill_id": "SK-029", "skill_name": "Accounting", "category": "Business"},
    {"skill_id": "SK-030", "skill_name": "Sales", "category": "Business"}
]

PROGRAMMES = [
    {
        "id": "PROG-DEMO-001",
        "name": "Data Analytics Bootcamp",
        "skills_taught": ["Python", "SQL", "Statistics", "Excel", "Power BI", "Data Analysis", "Communication", "Problem Solving"]
    },
    {
        "id": "PROG-DEMO-002",
        "name": "Full Stack Web Development",
        "skills_taught": ["HTML", "CSS", "JavaScript", "React", "REST APIs", "Git", "Team Collaboration"]
    },
    {
        "id": "PROG-DEMO-003",
        "name": "Machine Learning & AI",
        "skills_taught": ["Python", "Statistics", "Linear Algebra", "Machine Learning", "Deep Learning", "NLP"]
    },
    {
        "id": "PROG-DEMO-004",
        "name": "Cloud Computing (AWS/Azure)",
        "skills_taught": ["Linux", "Networking", "AWS", "Azure", "Docker", "Git"]
    },
    {
        "id": "PROG-DEMO-005",
        "name": "Cybersecurity Specialist",
        "skills_taught": ["Linux", "Networking", "Cybersecurity Fundamentals", "Python", "Problem Solving"]
    },
    {
        "id": "PROG-DEMO-006",
        "name": "Digital Marketing Masterclass",
        "skills_taught": ["Digital Marketing", "Communication", "Data Analysis", "Excel"]
    },
    {
        "id": "PROG-DEMO-007",
        "name": "Business & Financial Analytics",
        "skills_taught": ["Financial Analysis", "Accounting", "Excel", "Power BI", "Communication"]
    },
    {
        "id": "PROG-DEMO-008",
        "name": "Enterprise Software Engineering",
        "skills_taught": ["Java", "SQL", "REST APIs", "Git", "Docker", "Team Collaboration"]
    }
]

EMPLOYERS = [
    {"id": "EMP-DEMO-001", "name": "TechFlow Solutions", "industry": "IT Services"},
    {"id": "EMP-DEMO-002", "name": "DataSync Analytics", "industry": "Data & Analytics"},
    {"id": "EMP-DEMO-003", "name": "CloudNova Systems", "industry": "Cloud Infrastructure"},
    {"id": "EMP-DEMO-004", "name": "SecureNet Corp", "industry": "Cybersecurity"},
    {"id": "EMP-DEMO-005", "name": "FinTech Innovators", "industry": "Financial Technology"},
    {"id": "EMP-DEMO-006", "name": "MarketReach Digital", "industry": "Marketing Agency"},
    {"id": "EMP-DEMO-007", "name": "HealthData Analytics", "industry": "Healthcare IT"},
    {"id": "EMP-DEMO-008", "name": "RetailTech Global", "industry": "E-Commerce"},
    {"id": "EMP-DEMO-009", "name": "EduLearn Platforms", "industry": "EdTech"},
    {"id": "EMP-DEMO-010", "name": "BuildSmart Enterprise", "industry": "Software Consulting"}
]

# Generate job opportunities
JOB_ROLES = [
    {
        "id": "JOB-DEMO-001A",
        "employer_id": "EMP-DEMO-001",
        "title": "Data Analyst",
        "skills_required": ["Python", "SQL", "Excel", "Power BI", "Statistics", "Data Analysis", "Communication"]
    },
    {
        "id": "JOB-DEMO-001B",
        "employer_id": "EMP-DEMO-001",
        "title": "Junior Full Stack Developer",
        "skills_required": ["JavaScript", "React", "HTML", "CSS", "REST APIs", "Git", "SQL"]
    },
    {
        "id": "JOB-DEMO-001C",
        "employer_id": "EMP-DEMO-001",
        "title": "Cloud Support Associate",
        "skills_required": ["Linux", "AWS", "Networking", "Docker", "Git", "CI/CD"]
    },
    {
        "id": "JOB-DEMO-001D",
        "employer_id": "EMP-DEMO-001",
        "title": "ML/AI Associate",
        "skills_required": ["Python", "Statistics", "Machine Learning", "SQL", "Data Analysis", "Scikit-learn"]
    }
]

for i, emp in enumerate(EMPLOYERS):
    if emp["id"] == "EMP-DEMO-001":
        continue # Already added
    # Job 1
    prog1 = random.choice(PROGRAMMES)
    JOB_ROLES.append({
        "id": f"JOB-DEMO-{i}A",
        "employer_id": emp["id"],
        "title": f"Junior {prog1['name'].split(' ')[0]} Specialist",
        "skills_required": random.sample(prog1["skills_taught"], k=min(4, len(prog1["skills_taught"])))
    })
    # Job 2
    prog2 = random.choice(PROGRAMMES)
    JOB_ROLES.append({
        "id": f"JOB-DEMO-{i}B",
        "employer_id": emp["id"],
        "title": f"Associate {prog2['name'].split(' ')[0]} Analyst",
        "skills_required": random.sample(prog2["skills_taught"], k=min(5, len(prog2["skills_taught"])))
    })

FIRST_NAMES = ["Rahul", "Priya", "Amit", "Sneha", "Karthik", "Anjali", "Vikram", "Pooja", "Suresh", "Divya", "Arjun", "Neha", "Ravi", "Swati", "Manoj", "Kavya", "Sanjay", "Riya", "Vijay", "Aarti"]
LAST_NAMES = ["Kumar", "Reddy", "Sharma", "Singh", "Patel", "Rao", "Gupta", "Das", "Joshi", "Choudhary"]

# ==============================================================================
# BATCH UPLOAD (Bypassing Firestore Quota by Dumping to demo_data.json)
# ==============================================================================

import json

demo_data = {
    "programmes": [],
    "employers": [],
    "jobs": [],
    "employer_feedback": [],
    "trainees": [],
    "interventions": [],
    "skill_master": SKILLS_MASTER,
    "skill_assessments": []
}

def seed_programmes():
    print("Seeding programmes...")
    for prog in PROGRAMMES:
        data = {
            "id": prog["id"],
            "name": prog["name"],
            "provider": random.choice(["SkillIndia Institute", "Tech Academy", "Govt ITI", "FutureSkills Center"]),
            "status": "Active",
            "skills_taught": prog["skills_taught"],
            "skills_taught_structured": [
                {
                    "skill_id": next((s["skill_id"] for s in SKILLS_MASTER if s["skill_name"] == sk), ""),
                    "skill_name": sk,
                    "target_level": random.randint(70, 95)
                } for sk in prog["skills_taught"]
            ],
            "districts": random.sample(DISTRICTS, k=3),
            "is_synthetic": True,
            "created_at": datetime.now().isoformat() + "Z"
        }
        demo_data["programmes"].append(data)

def seed_employers_and_jobs():
    print("Seeding employers and jobs...")
    for emp in EMPLOYERS:
        data = {
            "id": emp["id"],
            "name": emp["name"],
            "industry": emp["industry"],
            "location": random.choice(DISTRICTS),
            "is_synthetic": True
        }
        demo_data["employers"].append(data)
    
    for job in JOB_ROLES:
        emp = next(e for e in EMPLOYERS if e["id"] == job["employer_id"])
        data = {
            "id": job["id"],
            "employer_id": job["employer_id"],
            "employer_name": emp["name"],
            "title": job["title"],
            "role": job["title"],
            "industry": emp["industry"],
            "location": random.choice(DISTRICTS),
            "skills_required": [{"skill_id": next((s["skill_id"] for s in SKILLS_MASTER if s["skill_name"] == sk), ""), "skill_name": sk, "required_level": random.randint(60, 90), "importance": round(random.uniform(0.5, 1.0), 2)} for sk in job["skills_required"]],
            "is_synthetic": True,
            "status": "Active"
        }
        demo_data["jobs"].append(data)

def seed_trainees():
    print("Seeding 350 trainees...")
    auth_trainee_id = "T102" 
    
    for i in range(350):
        t_id = auth_trainee_id if i == 0 else f"TR-DEMO-{1000+i}"
        prog = random.choice(PROGRAMMES)
        
        outcome_roll = random.random()
        status = "Certified"
        if outcome_roll < 0.1:
            status = "In Training"
            outcome = "Training"
        elif outcome_roll < 0.2:
            status = "Dropped"
            outcome = "Dropped"
        else:
            if outcome_roll < 0.5:
                outcome = "Seeking Employment"
            else:
                outcome = "Employed"
        
        acquired_skills = []
        acquired_skill_ids = []
        if status != "Dropped":
            acquired_skills = random.sample(prog["skills_taught"], k=max(2, int(len(prog["skills_taught"]) * random.uniform(0.6, 1.0))))
            acquired_skill_ids = [next((s["skill_id"] for s in SKILLS_MASTER if s["skill_name"] == sk), "") for sk in acquired_skills]
            
        emp_hist = []
        if outcome == "Employed":
            if random.random() < 0.8:
                job = random.choice(JOB_ROLES)
                emp_name = next(e["name"] for e in EMPLOYERS if e["id"] == job["employer_id"])
                job_title = job["title"]
            else:
                emp_name = "External Corp"
                job_title = "Analyst"
                
            import uuid
            salary = float(random.randint(15000, 45000))
            start_date = datetime.now() - timedelta(days=random.randint(30, 400))
            is_active = random.random() < 0.8
            emp_hist.append({
                "id": f"emp_{uuid.uuid4().hex[:8]}",
                "employer_name": emp_name,
                "role": job_title,
                "salary": salary,
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": None if is_active else (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                "verified": True,
                "employment_type": "Employed",
                "job_relevance": "High",
                "reason_for_exit": None
            })
            
        assessments = []
        for mod in ["Core Concepts", "Practical Lab", "Final Project"]:
            import uuid
            score = random.randint(55, 98)
            skill = random.choice(prog["skills_taught"])
            skill_id = next((s["skill_id"] for s in SKILLS_MASTER if s["skill_name"] == skill), "")
            ass_data = {
                "assessment_id": f"asm_{uuid.uuid4().hex[:8]}",
                "trainee_id": t_id,
                "skill_id": skill_id,
                "skill_name": skill,
                "module_name": mod,
                "proficiency_score": score,
                "assessment_date": datetime.now().strftime("%Y-%m-%d"),
                "assessment_type": "project" if mod == "Final Project" else "test",
                "created_at": datetime.now().isoformat() + "Z"
            }
            assessments.append({"module": mod, "score": score}) # Keep simple one for trainee object if frontend uses it
            demo_data["skill_assessments"].append(ass_data)
        
        timeline = []
        if outcome == "Employed" and emp_hist:
            days_since = (datetime.now() - datetime.strptime(emp_hist[0]["start_date"], "%Y-%m-%d")).days
            is_active_emp = emp_hist[0].get("end_date") is None
            if days_since > 90:
                timeline.append({"checkpoint": "3 Months", "status": "Recorded", "date": (datetime.now() - timedelta(days=days_since-90)).strftime("%Y-%m-%d"), "description": "3 month check-in completed", "employment_status": "Employed", "employer_or_activity": emp_hist[0]["employer_name"], "salary": str(emp_hist[0]["salary"]), "job_relevance": emp_hist[0]["job_relevance"], "verification_status": "Verified"})
            if days_since > 180:
                timeline.append({"checkpoint": "6 Months", "status": "Recorded", "date": (datetime.now() - timedelta(days=days_since-180)).strftime("%Y-%m-%d"), "description": "6 month check-in completed", "employment_status": "Employed" if is_active_emp else "Unemployed", "employer_or_activity": emp_hist[0]["employer_name"] if is_active_emp else "None", "salary": str(emp_hist[0]["salary"]) if is_active_emp else None, "job_relevance": emp_hist[0]["job_relevance"] if is_active_emp else None, "verification_status": "Verified"})
            if days_since > 365:
                timeline.append({"checkpoint": "12 Months", "status": "Recorded", "date": (datetime.now() - timedelta(days=days_since-365)).strftime("%Y-%m-%d"), "description": "1 year check-in completed", "employment_status": "Employed" if is_active_emp else "Unemployed", "employer_or_activity": emp_hist[0]["employer_name"] if is_active_emp else "None", "salary": str(emp_hist[0]["salary"]) if is_active_emp else None, "job_relevance": emp_hist[0]["job_relevance"] if is_active_emp else None, "verification_status": "Verified"})
            
        data = {
            "id": t_id,
            "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "email": f"demo{i}@example.com" if i > 0 else "rahul.kumar@example.com",
            "phone": f"+91 9{random.randint(100000000, 999999999)}",
            "district": random.choice(DISTRICTS),
            "programme_id": prog["id"],
            "course_name": prog["name"],
            "provider": random.choice(["SkillIndia Institute", "Tech Academy", "Govt ITI", "FutureSkills Center"]),
            "status": status,
            "outcome": outcome,
            "skills": acquired_skills,
            "skill_ids": acquired_skill_ids,
            "certifications": [],
            "employment_history": emp_hist,
            "outcomes_timeline": timeline,
            "assessments": assessments,
            "is_synthetic": True,
            "created_at": datetime.now().isoformat() + "Z"
        }
        
        demo_data["trainees"].append(data)
        
        if status == "Certified" and outcome == "Seeking Employment" and random.random() < 0.3:
            import uuid
            now_iso = datetime.now().isoformat() + "Z"
            demo_data["interventions"].append({
                "id": f"int_{uuid.uuid4().hex[:8]}",
                "title": "Targeted Skill Bridge",
                "description": f"Recommended skill bridge for trainee {t_id} to close gaps.",
                "programme_id": prog["id"],
                "date": datetime.now().strftime("%Y-%m-%d"),
                "impact": {
                    "before": {"skill_match": "60%", "retention_12m": "50%", "wage_growth": "+5%"},
                    "after": {"skill_match": "85%", "retention_12m": "80%", "wage_growth": "+15%"}
                },
                "is_synthetic": True,
                "created_at": now_iso,
                "updated_at": now_iso
            })
        
        # Generate employer feedback for employed trainees (with proper trainee_id linkage)
        if outcome == "Employed" and emp_hist and random.random() < 0.4:
            import uuid
            # Pick skills the employer might complain about (skills NOT fully acquired by trainee)
            all_prog_skills = prog["skills_taught"]
            possible_deficiencies = [s for s in all_prog_skills if s not in acquired_skills]
            if not possible_deficiencies:
                possible_deficiencies = random.sample(all_prog_skills, k=min(2, len(all_prog_skills)))
            
            demo_data["employer_feedback"].append({
                "id": f"f_{uuid.uuid4().hex[:8]}",
                "trainee_id": t_id,
                "programme_id": prog["id"],
                "employer_id": emp_hist[0].get("employer_name", "Unknown"),
                "employer_name": emp_hist[0].get("employer_name", "Unknown"),
                "satisfaction_score": random.randint(2, 5),
                "skills_required_in_job": random.sample(all_prog_skills, k=min(4, len(all_prog_skills))),
                "technical_deficiencies": random.sample(possible_deficiencies, k=min(2, len(possible_deficiencies))),
                "soft_skill_deficiencies": random.sample(["Communication", "Team Collaboration", "Problem Solving"], k=random.randint(0, 2)),
                "is_synthetic": True,
                "created_at": datetime.now().isoformat() + "Z"
            })

if __name__ == "__main__":
    seed_programmes()
    seed_employers_and_jobs()
    seed_trainees()
    
    with open("demo_data.json", "w") as f:
        json.dump(demo_data, f, indent=2)
        
    print("Successfully seeded all synthetic DEMO data locally to demo_data.json! Firestore bypassed.")
