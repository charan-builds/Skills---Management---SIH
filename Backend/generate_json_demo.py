import os
import random
from datetime import datetime, timedelta
import json

DISTRICTS = ["Hyderabad", "Ranga Reddy", "Medchal", "Warangal", "Nizamabad", "Karimnagar",
             "Khammam", "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet",
             "Jagtial", "Mancherial", "Yadadri", "Sangareddy"]

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
    }
]

EMPLOYERS = [
    {"id": "EMP-DEMO-001", "name": "TechFlow Solutions", "industry": "IT Services"},
    {"id": "EMP-DEMO-002", "name": "DataSync Analytics", "industry": "Data & Analytics"},
    {"id": "EMP-DEMO-003", "name": "CloudNova Systems", "industry": "Cloud Infrastructure"},
    {"id": "EMP-DEMO-004", "name": "SecureNet Corp", "industry": "Cybersecurity"},
    {"id": "EMP-DEMO-005", "name": "FinTech Innovators", "industry": "Financial Technology"}
]

ROLE_BENCHMARKS = []
for i, emp in enumerate(EMPLOYERS):
    prog1 = random.choice(PROGRAMMES)
    ROLE_BENCHMARKS.append({
        "id": f"BENCH-DEMO-{i}A",
        "title": f"Junior {prog1['name'].split(' ')[0]} Specialist",
        "role": f"Junior {prog1['name'].split(' ')[0]} Specialist",
        "industry": emp["industry"],
        "skills_required": random.sample(prog1["skills_taught"], k=min(4, len(prog1["skills_taught"]))),
        "is_synthetic": True,
        "is_active": True
    })

FIRST_NAMES = ["Rahul", "Priya", "Amit", "Sneha", "Karthik", "Anjali", "Vikram", "Pooja", "Suresh", "Divya"]
LAST_NAMES = ["Kumar", "Reddy", "Sharma", "Singh", "Patel", "Rao", "Gupta", "Das"]

def generate_data():
    db_json = {
        "programmes": [],
        "employers": [],
        "role_benchmarks": [],
        "trainees": [],
        "employer_feedback": [],
        "interventions": []
    }

    # Programmes
    for prog in PROGRAMMES:
        db_json["programmes"].append({
            "id": prog["id"],
            "name": prog["name"],
            "provider": "State Skilling Agency",
            "status": "Active",
            "trainees": random.randint(100, 500),
            "employment": random.randint(50, 90),
            "retention": random.randint(60, 95),
            "skills_taught": prog["skills_taught"],
            "districts": random.sample(DISTRICTS, k=3),
            "is_synthetic": True,
            "created_at": datetime.now().isoformat()
        })

    # Employers & Jobs
    for emp in EMPLOYERS:
        db_json["employers"].append({
            "id": emp["id"],
            "name": emp["name"],
            "industry": emp["industry"],
            "location": random.choice(DISTRICTS),
            "is_synthetic": True
        })

    # Benchmarks
    for bench in ROLE_BENCHMARKS:
        db_json["role_benchmarks"].append(bench)
        if random.random() > 0.5:
            db_json["employer_feedback"].append({
                "programme_id": random.choice(PROGRAMMES)["id"],
                "skills_required_in_job": bench["skills_required"],
                "technical_deficiencies": random.sample(bench["skills_required"], k=min(2, len(bench["skills_required"]))),
                "is_synthetic": True
            })

    # Trainees
    auth_trainee_id = "T102"
    for i in range(250):
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
            acquired_skill_ids = [s.lower().replace(" ", "-").replace("&", "and") for s in acquired_skills]

        emp_hist = []
        if outcome == "Employed":
            if random.random() < 0.8:
                bench = random.choice(ROLE_BENCHMARKS)
                emp_name = random.choice(EMPLOYERS)["name"]
                job_title = bench["role"]
            else:
                emp_name = "External Corp"
                job_title = "Analyst"

            salary = float(random.randint(15000, 45000))
            start_date = datetime.now() - timedelta(days=random.randint(30, 400))

            # Phase 2B schema
            emp_hist.append({
                "id": f"emp_{random.randint(10000, 99999)}",
                "status": "EMPLOYED",
                "employer": emp_name,
                "role": job_title,
                "salary": salary,
                "joining_date": start_date.strftime("%Y-%m-%d"),
                "timestamp": (start_date + timedelta(days=1)).isoformat() + "Z",
                "verification_state": "EMPLOYER_VERIFIED" if random.random() < 0.5 else "SELF_REPORTED"
            })

            if random.random() < 0.2:
                # Add multiple records
                emp_hist.append({
                    "id": f"emp_{random.randint(10000, 99999)}",
                    "status": "SEEKING_EMPLOYMENT",
                    "employer": None,
                    "role": None,
                    "salary": None,
                    "joining_date": None,
                    "timestamp": (start_date - timedelta(days=60)).isoformat() + "Z",
                    "verification_state": "SELF_REPORTED"
                })
        elif outcome == "Seeking Employment":
            emp_hist.append({
                "id": f"emp_{random.randint(10000, 99999)}",
                "status": "SEEKING_EMPLOYMENT",
                "employer": None,
                "role": None,
                "salary": None,
                "joining_date": None,
                "timestamp": datetime.now().isoformat() + "Z",
                "verification_state": "SELF_REPORTED"
            })

        consent_hist = []
        consent_roll = random.random()
        if consent_roll < 0.7:
            consent_hist.append({
                "status": "GIVEN",
                "effective_timestamp": (datetime.now() - timedelta(days=30)).isoformat() + "Z",
                "version": "1.0",
                "source": "TraineePortal"
            })
        elif consent_roll < 0.9:
            consent_hist.append({
                "status": "GIVEN",
                "effective_timestamp": (datetime.now() - timedelta(days=60)).isoformat() + "Z",
                "version": "1.0",
                "source": "TraineePortal"
            })
            consent_hist.append({
                "status": "REVOKED",
                "effective_timestamp": (datetime.now() - timedelta(days=10)).isoformat() + "Z",
                "version": "1.0",
                "source": "TraineePortal"
            })
        else:
            consent_hist.append({
                "status": "NOT_GIVEN",
                "effective_timestamp": (datetime.now() - timedelta(days=5)).isoformat() + "Z",
                "version": "1.0",
                "source": "TraineePortal"
            })

        assessments = [
            {"module": "Core Concepts", "score": random.randint(60, 95)},
            {"module": "Practical Lab", "score": random.randint(55, 95)},
            {"module": "Final Project", "score": random.randint(65, 98)}
        ]

        timeline = []
        if outcome == "Employed" and emp_hist:
            days_since = (datetime.now() - datetime.strptime(emp_hist[0]["joining_date"] or datetime.now().strftime("%Y-%m-%d"), "%Y-%m-%d")).days
            if days_since > 90:
                timeline.append({"checkpoint": "3 Months", "status": "Retained", "date": datetime.now().isoformat(), "description": "Checked status"})
            if days_since > 180:
                timeline.append({"checkpoint": "6 Months", "status": "Retained", "date": datetime.now().isoformat(), "description": "Checked status"})
            if days_since > 365:
                timeline.append({"checkpoint": "12 Months", "status": "Retained", "date": datetime.now().isoformat(), "description": "Checked status"})

        db_json["trainees"].append({
            "id": t_id,
            "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "email": f"demo{i}@example.com" if i > 0 else "rahul.kumar@example.com",
            "phone": "+91-9876543210",
            "district": random.choice(DISTRICTS),
            "programme_id": prog["id"],
            "course_name": prog["name"],
            "provider": random.choice(["SkillIndia Institute", "Tech Academy", "Govt ITI", "FutureSkills Center"]),
            "status": status,
            "outcome": outcome,
            "target_role_id": random.choice(ROLE_BENCHMARKS)["id"] if random.random() < 0.9 else None,
            "skills": acquired_skills,
            "skill_ids": acquired_skill_ids,
            "certifications": [],
            "consent_history": consent_hist,
            "assessments": assessments,
            "outcomes_timeline": timeline,
            "is_synthetic": True,
            "created_at": datetime.now().isoformat()
        })



    with open("demo_data.json", "w") as f:
        json.dump(db_json, f, indent=2)
    print("Generated demo_data.json successfully!")

if __name__ == "__main__":
    generate_data()
