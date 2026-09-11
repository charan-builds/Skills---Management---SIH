import os
import pytest
from dotenv import load_dotenv

# Load env vars
load_dotenv()

from fastapi.testclient import TestClient
from app.main import app
from app.auth.dependencies import get_current_user, get_admin_user, get_employer_user

client = TestClient(app)

pytestmark = pytest.mark.integration

@pytest.fixture(autouse=True)
def mock_auth():
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    app.dependency_overrides[get_admin_user] = lambda: {"uid": "admin123", "role": "admin"}
    app.dependency_overrides[get_employer_user] = lambda: {"uid": "admin123", "role": "employer", "organization_id": "EMP-DEMO-001"}
    yield
    app.dependency_overrides.clear()


def test_get_programmes():
    response = client.get("/api/programmes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    # Check schema keys
    for prog in data:
        assert "id" in prog
        assert "name" in prog
        assert "provider" in prog
        assert "trainees" in prog
        assert "employment" in prog
        assert "retention" in prog

def test_get_programme_by_id():
    response = client.get("/api/programmes/PROG-001")
    assert response.status_code == 200
    assert response.json()["id"] == "PROG-001"
    assert "Data" in response.json()["name"]

def test_get_trainees():
    response = client.get("/api/trainees")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_trainee_by_id():
    response = client.get("/api/trainees/TR-0001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "TR-0001"
    assert "name" in data
    assert "employment_history" in data
    assert "outcomes_timeline" in data

def test_add_trainee_employment():
    # Post new employment history for trainee TR-DEMO-1001
    payload = {
        "status": "EMPLOYED",
        "employer_name": "Test Employer LLC",
        "role": "Software Developer",
        "salary": 24000.0,
        "start_date": "2025-08-01",
        "verification_state": "SELF_REPORTED"
    }
    response = client.post("/api/trainees/TR-0002/outcome", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["outcome"] == "EMPLOYED"

    # Confirm verification request was created in DB
    v_response = client.get("/api/employers/verifications/pending")
    assert v_response.status_code == 200
    verifications = v_response.json()
    assert len(verifications) > 0
    # Find the verification we just triggered
    test_v = [v for v in verifications if v["trainee_id"] == "TR-0002" and v["employer_name"] == "Test Employer LLC"]
    assert len(test_v) >= 1

def test_submit_followup():
    payload = {
        "checkpoint": "12 Month Follow-up",
        "employment_status": "Employed",
        "employer_or_activity": "Test Employer LLC",
        "salary": "₹25,000",
        "job_relevance": "High",
        "description": "Follow-up completed successfully"
    }
    response = client.post("/api/trainees/TR-0002/followup", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify the timeline checkpoint status is updated
    timeline = data["outcomes_timeline"]
    chk = [c for c in timeline if c["checkpoint"] == "12 Month Follow-up"]
    assert len(chk) == 1
    assert chk[0]["status"] == "Recorded"
    assert chk[0]["employer_or_activity"] == "Test Employer LLC"

def test_employer_verification_flow():
    # Fetch pending verifications
    v_response = client.get("/api/employers/verifications/pending")
    verifications = v_response.json()
    assert len(verifications) > 0
    target_v = verifications[0]
    v_id = target_v["id"]

    # Approve verification
    payload = {"approve": True}
    response = client.post(f"/api/employers/verifications/{v_id}", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "Approved"

    # Fetch trainee profile to verify it's updated as verified
    t_id = target_v["trainee_id"]
    t_response = client.get(f"/api/trainees/{t_id}")
    t_data = t_response.json()

    # Check verification status in history
    found_verified_job = False
    for job in t_data["employment_history"]:
        if job.get("employer_name") == target_v["employer_name"] and job.get("role") == target_v["role"]:
            assert job["verification_state"] == "EMPLOYER_VERIFIED"
            found_verified_job = True
            break

    assert found_verified_job, "Verified job not found in trainee's employment history"

def test_submit_employer_feedback():
    payload = {
        "trainee_id": "TR-0001",
        "programme_id": "PROG-001",
        "employer_name": "Tech Corp",
        "satisfaction_score": 4,
        "technical_deficiencies": ["Docker", "Kubernetes"],
        "soft_skill_deficiencies": ["Leadership"],
        "skills_required_in_job": ["Python", "Docker"]
    }
    response = client.post("/api/employers/feedback", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["satisfaction_score"] == 4
    assert "Docker" in data["technical_deficiencies"]

def test_interventions():
    # Get initial
    g_response = client.get("/api/interventions")
    assert g_response.status_code == 200
    initial_len = len(g_response.json())

    # Create intervention
    payload = {
        "title": "Introduce Docker module",
        "description": "Added containerization modules to course curriculum",
        "programme_id": "PROG-001",
        "date": "2026-08-01"
    }
    c_response = client.post("/api/interventions", json=payload)
    assert c_response.status_code == 201

    # Get again
    g_response_after = client.get("/api/interventions")
    assert len(g_response_after.json()) == initial_len + 1
