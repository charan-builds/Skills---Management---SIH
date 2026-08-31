import pytest
from app.ai.service import AIService, clean_nan
import numpy as np
import math
from unittest.mock import patch

def test_clean_nan():
    data = {
        "valid": 10.5,
        "missing": np.nan,
        "inf": np.inf,
        "nested": [1.0, math.nan],
        "string": "test"
    }
    
    cleaned = clean_nan(data)
    assert cleaned["valid"] == 10.5
    assert cleaned["missing"] is None
    assert cleaned["inf"] is None
    assert cleaned["nested"][0] == 1.0
    assert cleaned["nested"][1] is None
    assert cleaned["string"] == "test"

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
        # Reset AIService cache so it uses mocked data
        AIService._cached_intel = None
        AIService._cached_features = None
        yield

def test_service_initialization_and_pipeline():
    intel, features = AIService.process_intelligence()
    
    assert "outcome_diagnosis" in intel
    assert "programme_intelligence" in intel
    assert "personal_skill_intelligence" in intel
    
    assert isinstance(intel, dict)

def test_get_trainee_skills():
    res = AIService.get_trainee_skills("T1")
    assert isinstance(res, list)

def test_get_programme_diagnosis():
    res = AIService.get_programme_diagnosis("P1")
    assert isinstance(res, list)
    
def test_get_programme_diagnosis_invalid():
    res = AIService.get_programme_diagnosis("INVALID_PROG")
    assert res[0]["issue"] == "INSUFFICIENT_DATA"

def test_get_programme_overview():
    res = AIService.get_programme_overview("P1")
    assert "final_impact_score" in res or "error" in res

def test_simulate_scenario():
    req = {
        "type": "increase_target_proficiency",
        "params": {
            "programme_id": "P1",
            "skill_id": "S1",
            "increase_amount": 10
        }
    }
    res = AIService.simulate_scenario(req)
    assert isinstance(res, dict)

