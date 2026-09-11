import os
import sys
import json
from fastapi.testclient import TestClient

os.environ["ENABLE_DEMO_MODE"] = "False"
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.firebase.config import db

client = TestClient(app)

print("Starting live data verification...")

# Verify Phase 2F Analytics (Cohorts & Privacy Threshold)
resp = client.get("/api/v1/analytics/cohorts/outcomes?district=North&course=IT%20Bootcamp")
print(f"Cohort North/IT (Expected >=12): {resp.status_code}")
data = resp.json()
print(f"Data: {data}")
if data.get("total_trainees", 0) < 12:
    print("WARNING: North/IT cohort size is smaller than expected.")

resp_small = client.get("/api/v1/analytics/cohorts/outcomes?district=West&course=Data")
print(f"Cohort West/Data (Expected 4 -> INSUFFICIENT_DATA): {resp_small.status_code}")
data_small = resp_small.json()
print(f"Data: {data_small}")
if data_small.get("status") != "INSUFFICIENT_DATA":
    print("WARNING: Privacy threshold failed for West/Data.")

# Verify Phase 2D Skill Gaps (Trainee TR-DEMO-024 should have a MULTI_GAP)
resp_gap = client.get("/api/v1/trainees/TR-DEMO-024/skill-gaps")
print(f"Skill Gaps TR-DEMO-024: {resp_gap.status_code}")
data_gap = resp_gap.json()
print(f"Gaps found: {len(data_gap)}")
if len(data_gap) == 0:
    print("WARNING: No gaps found for TR-DEMO-024.")

# Verify Phase 2E Recommendations
resp_rec = client.get("/api/v1/trainees/TR-DEMO-024/recommendations")
print(f"Recommendations TR-DEMO-024: {resp_rec.status_code}")
data_rec = resp_rec.json()
print(f"Recommendations found: {len(data_rec.get('recommended_programmes', []))}")
if len(data_rec.get('recommended_programmes', [])) == 0:
    print("WARNING: No recommendations found for TR-DEMO-024.")

print("Verification complete.")
