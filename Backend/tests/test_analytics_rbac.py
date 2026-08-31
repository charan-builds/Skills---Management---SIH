import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.auth.dependencies import get_current_user

client = TestClient(app)

@pytest.fixture
def mock_db():
    with patch("app.routers.analytics.FirestoreRepository.get_trainees") as mock_t, \
         patch("app.routers.analytics.FirestoreRepository.get_employer_feedback") as mock_f:
        mock_t.return_value = []
        mock_f.return_value = []
        yield

def test_analytics_anonymous(mock_db):
    """Verify anonymous access is denied."""
    app.dependency_overrides = {}
    response = client.get("/api/analytics/dashboard")
    assert response.status_code == 401 # FastAPI HTTPBearer returns 401 or 403 when no token is provided

def test_analytics_non_admin(mock_db):
    """Verify authenticated non-admin access is denied."""
    app.dependency_overrides[get_current_user] = lambda: {"uid": "user123", "role": "trainee"}
    
    # Must pass a fake token for HTTPBearer not to instantly reject it before dependencies
    response = client.get("/api/analytics/dashboard", headers={"Authorization": "Bearer fake_token"})
    
    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions. Admin role required."
    
    app.dependency_overrides = {}

def test_analytics_admin(mock_db):
    """Verify authenticated admin access is allowed."""
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    
    response = client.get("/api/analytics/dashboard", headers={"Authorization": "Bearer fake_token"})
    
    # Check that we got past authorization and successfully hit the endpoint logic
    assert response.status_code == 200
    assert "stats" in response.json()
    
    app.dependency_overrides = {}

def test_ai_systemic_anonymous(mock_db):
    """Verify anonymous access to AI systemic endpoints is denied."""
    app.dependency_overrides = {}
    response = client.get("/api/ai/programmes/P001")
    assert response.status_code == 401

def test_ai_systemic_non_admin(mock_db):
    """Verify authenticated non-admin access to AI systemic endpoints is denied."""
    app.dependency_overrides[get_current_user] = lambda: {"uid": "user123", "role": "trainee"}
    
    response = client.get("/api/ai/programmes/P001", headers={"Authorization": "Bearer fake_token"})
    
    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions. Admin role required."
    
    app.dependency_overrides = {}

def test_ai_systemic_admin():
    """Verify authenticated admin access to AI systemic endpoints is allowed."""
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    
    with patch("app.ai.api.AIService.get_programme_overview") as mock_overview:
        mock_overview.return_value = {"programme_id": "P001"}
        response = client.get("/api/ai/programmes/P001", headers={"Authorization": "Bearer fake_token"})
        assert response.status_code == 200
    
    app.dependency_overrides = {}
