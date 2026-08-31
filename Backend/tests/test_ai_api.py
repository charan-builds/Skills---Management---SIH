import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.auth.dependencies import get_current_user, get_admin_user

def mock_get_admin_user():
    return {"uid": "admin_user", "email": "admin@example.com", "role": "admin"}

def mock_get_normal_user():
    return {"uid": "normal_user", "email": "user@example.com", "role": "trainee"}

app.dependency_overrides[get_admin_user] = mock_get_admin_user
client = TestClient(app)

def test_health_check():
    response = client.get("/api/ai/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_rbac_unauthenticated():
    # Remove all overrides to test unauthenticated
    app.dependency_overrides.clear()
    response = client.get("/api/ai/overview")
    assert response.status_code == 401
    
    response2 = client.get("/api/ai/decision-engine/summary")
    assert response2.status_code == 401
    
    # Restore normal user
    app.dependency_overrides[get_current_user] = mock_get_normal_user
    app.dependency_overrides[get_admin_user] = mock_get_admin_user

def test_rbac_non_admin():
    # Set get_current_user to normal user, and remove get_admin_user override so it runs real check
    app.dependency_overrides.clear()
    app.dependency_overrides[get_current_user] = mock_get_normal_user
    # The real get_admin_user uses get_current_user, so it will see the normal user and raise 403
    response = client.get("/api/ai/decision-engine/summary")
    assert response.status_code == 403
    
    # Restore
    app.dependency_overrides[get_admin_user] = mock_get_admin_user

from app.ai.service import AIService

@pytest.fixture(autouse=True)
def mock_db():
    with patch("app.ai.ingestion.FirestoreRepository.get_trainees", return_value=[]), \
         patch("app.ai.ingestion.FirestoreRepository.get_skills", return_value=[]), \
         patch("app.ai.ingestion.FirestoreRepository.get_assessments", return_value=[]), \
         patch("app.ai.ingestion.FirestoreRepository.get_programmes", return_value=[]), \
         patch("app.ai.ingestion.FirestoreRepository.get_jobs", return_value=[]), \
         patch("app.ai.ingestion.FirestoreRepository.get_employer_feedback", return_value=[]), \
         patch("app.ai.decision_engine.SkillIntelligenceEngine.analyze_skill_gaps", return_value={"skill_gaps": [], "meta": {}}), \
         patch("app.ai.decision_engine.RetentionIntelligenceEngine.analyze_retention_risks", return_value={"risk_patterns": [], "meta": {}}):
        AIService._cached_intel = None
        AIService._cached_features = None
        yield

def test_get_overview():
    app.dependency_overrides[get_current_user] = mock_get_admin_user
    app.dependency_overrides[get_admin_user] = mock_get_admin_user
    response = client.get("/api/ai/overview")
    assert response.status_code == 200
    assert "data" in response.json()
    assert "outcome_diagnosis" in response.json()["data"]

def test_get_programme_intelligence():
    response = client.get("/api/ai/programmes/P1")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_get_programme_diagnosis():
    response = client.get("/api/ai/programmes/P1/diagnosis")
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)

def test_get_programme_curriculum():
    response = client.get("/api/ai/programmes/P1/curriculum")
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)

def test_get_trainee_skills():
    response = client.get("/api/ai/trainees/T1/skills")
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)

def test_get_trainee_job_match():
    response = client.get("/api/ai/trainees/T1/jobs/J1/match")
    assert response.status_code == 200
    assert "data" in response.json()

def test_scenario_endpoint():
    req = {
        "type": "increase_target_proficiency",
        "params": {
            "programme_id": "P1",
            "skill_id": "S1",
            "increase_amount": 20
        }
    }
    response = client.post("/api/ai/scenario", json=req)
    assert response.status_code == 200
    data = response.json()["data"]
    assert isinstance(data, dict)
