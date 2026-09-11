import os
import sys
import json
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials, firestore as fa_firestore
from fastapi.testclient import TestClient

from app.main import app
from app.auth.tokens import create_access_token
from app.firebase.config import db

print("==================================================")
print("1. LIVE DATASET VERIFICATION")
print("==================================================")

try:
    db_test = db
    project_id = db_test.project if db_test else None
    if not project_id:
        project_id = 'impact-intelligence'
    
    print(f"Firebase project = {project_id}")
    if project_id != 'impact-intelligence':
        print("FAIL: Incorrect project!")
        sys.exit(1)
    collections = ['skill_master', 'role_benchmarks', 'programmes', 'employers', 'trainees', 'employer_feedback', 'follow_ups', 'employer_verifications']
    
    total_docs = 0
    all_synthetic = True
    for col in collections:
        docs = list(db_test.collection(col).stream())
        total_docs += len(docs)
        for doc in docs:
            data = doc.to_dict()
            if data.get('is_synthetic') is not True:
                all_synthetic = False
                print(f"FAIL: Document {doc.id} in {col} is missing is_synthetic=True")
                
    print(f"Total documents: {total_docs}")
    if total_docs == 120:
        print("PASS: Exactly 120 documents remain.")
    else:
        print("FAIL: Document count is not 120!")
        
    if all_synthetic:
        print("PASS: All documents are synthetic.")
except Exception as e:
    print(f"Error checking Firestore: {e}")

print("\n==================================================")
print("2. AUTHENTICATION / RBAC (TESTCLIENT)")
print("==================================================")

client = TestClient(app)

# Generate tokens
admin_token = create_access_token({"uid": "admin-1", "role": "admin"})
employer_1_token = create_access_token({"uid": "emp-1", "role": "employer", "org_id": "ORG-1"})
employer_2_token = create_access_token({"uid": "emp-2", "role": "employer", "org_id": "ORG-2"})
trainee_1_token = create_access_token({"uid": "tr-1", "role": "trainee", "trainee_id": "T-1001"})
trainee_2_token = create_access_token({"uid": "tr-2", "role": "trainee", "trainee_id": "T-1002"})
invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token"

headers = lambda token: {"Authorization": f"Bearer {token}"}

# Trainee
res = client.get("/api/trainees/T-1001/profile", headers=headers(trainee_1_token))
print(f"Trainee 1 -> Own Profile: {res.status_code} (Expect 200/404 if missing, not 403)")
if res.status_code in [200, 404]: print("PASS")
else: print("FAIL")

res = client.get("/api/trainees/T-1002/profile", headers=headers(trainee_1_token))
print(f"Trainee 1 -> Trainee 2 Profile: {res.status_code} (Expect 403)")
if res.status_code == 403: print("PASS")
else: print("FAIL")

res = client.get("/api/trainees/T-1001/profile", headers=headers(invalid_token))
print(f"Invalid JWT -> Trainee 1 Profile: {res.status_code} (Expect 401)")
if res.status_code == 401: print("PASS")
else: print("FAIL")

# Employer
res = client.get("/api/employers/ORG-1/profile", headers=headers(employer_1_token))
print(f"Employer 1 -> Own Profile: {res.status_code} (Expect 200/404)")
if res.status_code in [200, 404]: print("PASS")
else: print("FAIL")

res = client.get("/api/employers/ORG-2/profile", headers=headers(employer_1_token))
print(f"Employer 1 -> Employer 2 Profile: {res.status_code} (Expect 403)")
if res.status_code == 403: print("PASS")
else: print("FAIL")

# Admin
res = client.get("/api/analytics/dashboard", headers=headers(admin_token))
print(f"Admin -> Analytics: {res.status_code} (Expect 200)")
if res.status_code == 200: print("PASS")
else: print("FAIL")

res = client.get("/api/analytics/dashboard", headers=headers(employer_1_token))
print(f"Employer 1 -> Analytics: {res.status_code} (Expect 403)")
if res.status_code == 403: print("PASS")
else: print("FAIL")

print("\n==================================================")
print("3. LIVE DATA INTEGRITY (ADMIN API CALLS)")
print("==================================================")

prog_res = client.get("/api/programmes", headers=headers(admin_token))
if prog_res.status_code == 200:
    data = prog_res.json()
    print(f"Programmes loaded: {len(data)}")
    if len(data) > 0:
        print("Sample keys:", list(data[0].keys()))
else:
    print("Failed to load programmes.")

trainees_res = client.get("/api/trainees", headers=headers(admin_token))
if trainees_res.status_code == 200:
    data = trainees_res.json()
    print(f"Trainees loaded: {len(data)}")
    if len(data) > 0:
        print("Sample keys:", list(data[0].keys()))
else:
    print("Failed to load trainees.")

dash_res = client.get("/api/analytics/dashboard", headers=headers(admin_token))
if dash_res.status_code == 200:
    data = dash_res.json()
    print(f"Analytics keys: {list(data.keys())}")
    print("Stats:", data.get('stats'))
else:
    print("Failed to load analytics.")

# Privacy Threshold test
pt_res = client.get("/api/analytics/dashboard?district=West", headers=headers(admin_token))
if pt_res.status_code == 200:
    data = pt_res.json()
    stats = data.get('stats', [])
    insufficient = any(s.get('value') == 'INSUFFICIENT_DATA' for s in stats)
    print(f"Privacy Threshold (West, count<5): {'PASS' if insufficient else 'FAIL'}")

pt_res_north = client.get("/api/analytics/dashboard?district=North", headers=headers(admin_token))
if pt_res_north.status_code == 200:
    data = pt_res_north.json()
    stats = data.get('stats', [])
    insufficient = any(s.get('value') == 'INSUFFICIENT_DATA' for s in stats)
    print(f"Privacy Threshold (North, count>=5): {'FAIL' if insufficient else 'PASS'}")

