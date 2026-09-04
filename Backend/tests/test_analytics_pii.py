import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.auth.dependencies import get_current_user

client = TestClient(app)

FORBIDDEN_PII_KEYS = {
    "name",
    "email",
    "phone",
    "address",
    "candidates",
    "jobs",
    "employment_history"
}

def assert_no_pii(data, path=""):
    """Recursively checks a dictionary or list for forbidden PII keys."""
    if isinstance(data, dict):
        for key, value in data.items():
            if key in FORBIDDEN_PII_KEYS:
                pytest.fail(f"PII Leak Detected: Found forbidden key '{key}' at path '{path}.{key}'")
            assert_no_pii(value, path + "." + key)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            assert_no_pii(item, path + f"[{i}]")

@pytest.fixture
def mock_db_with_real_trainee():
    with patch("app.routers.analytics.FirestoreRepository.get_trainees") as mock_t, \
         patch("app.routers.analytics.FirestoreRepository.get_employer_feedback") as mock_f:
        mock_t.return_value = [
            {
                "id": "T001",
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1234567890",
                "status": "Certified",
                "outcome": "Employed",
                "employment_history": [{"employer": "Tech Corp", "salary": 25000}],
                "outcomes_timeline": [{"checkpoint": "6 Month Follow-up", "status": "Recorded", "employment_status": "Employed"}]
            }
        ]
        mock_f.return_value = []
        yield

def test_analytics_dashboard_no_pii(mock_db_with_real_trainee):
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    response = client.get("/api/analytics/dashboard", headers={"Authorization": "Bearer token"})
    
    assert response.status_code == 200
    data = response.json()
    
    # Recursively check for PII keys
    assert_no_pii(data, "root")
    
    # Verify aggregate values are correct based on the mocked data
    assert data["stats"][0]["value"] == "1" # Total Trainees
    assert data["stats"][1]["value"] == "100%" # Employment Rate
    # Retention: The mock trainee has no valid start_date in employment_history,
    # so the RetentionIntelligenceEngine correctly reports insufficient evidence.
    assert data["stats"][2]["value"] is None # 6M Retention
    
    app.dependency_overrides = {}
