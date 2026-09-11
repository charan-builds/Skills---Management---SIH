import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

from app.auth.dependencies import get_current_user, get_admin_user

client = TestClient(app)

def mock_get_admin_user():
    return {"role": "admin", "uid": "admin123", "user_id": "admin123"}

def mock_get_trainee_user():
    return {"role": "trainee", "uid": "T123", "user_id": "T123"}
    
def mock_get_other_trainee_user():
    return {"role": "trainee", "uid": "T999", "user_id": "T999"}

@pytest.fixture(autouse=True)
def auth_overrides():
    app.dependency_overrides[get_admin_user] = mock_get_admin_user
    app.dependency_overrides[get_current_user] = mock_get_trainee_user
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def mock_repo():
    with patch("app.routers.intelligence.FirestoreRepository") as mock:
        yield mock

def test_trainee_skill_gap_success(mock_repo):
    # Mock assessments for T123
    mock_repo.get_assessments.return_value = [
        {"trainee_id": "T123", "skill_id": "S1", "proficiency_score": 40},
        {"trainee_id": "T123", "skill_id": "S2", "proficiency_score": 80}
    ]
    response = client.get("/api/intelligence/trainees/T123/skill-gaps")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["meta"]["insufficient_data"] == False
    assert len(data["data"]) == 1
    assert data["data"][0]["skill_name"] == "S1"

def test_trainee_skill_gap_insufficient_data(mock_repo):
    mock_repo.get_assessments.return_value = []
    response = client.get("/api/intelligence/trainees/T123/skill-gaps")
    assert response.status_code == 200
    assert response.json()["meta"]["insufficient_data"] == True

def test_trainee_skill_gap_idor_protection(mock_repo):
    # Trainee T999 trying to access T123
    app.dependency_overrides[get_current_user] = mock_get_other_trainee_user
    response = client.get("/api/intelligence/trainees/T123/skill-gaps")
    app.dependency_overrides[get_current_user] = mock_get_trainee_user
    assert response.status_code == 403

def test_trainee_upskilling_success(mock_repo):
    mock_repo.get_assessments.return_value = [
        {"trainee_id": "T123", "skill_name": "Python", "proficiency_score": 20}
    ]
    response = client.get("/api/intelligence/trainees/T123/upskilling")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["skill_name"] == "Python"
    assert data[0]["priority"] == "HIGH"

def test_trainee_upskilling_no_job_pollution(mock_repo):
    mock_repo.get_assessments.return_value = [
        {"trainee_id": "T123", "skill_name": "Python", "proficiency_score": 45}
    ]
    response = client.get("/api/intelligence/trainees/T123/upskilling")
    data = response.json()["data"]
    # Verify no job recommendations in the response
    for item in data:
        assert "job" not in item.get("recommended_action", "").lower()
        
def test_cohort_intelligence_success_above_threshold(mock_repo):
    # N=5
    mock_repo.get_trainees.return_value = [
        {"id": f"T{i}", "status": "Certified", "outcome": "Employed"} for i in range(5)
    ]
    response = client.get("/api/intelligence/cohorts/C1")
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["suppressed"] == False
    assert data["data"]["employment_rate"] == 100.0

def test_cohort_intelligence_suppressed_below_threshold(mock_repo):
    # N=4
    mock_repo.get_trainees.return_value = [
        {"id": f"T{i}", "status": "Certified", "outcome": "Employed"} for i in range(4)
    ]
    response = client.get("/api/intelligence/cohorts/C1")
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["suppressed"] == True
    assert data["data"] is None

def test_programme_impact_success_above_threshold(mock_repo):
    # N=5
    mock_repo.get_trainees.return_value = [
        {"id": f"T{i}", "status": "Certified", "outcome": "Employed", "outcomes_timeline": [{"checkpoint": "6 Month Follow-up", "status": "Recorded", "employment_status": "Employed"}]} for i in range(5)
    ]
    response = client.get("/api/intelligence/programmes/P1/impact")
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["suppressed"] == False
    assert data["data"]["retention_6m_rate"] == 100.0

def test_programme_impact_suppressed_below_threshold(mock_repo):
    # N=4
    mock_repo.get_trainees.return_value = [
        {"id": f"T{i}", "status": "Certified", "outcome": "Employed", "outcomes_timeline": [{"checkpoint": "6 Month Follow-up", "status": "Recorded", "employment_status": "Employed"}]} for i in range(4)
    ]
    response = client.get("/api/intelligence/programmes/P1/impact")
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["suppressed"] == True

def test_programme_impact_admin_auth_required(mock_repo):
    # Trainee accessing an Admin route
    app.dependency_overrides.pop(get_admin_user, None)
    response = client.get("/api/intelligence/programmes/P1/impact")
    assert response.status_code == 403

def test_zero_fabrication_contract(mock_repo):
    mock_repo.get_assessments.return_value = []
    response = client.get("/api/intelligence/trainees/T123/upskilling")
    assert response.json()["meta"]["insufficient_data"] == True
    assert response.json()["data"] == []

def test_no_offline_ml_leakage():
    # Verify routers/intelligence.py does not import ml_* modules
    import os
    file_path = os.path.join(os.path.dirname(__file__), "..", "app", "routers", "intelligence.py")
    with open(file_path, "r") as f:
        content = f.read()
    assert "app.ai.ml_retention" not in content
    assert "app.ai.synthetic" not in content
    assert "app.ai.ml_dataset" not in content
    assert "app.ai.ml_experiments" not in content

def test_firestore_read_only(mock_repo):
    # Verify the router calls do not trigger sets, adds, or updates
    mock_repo.get_assessments.return_value = []
    client.get("/api/intelligence/trainees/T123/skill-gaps")
    client.get("/api/intelligence/programmes/P1/impact")
    
    # Assert no mutation methods were called on the mock repo
    mock_repo.create_assessment.assert_not_called()
    mock_repo.create_programme.assert_not_called()
    mock_repo.update_trainee.assert_not_called()
