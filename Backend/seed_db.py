import os
from dotenv import load_dotenv
import random

# Load environment variables
load_dotenv()

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firestore
service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase/credentials.json")
if not firebase_admin._apps:
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def clear_collection(collection_name):
    print(f"Clearing collection: {collection_name}...")
    docs = db.collection(collection_name).stream()
    deleted = 0
    for doc in docs:
        doc.reference.delete()
        deleted += 1
    print(f"Deleted {deleted} documents from {collection_name}.")

def seed_data():
    # 1. Clear existing collections
    collections = ["programmes", "trainees", "employer_verifications", "employer_feedback", "interventions"]
    for col in collections:
        clear_collection(col)

    # 2. Seed Programmes
    print("\nSeeding programmes...")
    programmes = [
        {
            "id": "P001",
            "name": "Data Analytics",
            "provider": "Centre A",
            "status": "Active",
            "skills_taught": ["Python", "SQL", "Excel", "Statistics"],
            "created_at": "2024-12-01T00:00:00Z",
            "updated_at": "2024-12-01T00:00:00Z"
        },
        {
            "id": "P002",
            "name": "Web Development",
            "provider": "Centre B",
            "status": "Active",
            "skills_taught": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
            "created_at": "2024-12-01T00:00:00Z",
            "updated_at": "2024-12-01T00:00:00Z"
        },
        {
            "id": "P003",
            "name": "Electrical Technician",
            "provider": "Centre C",
            "status": "Active",
            "skills_taught": ["Wiring", "Safety", "Circuit Design", "Power Systems"],
            "created_at": "2024-12-01T00:00:00Z",
            "updated_at": "2024-12-01T00:00:00Z"
        }
    ]

    for p in programmes:
        db.collection("programmes").document(p["id"]).set(p)
    print("Programmes seeded.")

    # Lists for random generation
    first_names = [
        "Rahul", "Priya", "Arun", "Rohan", "Ananya", "Vikram", "Neha", "Sameer", "Amit", "Sanya", 
        "Pooja", "Deepika", "Gaurav", "Karan", "Manish", "Jyoti", "Sunita", "Rajesh", "Suresh", "Ramesh", 
        "Sunil", "Anil", "Vivek", "Vijay", "Ajay", "Sanjay", "Abhinav", "Abhishek", "Aditya", "Akash", 
        "Alok", "Aman", "Anjali", "Ankita", "Archana", "Arti", "Asha", "Ashok", "Babita", "Bala"
    ]
    last_names = [
        "Kumar", "Sharma", "Patel", "Rao", "Sen", "Khan", "Goel", "Dev", "Gupta", "Verma", 
        "Singh", "Joshi", "Mehta", "Shah", "Reddy", "Nair", "Menon", "Roy", "Das", "Bose"
    ]
    districts = ["Hyderabad", "Bengaluru", "Chennai", "Guntur", "Krishna", "Visakhapatnam"]
    employers = ["Tech Corp", "Velo Labs", "InfiCorp", "Datatech", "WebDev Co", "App Works", "DataWorks", "Power Systems Ltd"]
    roles_by_course = {
        "P001": ["Data Analyst", "Data Associate", "Junior Analyst", "Reporting Executive"],
        "P002": ["Frontend Developer", "Web Intern", "Junior UI Developer", "QA Analyst"],
        "P003": ["Wireman", "Maintenance Technician", "Electrical Helper", "Apprentice Electrician"]
    }
    
    # Outcomes configuration
    outcome_types = ["Employed", "Apprentice", "Self-Employed", "Unemployed", "Exit"]
    outcome_weights = [0.50, 0.20, 0.15, 0.10, 0.05]

    print("\nGenerating 50 trainees...")
    trainees = []
    
    # Always include the core T102, T103, T104 to keep them stable
    core_trainees = {
        "T102": {
            "id": "T102",
            "name": "Rahul Kumar",
            "email": "rahul.kumar@example.com",
            "phone": "+91 98765 43210",
            "district": "Hyderabad",
            "programme_id": "P001",
            "course_name": "Data Analytics",
            "provider": "Centre A",
            "status": "Certified",
            "outcome": "Employed",
            "skills": ["Python", "SQL", "Excel", "Statistics"],
            "certifications": [{"name": "Data Analytics Certified", "date": "2025-01-15", "issuing_body": "NSDC"}],
            "employment_history": [
                {
                    "id": "emp_001",
                    "employer_name": "Tech Corp",
                    "role": "Data Analyst",
                    "start_date": "2025-02-01",
                    "end_date": None,
                    "salary": 18000.0,
                    "verified": True,
                    "employment_type": "Employed",
                    "job_relevance": "High"
                }
            ],
            "outcomes_timeline": [
                {"checkpoint": "Training Completed", "date": "2025-01-15T00:00:00Z", "status": "Completed", "description": "Completed training."},
                {"checkpoint": "3 Month Follow-up", "date": "2025-04-15T00:00:00Z", "status": "Recorded", "employment_status": "Employed", "employer_or_activity": "Tech Corp", "salary": "₹18,000", "job_relevance": "High", "verification_status": "Verified", "description": "Initial outcome recorded."},
                {"checkpoint": "6 Month Follow-up", "date": "2025-07-15T00:00:00Z", "status": "Recorded", "employment_status": "Employed", "employer_or_activity": "Tech Corp", "salary": "₹21,000", "job_relevance": "High", "verification_status": "Verified", "description": "Six-month outcome recorded."},
                {"checkpoint": "12 Month Follow-up", "date": "2026-01-15T00:00:00Z", "status": "Pending", "employment_status": "Pending", "employer_or_activity": "Follow-up required", "salary": "—", "job_relevance": "—", "verification_status": "Pending", "description": "Twelve-month outcome required."}
            ]
        },
        "T103": {
            "id": "T103",
            "name": "Priya Sharma",
            "email": "priya.sharma@example.com",
            "phone": "+91 98765 43211",
            "district": "Bengaluru",
            "programme_id": "P002",
            "course_name": "Web Development",
            "provider": "Centre B",
            "status": "Certified",
            "outcome": "Apprentice",
            "skills": ["HTML", "CSS", "JavaScript", "React"],
            "certifications": [],
            "employment_history": [
                {
                    "id": "emp_002",
                    "employer_name": "Velo Labs",
                    "role": "Frontend Intern",
                    "start_date": "2025-03-01",
                    "end_date": None,
                    "salary": 12000.0,
                    "verified": False,
                    "employment_type": "Apprentice",
                    "job_relevance": "High"
                }
            ],
            "outcomes_timeline": [
                {"checkpoint": "Training Completed", "date": "2025-02-15T00:00:00Z", "status": "Completed", "description": "Completed training."},
                {"checkpoint": "3 Month Follow-up", "date": "2025-05-15T00:00:00Z", "status": "Recorded", "employment_status": "Apprentice", "employer_or_activity": "Velo Labs", "salary": "₹12,000", "job_relevance": "High", "verification_status": "Pending", "description": "Recorded apprenticeship."}
            ]
        },
        "T104": {
            "id": "T104",
            "name": "Arun Kumar",
            "email": "arun.kumar@example.com",
            "phone": "+91 98765 43212",
            "district": "Chennai",
            "programme_id": "P003",
            "course_name": "Electrical",
            "provider": "Centre C",
            "status": "Certified",
            "outcome": "Unemployed",
            "skills": ["Wiring", "Safety"],
            "certifications": [],
            "employment_history": [],
            "outcomes_timeline": [
                {"checkpoint": "Training Completed", "date": "2025-01-15T00:00:00Z", "status": "Completed", "description": "Completed training."},
                {"checkpoint": "3 Month Follow-up", "date": "2025-04-15T00:00:00Z", "status": "Recorded", "employment_status": "Unemployed", "employer_or_activity": "None", "salary": "—", "job_relevance": "—", "verification_status": "Pending", "description": "Unemployed."}
            ]
        }
    }

    # Generate from T105 to T151 to hit 50 values
    generated_verifications = []
    generated_feedbacks = []
    
    for i in range(105, 155):
        t_id = f"T{i}"
        
        # Pick random fields
        first = random.choice(first_names)
        last = random.choice(last_names)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{i}@example.com"
        phone = f"+91 98765 {random.randint(40000, 99999)}"
        district = random.choice(districts)
        
        prog = random.choice(programmes)
        programme_id = prog["id"]
        course_name = prog["name"]
        provider = prog["provider"]
        
        outcome = random.choices(outcome_types, weights=outcome_weights, k=1)[0]
        
        skills = prog["skills_taught"][:random.randint(2, len(prog["skills_taught"]))]
        
        certifications = []
        if random.random() > 0.3:
            certifications.append({
                "name": f"{course_name} Certificate",
                "date": "2025-01-20",
                "issuing_body": "National Skill Development Corporation"
            })
            
        employment_history = []
        outcomes_timeline = [
            {"checkpoint": "Training Completed", "date": "2025-01-15T00:00:00Z", "status": "Completed", "description": "Completed training."}
        ]
        
        if outcome in ["Employed", "Apprentice", "Self-Employed"]:
            employer_name = "Self-Employed" if outcome == "Self-Employed" else random.choice(employers)
            role = random.choice(roles_by_course[programme_id])
            salary = random.randint(12, 30) * 1000.0 if outcome != "Apprentice" else random.randint(8, 14) * 1000.0
            is_verified = random.random() > 0.3
            
            job_id = f"emp_{random.randint(100, 999)}"
            employment_history.append({
                "id": job_id,
                "employer_name": employer_name,
                "role": role,
                "start_date": "2025-02-15",
                "end_date": None,
                "salary": salary,
                "verified": is_verified,
                "employment_type": outcome,
                "job_relevance": "High" if random.random() > 0.2 else "Medium"
            })
            
            # Outcome checkpoints
            outcomes_timeline.append({
                "checkpoint": "3 Month Follow-up",
                "date": "2025-04-15T00:00:00Z",
                "status": "Recorded",
                "employment_status": outcome,
                "employer_or_activity": employer_name,
                "salary": f"₹{int(salary):,}",
                "job_relevance": "High" if random.random() > 0.2 else "Medium",
                "verification_status": "Verified" if is_verified else "Pending",
                "description": f"Outcome recorded as {outcome}."
            })
            
            # Maybe 6 Month Follow-up
            if random.random() > 0.4:
                salary_6m = salary * 1.1 # 10% increase
                outcomes_timeline.append({
                    "checkpoint": "6 Month Follow-up",
                    "date": "2025-07-15T00:00:00Z",
                    "status": "Recorded",
                    "employment_status": outcome,
                    "employer_or_activity": employer_name,
                    "salary": f"₹{int(salary_6m):,}",
                    "job_relevance": "High",
                    "verification_status": "Verified" if is_verified else "Pending",
                    "description": "Six-month outcome checkpoint recorded."
                })
                
            # Create verification requests
            if outcome in ["Employed", "Apprentice"] and not is_verified:
                generated_verifications.append({
                    "id": f"v_{random.randint(100, 999)}",
                    "trainee_id": t_id,
                    "employer_email": f"hr@{employer_name.lower().replace(' ', '')}.com",
                    "employer_name": employer_name,
                    "role": role,
                    "salary": salary,
                    "status": "Pending",
                    "created_at": "2025-02-15T10:00:00Z",
                    "updated_at": "2025-02-15T10:00:00Z",
                })
                
            # Generate employer feedback
            if outcome == "Employed" and random.random() > 0.4:
                deficiencies = []
                if programme_id == "P001" and random.random() > 0.5:
                    deficiencies.append("Power BI")
                if programme_id == "P002" and random.random() > 0.5:
                    deficiencies.append("Node.js")
                if random.random() > 0.7:
                    deficiencies.append("Communication")
                    
                generated_feedbacks.append({
                    "id": f"f_{random.randint(100, 999)}",
                    "trainee_id": t_id,
                    "programme_id": programme_id,
                    "employer_name": employer_name,
                    "satisfaction_score": random.randint(3, 5),
                    "technical_deficiencies": deficiencies,
                    "soft_skill_deficiencies": ["Communication"] if "Communication" in deficiencies else [],
                    "skills_required_in_job": prog["skills_taught"] + (["Power BI"] if programme_id == "P001" else []),
                    "created_at": "2025-06-10T12:00:00Z",
                    "updated_at": "2025-06-10T12:00:00Z",
                })
                
        else: # Unemployed or Exit
            outcomes_timeline.append({
                "checkpoint": "3 Month Follow-up",
                "date": "2025-04-15T00:00:00Z",
                "status": "Recorded",
                "employment_status": outcome,
                "employer_or_activity": "None",
                "salary": "—",
                "job_relevance": "—",
                "verification_status": "Pending",
                "description": f"Outcome recorded as {outcome}."
            })
            
        t_data = {
            "id": t_id,
            "name": name,
            "email": email,
            "phone": phone,
            "district": district,
            "programme_id": programme_id,
            "course_name": course_name,
            "provider": provider,
            "status": "Certified",
            "outcome": outcome,
            "skills": skills,
            "certifications": certifications,
            "employment_history": employment_history,
            "outcomes_timeline": outcomes_timeline,
            "created_at": "2025-01-15T00:00:00Z",
            "updated_at": "2025-04-15T00:00:00Z",
        }
        
        trainees.append(t_data)
        
    # Write core trainees first
    for tid, tdata in core_trainees.items():
        db.collection("trainees").document(tid).set(tdata)
        
    # Write generated trainees
    for t in trainees:
        db.collection("trainees").document(t["id"]).set(t)
    print(f"{len(trainees) + len(core_trainees)} Trainees seeded.")

    # Seed generated verifications
    # Include default core ones
    core_verifications = [
        {
            "id": "v_101",
            "trainee_id": "T102",
            "employer_email": "hr@techcorp.com",
            "employer_name": "Tech Corp",
            "role": "Data Analyst",
            "salary": 18000.0,
            "status": "Approved",
            "created_at": "2025-02-01T10:00:00Z",
            "updated_at": "2025-02-01T10:00:00Z",
        },
        {
            "id": "v_102",
            "trainee_id": "T103",
            "employer_email": "hr@velolabs.com",
            "employer_name": "Velo Labs",
            "role": "Frontend Intern",
            "salary": 12000.0,
            "status": "Pending",
            "created_at": "2025-03-01T10:00:00Z",
            "updated_at": "2025-03-01T10:00:00Z",
        }
    ]
    for v in core_verifications:
        db.collection("employer_verifications").document(v["id"]).set(v)
    for v in generated_verifications:
        db.collection("employer_verifications").document(v["id"]).set(v)
    print(f"Employer verifications seeded ({len(core_verifications) + len(generated_verifications)} total).")

    # Seed feedbacks
    core_feedbacks = [
        {
            "id": "f_201",
            "trainee_id": "T102",
            "programme_id": "P001",
            "employer_name": "Tech Corp",
            "satisfaction_score": 4,
            "technical_deficiencies": ["Power BI", "Cloud Fundamentals"],
            "soft_skill_deficiencies": ["Communication"],
            "skills_required_in_job": ["Python", "SQL", "Power BI", "Cloud"],
            "created_at": "2025-06-10T12:00:00Z",
            "updated_at": "2025-06-10T12:00:00Z",
        }
    ]
    for f in core_feedbacks:
        db.collection("employer_feedback").document(f["id"]).set(f)
    for f in generated_feedbacks:
        db.collection("employer_feedback").document(f["id"]).set(f)
    print(f"Employer feedback seeded ({len(core_feedbacks) + len(generated_feedbacks)} total).")

    # 6. Seed Interventions
    print("\nSeeding interventions...")
    interventions = [
        {
            "id": "int_001",
            "title": "Added Power BI module",
            "description": "Introduced Power BI and advanced Excel training into the curriculum to improve skill match.",
            "programme_id": "P001",
            "date": "2025-05-15",
            "impact": {
                "before": {
                    "skill_match": 61,
                    "retention_12m": 48,
                    "wage_growth": 12
                },
                "after": {
                    "skill_match": 76,
                    "retention_12m": 59,
                    "wage_growth": 19
                }
            },
            "created_at": "2025-05-15T00:00:00Z",
            "updated_at": "2025-05-15T00:00:00Z",
        }
    ]

    for i in interventions:
        db.collection("interventions").document(i["id"]).set(i)
    print("Interventions seeded.")

    print("\nDatabase seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
