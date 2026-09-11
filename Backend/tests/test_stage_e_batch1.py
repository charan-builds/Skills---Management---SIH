import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.auth.dependencies import get_current_user
from app.schemas.trainee import TraineeBase
from app.services.skill_gap_service import SkillGapService
from app.schemas.skill import SkillGapBase, SkillAssessmentBase
from app.schemas.job import RoleBenchmarkBase
from app.firebase.repository import FirestoreRepository
from pydantic import ValidationError
import os
import sys
import uuid
from datetime import datetime

os.environ["ENABLE_DEMO_MODE"] = "False"
client = TestClient(app)

@pytest.fixture(autouse=True)
def override_demo_mode():
    from app.core.config import settings
    original = settings.ENABLE_DEMO_MODE
    settings.ENABLE_DEMO_MODE = False
    yield
    settings.ENABLE_DEMO_MODE = original

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

@pytest.fixture
def mock_db():
    with patch("app.firebase.repository.db") as mock:
        yield mock

# ==========================================
# CONS-03
# ==========================================
def test_cons_03_cross_endpoint_bypass(mock_db):
    app.dependency_overrides[get_current_user] = lambda: {"uid": "emp1", "role": "employer", "organization_id": "ORG1"}
    response = client.get("/api/trainees/T1/outcome-history")
    assert response.status_code == 403

# ==========================================
# EMP-03
# ==========================================
def test_emp_03_self_report_verified_state(mock_db):
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
            "verification_state": "VERIFIED"
        }
        
        try:
            response = client.post("/api/trainees/T1/outcome", json=payload)
            assert response.status_code == 200
            args, _ = mock_add.call_args
            employment_obj = args[1]
            assert employment_obj.verification_state == "SELF_REPORTED"
        except AttributeError as e:
            # THIS IS A VULNERABILITY! The endpoint has a bug: employment.employer instead of employment.employer_name
            # We catch it to document it properly.
            pytest.fail(f"VULNERABILITY DISCOVERED in EMP-03: Application bug prevents execution - {e}")
            
# ==========================================
# FUP-02
# ==========================================
def test_fup_02_duplicate_state_flags(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = get_dummy_trainee({
        "outcomes_timeline": [{"checkpoint": "Day 0", "date": "2023-01-01", "status": "Recorded", "description": "test"}]
    })
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    app.dependency_overrides[get_current_user] = lambda: {"uid": "T1", "role": "trainee"}
    
    payload = {
        "checkpoint": "Day 0",
        "employment_status": "Employed",
        "employer_or_activity": "Self",
        "salary": "10000",
        "job_relevance": "High",
        "description": "duplicate attempt"
    }
    response = client.post("/api/trainees/T1/followup", json=payload)
    assert response.status_code == 400
    assert "already recorded" in response.json()["detail"].lower()

# ==========================================
# SKL-01, SKL-02, SKL-03
# ==========================================
def test_skl_01_unverified_skill_ignored():
    with patch("app.firebase.repository.FirestoreRepository.get_trainee") as mock_get_trainee, \
         patch("app.firebase.repository.FirestoreRepository.get_role_benchmark") as mock_get_bmk, \
         patch("app.firebase.repository.FirestoreRepository.get_trainee_assessments") as mock_get_assessments:
        
        mock_get_trainee.return_value = get_dummy_trainee({
            "target_role_id": "R1",
            "skills": ["python"] # Self-reported
        })
        mock_get_bmk.return_value = {
            "skills_required": [{"skill_id": "python", "skill_name": "python", "required_level": 3, "importance": 0.8}]
        }
        mock_get_assessments.return_value = [] # No verified assessments

        result = SkillGapService.calculate_skill_gaps("T1")
        assert result["status"] == "SUCCESS"
        gap = result["gaps"][0]
        assert gap.evidence_state == "INSUFFICIENT_SKILL_EVIDENCE"
        assert gap.gap_size is None

def test_skl_02_impossible_proficiency():
    try:
        SkillAssessmentBase(trainee_id="T1", skill_id="S1", skill_name="Python", proficiency_score=150)
        pytest.fail("Should have rejected proficiency > 100")
    except ValidationError:
        pass

def test_skl_03_unverified_recommendation():
    gap = SkillGapBase(
        skill="Python", skill_id="python", current_proficiency=None,
        required_proficiency=3, gap_size=None, priority="HIGH",
        evidence_state="INSUFFICIENT_SKILL_EVIDENCE", benchmark_source="Test"
    )
    with patch("app.firebase.repository.FirestoreRepository.get_programmes") as mock_prog:
        mock_prog.return_value = [{
            "id": "P1", "name": "Python Bootcamp", "provider": "TechPro",
            "skills_taught_structured": [{"skill_id": "python", "target_level": 4}]
        }]
        recs = SkillGapService.generate_recommendations([gap])
        assert len(recs) == 1
        assert recs[0].expected_impact == 0

# ==========================================
# BMK-02, BMK-03
# ==========================================
def test_bmk_02_invalid_proficiency():
    try:
        RoleBenchmarkBase(id="R1", title="test", role="test", industry="test", 
                          skills_required=[{"skill_id": "S1", "skill_name": "x", "required_level": -1, "importance": 0.5}])
        pytest.fail("Should have rejected proficiency < 1")
    except ValidationError:
        pass

def test_bmk_03_missing_role_reference():
    try:
        RoleBenchmarkBase(title="test", role="test", industry="test", skills_required=[{"skill_id": "S1", "skill_name": "x", "required_level": 3, "importance": 0.5}])
        pytest.fail("Should have rejected missing id")
    except ValidationError:
        pass

# ==========================================
# REC-02, REC-03
# ==========================================
def test_rec_02_no_matching_programme():
    gap = SkillGapBase(
        skill="Rust", skill_id="rust", current_proficiency=1,
        required_proficiency=3, gap_size=2, priority="HIGH",
        evidence_state="VERIFIED_ASSESSMENT", benchmark_source="Test"
    )
    with patch("app.firebase.repository.FirestoreRepository.get_programmes") as mock_prog:
        mock_prog.return_value = [{
            "id": "P1", "name": "Python Bootcamp", "provider": "TechPro",
            "skills_taught_structured": [{"skill_id": "python", "target_level": 4}]
        }]
        recs = SkillGapService.generate_recommendations([gap])
        assert len(recs) == 1
        assert recs[0].state == "NO_MATCHING_PROGRAMME"
        assert recs[0].expected_impact is None

def test_rec_03_consent_block():
    app.dependency_overrides[get_current_user] = lambda: {"uid": "emp1", "role": "employer", "organization_id": "ORG1"}
    # Because there is no /recommendations route, we hit the generic profile route which would contain any recommendation data or access to it
    response = client.get("/api/trainees/T1")
    assert response.status_code == 403

# ==========================================
# DB-01
# ==========================================
def test_db_01_orphan_write():
    with patch("app.firebase.repository.db") as mock_db:
        mock_doc = MagicMock()
        mock_doc.exists = False
        mock_db.collection.return_value.document.return_value.get.return_value = mock_doc
        
        from app.schemas.trainee import TraineeEmploymentCreate
        emp = TraineeEmploymentCreate(status="EMPLOYED", employer_name="x", role="y", start_date="2025-01-01", verification_state="SELF_REPORTED")
        
        # Calling add_trainee_employment should safely return None when trainee is missing, avoiding orphan writes
        result = FirestoreRepository.add_trainee_employment("NONEXISTENT", emp)
        assert result is None
