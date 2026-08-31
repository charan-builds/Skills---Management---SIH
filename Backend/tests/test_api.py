import os
import pytest
from dotenv import load_dotenv

# Load env vars
load_dotenv()

from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.auth.dependencies import get_current_user

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "message": "Skilling Impact Intelligence API is running"
    }

@patch("app.routers.analytics.FirestoreRepository.get_trainees")
@patch("app.routers.analytics.FirestoreRepository.get_employer_feedback")
def test_analytics_dashboard(mock_fb, mock_tr):
    mock_tr.return_value = []
    mock_fb.return_value = []
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    response = client.get("/api/analytics/dashboard", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "notifications" in data
    assert "employment_trend" in data
    assert "retention" in data
    
    # Verify the stat cards structure
    for stat in data["stats"]:
        assert stat["title"] in ["Total Trainees", "Employment Rate", "6M Retention", "Wage Progression"]
        assert stat["value"] is None or "%" in stat["value"] or stat["value"].isdigit() or "+" in stat["value"] or stat["value"] == "None"
    app.dependency_overrides = {}

@patch("app.routers.analytics.FirestoreRepository.get_programme")
@patch("app.routers.analytics.FirestoreRepository.get_employer_feedback")
def test_skill_gap_analysis(mock_fb, mock_prog):
    mock_prog.return_value = {"id": "P001", "name": "Data Analytics", "skills_taught": ["Python", "SQL"]}
    mock_fb.return_value = []
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    response = client.get("/api/analytics/skill-gaps?programme_id=P001", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    data = response.json()
    assert "course_name" in data
    assert "job_skill_match" in data
    assert "skills_comparison" in data
    assert "common_gaps" in data
    app.dependency_overrides = {}

@patch("app.ai.service.AIService.get_programme_diagnosis")
def test_diagnosis_engine(mock_diag):
    """Test the current AI diagnosis endpoint at /api/ai/programmes/{id}/diagnosis."""
    mock_diag.return_value = [{"issue": "INSUFFICIENT_DATA", "severity": "UNKNOWN"}]
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    response = client.get("/api/ai/programmes/P001/diagnosis", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)
    assert data["data"][0]["issue"] == "INSUFFICIENT_DATA"
    app.dependency_overrides = {}

@patch("app.routers.analytics.FirestoreRepository.get_trainees")
@patch("app.routers.analytics.FirestoreRepository.get_employer_feedback")
def test_analytics_dashboard_empty_db(mock_fb, mock_tr):
    # Empty DB behavior
    mock_tr.return_value = []
    mock_fb.return_value = []
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    response = client.get("/api/analytics/dashboard", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    data = response.json()
    assert len(data.get("notifications", [])) == 0
    # The stats should gracefully handle 0 trainees
    for stat in data.get("stats", []):
        if stat["title"] == "Total Trainees":
            assert stat["value"] == "0"
    app.dependency_overrides = {}

