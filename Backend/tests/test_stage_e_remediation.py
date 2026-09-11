import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.auth.dependencies import get_current_user
from app.firebase.repository import FirestoreRepository
import os

os.environ["ENABLE_DEMO_MODE"] = "False"
client = TestClient(app)

@pytest.fixture(autouse=True)
def override_demo_mode():
    from app.core.config import settings
    original = settings.ENABLE_DEMO_MODE
    settings.ENABLE_DEMO_MODE = False
    yield
    settings.ENABLE_DEMO_MODE = original

def get_dummy_trainee():
    return {
        "id": "T1", "name": "Test", "email": "test@test.com", "phone": "123",
        "district": "North", "programme_id": "P1", "course_name": "C1",
        "provider": "Pratham", "status": "Active", "outcome": "None",
        "skills": [], "certifications": [], "employment_history": [],
        "consent_history": [], "outcomes_timeline": [], "is_synthetic": False
    }

@pytest.fixture
def mock_db():
    with patch("app.firebase.repository.db") as mock:
        yield mock

# ==========================================
# EMP-03 Remediation Tests
# ==========================================
def test_emp_03_valid_execution(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = get_dummy_trainee()
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    app.dependency_overrides[get_current_user] = lambda: {"uid": "T1", "role": "trainee"}

    with patch("app.firebase.repository.FirestoreRepository.add_trainee_employment") as mock_add:
        mock_add.return_value = get_dummy_trainee()
        payload = {
            "status": "EMPLOYED",
            "employer_name": "SelfCorp",
            "start_date": "2025-01-01"
        }
        response = client.post("/api/trainees/T1/outcome", json=payload)
        assert response.status_code == 200
        args, _ = mock_add.call_args
        emp_obj = args[1]
        assert emp_obj.employer_name == "SelfCorp"
        assert emp_obj.verification_state == "SELF_REPORTED"

def test_emp_03_trainee_verified_attempt_becomes_self_reported(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = get_dummy_trainee()
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    app.dependency_overrides[get_current_user] = lambda: {"uid": "T1", "role": "trainee"}

    with patch("app.firebase.repository.FirestoreRepository.add_trainee_employment") as mock_add:
        mock_add.return_value = get_dummy_trainee()
        payload = {
            "status": "EMPLOYED",
            "employer_name": "SelfCorp",
            "start_date": "2025-01-01",
            "verification_state": "VERIFIED" # Malicious elevation
        }
        response = client.post("/api/trainees/T1/outcome", json=payload)
        assert response.status_code == 200
        args, _ = mock_add.call_args
        emp_obj = args[1]
        assert emp_obj.verification_state == "SELF_REPORTED"

def test_emp_03_admin_verification_remains_valid(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = get_dummy_trainee()
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    app.dependency_overrides[get_current_user] = lambda: {"uid": "A1", "role": "admin"}

    with patch("app.firebase.repository.FirestoreRepository.add_trainee_employment") as mock_add:
        mock_add.return_value = get_dummy_trainee()
        payload = {
            "status": "EMPLOYED",
            "employer_name": "SelfCorp",
            "start_date": "2025-01-01",
            "verification_state": "ADMIN_VERIFIED"
        }
        response = client.post("/api/trainees/T1/outcome", json=payload)
        assert response.status_code == 200
        args, _ = mock_add.call_args
        emp_obj = args[1]
        assert emp_obj.verification_state == "ADMIN_VERIFIED"

def test_emp_03_invalid_transition_rejected(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    trainee = get_dummy_trainee()
    # Mock current outcome as EMPLOYED
    trainee["employment_history"] = [{"status": "EMPLOYED", "timestamp": "2025-01-01", "verification_state": "SELF_REPORTED", "id": "emp_1"}]
    mock_doc.to_dict.return_value = trainee
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    app.dependency_overrides[get_current_user] = lambda: {"uid": "T1", "role": "trainee"}

    payload = {
        "status": "IN_TRAINING",
        "employer_name": "SelfCorp",
        "start_date": "2025-01-02"
    }
    response = client.post("/api/trainees/T1/outcome", json=payload)
    assert response.status_code == 400
    assert "Cannot transition" in response.json()["detail"]

# ==========================================
# DB-01 Remediation Tests
# ==========================================
def test_db_01_valid_reference(mock_db):
    app.dependency_overrides[get_current_user] = lambda: {"uid": "A1", "role": "admin"}
    
    with patch("app.firebase.repository.FirestoreRepository._verify_document_exists") as mock_verify:
        mock_verify.return_value = True # Pretend it exists
        
        # We need to mock create_trainee writing to DB
        with patch("app.firebase.repository.db"):
            payload = get_dummy_trainee()
            payload["id"] = "T2"
            payload["programme_id"] = "VALID_PROG"
            
            response = client.post("/api/trainees", json=payload)
            assert response.status_code == 201

def test_db_01_missing_reference_rejected(mock_db):
    app.dependency_overrides[get_current_user] = lambda: {"uid": "A1", "role": "admin"}
    
    with patch("app.firebase.repository.FirestoreRepository._verify_document_exists") as mock_verify:
        mock_verify.return_value = False # Missing!
        
        payload = get_dummy_trainee()
        payload["id"] = "T3"
        payload["programme_id"] = "INVALID_PROG"
        
        response = client.post("/api/trainees", json=payload)
        assert response.status_code == 422
        assert "does not exist" in response.json()["detail"]

def test_db_01_orphan_prevention_on_employment(mock_db):
    from app.schemas.trainee import TraineeEmploymentCreate
    emp = TraineeEmploymentCreate(status="EMPLOYED", employer_name="x", start_date="2025-01-01")
    with patch("app.firebase.repository.db") as mock_real_db:
        mock_doc = MagicMock()
        mock_doc.exists = False
        mock_real_db.collection.return_value.document.return_value.get.return_value = mock_doc
        
        result = FirestoreRepository.add_trainee_employment("NONEXISTENT", emp)
        assert result is None

# ==========================================
# DB-02 Remediation Tests
# ==========================================
def test_db_02_delete_programme_blocked_by_references(mock_db):
    app.dependency_overrides[get_current_user] = lambda: {"uid": "A1", "role": "admin"}
    
    with patch("app.firebase.repository.FirestoreRepository.get_programme") as mock_get_prog, \
         patch("app.firebase.repository.FirestoreRepository.get_trainees") as mock_get_trainees:
        
        mock_get_prog.return_value = {"id": "P1", "name": "Prog 1"}
        mock_get_trainees.return_value = [{"id": "T1", "programme_id": "P1"}] # Trainee reference exists
        
        response = client.delete("/api/programmes/P1")
        assert response.status_code == 409
        assert "Cannot delete entity" in response.json()["detail"]
        
def test_db_02_delete_programme_success_no_references(mock_db):
    app.dependency_overrides[get_current_user] = lambda: {"uid": "A1", "role": "admin"}
    
    with patch("app.firebase.repository.FirestoreRepository.get_programme") as mock_get_prog, \
         patch("app.firebase.repository.FirestoreRepository.get_trainees") as mock_get_trainees, \
         patch("app.firebase.repository.FirestoreRepository.delete_programme") as mock_delete:
        
        mock_get_prog.return_value = {"id": "P2", "name": "Prog 2"}
        mock_get_trainees.return_value = [] # No references
        
        response = client.delete("/api/programmes/P2")
        assert response.status_code == 204
        mock_delete.assert_called_once_with("P2")

