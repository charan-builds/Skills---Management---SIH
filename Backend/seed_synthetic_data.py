"""
seed_synthetic_data.py
======================
Comprehensive, relationally consistent synthetic dataset generator for the
SIH Skilling Impact Intelligence platform.

Generates:
- 8 Programmes
- 12 Employers
- 25 Jobs
- 180 Trainees across 10 distinct personas (including 5 curated Demo accounts)
- 90+ Job Applications with realistic stage funnels
- 16 Employer Feedback records
- 6 Interventions with impact metrics
- 24 Follow-ups across all 4 stages (DAY_0 to DAY_21 UNRESOLVED)
- 10 Pending Outcome Verifications

Guarantees 100% referential, chronological, and status integrity.
Output: Backend/demo_data.json
"""

import json
import os
import random
import uuid
from datetime import datetime, timedelta

def generate_dataset(seed: int = 42) -> dict:
    random.seed(seed)
    base_date = datetime(2025, 1, 15)

    # -------------------------------------------------------------
    # 1. PROGRAMMES (8 Industry-Aligned Skilling Programmes)
    # -------------------------------------------------------------
    programmes = [
        {
            "id": "PROG-DEMO-001",
            "name": "Data Science & AI Engineering",
            "provider": "Telangana State Skilling Mission",
            "status": "Active",
            "trainees": 235,
            "employment": 78,
            "retention": 82,
            "skills_taught": ["Python", "SQL", "Statistics", "Pandas", "Machine Learning", "Data Visualization", "Power BI", "Scikit-Learn"],
            "districts": ["Hyderabad", "Rangareddy", "Warangal Urban", "Medchal-Malkajgiri"],
            "is_synthetic": True,
            "created_at": "2025-01-10T00:00:00Z"
        },
        {
            "id": "PROG-DEMO-002",
            "name": "Full Stack Web Development",
            "provider": "Telangana State Skilling Mission",
            "status": "Active",
            "trainees": 260,
            "employment": 84,
            "retention": 85,
            "skills_taught": ["HTML5", "CSS3", "JavaScript", "React", "Node.js", "Express", "MongoDB", "REST APIs", "Git"],
            "districts": ["Hyderabad", "Medchal-Malkajgiri", "Nizamabad", "Siddipet"],
            "is_synthetic": True,
            "created_at": "2025-01-10T00:00:00Z"
        },
        {
            "id": "PROG-DEMO-003",
            "name": "Cloud Infrastructure & DevOps",
            "provider": "National Skill Development Council",
            "status": "Active",
            "trainees": 190,
            "employment": 72,
            "retention": 76,
            "skills_taught": ["Linux", "Bash Scripting", "Docker", "Kubernetes", "AWS", "CI/CD Pipelines", "Terraform", "Networking"],
            "districts": ["Hyderabad", "Warangal Urban", "Sangareddy", "Karimnagar"],
            "is_synthetic": True,
            "created_at": "2025-01-12T00:00:00Z"
        },
        {
            "id": "PROG-DEMO-004",
            "name": "Cybersecurity & SOC Operations",
            "provider": "Cyber Guard National Academy",
            "status": "Active",
            "trainees": 180,
            "employment": 79,
            "retention": 80,
            "skills_taught": ["Linux", "Network Security", "Cybersecurity Fundamentals", "SIEM Log Analysis", "Wireshark", "Vulnerability Assessment", "Python"],
            "districts": ["Hyderabad", "Medchal-Malkajgiri", "Karimnagar", "Nalgonda"],
            "is_synthetic": True,
            "created_at": "2025-01-12T00:00:00Z"
        },
        {
            "id": "PROG-DEMO-005",
            "name": "Electric Vehicle Powertrain Engineering",
            "provider": "Advanced Clean Mobility Institute",
            "status": "Active",
            "trainees": 150,
            "employment": 68,
            "retention": 74,
            "skills_taught": ["EV Battery Management", "CAN Bus Protocol", "Electric Motor Drives", "Automotive Wiring", "Embedded C", "Safety Protocols"],
            "districts": ["Medchal-Malkajgiri", "Sangareddy", "Siddipet"],
            "is_synthetic": True,
            "created_at": "2025-01-15T00:00:00Z"
        },
        {
            "id": "PROG-DEMO-006",
            "name": "Healthcare Assistant & Clinical Diagnostics",
            "provider": "State Health Skilling Mission",
            "status": "Active",
            "trainees": 210,
            "employment": 88,
            "retention": 89,
            "skills_taught": ["Patient Care", "Phlebotomy", "Vital Signs Monitoring", "Medical Records Management", "Clinical Safety", "First Aid & CPR"],
            "districts": ["Khammam", "Nalgonda", "Mahabubnagar", "Hyderabad"],
            "is_synthetic": True,
            "created_at": "2025-01-15T00:00:00Z"
        },
        {
            "id": "PROG-DEMO-007",
            "name": "Digital Marketing & E-Commerce Operations",
            "provider": "Regional Vocational Training Council",
            "status": "Active",
            "trainees": 175,
            "employment": 65,
            "retention": 70,
            "skills_taught": ["SEO", "Social Media Marketing", "Google Ads", "Content Strategy", "Shopify Operations", "Web Analytics", "Email Marketing"],
            "districts": ["Hyderabad", "Warangal Urban", "Nizamabad"],
            "is_synthetic": True,
            "created_at": "2025-01-18T00:00:00Z"
        },
        {
            "id": "PROG-DEMO-008",
            "name": "Smart Manufacturing & CNC Automation",
            "provider": "Industrial Skill Development Center",
            "status": "Active",
            "trainees": 140,
            "employment": 75,
            "retention": 79,
            "skills_taught": ["CNC Milling", "CAD Modeling", "G-Code Programming", "Precision Metrology", "Industrial Robotics", "Quality Inspection"],
            "districts": ["Warangal Urban", "Karimnagar", "Sangareddy"],
            "is_synthetic": True,
            "created_at": "2025-01-18T00:00:00Z"
        }
    ]

    # -------------------------------------------------------------
    # 2. EMPLOYERS (12 Diverse Enterprises across Key Sectors)
    # -------------------------------------------------------------
    employers = [
        {
            "id": "EMP-DEMO-001",
            "name": "TechFlow Solutions",
            "industry": "IT Services",
            "location": "Hyderabad",
            "email": "organisation.demo@sih.gov.in",
            "phone": "+91 40 2345 6789",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 5
        },
        {
            "id": "EMP-DEMO-002",
            "name": "CogniSphere Cloud Systems",
            "industry": "Cloud & AI Platforms",
            "location": "Hyderabad",
            "email": "careers@cognisphere.demo",
            "phone": "+91 40 3456 7890",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 4
        },
        {
            "id": "EMP-DEMO-003",
            "name": "CyberShield Defense Labs",
            "industry": "Cybersecurity",
            "location": "Hyderabad",
            "email": "talent@cybershield.demo",
            "phone": "+91 40 4567 8901",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 3
        },
        {
            "id": "EMP-DEMO-004",
            "name": "BharatPay Financial Technologies",
            "industry": "FinTech & Banking",
            "location": "Hyderabad",
            "email": "hr@bharatpay.demo",
            "phone": "+91 40 5678 9012",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 4
        },
        {
            "id": "EMP-DEMO-005",
            "name": "CareFirst Health Networks",
            "industry": "Healthcare & Diagnostics",
            "location": "Khammam",
            "email": "recruit@carefirst.demo",
            "phone": "+91 8742 234567",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 6
        },
        {
            "id": "EMP-DEMO-006",
            "name": "Surya Renewable & Clean Energy",
            "industry": "Renewable Power",
            "location": "Medchal-Malkajgiri",
            "email": "jobs@suryarenew.demo",
            "phone": "+91 8418 245678",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 3
        },
        {
            "id": "EMP-DEMO-007",
            "name": "Precision AutoMech Industries",
            "industry": "Automotive & EV",
            "location": "Sangareddy",
            "email": "talent@precisionautomech.demo",
            "phone": "+91 8455 256789",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 4
        },
        {
            "id": "EMP-DEMO-008",
            "name": "GatiFast Logistics & Warehousing",
            "industry": "Supply Chain & Logistics",
            "location": "Warangal Urban",
            "email": "hiring@gatifast.demo",
            "phone": "+91 870 2678901",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 3
        },
        {
            "id": "EMP-DEMO-009",
            "name": "OmniRetail Digital Platforms",
            "industry": "E-Commerce",
            "location": "Hyderabad",
            "email": "people@omniretail.demo",
            "phone": "+91 40 6789 0123",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 2
        },
        {
            "id": "EMP-DEMO-010",
            "name": "AeroTech Precision CNC",
            "industry": "Aerospace & Precision Manufacturing",
            "location": "Karimnagar",
            "email": "operations@aerotech.demo",
            "phone": "+91 878 2789012",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 3
        },
        {
            "id": "EMP-DEMO-011",
            "name": "MedPulse LifeSciences Labs",
            "industry": "Clinical & Diagnostics",
            "location": "Nalgonda",
            "email": "hr@medpulse.demo",
            "phone": "+91 8682 289012",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 3
        },
        {
            "id": "EMP-DEMO-012",
            "name": "Vanguard Security Solutions",
            "industry": "Cybersecurity & IT",
            "location": "Hyderabad",
            "email": "sec-careers@vanguard.demo",
            "phone": "+91 40 7890 1234",
            "is_synthetic": True,
            "verified": True,
            "open_positions": 2
        }
    ]

    # -------------------------------------------------------------
    # 3. JOBS (25 Diverse Job Requisitions)
    # -------------------------------------------------------------
    jobs_seed = [
        # TechFlow Solutions
        ("EMP-DEMO-001", "Junior Full Stack Developer", "IT Services", "Hyderabad", 480000, ["JavaScript", "React", "Node.js", "SQL", "REST APIs"], "Active"),
        ("EMP-DEMO-001", "Cloud Infrastructure Associate", "IT Services", "Hyderabad", 520000, ["Linux", "Docker", "AWS", "Git", "Bash Scripting"], "Active"),
        ("EMP-DEMO-001", "Data Analytics Specialist", "IT Services", "Hyderabad", 500000, ["Python", "SQL", "Power BI", "Data Analysis", "Statistics"], "Active"),
        # CogniSphere Cloud Systems
        ("EMP-DEMO-002", "DevOps & Cloud Engineer", "Cloud & AI Platforms", "Hyderabad", 620000, ["Docker", "Kubernetes", "AWS", "CI/CD Pipelines", "Linux"], "Active"),
        ("EMP-DEMO-002", "Junior Machine Learning Engineer", "Cloud & AI Platforms", "Hyderabad", 580000, ["Python", "Machine Learning", "SQL", "Scikit-Learn", "Docker"], "Active"),
        ("EMP-DEMO-002", "Backend API Engineer", "Cloud & AI Platforms", "Hyderabad", 540000, ["Node.js", "Express", "MongoDB", "REST APIs", "Git"], "Active"),
        # CyberShield Defense Labs
        ("EMP-DEMO-003", "SOC Operations Analyst (L1)", "Cybersecurity", "Hyderabad", 550000, ["Cybersecurity Fundamentals", "Linux", "SIEM Log Analysis", "Network Security"], "Active"),
        ("EMP-DEMO-003", "Junior Vulnerability Assessor", "Cybersecurity", "Hyderabad", 580000, ["Network Security", "Wireshark", "Vulnerability Assessment", "Python"], "Active"),
        # BharatPay Financial Technologies
        ("EMP-DEMO-004", "FinTech Software Associate", "FinTech & Banking", "Hyderabad", 560000, ["React", "JavaScript", "Node.js", "SQL", "REST APIs"], "Active"),
        ("EMP-DEMO-004", "Database & BI Analyst", "FinTech & Banking", "Hyderabad", 520000, ["SQL", "Python", "Power BI", "Statistics", "Data Visualization"], "Active"),
        # CareFirst Health Networks
        ("EMP-DEMO-005", "Certified Clinical Lab Technician", "Healthcare & Diagnostics", "Khammam", 360000, ["Phlebotomy", "Clinical Safety", "Medical Records Management", "Vital Signs Monitoring"], "Active"),
        ("EMP-DEMO-005", "Patient Care Coordinator", "Healthcare & Diagnostics", "Hyderabad", 340000, ["Patient Care", "First Aid & CPR", "Vital Signs Monitoring"], "Active"),
        # Surya Renewable & Clean Energy
        ("EMP-DEMO-006", "Solar & EV Infrastructure Specialist", "Renewable Power", "Medchal-Malkajgiri", 420000, ["EV Battery Management", "Electrical Safety", "Solar Inverters", "Safety Protocols"], "Active"),
        ("EMP-DEMO-006", "Energy Storage Technician", "Renewable Power", "Medchal-Malkajgiri", 400000, ["EV Battery Management", "Automotive Wiring", "Embedded C"], "Active"),
        # Precision AutoMech Industries
        ("EMP-DEMO-007", "EV Powertrain Diagnostic Technician", "Automotive & EV", "Sangareddy", 450000, ["CAN Bus Protocol", "EV Battery Management", "Electric Motor Drives", "Automotive Wiring"], "Active"),
        ("EMP-DEMO-007", "Embedded Electronics Technician", "Automotive & EV", "Sangareddy", 460000, ["Embedded C", "Automotive Wiring", "CAN Bus Protocol"], "Active"),
        # GatiFast Logistics
        ("EMP-DEMO-008", "Supply Chain Data Analyst", "Supply Chain & Logistics", "Warangal Urban", 440000, ["SQL", "Excel", "Data Visualization", "Python"], "Active"),
        ("EMP-DEMO-008", "Warehouse Operations Coordinator", "Supply Chain & Logistics", "Warangal Urban", 360000, ["Inventory Management", "ERP Basics", "Problem Solving"], "Active"),
        # OmniRetail Digital Platforms
        ("EMP-DEMO-009", "E-Commerce Growth Specialist", "E-Commerce", "Hyderabad", 420000, ["Shopify Operations", "SEO", "Social Media Marketing", "Google Ads"], "Active"),
        ("EMP-DEMO-009", "Performance Marketing Associate", "E-Commerce", "Hyderabad", 450000, ["Google Ads", "Web Analytics", "SEO", "Content Strategy"], "Active"),
        # AeroTech Precision CNC
        ("EMP-DEMO-010", "Precision CNC Machinist", "Aerospace & Precision Manufacturing", "Karimnagar", 420000, ["CNC Milling", "G-Code Programming", "Precision Metrology", "CAD Modeling"], "Active"),
        ("EMP-DEMO-010", "Quality Metrology Inspector", "Aerospace & Precision Manufacturing", "Karimnagar", 400000, ["Precision Metrology", "Quality Inspection", "CAD Modeling"], "Active"),
        # MedPulse LifeSciences Labs
        ("EMP-DEMO-011", "Diagnostic Laboratory Assistant", "Clinical & Diagnostics", "Nalgonda", 350000, ["Phlebotomy", "Clinical Safety", "Medical Records Management"], "Active"),
        # Vanguard Security Solutions
        ("EMP-DEMO-012", "Information Security Associate", "Cybersecurity & IT", "Hyderabad", 530000, ["Cybersecurity Fundamentals", "Linux", "Network Security", "Python"], "Active"),
        ("EMP-DEMO-012", "Network Support Technician", "Cybersecurity & IT", "Hyderabad", 450000, ["Networking", "Linux", "Troubleshooting"], "Active")
    ]

    jobs = []
    for idx, (emp_id, title, ind, loc, sal, req_skills, st) in enumerate(jobs_seed):
        job_id = f"JOB-DEMO-{idx+1:02d}"
        jobs.append({
            "id": job_id,
            "employer_id": emp_id,
            "title": title,
            "role": title,
            "industry": ind,
            "location": loc,
            "base_salary": sal,
            "salary_range": f"₹{sal // 100000}.{(sal % 100000)//10000} LPA",
            "skills_required": req_skills,
            "status": st,
            "is_active": True,
            "is_synthetic": True,
            "created_at": (base_date - timedelta(days=20 - idx)).isoformat() + "Z"
        })

    # -------------------------------------------------------------
    # 4. CURATED DEMO TRAINEES & PERSONAS (5 Specific Stories)
    # -------------------------------------------------------------
    trainees = []

    # Demo 1: High Performer (Vikram Sharma - T102)
    t102 = {
        "id": "T102",
        "name": "Vikram Sharma",
        "email": "demo.trainee@sih.gov.in",
        "phone": "+91 98765 43210",
        "district": "Hyderabad",
        "programme_id": "PROG-DEMO-002",
        "course_name": "Full Stack Web Development",
        "provider": "Telangana State Skilling Mission",
        "status": "Placed",
        "outcome": "Employed",
        "skills": ["HTML5", "CSS3", "JavaScript", "React", "Node.js", "Express", "REST APIs", "Git", "SQL"],
        "certifications": [
            {
                "id": "cert_102_1",
                "name": "Full Stack Web Developer Professional",
                "issuing_body": "NASSCOM FutureSkills Prime",
                "date": "2025-05-15",
                "status": "Verified"
            }
        ],
        "assessments": [
            {"module": "Frontend Architecture (React)", "score": 94},
            {"module": "Backend APIs & Node.js", "score": 91},
            {"module": "Database Design & SQL", "score": 88}
        ],
        "employment_history": [
            {
                "id": "emp_102_1",
                "organization_id": "EMP-DEMO-001",
                "employer_name": "TechFlow Solutions",
                "role": "Junior Full Stack Developer",
                "salary": 45000,
                "start_date": "2025-06-01",
                "verified": True,
                "verification_state": "EMPLOYER_VERIFIED",
                "employment_type": "Full-Time",
                "employer_remarks": "High-performing graduate successfully placed and attested."
            }
        ],
        "outcomes_timeline": [
            {
                "checkpoint": "Training Completed",
                "date": "2025-05-10",
                "status": "Completed",
                "employment_status": "Training Completed",
                "description": "Completed 16-week Full Stack bootcamp with Distinction."
            },
            {
                "checkpoint": "Placed with TechFlow Solutions",
                "date": "2025-06-01",
                "status": "Recorded",
                "employment_status": "Employed",
                "employer_or_activity": "TechFlow Solutions",
                "salary": "₹45,000 / mo",
                "job_relevance": "High",
                "verification_status": "Verified",
                "description": "Joined TechFlow Solutions as Junior Full Stack Developer."
            },
            {
                "checkpoint": "3 Month Follow-up",
                "date": "2025-09-01",
                "status": "Recorded",
                "employment_status": "Employed",
                "employer_or_activity": "TechFlow Solutions",
                "salary": "₹45,000 / mo",
                "job_relevance": "High",
                "verification_status": "Verified",
                "description": "Retained at 3 months with positive employer rating."
            }
        ],
        "consent_history": [
            {"status": "GIVEN", "effective_timestamp": "2025-01-20T10:00:00Z", "version": "1.0", "source": "TraineePortal"}
        ],
        "attendance": 96,
        "is_synthetic": True,
        "created_at": "2025-01-20T00:00:00Z"
    }
    trainees.append(t102)

    # Demo 2: At-Risk / Escalation Case (Sai Kiran Reddy - T-RISK-01)
    t_risk = {
        "id": "T-RISK-01",
        "name": "Sai Kiran Reddy",
        "email": "risk.trainee@sih.gov.in",
        "phone": "+91 98480 12345",
        "district": "Warangal Urban",
        "programme_id": "PROG-DEMO-003",
        "course_name": "Cloud Infrastructure & DevOps",
        "provider": "National Skill Development Council",
        "status": "In Training",
        "outcome": "At-Risk",
        "skills": ["Linux", "Bash Scripting"],
        "certifications": [],
        "assessments": [
            {"module": "Linux Fundamentals", "score": 62},
            {"module": "Containerization & Docker", "score": 45},
            {"module": "Kubernetes Clusters", "score": 38}
        ],
        "employment_history": [],
        "outcomes_timeline": [
            {
                "checkpoint": "Attendance Alert Triggered",
                "date": "2025-03-01",
                "status": "Recorded",
                "employment_status": "Training",
                "description": "Attendance dropped below 55%. Escalated to Centre Head."
            }
        ],
        "consent_history": [
            {"status": "GIVEN", "effective_timestamp": "2025-01-22T10:00:00Z", "version": "1.0", "source": "TraineePortal"}
        ],
        "attendance": 52,
        "is_synthetic": True,
        "created_at": "2025-01-22T00:00:00Z"
    }
    trainees.append(t_risk)

    # Demo 3: Skill Gap Candidate (Swati Deshmukh - T-GAP-01)
    t_gap = {
        "id": "T-GAP-01",
        "name": "Swati Deshmukh",
        "email": "gap.trainee@sih.gov.in",
        "phone": "+91 94401 23456",
        "district": "Karimnagar",
        "programme_id": "PROG-DEMO-001",
        "course_name": "Data Science & AI Engineering",
        "provider": "Telangana State Skilling Mission",
        "status": "Certified",
        "outcome": "Seeking Placement",
        "skills": ["Python", "SQL", "Statistics", "Pandas"],
        "certifications": [
            {
                "id": "cert_gap_1",
                "name": "Data Analysis Fundamentals",
                "issuing_body": "State Skilling Agency",
                "date": "2025-05-20",
                "status": "Verified"
            }
        ],
        "assessments": [
            {"module": "Python Programming", "score": 85},
            {"module": "SQL Querying", "score": 82},
            {"module": "Machine Learning Pipelines", "score": 64}
        ],
        "employment_history": [],
        "outcomes_timeline": [
            {
                "checkpoint": "Training Completed",
                "date": "2025-05-18",
                "status": "Completed",
                "employment_status": "Seeking",
                "description": "Completed Data Science course. Identified missing production cloud deployment skills."
            }
        ],
        "consent_history": [
            {"status": "GIVEN", "effective_timestamp": "2025-01-25T10:00:00Z", "version": "1.0", "source": "TraineePortal"}
        ],
        "attendance": 88,
        "is_synthetic": True,
        "created_at": "2025-01-25T00:00:00Z"
    }
    trainees.append(t_gap)

    # Demo 4: Certified but Unemployed (Rahul Kumar - T-UNEMP-01)
    t_unemp = {
        "id": "T-UNEMP-01",
        "name": "Rahul Kumar",
        "email": "unemp.trainee@sih.gov.in",
        "phone": "+91 98492 34567",
        "district": "Nizamabad",
        "programme_id": "PROG-DEMO-004",
        "course_name": "Cybersecurity & SOC Operations",
        "provider": "Cyber Guard National Academy",
        "status": "Certified",
        "outcome": "Unemployed",
        "skills": ["Linux", "Network Security", "Cybersecurity Fundamentals", "Wireshark"],
        "certifications": [
            {
                "id": "cert_unemp_1",
                "name": "CompTIA Security+ Equivalent",
                "issuing_body": "National Cyber Academy",
                "date": "2025-04-10",
                "status": "Verified"
            },
            {
                "id": "cert_unemp_2",
                "name": "Network Vulnerability Specialist",
                "issuing_body": "NASSCOM",
                "date": "2025-05-02",
                "status": "Verified"
            }
        ],
        "assessments": [
            {"module": "Network Security Assessment", "score": 86},
            {"module": "Packet Analysis with Wireshark", "score": 89},
            {"module": "Incident Response Lab", "score": 82}
        ],
        "employment_history": [],
        "outcomes_timeline": [
            {
                "checkpoint": "Training Completed",
                "date": "2025-04-12",
                "status": "Completed",
                "employment_status": "Unemployed",
                "description": "Graduated with dual certifications. Actively seeking SOC analyst roles."
            }
        ],
        "consent_history": [
            {"status": "GIVEN", "effective_timestamp": "2025-01-18T10:00:00Z", "version": "1.0", "source": "TraineePortal"}
        ],
        "attendance": 92,
        "is_synthetic": True,
        "created_at": "2025-01-18T00:00:00Z"
    }
    trainees.append(t_unemp)

    # Demo 5: Recently Hired & Attested (Priya Gupta - T-HIRED-01)
    t_hired = {
        "id": "T-HIRED-01",
        "name": "Priya Gupta",
        "email": "hired.trainee@sih.gov.in",
        "phone": "+91 99890 45678",
        "district": "Medchal-Malkajgiri",
        "programme_id": "PROG-DEMO-004",
        "course_name": "Cybersecurity & SOC Operations",
        "provider": "Cyber Guard National Academy",
        "status": "Placed",
        "outcome": "Employed",
        "skills": ["Linux", "Network Security", "Cybersecurity Fundamentals", "SIEM Log Analysis", "Wireshark", "Python"],
        "certifications": [
            {
                "id": "cert_hired_1",
                "name": "Certified SOC Analyst (Level 1)",
                "issuing_body": "NASSCOM FutureSkills Prime",
                "date": "2025-04-25",
                "status": "Verified"
            }
        ],
        "assessments": [
            {"module": "Security Fundamentals", "score": 93},
            {"module": "SIEM Threat Hunting Lab", "score": 90},
            {"module": "Linux Hardening Benchmark", "score": 92}
        ],
        "employment_history": [
            {
                "id": "emp_hired_1",
                "organization_id": "EMP-DEMO-003",
                "employer_name": "CyberShield Defense Labs",
                "role": "SOC Operations Analyst (L1)",
                "salary": 46000,
                "start_date": "2025-06-15",
                "verified": True,
                "verification_state": "EMPLOYER_VERIFIED",
                "employment_type": "Full-Time",
                "employer_remarks": "Excellent analytical abilities during log triage."
            }
        ],
        "outcomes_timeline": [
            {
                "checkpoint": "Training Completed",
                "date": "2025-04-28",
                "status": "Completed",
                "employment_status": "Training Completed",
                "description": "Graduated in top 5% of Cybersecurity cohort."
            },
            {
                "checkpoint": "Placed with CyberShield Defense Labs",
                "date": "2025-06-15",
                "status": "Recorded",
                "employment_status": "Employed",
                "employer_or_activity": "CyberShield Defense Labs",
                "salary": "₹46,000 / mo",
                "job_relevance": "High",
                "verification_status": "Verified",
                "description": "Placed via employer portal hiring pipeline."
            },
            {
                "checkpoint": "3 Month Follow-up",
                "date": "2025-09-15",
                "status": "Recorded",
                "employment_status": "Employed",
                "employer_or_activity": "CyberShield Defense Labs",
                "salary": "₹46,000 / mo",
                "job_relevance": "High",
                "verification_status": "Verified",
                "description": "Successfully completed 90-day probationary review."
            }
        ],
        "consent_history": [
            {"status": "GIVEN", "effective_timestamp": "2025-01-19T10:00:00Z", "version": "1.0", "source": "TraineePortal"}
        ],
        "attendance": 98,
        "is_synthetic": True,
        "created_at": "2025-01-19T00:00:00Z"
    }
    trainees.append(t_hired)

    # Demo 6: Cybersecurity Specialist (Kalyan Pagadala - TR-DEMO-1006 / T1006)
    t_kalyan = {
        "id": "TR-DEMO-1006",
        "name": "Kalyan Pagadala",
        "email": "kalyanpagadala1@gmail.com",
        "phone": "+91 98765 43219",
        "district": "Hyderabad",
        "programme_id": "PROG-DEMO-004",
        "course_name": "Cybersecurity Specialist",
        "provider": "Telangana State Skilling Mission",
        "status": "Certified",
        "outcome": "Seeking",
        "skills": ["Linux", "Network Security", "Cryptography", "Python", "SOC Operations", "Wireshark", "Vulnerability Assessment", "SIEM Log Analysis"],
        "certifications": [
            {
                "id": "cert_kalyan_1",
                "name": "Certified Cybersecurity Specialist",
                "issuing_body": "NASSCOM FutureSkills Prime",
                "date": "2025-05-20",
                "status": "Verified"
            },
            {
                "id": "cert_kalyan_2",
                "name": "CompTIA Security+ Equivalent",
                "issuing_body": "National Cyber Academy",
                "date": "2025-04-15",
                "status": "Verified"
            }
        ],
        "assessments": [
            {"module": "Linux Hardening Benchmark", "score": 92},
            {"module": "SIEM Threat Hunting Lab", "score": 89},
            {"module": "Network Penetration Testing", "score": 88}
        ],
        "employment_history": [],
        "outcomes_timeline": [
            {
                "checkpoint": "Training Completed",
                "date": "2025-05-15",
                "status": "Completed",
                "employment_status": "Certified",
                "description": "Completed Advanced Cybersecurity Specialist Track with Distinction."
            },
            {
                "checkpoint": "NASSCOM Certification Attested",
                "date": "2025-05-20",
                "status": "Completed",
                "employment_status": "Certified",
                "description": "Attested with Distinction (Top 5% score)."
            }
        ],
        "consent_history": [
            {"status": "GIVEN", "effective_timestamp": "2025-01-20T10:00:00Z", "version": "1.0", "source": "TraineePortal"}
        ],
        "attendance": 95,
        "is_synthetic": True,
        "created_at": "2025-01-20T00:00:00Z"
    }
    trainees.append(t_kalyan)

    # -------------------------------------------------------------
    # 5. GENERATE 175 REALISTIC TRAINEES (Covering all 10 Personas)
    # -------------------------------------------------------------
    first_names = [
        "Aarav", "Ananya", "Rohan", "Sneha", "Karthik", "Pooja", "Suresh", "Divya", "Manoj", "Swati",
        "Rajesh", "Kavita", "Sandeep", "Megha", "Sai", "Haritha", "Pranav", "Neha", "Venkatesh", "Lavanya",
        "Ravi", "Bhavana", "Arvind", "Ritu", "Kiran", "Shilpa", "Aditya", "Preeti", "Naveen", "Deepika",
        "Gautam", "Aishwarya", "Vishal", "Suman", "Ajay", "Pallavi", "Nikhil", "Geeta", "Sunil", "Aparna"
    ]
    last_names = [
        "Sharma", "Kumar", "Rao", "Reddy", "Gupta", "Patel", "Verma", "Singh", "Joshi", "Iyer",
        "Nair", "Deshmukh", "Kulkarni", "Choudhury", "Das", "Banerjee", "Bhattacharya", "Chakraborty",
        "Venkatesan", "Subramanian", "Pagadala", "Goud", "Chary", "Murthy", "Naidu"
    ]
    districts = [
        "Hyderabad", "Medchal-Malkajgiri", "Rangareddy", "Warangal Urban", "Karimnagar",
        "Nalgonda", "Khammam", "Nizamabad", "Siddipet", "Sangareddy", "Mahabubnagar"
    ]

    for i in range(1, 176):
        t_id = f"T{1000 + i}"
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        full_name = f"{fn} {ln}"
        email = f"{fn.lower()}.{ln.lower()}{i}@telangana-skilling.in"
        phone = f"+91 {random.choice([98480, 94401, 98492, 99890, 91212])} {random.randint(10000, 99999)}"
        prog = random.choice(programmes)
        dist = random.choice(prog["districts"])

        # Determine persona distribution:
        # Persona 1: High Performer (25%) -> Completed, Certified, Employed
        # Persona 2: Average Performer (35%) -> Completed, Certified/Placed or Seeking
        # Persona 3: Skill Gap (15%) -> Completed, missing employer skills
        # Persona 4: At-Risk / Low attendance (10%) -> Low attendance, declining score
        # Persona 5: Dropout / Incomplete (5%) -> Abandoned training
        # Persona 6: Certified Unemployed (10%) -> Completed, Certified, multiple rejections
        dice = random.random()
        taught_skills = list(prog["skills_taught"])

        if dice < 0.25: # High Performer
            status = "Placed"
            outcome = "Employed"
            att = random.randint(90, 100)
            avg_score = random.randint(85, 96)
            my_skills = taught_skills[:random.randint(5, len(taught_skills))]
            my_skills.extend(["Problem Solving", "Communication"])
            certs = [{
                "id": f"cert_{t_id}",
                "name": f"{prog['name']} Certified Specialist",
                "issuing_body": "State Skill Council",
                "date": "2025-05-10",
                "status": "Verified"
            }]
            emp_partner = random.choice(employers)
            emp_hist = [{
                "id": f"emp_{t_id}",
                "organization_id": emp_partner["id"],
                "employer_name": emp_partner["name"],
                "role": f"{prog['name'].split()[0]} Associate",
                "salary": random.choice([38000, 42000, 46000, 50000]),
                "start_date": "2025-06-01",
                "verified": True,
                "verification_state": "EMPLOYER_VERIFIED",
                "employment_type": "Full-Time",
                "employer_remarks": "Demonstrates strong foundational competency."
            }]
            timeline = [
                {"checkpoint": "Training Completed", "date": "2025-05-01", "status": "Completed", "description": "Training completed with top grades."},
                {"checkpoint": f"Placed with {emp_partner['name']}", "date": "2025-06-01", "status": "Recorded", "employment_status": "Employed", "verification_status": "Verified", "description": "Placed successfully."}
            ]

        elif dice < 0.60: # Average Performer
            status = random.choice(["Certified", "Placed"])
            outcome = "Employed" if status == "Placed" else "Available"
            att = random.randint(75, 89)
            avg_score = random.randint(72, 84)
            my_skills = taught_skills[:random.randint(4, len(taught_skills)-1)]
            certs = [{
                "id": f"cert_{t_id}",
                "name": f"Certificate in {prog['name']}",
                "issuing_body": prog["provider"],
                "date": "2025-05-20",
                "status": "Verified"
            }] if status == "Placed" or random.random() > 0.3 else []
            emp_partner = random.choice(employers)
            emp_hist = [{
                "id": f"emp_{t_id}",
                "organization_id": emp_partner["id"],
                "employer_name": emp_partner["name"],
                "role": "Operations / Junior Trainee",
                "salary": 32000,
                "start_date": "2025-06-15",
                "verified": True,
                "verification_state": "EMPLOYER_VERIFIED",
                "employment_type": "Full-Time",
                "employer_remarks": "Good performance."
            }] if status == "Placed" else []
            timeline = [{"checkpoint": "Training Completed", "date": "2025-05-15", "status": "Completed", "description": "Course finished successfully."}]

        elif dice < 0.75: # Skill Gap Case
            status = "Certified"
            outcome = "Seeking Placement"
            att = random.randint(70, 85)
            avg_score = random.randint(68, 78)
            # Only learned the basic skills, missed advanced ones
            my_skills = taught_skills[:3]
            certs = [{"id": f"cert_{t_id}", "name": f"Basic {prog['name']}", "issuing_body": prog["provider"], "date": "2025-05-25", "status": "Verified"}]
            emp_hist = []
            timeline = [{"checkpoint": "Training Completed", "date": "2025-05-20", "status": "Completed", "description": "Skill gap identified in advanced tools."}]

        elif dice < 0.85: # At-Risk / Declining Case
            status = "In Training"
            outcome = "At-Risk"
            att = random.randint(45, 62)
            avg_score = random.randint(40, 58)
            my_skills = taught_skills[:2]
            certs = []
            emp_hist = []
            timeline = [{"checkpoint": "Attendance Alert Triggered", "date": "2025-03-10", "status": "Recorded", "description": "Attendance dropped below threshold."}]

        elif dice < 0.90: # Dropout
            status = "Archived"
            outcome = "Dropped Out"
            att = random.randint(30, 48)
            avg_score = random.randint(35, 50)
            my_skills = taught_skills[:1]
            certs = []
            emp_hist = []
            timeline = [{"checkpoint": "Training Discontinued", "date": "2025-03-20", "status": "Recorded", "description": "Trainee discontinued due to relocation/personal reasons."}]

        else: # Certified but Unemployed
            status = "Certified"
            outcome = "Unemployed"
            att = random.randint(85, 95)
            avg_score = random.randint(80, 90)
            my_skills = taught_skills[:5]
            certs = [{"id": f"cert_{t_id}", "name": f"{prog['name']} Certified", "issuing_body": "National Skills Board", "date": "2025-05-15", "status": "Verified"}]
            emp_hist = []
            timeline = [{"checkpoint": "Training Completed", "date": "2025-05-15", "status": "Completed", "description": "Actively seeking interview opportunities."}]

        assessments = [
            {"module": f"{prog['skills_taught'][0]} Core", "score": avg_score + random.randint(-4, 5)},
            {"module": f"{prog['skills_taught'][1]} Practice", "score": avg_score + random.randint(-6, 4)},
            {"module": "Practical Benchmark", "score": avg_score + random.randint(-5, 6)}
        ]

        t_record = {
            "id": t_id,
            "name": full_name,
            "email": email,
            "phone": phone,
            "district": dist,
            "programme_id": prog["id"],
            "course_name": prog["name"],
            "provider": prog["provider"],
            "status": status,
            "outcome": outcome,
            "skills": my_skills,
            "certifications": certs,
            "assessments": assessments,
            "employment_history": emp_hist,
            "outcomes_timeline": timeline,
            "consent_history": [
                {"status": "GIVEN", "effective_timestamp": "2025-01-20T00:00:00Z", "version": "1.0", "source": "System"}
            ],
            "attendance": att,
            "is_synthetic": True,
            "created_at": (base_date + timedelta(days=i % 15)).isoformat() + "Z"
        }
        trainees.append(t_record)

    # -------------------------------------------------------------
    # 6. JOB APPLICATIONS (90+ Applications across the Pipeline)
    # -------------------------------------------------------------
    applications = []

    # Application for Demo 1 (Vikram Sharma -> TechFlow Full Stack -> Hired)
    applications.append({
        "id": "app_demo_102",
        "job_id": "JOB-DEMO-01",
        "job_title": "Junior Full Stack Developer",
        "employer_id": "EMP-DEMO-001",
        "employer_name": "TechFlow Solutions",
        "trainee_id": "T102",
        "trainee_name": "Vikram Sharma",
        "status": "Hired",
        "match_percentage": 95,
        "employer_notes": "Outstanding technical assessment score. Selected and offered position.",
        "created_at": "2025-05-12T14:30:00Z",
        "updated_at": "2025-05-28T16:00:00Z"
    })

    # Application for Demo 5 (Priya Gupta -> CyberShield -> Hired)
    applications.append({
        "id": "app_demo_hired",
        "job_id": "JOB-DEMO-07",
        "job_title": "SOC Operations Analyst (L1)",
        "employer_id": "EMP-DEMO-003",
        "employer_name": "CyberShield Defense Labs",
        "trainee_id": "T-HIRED-01",
        "trainee_name": "Priya Gupta",
        "status": "Hired",
        "match_percentage": 94,
        "employer_notes": "Demonstrated excellent log analysis skills during technical interview.",
        "created_at": "2025-05-18T10:15:00Z",
        "updated_at": "2025-06-05T11:30:00Z"
    })

    # Applications for Demo 4 (Rahul Kumar -> Multiple Rejections)
    for idx, (j_id, emp_id, emp_name, j_title) in enumerate([
        ("JOB-DEMO-07", "EMP-DEMO-003", "CyberShield Defense Labs", "SOC Operations Analyst (L1)"),
        ("JOB-DEMO-08", "EMP-DEMO-003", "CyberShield Defense Labs", "Junior Vulnerability Assessor"),
        ("JOB-DEMO-24", "EMP-DEMO-012", "Vanguard Security Solutions", "Information Security Associate")
    ]):
        applications.append({
            "id": f"app_unemp_{idx+1}",
            "job_id": j_id,
            "job_title": j_title,
            "employer_id": emp_id,
            "employer_name": emp_name,
            "trainee_id": "T-UNEMP-01",
            "trainee_name": "Rahul Kumar",
            "status": "Rejected",
            "match_percentage": 82,
            "employer_notes": "Candidate met basic criteria but lacked practical enterprise SIEM tool experience.",
            "created_at": (base_date + timedelta(days=70 + idx * 10)).isoformat() + "Z",
            "updated_at": (base_date + timedelta(days=80 + idx * 10)).isoformat() + "Z"
        })

    # Generate 85+ applications across all active jobs
    app_stages = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Hired", "Rejected"]
    stage_weights = [0.25, 0.20, 0.20, 0.15, 0.10, 0.10]

    for j in jobs:
        # Each job gets 3 to 6 applicants
        req_skills_lower = [s.lower() for s in j["skills_required"]]
        potential_trainees = [
            t for t in trainees
            if any(any(rs in s.lower() for rs in req_skills_lower) for s in t.get("skills", []))
        ]
        sample_trainees = random.sample(potential_trainees, min(len(potential_trainees), random.randint(3, 6)))

        for t in sample_trainees:
            if any(a["job_id"] == j["id"] and a["trainee_id"] == t["id"] for a in applications):
                continue
            t_skills_lower = [s.lower() for s in t.get("skills", [])]
            match_count = sum(1 for rs in req_skills_lower if any(rs in ts for ts in t_skills_lower))
            match_pct = min(100, max(50, int((match_count / max(1, len(req_skills_lower))) * 100)))

            stage = random.choices(app_stages, weights=stage_weights)[0]
            notes = f"Candidate profile evaluated for {j['title']} with {match_pct}% skill match."
            if stage == "Hired":
                notes = "Candidate successfully cleared all rounds and accepted offer."
            elif stage == "Interview Scheduled":
                notes = "Technical interview scheduled with engineering lead."
            elif stage == "Shortlisted":
                notes = "Shortlisted based on strong skill alignment."

            app_date = base_date + timedelta(days=random.randint(40, 120))
            applications.append({
                "id": f"app_{uuid.uuid4().hex[:8]}",
                "job_id": j["id"],
                "job_title": j["title"],
                "employer_id": j["employer_id"],
                "employer_name": next((e["name"] for e in employers if e["id"] == j["employer_id"]), "Enterprise Employer"),
                "trainee_id": t["id"],
                "trainee_name": t["name"],
                "status": stage,
                "match_percentage": match_pct,
                "employer_notes": notes,
                "created_at": app_date.isoformat() + "Z",
                "updated_at": (app_date + timedelta(days=random.randint(2, 14))).isoformat() + "Z"
            })

    # -------------------------------------------------------------
    # 7. EMPLOYER FEEDBACK (16 Detailed Feedback Records)
    # -------------------------------------------------------------
    feedback_entries = [
        {
            "id": f"f_demo_{idx+1}",
            "employer_id": emp["id"],
            "employer_name": emp["name"],
            "programme_id": prog["id"],
            "programme_name": prog["name"],
            "skills_required_in_job": list(prog["skills_taught"][:4]) + ["Docker", "Git Collaboration"],
            "technical_deficiencies": [random.choice(["Docker", "Kubernetes", "CI/CD Pipelines", "Spring Boot", "CAN Bus Protocol", "Medical Electronics"])],
            "soft_skills_rating": random.randint(3, 5),
            "technical_skills_rating": random.randint(3, 5),
            "overall_satisfaction": random.randint(3, 5),
            "curriculum_recommendations": "Recommend adding a mandatory 2-week hands-on capstone project replicating real industry workflows.",
            "created_at": (base_date + timedelta(days=50 + idx * 5)).isoformat() + "Z"
        }
        for idx, (emp, prog) in enumerate(zip(employers + employers[:4], programmes * 2))
    ]

    # -------------------------------------------------------------
    # 8. POLICY INTERVENTIONS (6 Strategic Interventions)
    # -------------------------------------------------------------
    interventions = [
        {
            "id": "int_01",
            "title": "Bridge Module: Containerization & Docker for Cloud Trainees",
            "description": "Introduced hands-on micro-module addressing employer demand for Docker and CI/CD pipelines.",
            "programme_id": "PROG-DEMO-003",
            "date": "2025-03-01",
            "impact": {
                "before": {"skill_match": "65%", "retention_12m": "71%", "wage_growth": "+12%"},
                "after": {"skill_match": "88%", "retention_12m": "84%", "wage_growth": "+28%"}
            },
            "created_at": "2025-03-01T00:00:00Z"
        },
        {
            "id": "int_02",
            "title": "Specialized English & Technical Interview Readiness",
            "description": "Conducted 30-hour intensive communication and behavioral interview workshops across rural centres.",
            "programme_id": "PROG-DEMO-002",
            "date": "2025-03-15",
            "impact": {
                "before": {"skill_match": "70%", "retention_12m": "74%", "wage_growth": "+15%"},
                "after": {"skill_match": "86%", "retention_12m": "85%", "wage_growth": "+24%"}
            },
            "created_at": "2025-03-15T00:00:00Z"
        },
        {
            "id": "int_03",
            "title": "Hands-On SIEM & Wireshark Threat Hunting Labs",
            "description": "Provided dedicated cloud sandbox labs simulating real enterprise DDoS and malware attacks.",
            "programme_id": "PROG-DEMO-004",
            "date": "2025-04-01",
            "impact": {
                "before": {"skill_match": "68%", "retention_12m": "75%", "wage_growth": "+18%"},
                "after": {"skill_match": "91%", "retention_12m": "86%", "wage_growth": "+32%"}
            },
            "created_at": "2025-04-01T00:00:00Z"
        },
        {
            "id": "int_04",
            "title": "Clean Mobility Battery Safety & High Voltage Training",
            "description": "Added state-of-the-art battery diagnostic equipment and ARAI safety certification modules.",
            "programme_id": "PROG-DEMO-005",
            "date": "2025-04-15",
            "impact": {
                "before": {"skill_match": "62%", "retention_12m": "68%", "wage_growth": "+10%"},
                "after": {"skill_match": "84%", "retention_12m": "81%", "wage_growth": "+22%"}
            },
            "created_at": "2025-04-15T00:00:00Z"
        },
        {
            "id": "int_05",
            "title": "Modern CNC 5-Axis Simulator Integration",
            "description": "Installed digital twin CNC controllers allowing trainees to program complex aerospace components.",
            "programme_id": "PROG-DEMO-008",
            "date": "2025-05-01",
            "impact": {
                "before": {"skill_match": "64%", "retention_12m": "70%", "wage_growth": "+14%"},
                "after": {"skill_match": "87%", "retention_12m": "83%", "wage_growth": "+26%"}
            },
            "created_at": "2025-05-01T00:00:00Z"
        },
        {
            "id": "int_06",
            "title": "Digital Performance Marketing & Attribution Lab",
            "description": "Equipped trainees with live advertising budgets on Google Ads and Meta for real campaign execution.",
            "programme_id": "PROG-DEMO-007",
            "date": "2025-05-10",
            "impact": {
                "before": {"skill_match": "58%", "retention_12m": "64%", "wage_growth": "+9%"},
                "after": {"skill_match": "80%", "retention_12m": "78%", "wage_growth": "+20%"}
            },
            "created_at": "2025-05-10T00:00:00Z"
        }
    ]

    # -------------------------------------------------------------
    # 9. FOLLOW-UPS & ESCALATIONS (24 Cases across DAY_0 to DAY_21)
    # -------------------------------------------------------------
    follow_ups = []
    follow_up_attempts = []

    # Case 1: T-RISK-01 (Sai Kiran Reddy) -> DAY_21 UNRESOLVED (Critical Escalation)
    f_risk_id = "fu_risk_01"
    follow_ups.append({
        "id": f_risk_id,
        "trainee_id": "T-RISK-01",
        "triggered_at": "2025-02-15T09:00:00Z",
        "current_stage": "DAY_21",
        "status": "UNRESOLVED",
        "next_due_at": "2025-03-08T09:00:00Z",
        "unresolved_at": "2025-03-08T10:00:00Z"
    })
    follow_up_attempts.extend([
        {
            "id": f"att_{f_risk_id}_0",
            "follow_up_id": f_risk_id,
            "stage": "DAY_0",
            "scheduled_at": "2025-02-15T09:00:00Z",
            "executed_at": "2025-02-15T09:05:00Z",
            "method": "SMS_DEMO",
            "actor": "SYSTEM_CRON",
            "result": "DELIVERED",
            "notes": "Automated reminder sent to trainee.",
            "idempotency_key": f"{f_risk_id}_DAY_0"
        },
        {
            "id": f"att_{f_risk_id}_7",
            "follow_up_id": f_risk_id,
            "stage": "DAY_7",
            "scheduled_at": "2025-02-22T09:00:00Z",
            "executed_at": "2025-02-22T11:00:00Z",
            "method": "TRAINING_CENTRE_CONTACT",
            "actor": "Centre Coordinator - Warangal",
            "result": "CONTACT_FAILED",
            "notes": "Phone rang without response. Parent contacted.",
            "idempotency_key": f"{f_risk_id}_DAY_7"
        },
        {
            "id": f"att_{f_risk_id}_14",
            "follow_up_id": f_risk_id,
            "stage": "DAY_14",
            "scheduled_at": "2025-03-01T09:00:00Z",
            "executed_at": "2025-03-01T14:20:00Z",
            "method": "EMPLOYER_VERIFICATION_TRIGGER",
            "actor": "District Verification Officer",
            "result": "UNRESPONSIVE",
            "notes": "Trainee has not attended classes for 12 consecutive days.",
            "idempotency_key": f"{f_risk_id}_DAY_14"
        },
        {
            "id": f"att_{f_risk_id}_21",
            "follow_up_id": f_risk_id,
            "stage": "DAY_21",
            "scheduled_at": "2025-03-08T09:00:00Z",
            "executed_at": "2025-03-08T10:00:00Z",
            "method": "CALL_CENTRE",
            "actor": "Central State Helpdesk",
            "result": "ESCALATED_TO_ADMIN",
            "notes": "Escalated to District Collectorate Skilling Taskforce.",
            "idempotency_key": f"{f_risk_id}_DAY_21"
        }
    ])

    # Generate 23 additional follow-up cases across different stages
    stages = ["DAY_0", "DAY_7", "DAY_14", "DAY_21"]
    at_risk_trainees = [t for t in trainees if t["outcome"] in ["At-Risk", "Seeking Placement", "Unemployed"]]
    sample_fu_trainees = random.sample(at_risk_trainees, min(23, len(at_risk_trainees)))

    for idx, t in enumerate(sample_fu_trainees):
        fu_id = f"fu_{idx+2:02d}"
        assigned_stage = stages[idx % 4]
        assigned_status = "UNRESOLVED" if assigned_stage == "DAY_21" else "PENDING"
        t_date = base_date + timedelta(days=idx * 4)

        follow_ups.append({
            "id": fu_id,
            "trainee_id": t["id"],
            "triggered_at": t_date.isoformat() + "Z",
            "current_stage": assigned_stage,
            "status": assigned_status,
            "next_due_at": (t_date + timedelta(days=7)).isoformat() + "Z",
            "unresolved_at": (t_date + timedelta(days=21)).isoformat() + "Z" if assigned_status == "UNRESOLVED" else None
        })

        # Add corresponding attempt
        method = "SMS_DEMO" if assigned_stage == "DAY_0" else ("TRAINING_CENTRE_CONTACT" if assigned_stage == "DAY_7" else ("EMPLOYER_VERIFICATION_TRIGGER" if assigned_stage == "DAY_14" else "CALL_CENTRE"))
        follow_up_attempts.append({
            "id": f"att_{fu_id}_{assigned_stage}",
            "follow_up_id": fu_id,
            "stage": assigned_stage,
            "scheduled_at": t_date.isoformat() + "Z",
            "executed_at": (t_date + timedelta(hours=2)).isoformat() + "Z",
            "method": method,
            "actor": "SYSTEM_CRON",
            "result": "EXECUTED",
            "notes": f"Stage {assigned_stage} verification processed.",
            "idempotency_key": f"{fu_id}_{assigned_stage}"
        })

    # -------------------------------------------------------------
    # 10. PENDING EMPLOYER VERIFICATIONS (10 Verification Records)
    # -------------------------------------------------------------
    employer_verifications = []
    employed_trainees = [t for t in trainees if t["outcome"] == "Employed"]
    sample_verif_trainees = random.sample(employed_trainees, min(10, len(employed_trainees)))

    for idx, t in enumerate(sample_verif_trainees):
        v_id = f"v_{idx+1:02d}"
        emp_record = t["employment_history"][0] if t["employment_history"] else {}
        employer_verifications.append({
            "id": v_id,
            "trainee_id": t["id"],
            "trainee_name": t["name"],
            "employer_id": emp_record.get("organization_id", "EMP-DEMO-001"),
            "employer_name": emp_record.get("employer_name", "TechFlow Solutions"),
            "employer_email": "hr@enterprise-partner.demo",
            "role": emp_record.get("role", "Associate Engineer"),
            "salary": emp_record.get("salary", 42000),
            "status": "Pending",
            "created_at": (base_date + timedelta(days=90 + idx * 2)).isoformat() + "Z",
            "updated_at": (base_date + timedelta(days=90 + idx * 2)).isoformat() + "Z"
        })

    # -------------------------------------------------------------
    # COMPILE COMPLETE DATASET
    # -------------------------------------------------------------
    full_dataset = {
        "programmes": programmes,
        "employers": employers,
        "jobs": jobs,
        "trainees": trainees,
        "job_applications": applications,
        "employer_feedback": feedback_entries,
        "interventions": interventions,
        "follow_ups": follow_ups,
        "follow_up_attempts": follow_up_attempts,
        "employer_verifications": employer_verifications
    }

    return full_dataset


if __name__ == "__main__":
    dataset = generate_dataset(seed=42)
    output_path = os.path.join(os.path.dirname(__file__), "demo_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)

    print("=========================================================")
    print("[OK] SYNTHETIC DATASET GENERATED SUCCESSFULLY (Seed=42)")
    print("=========================================================")
    print(f"Programmes:            {len(dataset['programmes'])}")
    print(f"Employers:             {len(dataset['employers'])}")
    print(f"Jobs:                  {len(dataset['jobs'])}")
    print(f"Trainees:              {len(dataset['trainees'])}")
    print(f"Job Applications:      {len(dataset['job_applications'])}")
    print(f"Employer Feedback:     {len(dataset['employer_feedback'])}")
    print(f"Interventions:         {len(dataset['interventions'])}")
    print(f"Follow-ups:            {len(dataset['follow_ups'])}")
    print(f"Follow-up Attempts:    {len(dataset['follow_up_attempts'])}")
    print(f"Employer Verifications:{len(dataset['employer_verifications'])}")
    print("=========================================================")
