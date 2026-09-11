import os
import sys
import uuid
import random
import json
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Starting Comprehensive Three-Panel Data Seeding to demo_data.json...")

# Ensure reproducibility
rnd = random.Random(42)

now = datetime.utcnow()
now_iso = now.isoformat() + "Z"

demo_data = {
    "programmes": [],
    "skill_master": [],
    "role_benchmarks": [],
    "skill_assessments": [],
    "employers": [],
    "employer_feedback": [],
    "employer_verifications": [],
    "follow_ups": [],
    "interventions": [],
    "trainees": []
}

# 1. Programmes
programmes = [
    {"id": "PROG-001", "name": "IT Data Analytics Bootcamp", "course_name": "Data Analytics", "provider": "State Tech Institute"},
    {"id": "PROG-002", "name": "Full Stack Web Developer", "course_name": "Web Development", "provider": "Digital Skills Academy"},
    {"id": "PROG-003", "name": "Industrial Automation & Safety", "course_name": "Industrial Safety", "provider": "National Engineering Board"}
]
for p in programmes:
    p["created_at"] = now_iso
    p["updated_at"] = now_iso
    p["employment_rate_num"] = 0.8
    p["retention_6m_num"] = 0.7
    p["retention_12m_num"] = 0.6
    demo_data["programmes"].append(p)

# 2. Skills
skills = [
    {"skill_id": "SKILL-001", "skill_name": "Python Data Analysis", "category": "Data"},
    {"skill_id": "SKILL-002", "skill_name": "SQL & Databases", "category": "Data"},
    {"skill_id": "SKILL-003", "skill_name": "React Frontend", "category": "Web"},
    {"skill_id": "SKILL-004", "skill_name": "Node.js Backend", "category": "Web"},
    {"skill_id": "SKILL-005", "skill_name": "PLC Programming", "category": "Engineering"},
    {"skill_id": "SKILL-006", "skill_name": "Industrial Safety Codes", "category": "Engineering"},
]
for s in skills:
    s["created_at"] = now_iso
    demo_data["skill_master"].append(s)

# 3. Employers
employers = []
for i in range(1, 11):
    emp_id = f"EMP-{i:03d}"
    employers.append({
        "id": emp_id,
        "organization_name": f"Enterprise Corp {i}",
        "industry": rnd.choice(["Tech", "Manufacturing", "Finance"]),
        "contact_email": f"hr@enterprise{i}.com",
        "created_at": now_iso,
        "updated_at": now_iso
    })
for e in employers:
    demo_data["employers"].append(e)

# 4. Trainees & Related Data
for i in range(1, 1001):
    t_id = f"TR-{i:04d}"
    prog = rnd.choice(programmes)
    
    # 80% employed, 20% unemployed
    is_employed = rnd.random() < 0.8
    emp = rnd.choice(employers) if is_employed else None
    
    # Generate Trainee
    trainee = {
        "id": t_id,
        "name": f"Synthetic Trainee {i}",
        "email": f"trainee{i}@synthetic.local",
        "phone": f"+9198{rnd.randint(10000000, 99999999)}",
        "district": rnd.choice(["North", "South", "East", "West"]),
        "programme_id": prog["id"],
        "course_name": prog["course_name"],
        "provider": prog["provider"],
        "cohort": "2025-Q1",
        "enrollment_date": (now - timedelta(days=200)).isoformat() + "Z",
        "status": "Certified",
        "outcome": "Employed" if is_employed else "Unemployed",
        "employment_history": [],
        "skill_ids": [],
        "created_at": now_iso,
        "updated_at": now_iso
    }
    
    # Generate Skills
    t_skills = []
    if prog["id"] == "PROG-001":
        t_skills = ["SKILL-001", "SKILL-002"]
    elif prog["id"] == "PROG-002":
        t_skills = ["SKILL-003", "SKILL-004"]
    else:
        t_skills = ["SKILL-005", "SKILL-006"]
        
    trainee["skill_ids"] = t_skills
    
    for s_id in t_skills:
        skill_obj = next(s for s in skills if s["skill_id"] == s_id)
        asm_id = f"ASM-{t_id}-{s_id}"
        asm = {
            "assessment_id": asm_id,
            "trainee_id": t_id,
            "skill_id": s_id,
            "skill_name": skill_obj["skill_name"],
            "proficiency_score": rnd.randint(60, 95),
            "assessment_type": "Final",
            "assessment_date": (now - timedelta(days=100)).isoformat() + "Z",
            "created_at": now_iso
        }
        demo_data["skill_assessments"].append(asm)
        
    # Generate Employment
    if is_employed:
        emp_hist_id = str(uuid.uuid4())
        salary = rnd.randint(300000, 800000)
        emp_hist = {
            "id": emp_hist_id,
            "employer_name": emp["organization_name"],
            "employer_id": emp["id"],
            "role": "Analyst" if prog["id"] == "PROG-001" else ("Developer" if prog["id"] == "PROG-002" else "Technician"),
            "start_date": (now - timedelta(days=90)).isoformat() + "Z",
            "end_date": None,
            "reason_for_exit": None,
            "salary": salary,
            "verified": True,
            "employment_type": "Employed",
            "job_relevance": "High",
            "status": "Active",
            "verification_state": "Verified"
        }
        trainee["employment_history"].append(emp_hist)
        
        # Employer Verification Record
        ver_id = f"VER-{t_id}"
        ver = {
            "id": ver_id,
            "verification_id": ver_id,
            "trainee_id": t_id,
            "employer_id": emp["id"],
            "employer_name": emp["organization_name"],
            "employer_email": emp["contact_email"],
            "role": emp_hist.get("role", "Software Engineer") if emp_hist else "Software Engineer",
            "status": "Verified" if rnd.random() < 0.9 else "Pending",
            "verification_date": (now - timedelta(days=80)).isoformat() + "Z",
            "created_at": now_iso,
            "updated_at": now_iso
        }
        demo_data["employer_verifications"].append(ver)
        
        # Employer Feedback Record (30% chance)
        if rnd.random() < 0.3:
            fb_id = f"FB-{t_id}"
            fb = {
                "feedback_id": fb_id,
                "trainee_id": t_id,
                "programme_id": prog["id"],
                "employer_id": emp["id"],
                "employer_name": emp["organization_name"],
                "satisfaction_score": rnd.randint(3, 5),
                "technical_deficiencies": [],
                "created_at": now_iso
            }
            demo_data["employer_feedback"].append(fb)
            
    # Trainee Follow-up
    fu_id = f"FU-{t_id}"
    fu = {
        "id": fu_id,
        "trainee_id": t_id,
        "current_stage": "3M",
        "status": "COMPLETED",
        "triggered_at": (now - timedelta(days=5)).isoformat() + "Z",
        "next_due_at": (now + timedelta(days=85)).isoformat() + "Z",
        "created_at": now_iso,
        "updated_at": now_iso
    }
    demo_data["follow_ups"].append(fu)
    
    # Save Trainee
    demo_data["trainees"].append(trainee)

demo_file_path = os.path.join(os.path.dirname(__file__), 'demo_data.json')
with open(demo_file_path, 'w', encoding='utf-8') as f:
    json.dump(demo_data, f, indent=2)

print("Comprehensive Three-Panel Dataset generated successfully to demo_data.json! Total trainees: 1000")
