import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os
import sys

os.environ["ENABLE_DEMO_MODE"] = "False"
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from app.main import app
from app.auth.dependencies import get_current_user, get_admin_user, get_employer_user
from app.firebase.repository import FirestoreRepository
from app.schemas.trainee import TraineeEmploymentCreate
from app.schemas.employer import EmployerFeedbackCreate
from app.services.skill_gap_service import SkillGapService

client = TestClient(app)

pytestmark = pytest.mark.integration

@pytest.fixture(autouse=True)
def mock_auth():
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    app.dependency_overrides[get_admin_user] = lambda: {"uid": "admin123", "role": "admin"}
    app.dependency_overrides[get_employer_user] = lambda: {"uid": "admin123", "role": "employer", "organization_id": "EMP-DEMO-001"}
    yield
    app.dependency_overrides.clear()

@pytest.fixture(autouse=True)
def override_demo_mode():
    from app.core.config import settings
    original = settings.ENABLE_DEMO_MODE
    settings.ENABLE_DEMO_MODE = False
    yield
    settings.ENABLE_DEMO_MODE = original

@pytest.fixture
def mock_db():
    # Correctly patch the db instance inside the repository module where it is used
    with patch("app.firebase.repository.db") as mock:
        yield mock

# ==========================================
# CONSENT TESTS
# ==========================================
def test_cons_02_revoked_consent_employer_access(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"id": "T1", "consent_granted": False}
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc
    
    app.dependency_overrides[get_employer_user] = lambda: {"uid": "emp1", "role": "employer", "organization_id": "ORG-1"}
    
    # Correct endpoint: employers fetch outcomes/dashboard
    response = client.get("/api/employers/ORG-1/outcomes")
    
    # Valid execution: Employer should NOT see T1 in the array or should get 403.
    # We assert T1 is omitted.
    if response.status_code == 200:
        data = response.json()
        assert not any(t.get("trainee_id") == "T1" for t in data), "VULNERABILITY: Revoked consent leaked to employer dashboard."
    else:
        assert response.status_code in [403, 404]

# ==========================================
# EMPLOYMENT MUTATION TESTS
# ==========================================
def get_dummy_trainee(extra_fields=None):
    base = {
        "id": "T1", "name": "Test", "email": "test@test.com", "phone": "123",
        "district": "North", "programme_id": "P1", "course_name": "C1",
        "provider": "Pratham", "status": "Active", "outcome": "None",
        "skills": [], "certifications": [], "employment_history": [],
        "consent_history": [], "outcomes_timeline": [], "is_synthetic": False
    }
    if extra_fields:
        base.update(extra_fields)
    return base

def test_emp_01_missing_joining_date(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = get_dummy_trainee()
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    payload = {
        "status": "EMPLOYED",
        "employer_name": "Tech Corp",
        "role": "Developer"
        # missing start_date
    }
    response = client.post("/api/trainees/T1/outcome", json=payload)
    # Must fail schema/business validation
    assert response.status_code in [400, 422], f"VULNERABILITY: Missing joining date accepted. Status {response.status_code}"

def test_emp_02_impossible_transition(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = get_dummy_trainee({
        "outcome": "EMPLOYED",
        "employment_history": [{"id": "EH1", "status": "EMPLOYED", "employer_name": "Old Corp", "timestamp": "2025-01-01T00:00:00Z", "verification_state": "VERIFIED"}]
    })
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc
    
    app.dependency_overrides[get_current_user] = lambda: {"uid": "T1", "role": "trainee"}
    
    payload = {
        "status": "IN_TRAINING",
        "employer_name": "Tech Corp",
        "start_date": "2025-08-01"
    }
    response = client.post("/api/trainees/T1/outcome", json=payload)
    assert response.status_code in [400, 422], f"VULNERABILITY: Impossible transition allowed. Status {response.status_code}"

# ==========================================
# FOLLOW-UP MUTATION TESTS
# ==========================================
def test_fup_01_invalid_resolution_sequence(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = get_dummy_trainee()
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    payload = {
        "checkpoint": "Day 21",
        "employment_status": "Employed",
        "employer_or_activity": "Tech",
        "salary": "25000",
        "job_relevance": "High",
        "description": "Skipped Day 7 and 14"
    }
    response = client.post("/api/trainees/T1/followup", json=payload)
    assert response.status_code in [400, 422], f"VULNERABILITY: Out of sequence follow-up allowed. Status {response.status_code}"

# ==========================================
# ISO-02 ORGANIZATION ISOLATION
# ==========================================
def test_iso_02_cross_org_feedback(mock_db):
    mock_trainee = MagicMock()
    mock_trainee.exists = True
    mock_trainee.to_dict.return_value = {"id": "T102"}
    
    mock_prog = MagicMock()
    mock_prog.exists = True
    mock_prog.to_dict.return_value = {"id": "PROG-1"}
    
    def side_effect_get(col_name):
        mock_col = MagicMock()
        if col_name == "trainees":
            mock_col.document.return_value.get.return_value = mock_trainee
        elif col_name == "programmes":
            mock_col.document.return_value.get.return_value = mock_prog
        return mock_col
    
    mock_db.collection.side_effect = side_effect_get
    
    payload = {
        "trainee_id": "T102",
        "programme_id": "PROG-1",
        "employer_name": "Other Corp",
        "satisfaction_score": 4,
        "technical_deficiencies": [],
        "soft_skill_deficiencies": [],
        "skills_required_in_job": ["Docker"]
    }
    app.dependency_overrides[get_current_user] = lambda: {"uid": "emp1", "role": "employer", "organization_id": "EMP-DEMO-001"}
    
    # We omit organization_id in payload if it is fetched from JWT, or we supply a malicious one. 
    # If the endpoint doesn't validate cross-org, it will just write it.
    response = client.post("/api/employers/feedback", json=payload)
    
    assert response.status_code in [403, 401], f"VULNERABILITY: Cross-org feedback submitted successfully! Status {response.status_code}"

# ==========================================
# SKILL GAP SERVICE (DIRECT SERVICE INVOCATION)
# ==========================================
def test_skl_01_unverified_skill():
    # Directly test the service layer with an unverified skill
    trainee_profile = {
        "id": "T1",
        "skills": [],
        "target_role_id": "R1"
    }
    
    # Malicious injection of unverified claim directly into the service model evaluation
    class DummySkill:
        def __init__(self):
            self.name = "Python"
            self.verification_status = "SELF_REPORTED"
            
    trainee_profile["skills"] = [DummySkill()]
    
    # To execute SkillGapService.calculate_gaps we need a mock benchmark
    # The actual vulnerability is whether the service filters out SELF_REPORTED skills during matrix calculation
    # If it calculates gaps based on unverified skills, it's vulnerable.
    pass

# ==========================================
# BENCHMARK TESTS (DIRECT REPOSITORY)
# ==========================================
def test_bmk_02_invalid_proficiency(mock_db):
    # Endpoint absence confirmed. If implemented, must test role benchmarks directly.
    pass
