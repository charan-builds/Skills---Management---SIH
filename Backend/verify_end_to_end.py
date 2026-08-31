import requests
import json
import sys

BASE_URL = "http://localhost:8001"
# We'll use the MOCK_TOKEN trick that we set up for testing endpoints earlier with an admin role
HEADERS = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbjEiLCJlbWFpbCI6ImFkbWluQGdvdi5pbiIsInJvbGUiOiJhZG1pbiJ9."}

def run_tests():
    print("="*50)
    print("PHASE 11 - AUTOMATED ACCEPTANCE TESTS")
    print("="*50)

    endpoints = [
        {"url": "/health", "expected_records": False},
        {"url": "/api/status", "expected_records": False},
        {"url": "/api/trainees", "expected_records": True},
        {"url": "/api/programmes", "expected_records": True},
        {"url": "/api/jobs", "expected_records": True},
        {"url": "/api/employers", "expected_records": True},
        {"url": "/api/skills", "expected_records": True},
        {"url": "/api/analytics/dashboard", "expected_records": True, "is_dict": True},
        {"url": "/api/ai/skill-gaps/summary", "expected_records": True, "is_dict": True, "data_key": "data"},
        {"url": "/api/interventions", "expected_records": True},
        {"url": "/api/ai/decision-engine/summary", "expected_records": True, "is_dict": True, "data_key": "data"}
    ]

    all_passed = True
    
    # Track counts for data quality checks
    counts = {}

    for ep in endpoints:
        print(f"\nTesting {ep['url']} ...")
        try:
            res = requests.get(BASE_URL + ep['url'], headers=HEADERS)
            status_code = res.status_code
            print(f"  HTTP Status: {status_code}")
            
            if status_code != 200:
                print(f"  [FAIL] Expected 200, got {status_code}. Response: {res.text[:200]}")
                all_passed = False
                continue

            data = res.json()
            
            if ep.get("data_key") and isinstance(data, dict):
                actual_data = data.get(ep["data_key"])
            else:
                actual_data = data
                
            if ep["expected_records"]:
                if ep.get("is_dict"):
                    if not actual_data or len(actual_data.keys()) == 0:
                        print(f"  [FAIL] Endpoint returned empty dictionary: {actual_data}")
                        all_passed = False
                    else:
                        print(f"  [PASS] Returned populated dictionary keys: {list(actual_data.keys())}")
                        counts[ep['url']] = len(actual_data.keys())
                else:
                    if not isinstance(actual_data, list):
                        print(f"  [FAIL] Endpoint did not return a list. Returned {type(actual_data)}")
                        all_passed = False
                    elif len(actual_data) == 0:
                        print(f"  [FAIL] Endpoint returned 200 but list is empty []")
                        all_passed = False
                    else:
                        print(f"  [PASS] Returned {len(actual_data)} records.")
                        counts[ep['url']] = len(actual_data)
            else:
                print(f"  [PASS] Basic health check ok.")
                
        except Exception as e:
            print(f"  [FAIL] Exception occurred: {e}")
            all_passed = False

    print("\n" + "="*50)
    print("PHASE 14 - DATA QUALITY & RELATIONSHIP CHECK")
    print("="*50)
    
    # Read the raw dataset to verify integrity as requested
    try:
        with open("demo_data.json", "r") as f:
            demo_data = json.load(f)
            
        t_count = len(demo_data.get("trainees", []))
        e_count = len(demo_data.get("employers", []))
        p_count = len(demo_data.get("programmes", []))
        j_count = len(demo_data.get("jobs", []))
        s_count = len(demo_data.get("skill_master", []))
        
        print(f"Trainees: {t_count} (>=350 target)")
        print(f"Employers: {e_count} (>=10 target)")
        print(f"Programmes: {p_count} (>=8 target)")
        print(f"Jobs: {j_count} (>=20 target)")
        print(f"Skills: {s_count} (>=30 target)")
        
        # Check relationships
        orphaned_programmes = 0
        orphaned_employers = 0
        
        prog_ids = {p["id"] for p in demo_data.get("programmes", [])}
        emp_ids = {e["id"] for e in demo_data.get("employers", [])}
        
        for t in demo_data.get("trainees", []):
            if t.get("programme_id") and t.get("programme_id") not in prog_ids:
                orphaned_programmes += 1
                
        for j in demo_data.get("jobs", []):
            if j.get("employer_id") and j.get("employer_id") not in emp_ids:
                orphaned_employers += 1
                
        print(f"\nOrphaned Trainee->Programme links: {orphaned_programmes}")
        print(f"Orphaned Job->Employer links: {orphaned_employers}")
        
        if orphaned_programmes > 0 or orphaned_employers > 0:
            print("[FAIL] Orphaned relationships found!")
            all_passed = False
        else:
            print("[PASS] Zero orphaned critical relationships.")
            
    except Exception as e:
        print(f"[FAIL] Could not perform data quality check: {e}")
        all_passed = False

    print("\n" + "="*50)
    print("FINAL ACCEPTANCE CRITERIA RESULTS")
    print("="*50)
    if all_passed:
        print(">>> ALL PIPELINE TESTS PASSED <<<")
        sys.exit(0)
    else:
        print(">>> SOME PIPELINE TESTS FAILED <<<")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
