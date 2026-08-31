import os
import sys
from datetime import datetime, timedelta
import random

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.firebase.config import db

print("Starting Skilling Impact Intelligence Extended Database Seed...")

# ==============================================================================
# 1. SEED SKILL MASTER (Canonical Skills)
# ==============================================================================
SKILLS = [
    {
        "skill_id": "S001",
        "skill_name": "Python",
        "category": "Programming",
        "description": "Core Python programming, data structures, and automation scripting."
    },
    {
        "skill_id": "S002",
        "skill_name": "SQL",
        "category": "Database",
        "description": "Relational database queries, joins, aggregations, and schema design."
    },
    {
        "skill_id": "S003",
        "skill_name": "Power BI",
        "category": "Analytics & BI",
        "description": "Dashboard creation, DAX functions, and business data visualization."
    },
    {
        "skill_id": "S004",
        "skill_name": "Statistics",
        "category": "Analytics",
        "description": "Descriptive statistics, hypothesis testing, probability, and trend analysis."
    },
    {
        "skill_id": "S005",
        "skill_name": "Excel & Advanced MIS",
        "category": "Office Productivity",
        "description": "VLOOKUP, Pivot Tables, macro automations, and reporting workflows."
    },
    {
        "skill_id": "S006",
        "skill_name": "React & Frontend",
        "category": "Web Development",
        "description": "Modern frontend development, component architecture, hooks, and responsive UI."
    },
    {
        "skill_id": "S007",
        "skill_name": "Node.js & REST APIs",
        "category": "Backend Development",
        "description": "Backend API development, routing, async operations, and database integration."
    },
    {
        "skill_id": "S008",
        "skill_name": "Cloud Fundamentals",
        "category": "Cloud Computing",
        "description": "Cloud hosting, serverless functions, cloud storage, and IAM security basics."
    },
    {
        "skill_id": "S009",
        "skill_name": "Machine Learning Basics",
        "category": "AI & Machine Learning",
        "description": "Supervised learning models, regression, classification, and model evaluation."
    },
    {
        "skill_id": "S010",
        "skill_name": "Electrical Circuit Wiring",
        "category": "Core Engineering",
        "description": "Industrial wiring, schematics interpretation, switchgears, and power distribution."
    },
    {
        "skill_id": "S011",
        "skill_name": "PLC & Automation",
        "category": "Industrial Controls",
        "description": "Programmable logic controller ladder logic, sensors, actuators, and troubleshooting."
    },
    {
        "skill_id": "S012",
        "skill_name": "Safety Compliance & Standards",
        "category": "Industrial Safety",
        "description": "OSHA/BIS industrial electrical safety codes, PPE protocols, and hazard mitigation."
    },
    {
        "skill_id": "S013",
        "skill_name": "Digital Marketing & SEO",
        "category": "Marketing & Growth",
        "description": "Search engine optimization, paid ad campaigns, analytics tracking, and social content."
    },
    {
        "skill_id": "S014",
        "skill_name": "Communication & Professional Ethics",
        "category": "Soft Skills",
        "description": "Workplace verbal communication, active listening, teamwork, and business etiquette."
    },
    {
        "skill_id": "S015",
        "skill_name": "Problem Solving & Analytical Thinking",
        "category": "Cognitive Skills",
        "description": "Root cause analysis, logical structuring, and quantitative decision making."
    }
]

print("--> Seeding skill_master collection...")
for skill in SKILLS:
    skill["created_at"] = datetime.utcnow().isoformat() + "Z"
    db.collection("skill_master").document(skill["skill_id"]).set(skill)
print(f"  ? Seeded {len(SKILLS)} canonical skills into skill_master.")

# ==============================================================================
# 2. SEED JOBS / JOB REQUIREMENTS
# ==============================================================================
JOBS = [
    {
        "id": "J101",
        "title": "Junior Data Analyst",
        "role": "Data Analyst",
        "industry": "Information Technology",
        "location": "Hyderabad",
        "min_salary": 25000.0,
        "max_salary": 38000.0,
        "openings": 4,
        "applications": 32,
        "match": 86,
        "employer_id": "ORG4582",
        "employer_name": "ABC Technologies",
        "skills_required": [
            {"skill_id": "S001", "skill_name": "Python", "required_level": 75, "importance": 0.85},
            {"skill_id": "S002", "skill_name": "SQL", "required_level": 80, "importance": 1.0},
            {"skill_id": "S003", "skill_name": "Power BI", "required_level": 70, "importance": 0.9},
            {"skill_id": "S004", "skill_name": "Statistics", "required_level": 65, "importance": 0.7},
            {"skill_id": "S014", "skill_name": "Communication & Professional Ethics", "required_level": 70, "importance": 0.6}
        ]
    },
    {
        "id": "J102",
        "title": "Business Intelligence Associate",
        "role": "Business Analyst",
        "industry": "Financial Services & Analytics",
        "location": "Bengaluru",
        "min_salary": 28000.0,
        "max_salary": 42000.0,
        "openings": 3,
        "applications": 21,
        "match": 82,
        "employer_id": "ORG4582",
        "employer_name": "ABC Technologies",
        "skills_required": [
            {"skill_id": "S002", "skill_name": "SQL", "required_level": 85, "importance": 1.0},
            {"skill_id": "S003", "skill_name": "Power BI", "required_level": 80, "importance": 0.95},
            {"skill_id": "S005", "skill_name": "Excel & Advanced MIS", "required_level": 85, "importance": 0.8},
            {"skill_id": "S015", "skill_name": "Problem Solving & Analytical Thinking", "required_level": 75, "importance": 0.75}
        ]
    },
    {
        "id": "J103",
        "title": "Frontend React Developer",
        "role": "Frontend Developer",
        "industry": "Software & Web Services",
        "location": "Visakhapatnam",
        "min_salary": 24000.0,
        "max_salary": 36000.0,
        "openings": 5,
        "applications": 19,
        "match": 80,
        "employer_id": "ORG7890",
        "employer_name": "Sunrise Digital Labs",
        "skills_required": [
            {"skill_id": "S006", "skill_name": "React & Frontend", "required_level": 80, "importance": 1.0},
            {"skill_id": "S007", "skill_name": "Node.js & REST APIs", "required_level": 65, "importance": 0.75},
            {"skill_id": "S014", "skill_name": "Communication & Professional Ethics", "required_level": 70, "importance": 0.6}
        ]
    },
    {
        "id": "J104",
        "title": "Full Stack Web Apprentice",
        "role": "Full Stack Developer",
        "industry": "Information Technology",
        "location": "Hyderabad",
        "min_salary": 20000.0,
        "max_salary": 30000.0,
        "openings": 2,
        "applications": 15,
        "match": 78,
        "employer_id": "ORG4582",
        "employer_name": "ABC Technologies",
        "skills_required": [
            {"skill_id": "S006", "skill_name": "React & Frontend", "required_level": 75, "importance": 0.9},
            {"skill_id": "S007", "skill_name": "Node.js & REST APIs", "required_level": 75, "importance": 0.9},
            {"skill_id": "S002", "skill_name": "SQL", "required_level": 70, "importance": 0.8}
        ]
    },
    {
        "id": "J105",
        "title": "Industrial Electrical Technician",
        "role": "Electrical Technician",
        "industry": "Manufacturing & Heavy Engineering",
        "location": "Guntur",
        "min_salary": 18000.0,
        "max_salary": 26000.0,
        "openings": 6,
        "applications": 28,
        "match": 88,
        "employer_id": "ORG6310",
        "employer_name": "Deccan Power & Grid Corp",
        "skills_required": [
            {"skill_id": "S010", "skill_name": "Electrical Circuit Wiring", "required_level": 85, "importance": 1.0},
            {"skill_id": "S012", "skill_name": "Safety Compliance & Standards", "required_level": 90, "importance": 0.95},
            {"skill_id": "S011", "skill_name": "PLC & Automation", "required_level": 60, "importance": 0.7}
        ]
    },
    {
        "id": "J106",
        "title": "Automation & Controls Assistant",
        "role": "Automation Engineer",
        "industry": "Automotive & Manufacturing",
        "location": "Krishna",
        "min_salary": 22000.0,
        "max_salary": 32000.0,
        "openings": 2,
        "applications": 11,
        "match": 75,
        "employer_id": "ORG6310",
        "employer_name": "Deccan Power & Grid Corp",
        "skills_required": [
            {"skill_id": "S011", "skill_name": "PLC & Automation", "required_level": 80, "importance": 1.0},
            {"skill_id": "S010", "skill_name": "Electrical Circuit Wiring", "required_level": 75, "importance": 0.85},
            {"skill_id": "S012", "skill_name": "Safety Compliance & Standards", "required_level": 85, "importance": 0.9}
        ]
    },
    {
        "id": "J107",
        "title": "MIS Executive & Data Coordinator",
        "role": "MIS Executive",
        "industry": "Logistics & Supply Chain",
        "location": "Guntur",
        "min_salary": 19000.0,
        "max_salary": 27000.0,
        "openings": 3,
        "applications": 25,
        "match": 84,
        "employer_id": "ORG2215",
        "employer_name": "Coastal Logistics Ltd",
        "skills_required": [
            {"skill_id": "S005", "skill_name": "Excel & Advanced MIS", "required_level": 85, "importance": 1.0},
            {"skill_id": "S002", "skill_name": "SQL", "required_level": 65, "importance": 0.75},
            {"skill_id": "S014", "skill_name": "Communication & Professional Ethics", "required_level": 70, "importance": 0.6}
        ]
    },
    {
        "id": "J108",
        "title": "Digital Growth Specialist",
        "role": "Digital Marketer",
        "industry": "E-Commerce & Digital Media",
        "location": "Visakhapatnam",
        "min_salary": 21000.0,
        "max_salary": 31000.0,
        "openings": 2,
        "applications": 14,
        "match": 81,
        "employer_id": "ORG7890",
        "employer_name": "Sunrise Digital Labs",
        "skills_required": [
            {"skill_id": "S013", "skill_name": "Digital Marketing & SEO", "required_level": 80, "importance": 1.0},
            {"skill_id": "S005", "skill_name": "Excel & Advanced MIS", "required_level": 70, "importance": 0.7},
            {"skill_id": "S014", "skill_name": "Communication & Professional Ethics", "required_level": 80, "importance": 0.85}
        ]
    }
]

print("--> Seeding jobs collection...")
for job in JOBS:
    job["created_at"] = datetime.utcnow().isoformat() + "Z"
    job["updated_at"] = datetime.utcnow().isoformat() + "Z"
    job["status"] = "Active"
    db.collection("jobs").document(job["id"]).set(job)
print(f"  ? Seeded {len(JOBS)} structured job openings into jobs collection.")

# ==============================================================================
# 3. UPDATE PROGRAMMES WITH STRUCTURED SKILLS & NUMERIC RATES
# ==============================================================================
print("--> Updating programmes collection with structured skills and numeric metrics...")
PROGRAMMES_UPDATE = {
    "P001": {
        "skills_taught_structured": [
            {"skill_id": "S001", "skill_name": "Python", "target_level": 75},
            {"skill_id": "S002", "skill_name": "SQL", "target_level": 80},
            {"skill_id": "S003", "skill_name": "Power BI", "target_level": 60},
            {"skill_id": "S004", "skill_name": "Statistics", "target_level": 70},
            {"skill_id": "S005", "skill_name": "Excel & Advanced MIS", "target_level": 85},
            {"skill_id": "S014", "skill_name": "Communication & Professional Ethics", "target_level": 75}
        ],
        "employment_rate_num": 0.78,
        "retention_6m_num": 0.64,
        "retention_12m_num": 0.49
    },
    "P002": {
        "skills_taught_structured": [
            {"skill_id": "S006", "skill_name": "React & Frontend", "target_level": 80},
            {"skill_id": "S007", "skill_name": "Node.js & REST APIs", "target_level": 70},
            {"skill_id": "S002", "skill_name": "SQL", "target_level": 65},
            {"skill_id": "S014", "skill_name": "Communication & Professional Ethics", "target_level": 75}
        ],
        "employment_rate_num": 0.74,
        "retention_6m_num": 0.61,
        "retention_12m_num": 0.52
    },
    "P003": {
        "skills_taught_structured": [
            {"skill_id": "S010", "skill_name": "Electrical Circuit Wiring", "target_level": 85},
            {"skill_id": "S011", "skill_name": "PLC & Automation", "target_level": 60},
            {"skill_id": "S012", "skill_name": "Safety Compliance & Standards", "target_level": 90},
            {"skill_id": "S014", "skill_name": "Communication & Professional Ethics", "target_level": 70}
        ],
        "employment_rate_num": 0.70,
        "retention_6m_num": 0.58,
        "retention_12m_num": 0.45
    }
}

for p_id, p_data in PROGRAMMES_UPDATE.items():
    doc_ref = db.collection("programmes").document(p_id)
    if doc_ref.get().exists:
        doc_ref.update(p_data)
print("  ? Updated programmes P001, P002, P003 with skills_taught_structured and float rates.")

# ==============================================================================
# 4. SEED SKILL ASSESSMENTS & UPDATE TRAINEES WITH EMPLOYMENT DATES
# ==============================================================================
print("--> Generating granular skill_assessments and updating trainee records...")

# Fetch all existing trainees
trainee_docs = db.collection("trainees").stream()
all_trainees = [doc.to_dict() for doc in trainee_docs]

assessment_count = 0
updated_trainee_count = 0

# Random generator with fixed seed for reproducibility and unbiased distribution
rnd = random.Random(42)

for trainee in all_trainees:
    t_id = trainee["id"]
    course = trainee.get("course_name", "Data Analytics")
    prog_id = trainee.get("programme_id", "P001")
    
    # Determine skill profiles based on programme
    if prog_id == "P001" or "Analytics" in course:
        skills_to_assess = [
            ("S001", "Python", 65, 92, "project"),
            ("S002", "SQL", 68, 95, "test"),
            ("S003", "Power BI", 35, 78, "practical"), # lower score to reflect realistic skill gap
            ("S004", "Statistics", 60, 88, "test"),
            ("S005", "Excel & Advanced MIS", 75, 95, "test"),
            ("S014", "Communication & Professional Ethics", 70, 90, "interview")
        ]
        skill_ids = ["S001", "S002", "S003", "S004", "S005", "S014"]
    elif prog_id == "P002" or "Web" in course:
        skills_to_assess = [
            ("S006", "React & Frontend", 70, 94, "project"),
            ("S007", "Node.js & REST APIs", 60, 88, "practical"),
            ("S002", "SQL", 58, 85, "test"),
            ("S014", "Communication & Professional Ethics", 70, 92, "interview")
        ]
        skill_ids = ["S006", "S007", "S002", "S014"]
    else: # P003 Electrical
        skills_to_assess = [
            ("S010", "Electrical Circuit Wiring", 75, 96, "practical"),
            ("S011", "PLC & Automation", 50, 78, "project"),
            ("S012", "Safety Compliance & Standards", 80, 98, "test"),
            ("S014", "Communication & Professional Ethics", 65, 88, "interview")
        ]
        skill_ids = ["S010", "S011", "S012", "S014"]

    # Special calibrated scores for demo accounts
    if t_id == "T102": # Rahul Kumar
        scores = {"S001": 82, "S002": 78, "S003": 52, "S004": 74, "S005": 90, "S014": 85}
    elif t_id == "T103": # Priya Sharma
        scores = {"S006": 88, "S007": 74, "S002": 70, "S014": 82}
    elif t_id == "T104": # Arun Kumar
        scores = {"S010": 86, "S011": 58, "S012": 92, "S014": 72}
    else:
        scores = {}

    for (s_id, s_name, min_s, max_s, asm_type) in skills_to_assess:
        score = scores.get(s_id, rnd.randint(min_s, max_s))
        asm_id = f"asm_{t_id}_{s_id}"
        asm_doc = {
            "assessment_id": asm_id,
            "trainee_id": t_id,
            "skill_id": s_id,
            "skill_name": s_name,
            "proficiency_score": score,
            "assessment_type": asm_type,
            "assessment_date": "2025-01-15",
            "assessor": "National Assessment & Certification Body",
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        db.collection("skill_assessments").document(asm_id).set(asm_doc)
        assessment_count += 1

    # Update Trainee Employment History with dates and exit reasons
    emp_history = trainee.get("employment_history", [])
    updated_history = []
    if emp_history:
        for idx, emp in enumerate(emp_history):
            start_date = "2025-02-01"
            # 6M and 12M intervals
            if trainee.get("outcome") == "Unemployed":
                end_date = "2025-05-15"
                reason_for_exit = "Skill mismatch with modern BI and automated tool requirements"
                status_emp = "Exit"
            elif trainee.get("outcome") == "Apprentice":
                end_date = "2025-08-01"
                reason_for_exit = None
                status_emp = "Apprentice"
            else:
                end_date = None
                reason_for_exit = None
                status_emp = "Employed"

            updated_emp = {
                **emp,
                "start_date": start_date,
                "end_date": end_date,
                "reason_for_exit": reason_for_exit,
                "employment_type": status_emp
            }
            updated_history.append(updated_emp)
    else:
        # Create default employment record if missing
        if trainee.get("outcome") != "Unemployed":
            updated_history.append({
                "id": f"emp_{t_id}_1",
                "employer_name": "ABC Technologies" if prog_id == "P001" else "Sunrise Digital Labs",
                "role": "Junior Associate",
                "start_date": "2025-02-01",
                "end_date": None,
                "reason_for_exit": None,
                "salary": 21000.0,
                "verified": True,
                "employment_type": "Employed",
                "job_relevance": "High"
            })

    db.collection("trainees").document(t_id).update({
        "skill_ids": skill_ids,
        "employment_history": updated_history,
        "updated_at": datetime.utcnow().isoformat() + "Z",
    })
    updated_trainee_count += 1

print(f"  ? Seeded {assessment_count} skill assessments into skill_assessments collection.")
print(f"  ? Updated {updated_trainee_count} trainees with skill IDs and longitudinal employment dates.")

# ==============================================================================
# 5. UPDATE EMPLOYER FEEDBACK WITH TRAINEE IDS
# ==============================================================================
print("--> Updating employer feedback records with trainee linkage...")
feedback_docs = db.collection("employer_feedback").stream()
feed_count = 0
for f_doc in feedback_docs:
    f_dict = f_doc.to_dict()
    if not f_dict.get("trainee_id") or f_dict.get("trainee_id") == "":
        # Link to representative trainees (e.g. T102, T105, T110)
        chosen_trainee = f"T{rnd.randint(102, 115)}"
        db.collection("employer_feedback").document(f_doc.id).update({
            "trainee_id": chosen_trainee,
            "updated_at": datetime.utcnow().isoformat() + "Z",
        })
        feed_count += 1
print(f"  ? Linked {feed_count} employer feedback documents with individual trainee IDs.")

print("\n========================================================")
print("SUCCESS: Database schema extended and synthetic data seeded!")
print("========================================================")
