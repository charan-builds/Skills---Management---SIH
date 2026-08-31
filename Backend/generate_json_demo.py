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

JOB_ROLES = []
for i, emp in enumerate(EMPLOYERS):
    prog1 = random.choice(PROGRAMMES)
    JOB_ROLES.append({
        "id": f"JOB-DEMO-{i}A",
        "employer_id": emp["id"],
        "role": f"Junior {prog1['name'].split(' ')[0]} Specialist", # changed from title to role
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
        "jobs": [],
        "trainees": [],
        "employer_feedback": [],
        "interventions": []
    }
    
    # Programmes
    for prog in PROGRAMMES:
        db_json["programmes"].append({
            "id": prog["id"],
            "name": prog["name"],
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
        
    for job in JOB_ROLES:
        db_json["jobs"].append(job)
        if random.random() > 0.5:
            db_json["employer_feedback"].append({
                "employer_id": job["employer_id"],
                "programme_id": random.choice(PROGRAMMES)["id"],
                "skills_required_in_job": job["skills_required"],
                "technical_deficiencies": random.sample(job["skills_required"], k=min(2, len(job["skills_required"]))),
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
        if status != "Dropped":
            acquired_skills = random.sample(prog["skills_taught"], k=max(2, int(len(prog["skills_taught"]) * random.uniform(0.6, 1.0))))
            
        emp_hist = []
        if outcome == "Employed":
            if random.random() < 0.8:
                job = random.choice(JOB_ROLES)
                emp_name = next(e["name"] for e in EMPLOYERS if e["id"] == job["employer_id"])
                job_title = job["role"]
            else:
                emp_name = "External Corp"
                job_title = "Analyst"
                
            salary = str(random.randint(15000, 45000))
            start_date = datetime.now() - timedelta(days=random.randint(30, 400))
            emp_hist.append({
                "employer": emp_name,
                "role": job_title,
                "salary": salary,
                "start_date": start_date.strftime("%Y-%m-%d"),
                "status": "Active" if random.random() < 0.8 else "Left"
            })
            
        assessments = [
            {"module": "Core Concepts", "score": random.randint(60, 95)},
            {"module": "Practical Lab", "score": random.randint(55, 95)},
            {"module": "Final Project", "score": random.randint(65, 98)}
        ]
        
        timeline = []
        if outcome == "Employed" and emp_hist:
            days_since = (datetime.now() - datetime.strptime(emp_hist[0]["start_date"], "%Y-%m-%d")).days
            if days_since > 90:
                timeline.append({"checkpoint": "3 Months", "status": "Retained"})
            if days_since > 180:
                timeline.append({"checkpoint": "6 Months", "status": "Retained" if emp_hist[0]["status"] == "Active" else "Dropped"})
            if days_since > 365:
                timeline.append({"checkpoint": "12 Months", "status": "Retained" if emp_hist[0]["status"] == "Active" else "Dropped"})
                
        db_json["trainees"].append({
            "id": t_id,
            "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "email": f"demo{i}@example.com" if i > 0 else "rahul.kumar@example.com",
            "district": random.choice(DISTRICTS),
            "programme_id": prog["id"],
            "status": status,
            "outcome": outcome,
            "skills": acquired_skills,
            "employment_history": emp_hist,
            "assessments": assessments,
            "outcomes_timeline": timeline,
            "is_synthetic": True,
            "created_at": datetime.now().isoformat()
        })
        
        if status == "Certified" and outcome == "Seeking Employment" and random.random() < 0.3:
            db_json["interventions"].append({
                "trainee_id": t_id,
                "programme_id": prog["id"],
                "type": "Skill Bridge Module",
                "status": "Recommended",
                "is_synthetic": True,
                "created_at": datetime.now().isoformat()
            })
            
    with open("demo_data.json", "w") as f:
        json.dump(db_json, f, indent=2)
    print("Generated demo_data.json successfully!")

if __name__ == "__main__":
    generate_data()
