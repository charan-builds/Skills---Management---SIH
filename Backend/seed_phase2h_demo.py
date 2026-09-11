import os
import sys
import json
import argparse
from datetime import datetime, timedelta

# Force disable demo mode so we can actually connect to a Firestore instance to check collisions
os.environ["ENABLE_DEMO_MODE"] = "False"

# Configure sys.path for app module imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.firebase.config import db
from firebase_admin import get_app

def recursive_check(data, validate_synthetic, validate_forbidden):
    """Recursively checks for is_synthetic and forbidden keys."""
    forbidden_keys = {
        "vacancy", "opening", "candidate", "application", "shortlist", 
        "recruitment", "interview", "match", "match_score", "recruiter"
    }
    
    if isinstance(data, dict):
        if validate_synthetic and "is_synthetic" not in data:
            return False, "Missing is_synthetic key at dictionary level (required for top level documents)"
        if validate_synthetic and data.get("is_synthetic") is not True:
            return False, "is_synthetic must be True"
            
        for k, v in data.items():
            if validate_forbidden:
                k_lower = k.lower()
                for fk in forbidden_keys:
                    if fk in k_lower:
                        return False, f"Forbidden key found: {k}"
            
            # Recurse, but don't require `is_synthetic` on nested dicts
            ok, msg = recursive_check(v, False, validate_forbidden)
            if not ok: return False, msg
            
    elif isinstance(data, list):
        for item in data:
            ok, msg = recursive_check(item, False, validate_forbidden)
            if not ok: return False, msg
            
    elif isinstance(data, str) and validate_forbidden:
        v_lower = data.lower()
        for fk in forbidden_keys:
            if fk in v_lower:
                return False, f"Forbidden value found: {data}"
                
    return True, ""

def validate_relationships(docs):
    skill_ids = {d["id"] for d in docs.get("skill_master", [])}
    prog_ids = {d["id"] for d in docs.get("programmes", [])}
    emp_names = {d["name"] for d in docs.get("employers", [])}
    role_ids = {d["id"] for d in docs.get("role_benchmarks", [])}
    trainee_ids = {d["id"] for d in docs.get("trainees", [])}
    emp_ids = {d["id"] for d in docs.get("employers", [])}
    
    for r in docs.get("role_benchmarks", []):
        for s in r.get("skills_required", []):
            if s["skill_id"] not in skill_ids:
                return False, f"RoleBenchmark {r['id']} missing skill {s['skill_id']}"
                
    for p in docs.get("programmes", []):
        for s in p.get("curriculum", []):
            if s["skill_id"] not in skill_ids:
                return False, f"Programme {p['id']} missing skill {s['skill_id']}"
                
    for t in docs.get("trainees", []):
        if t.get("target_role_id") and t.get("target_role_id") not in role_ids:
            return False, f"Trainee {t['id']} missing role {t['target_role_id']}"
        if t.get("programme_id") and t.get("programme_id") not in prog_ids:
            return False, f"Trainee {t['id']} missing programme {t['programme_id']}"
        for h in t.get("employment_history", []):
            if h.get("employer_name") and h.get("employer_name") not in emp_names:
                return False, f"Trainee {t['id']} missing employer {h['employer_name']}"
                
    for f in docs.get("employer_feedback", []):
        if f.get("trainee_id") not in trainee_ids:
            return False, f"Feedback {f['id']} missing trainee {f['trainee_id']}"
        if f.get("programme_id") not in prog_ids:
            return False, f"Feedback {f['id']} missing programme {f['programme_id']}"
            
    for f in docs.get("employer_verifications", []):
        if f.get("trainee_id") not in trainee_ids:
            return False, f"Verification {f['id']} missing trainee {f['trainee_id']}"
        if f.get("employer_name") not in emp_names:
            return False, f"Verification {f['id']} missing employer {f['employer_name']}"
            
    for f in docs.get("follow_ups", []):
        if f.get("trainee_id") not in trainee_ids:
            return False, f"Follow-up {f['id']} missing trainee {f['trainee_id']}"
            
    return True, ""

def generate_documents():
    now = datetime.utcnow().isoformat() + "Z"
    # helper for varying timestamps
    def t_minus(days):
        return (datetime.utcnow() - timedelta(days=days)).isoformat() + "Z"
    
    docs = {
        "skill_master": [],
        "role_benchmarks": [],
        "programmes": [],
        "employers": [],
        "employer_feedback": [],
        "follow_ups": [],
        "employer_verifications": [],
        "trainees": []
    }
    
    # 1. skill_master (20)
    skills = [
        ("SK-DEMO-001", "Python", "Programming"),
        ("SK-DEMO-002", "SQL", "Database"),
        ("SK-DEMO-003", "React", "Web"),
        ("SK-DEMO-004", "Node.js", "Web"),
        ("SK-DEMO-005", "Circuit Wiring", "Manufacturing"),
        ("SK-DEMO-006", "Safety Compliance", "Safety"),
        ("SK-DEMO-007", "Machine Learning", "Data"),
        ("SK-DEMO-008", "Data Visualization", "Data"),
        ("SK-DEMO-009", "REST APIs", "Web"),
        ("SK-DEMO-010", "Electrical Diagnostics", "Manufacturing"),
    ]
    for i in range(11, 21):
        skills.append((f"SK-DEMO-{i:03d}", f"Filler Skill {i}", "Filler"))
        
    for sid, name, cat in skills:
        docs["skill_master"].append({
            "id": sid,
            "name": name,
            "category": cat,
            "is_synthetic": True,
            "created_at": now,
            "updated_at": now
        })
        
    # 2. role_benchmarks (5)
    docs["role_benchmarks"] = [
        {
            "id": "BENCH-DEMO-1", "title": "Junior Analyst", "industry": "IT", 
            "skills_required": [{"skill_id": "SK-DEMO-001", "required_level": 75}, {"skill_id": "SK-DEMO-002", "required_level": 80}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "BENCH-DEMO-2", "title": "Web Apprentice", "industry": "IT", 
            "skills_required": [{"skill_id": "SK-DEMO-003", "required_level": 80}, {"skill_id": "SK-DEMO-004", "required_level": 70}, {"skill_id": "SK-DEMO-009", "required_level": 60}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "BENCH-DEMO-3", "title": "Electrical Tech", "industry": "Manufacturing", 
            "skills_required": [{"skill_id": "SK-DEMO-005", "required_level": 85}, {"skill_id": "SK-DEMO-006", "required_level": 90}, {"skill_id": "SK-DEMO-010", "required_level": 80}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "BENCH-DEMO-4", "title": "Data Scientist", "industry": "Data", 
            "skills_required": [{"skill_id": "SK-DEMO-001", "required_level": 90}, {"skill_id": "SK-DEMO-007", "required_level": 85}, {"skill_id": "SK-DEMO-008", "required_level": 80}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "BENCH-DEMO-5", "title": "Safety Officer", "industry": "Safety", 
            "skills_required": [{"skill_id": "SK-DEMO-006", "required_level": 95}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        }
    ]
    
    # 3. programmes (8)
    docs["programmes"] = [
        {
            "id": "PROG-DEMO-1", "name": "Data Upskill", "provider_id": "PRV-DEMO", 
            "curriculum": [{"skill_id": "SK-DEMO-001", "target_level": 80}, {"skill_id": "SK-DEMO-002", "target_level": 85}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "PROG-DEMO-2", "name": "Frontend Bootcamp", "provider_id": "PRV-DEMO", 
            "curriculum": [{"skill_id": "SK-DEMO-003", "target_level": 85}, {"skill_id": "SK-DEMO-004", "target_level": 75}, {"skill_id": "SK-DEMO-009", "target_level": 70}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "PROG-DEMO-3", "name": "Safety Cert", "provider_id": "PRV-DEMO", 
            "curriculum": [{"skill_id": "SK-DEMO-006", "target_level": 95}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "PROG-DEMO-4", "name": "Advanced Data Science", "provider_id": "PRV-DEMO", 
            "curriculum": [{"skill_id": "SK-DEMO-001", "target_level": 95}, {"skill_id": "SK-DEMO-007", "target_level": 90}, {"skill_id": "SK-DEMO-008", "target_level": 85}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "PROG-DEMO-5", "name": "Basic Programming", "provider_id": "PRV-DEMO", 
            "curriculum": [{"skill_id": "SK-DEMO-001", "target_level": 40}, {"skill_id": "SK-DEMO-003", "target_level": 40}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "PROG-DEMO-6", "name": "Electrical Masterclass", "provider_id": "PRV-DEMO", 
            "curriculum": [{"skill_id": "SK-DEMO-005", "target_level": 90}, {"skill_id": "SK-DEMO-010", "target_level": 85}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "PROG-DEMO-7", "name": "SQL Deep Dive", "provider_id": "PRV-DEMO", 
            "curriculum": [{"skill_id": "SK-DEMO-002", "target_level": 95}],
            "is_synthetic": True, "created_at": now, "updated_at": now
        },
        {
            "id": "PROG-DEMO-8", "name": "Empty Curriculum (No Bridge)", "provider_id": "PRV-DEMO", 
            "curriculum": [{"skill_id": "SK-DEMO-011", "target_level": 90}], # irrelevant skill
            "is_synthetic": True, "created_at": now, "updated_at": now
        }
    ]
    
    # 4. employers (6)
    docs["employers"] = [
        {"id": f"EMP-DEMO-00{i}", "name": f"EMP-DEMO-{chr(64+i)}", "industry": "IT" if i<4 else "Manufacturing", "is_synthetic": True, "created_at": now, "updated_at": now}
        for i in range(1, 7)
    ]
    
    # 8. trainees (45) + followups, verifications, feedback embedded logic
    def make_trainee(idx, district, course, target_role, prog, emp_status, verify_state, emp_name="EMP-DEMO-A", gap_mode=None):
        t = {
            "id": f"TR-DEMO-{idx:03d}",
            "name": f"Demo Trainee {idx:03d}",
            "email": f"demo-{idx:03d}@example.invalid",
            "phone": "+10000000000",
            "district": district,
            "course": course,
            "programme_id": prog,
            "target_role_id": target_role,
            "consent_history": [
                {"action": "GIVEN", "timestamp": t_minus(30), "channel": "PORTAL"}
            ],
            "employment_history": [],
            "skill_assessments": [],
            "is_synthetic": True, "created_at": t_minus(30), "updated_at": now
        }
        
        if emp_status in ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICESHIP"]:
            t["employment_history"].append({
                "status": emp_status,
                "employer_name": emp_name if emp_status not in ["SELF_EMPLOYED"] else None,
                "start_date": t_minus(20),
                "role": "Analyst",
                "verification_state": verify_state,
                "organization_id": emp_name.replace("-A", "-001").replace("-B", "-002").replace("-C", "-003").replace("-D", "-004").replace("-E", "-005").replace("-F", "-006") if emp_name else None,
                "employment_type": "FULL_TIME",
                "salary": 50000 + (idx * 1000)
            })
            
        if gap_mode == "NO_EVIDENCE":
            t["skill_assessments"] = []
        elif gap_mode == "UNVERIFIED_EVIDENCE":
            t["skill_assessments"] = [{"skill_id": "SK-DEMO-001", "proficiency_score": 90, "source": "SELF_REPORTED"}]
        elif gap_mode == "GENUINE_GAP": # needs PROG-DEMO-1 (Analyst)
            t["skill_assessments"] = [
                {"skill_id": "SK-DEMO-001", "proficiency_score": 20, "source": "ASSESSMENT"},
                {"skill_id": "SK-DEMO-002", "proficiency_score": 10, "source": "ASSESSMENT"}
            ]
        elif gap_mode == "MULTI_GAP": # needs PROG-DEMO-2 (Web)
            t["skill_assessments"] = [
                {"skill_id": "SK-DEMO-003", "proficiency_score": 20, "source": "ASSESSMENT"},
                {"skill_id": "SK-DEMO-004", "proficiency_score": 10, "source": "ASSESSMENT"},
                {"skill_id": "SK-DEMO-009", "proficiency_score": 15, "source": "ASSESSMENT"}
            ]
        elif gap_mode == "NO_GAP":
            t["skill_assessments"] = [
                {"skill_id": "SK-DEMO-001", "proficiency_score": 99, "source": "ASSESSMENT"},
                {"skill_id": "SK-DEMO-002", "proficiency_score": 99, "source": "ASSESSMENT"}
            ]
        else:
            # Baseline
            t["skill_assessments"] = [{"skill_id": "SK-DEMO-001", "proficiency_score": 75, "source": "ASSESSMENT"}]
            
        # REVOKED consent scenario
        if idx in [15, 30]:
            t["consent_history"].append({"action": "REVOKED", "timestamp": now, "channel": "PORTAL"})
            
        return t

    # 45 trainees designed for analytics cohorts
    # Cohort 1: North, IT Bootcamp, BENCH-1, PROG-1, EMPLOYED (>=12 records) -> 15 records
    for i in range(1, 16):
        docs["trainees"].append(make_trainee(i, "North", "IT Bootcamp", "BENCH-DEMO-1", "PROG-DEMO-1", "EMPLOYED", "EMPLOYER_VERIFIED", "EMP-DEMO-A"))
        
    # Cohort 2: South, Hardware, BENCH-3, PROG-3, EMPLOYED (8 records) -> 8 records
    for i in range(16, 24):
        docs["trainees"].append(make_trainee(i, "South", "Hardware", "BENCH-DEMO-3", "PROG-DEMO-3", "EMPLOYED", "EMPLOYER_VERIFIED", "EMP-DEMO-B", gap_mode="GENUINE_GAP"))
        
    # Cohort 3: East, Web, BENCH-2, PROG-2, EMPLOYED (exactly 5 records) -> 5 records
    for i in range(24, 29):
        docs["trainees"].append(make_trainee(i, "East", "Web", "BENCH-DEMO-2", "PROG-DEMO-2", "EMPLOYED", "PENDING_VERIFICATION", "EMP-DEMO-C", gap_mode="MULTI_GAP"))
        
    # Cohort 4: West, Data, BENCH-4, PROG-4, SEEKING_EMPLOYMENT (4 records -> INSUFFICIENT_DATA)
    for i in range(29, 33):
        docs["trainees"].append(make_trainee(i, "West", "Data", "BENCH-DEMO-4", "PROG-DEMO-4", "SEEKING_EMPLOYMENT", "SELF_REPORTED", gap_mode="GENUINE_GAP"))

    # Cohort 5: North, Safety, BENCH-5, PROG-3, SELF_EMPLOYED (3 records -> INSUFFICIENT_DATA)
    for i in range(33, 36):
        docs["trainees"].append(make_trainee(i, "North", "Safety", "BENCH-DEMO-5", "PROG-DEMO-3", "SELF_EMPLOYED", "SELF_REPORTED"))

    # 10 records for varied scenarios (NO_BENCHMARK, NO_GAP, APPRENTICESHIP, etc.)
    docs["trainees"].append(make_trainee(36, "East", "General", None, "PROG-DEMO-1", "SEEKING_EMPLOYMENT", "SELF_REPORTED"))
    docs["trainees"].append(make_trainee(37, "East", "General", "BENCH-DEMO-1", "PROG-DEMO-1", "SEEKING_EMPLOYMENT", "SELF_REPORTED", gap_mode="NO_EVIDENCE"))
    docs["trainees"].append(make_trainee(38, "East", "General", "BENCH-DEMO-1", "PROG-DEMO-1", "SEEKING_EMPLOYMENT", "SELF_REPORTED", gap_mode="UNVERIFIED_EVIDENCE"))
    docs["trainees"].append(make_trainee(39, "East", "General", "BENCH-DEMO-1", "PROG-DEMO-1", "SEEKING_EMPLOYMENT", "SELF_REPORTED", gap_mode="GENUINE_GAP"))
    docs["trainees"].append(make_trainee(40, "East", "General", "BENCH-DEMO-1", "PROG-DEMO-1", "SEEKING_EMPLOYMENT", "SELF_REPORTED", gap_mode="NO_GAP"))
    docs["trainees"].append(make_trainee(41, "South", "Hardware", "BENCH-DEMO-3", "PROG-DEMO-8", "SEEKING_EMPLOYMENT", "SELF_REPORTED", gap_mode="GENUINE_GAP")) # PROG-DEMO-8 won't bridge
    docs["trainees"].append(make_trainee(42, "South", "Hardware", "BENCH-DEMO-3", "PROG-DEMO-6", "APPRENTICESHIP", "EMPLOYER_VERIFIED", "EMP-DEMO-D"))
    docs["trainees"].append(make_trainee(43, "South", "Hardware", "BENCH-DEMO-3", None, "SEEKING_EMPLOYMENT", "SELF_REPORTED", gap_mode="GENUINE_GAP"))
    docs["trainees"].append(make_trainee(44, "West", "Data", "BENCH-DEMO-4", "PROG-DEMO-4", "EMPLOYED", "EMPLOYER_VERIFIED", "EMP-DEMO-E"))
    docs["trainees"].append(make_trainee(45, "West", "Data", "BENCH-DEMO-4", "PROG-DEMO-4", "EMPLOYED", "PENDING_VERIFICATION", "EMP-DEMO-F"))

    # 6. employer_feedback (12)
    # Employers: EMP-DEMO-A, B, C, D, E, F
    feedback_targets = [
        ("EMP-DEMO-A", 1, "PROG-DEMO-1"), ("EMP-DEMO-A", 2, "PROG-DEMO-1"),
        ("EMP-DEMO-B", 16, "PROG-DEMO-3"), ("EMP-DEMO-B", 17, "PROG-DEMO-3"),
        ("EMP-DEMO-C", 24, "PROG-DEMO-2"), ("EMP-DEMO-C", 25, "PROG-DEMO-2"),
        ("EMP-DEMO-D", 42, "PROG-DEMO-6"), ("EMP-DEMO-E", 44, "PROG-DEMO-4"),
        ("EMP-DEMO-F", 45, "PROG-DEMO-4"), ("EMP-DEMO-A", 3, "PROG-DEMO-1"),
        ("EMP-DEMO-A", 4, "PROG-DEMO-1"), ("EMP-DEMO-A", 5, "PROG-DEMO-1")
    ]
    for i, (emp, t_idx, prog) in enumerate(feedback_targets, 1):
        docs["employer_feedback"].append({
            "id": f"F-DEMO-{i:03d}",
            "employer_id": emp.replace("-A", "-001").replace("-B", "-002").replace("-C", "-003").replace("-D", "-004").replace("-E", "-005").replace("-F", "-006"),
            "trainee_id": f"TR-DEMO-{t_idx:03d}",
            "programme_id": prog,
            "rating": 4.0 if i % 2 == 0 else 5.0,
            "comments": "Solid skills.",
            "is_synthetic": True, "created_at": now, "updated_at": now
        })
        
    # 7. follow_ups (15)
    # Covering Day 0, Day 7, Day 14, Day 21 (resolved/unresolved)
    fu_scenarios = [
        ("TR-DEMO-001", "PROG-DEMO-1", "DAY_0", "COMPLETED", [("DAY_0", "COMPLETED")]),
        ("TR-DEMO-002", "PROG-DEMO-1", "DAY_7", "COMPLETED", [("DAY_0", "COMPLETED"), ("DAY_7", "COMPLETED")]),
        ("TR-DEMO-003", "PROG-DEMO-1", "DAY_14", "COMPLETED", [("DAY_0", "COMPLETED"), ("DAY_7", "COMPLETED"), ("DAY_14", "COMPLETED")]),
        ("TR-DEMO-004", "PROG-DEMO-1", "DAY_21", "RESOLVED", [("DAY_0", "COMPLETED"), ("DAY_7", "COMPLETED"), ("DAY_14", "COMPLETED"), ("DAY_21", "RESOLVED")]),
        ("TR-DEMO-005", "PROG-DEMO-1", "DAY_21", "UNRESOLVED", [("DAY_0", "COMPLETED"), ("DAY_7", "COMPLETED"), ("DAY_14", "COMPLETED"), ("DAY_21", "UNRESOLVED")]),
        ("TR-DEMO-006", "PROG-DEMO-1", "DAY_21", "UNRESOLVED", [("DAY_0", "COMPLETED"), ("DAY_7", "COMPLETED"), ("DAY_14", "COMPLETED"), ("DAY_21", "UNRESOLVED")]),
    ]
    # Add 9 more Day 21 resolved/unresolved to hit 15
    for i in range(7, 16):
        fu_scenarios.append((
            f"TR-DEMO-{i:03d}", "PROG-DEMO-1", "DAY_21", 
            "RESOLVED" if i % 2 == 0 else "UNRESOLVED", 
            [("DAY_0", "COMPLETED"), ("DAY_7", "COMPLETED"), ("DAY_14", "COMPLETED"), ("DAY_21", "RESOLVED" if i % 2 == 0 else "UNRESOLVED")]
        ))
        
    for i, (t_id, prog, stage, status, hist) in enumerate(fu_scenarios, 1):
        docs["follow_ups"].append({
            "id": f"FU-DEMO-{i:03d}",
            "trainee_id": t_id,
            "programme_id": prog,
            "current_stage": stage,
            "status": status,
            "history": [{"stage": h_st, "status": h_stat, "timestamp": now} for h_st, h_stat in hist],
            "is_synthetic": True, "created_at": now, "updated_at": now
        })
        
    # 8. employer_verifications (9)
    # Covering verified and pending
    ev_targets = [
        ("TR-DEMO-024", "EMP-DEMO-C", "Pending"),
        ("TR-DEMO-025", "EMP-DEMO-C", "Pending"),
        ("TR-DEMO-026", "EMP-DEMO-C", "Pending"),
        ("TR-DEMO-027", "EMP-DEMO-C", "Pending"),
        ("TR-DEMO-028", "EMP-DEMO-C", "Pending"),
        ("TR-DEMO-042", "EMP-DEMO-D", "Verified"),
        ("TR-DEMO-044", "EMP-DEMO-E", "Verified"),
        ("TR-DEMO-045", "EMP-DEMO-F", "Pending"),
        ("TR-DEMO-001", "EMP-DEMO-A", "Verified")
    ]
    for i, (t_id, emp_name, stat) in enumerate(ev_targets, 1):
        docs["employer_verifications"].append({
            "id": f"EV-DEMO-{i:03d}",
            "trainee_id": t_id,
            "employer_name": emp_name,
            "role": "Analyst",
            "status": stat,
            "submitted_at": now,
            "is_synthetic": True, "created_at": now, "updated_at": now
        })

    return docs

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--execute", action="store_true", help="Perform actual writes")
    parser.add_argument("--confirm-env", type=str, help="Confirm the Firestore Project ID")
    args = parser.parse_args()
    
    try:
        app = get_app()
        project_id = app.project_id or os.environ.get("GOOGLE_CLOUD_PROJECT") or "Unknown"
    except ValueError:
        project_id = "UNKNOWN-NO-APP-INITIALIZED"
        
    print("==================================================")
    print("PHASE 2H STAGE C-3 DEMO DATASET LOADER (120 Docs)")
    print("==================================================")
    print(f"Detected Project ID: {project_id}")
    
    docs = generate_documents()
    
    # Verify count
    total_count = sum(len(v) for v in docs.values())
    if total_count != 120:
        print(f"ABORT: Expected exactly 120 documents, generated {total_count}")
        sys.exit(1)
        
    print(f"Generated exactly {total_count} documents.")
    
    # Validations
    for coll_name, coll_docs in docs.items():
        for doc in coll_docs:
            ok, msg = recursive_check(doc, True, True)
            if not ok:
                print(f"ABORT: Validation failed for {coll_name}/{doc.get('id')}: {msg}")
                sys.exit(1)
                
    ok, msg = validate_relationships(docs)
    if not ok:
        print(f"ABORT: Relationship validation failed: {msg}")
        sys.exit(1)
        
    print("All documents passed Synthetic, Forbidden-Key, Count, and Relationship validations.")
    
    # Collision check
    print("Checking for existing documents (Collision Protection)...")
    has_collision = False
    if db is None:
        print("WARNING: db is None. Cannot perform real collision check against Firestore. Skipping check.")
    else:
        for coll_name, coll_docs in docs.items():
            for doc in coll_docs:
                doc_id = doc["id"]
                if db.collection(coll_name).document(doc_id).get().exists:
                    print(f"COLLISION DETECTED: {coll_name}/{doc_id} already exists.")
                    has_collision = True
                
        if has_collision:
            print("ABORT: Collisions detected. No writes will be performed.")
            sys.exit(1)
        print("No collisions detected.")
    
    if not args.execute:
        print("\n--- DRY RUN SUMMARY ---")
        print(f"Total documents: {total_count}")
        print("\nDRY RUN SUCCESSFUL. 0 Writes performed.")
        print("To execute writes, use: python seed_phase2h_demo.py --execute --confirm-env=<project-id>")
        sys.exit(0)
        
    if args.confirm_env != project_id:
        print(f"ABORT: --confirm-env '{args.confirm_env}' does not match detected project '{project_id}'")
        sys.exit(1)
        
    print("\nExecuting atomic batch write...")
    batch = db.batch()
    
    for coll_name, coll_docs in docs.items():
        for doc in coll_docs:
            doc_ref = db.collection(coll_name).document(doc["id"])
            batch.set(doc_ref, doc)
            
    batch.commit()
    print("Batch commit successful.")
    
    # Post-commit verification
    print("\n--- POST-COMMIT VERIFICATION ---")
    verification_passed = True
    actual_counts = {k: 0 for k in docs.keys()}
    
    for coll_name, coll_docs in docs.items():
        for doc in coll_docs:
            written_doc = db.collection(coll_name).document(doc["id"]).get().to_dict()
            if not written_doc:
                print(f"FAILED: {coll_name}/{doc['id']} not found in Firestore.")
                verification_passed = False
            elif written_doc.get("is_synthetic") is not True:
                print(f"FAILED: {coll_name}/{doc['id']} missing is_synthetic=True.")
                verification_passed = False
            else:
                actual_counts[coll_name] += 1
                
    if verification_passed:
        print(f"VERIFICATION SUCCESSFUL: All {total_count} documents written and confirmed.")
        for k, v in actual_counts.items():
            print(f"  {k}: {v}")
    else:
        print("VERIFICATION FAILED: Data mismatch after write.")

if __name__ == "__main__":
    main()
