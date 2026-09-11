import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth.dependencies import get_current_user
from app.ai.ml_inference import (
    load_inference_models,
    validate_prediction_input,
    predict_employment,
    predict_salary,
    predict_retention,
    generate_trajectory_prediction,
    FORBIDDEN_LEAKAGE_FEATURES
)

from unittest.mock import patch
from app.ai.service import AIService

def mock_get_current_user():
    return {"uid": "test_user", "email": "test@example.com", "role": "admin"}

app.dependency_overrides[get_current_user] = mock_get_current_user
client = TestClient(app)

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


@pytest.fixture(scope="module")
def models_bundle():
    """Initializes and caches the multi-model inference bundle."""
    return load_inference_models(force_reload=False)


def test_load_inference_models_and_caching(models_bundle):
    """Verifies that all three pipelines are loaded, cached, and contain metadata."""
    assert "employment_pipeline" in models_bundle
    assert "salary_pipeline" in models_bundle
    assert "retention_pipeline" in models_bundle
    assert "metadata" in models_bundle
    assert models_bundle["metadata"]["synthetic_data"] is True


def test_validate_prediction_input_success_and_failures():
    """Verifies validation catches missing fields and out-of-bounds values."""
    valid_input = {
        "programme_id": "PROG_001",
        "district": "North",
        "avg_skill_score": 75.5,
        "total_assessments": 4
    }
    is_valid, errors = validate_prediction_input(valid_input)
    assert is_valid is True
    assert len(errors) == 0

    # Missing required field
    invalid_input = {"programme_id": "PROG_001", "district": "North"}
    is_valid, errors = validate_prediction_input(invalid_input)
    assert is_valid is False
    assert any("avg_skill_score" in e for e in errors)

    # Score out of bounds
    out_of_bounds = {**valid_input, "avg_skill_score": 150.0}
    is_valid, errors = validate_prediction_input(out_of_bounds)
    assert is_valid is False
    assert any("must be between 0.0 and 100.0" in e for e in errors)


def test_validate_prediction_input_leakage_rejection():
    """Verifies that every forbidden leakage field is actively caught and rejected."""
    base_input = {
        "programme_id": "PROG_001",
        "district": "North",
        "avg_skill_score": 75.5,
        "total_assessments": 4
    }
    for forbidden in FORBIDDEN_LEAKAGE_FEATURES:
        dirty_input = {**base_input, forbidden: 100}
        is_valid, errors = validate_prediction_input(dirty_input)
        assert is_valid is False, f"Forbidden leakage field '{forbidden}' was not rejected"
        assert any("Forbidden leakage" in e for e in errors)


def test_predict_employment_execution_and_schema(models_bundle):
    """Verifies pre-employment inference returns probability, prediction, and explanations."""
    input_data = {
        "programme_id": "PROG_001",
        "district": "North",
        "avg_skill_score": 82.0,
        "total_assessments": 5
    }
    result = predict_employment(input_data, models_bundle)
    
    assert 0.0 <= result["probability"] <= 1.0
    assert result["prediction"] in (0, 1)
    assert result["confidence_band"] in ("LOW_PROBABILITY", "HIGH_UNCERTAINTY_REVIEW_RECOMMENDED", "HIGH_PROBABILITY")
    assert result["prediction_point"] == "pre_employment"
    assert len(result["explanations"]) > 0
    assert any("causal effect" in e.lower() for e in result["explanations"])
    assert "provenance" in result


def test_predict_salary_execution_and_schema(models_bundle):
    """Verifies salary inference returns valid continuous estimate and uncertainty warning."""
    input_data = {
        "programme_id": "PROG_001",
        "district": "North",
        "avg_skill_score": 82.0,
        "total_assessments": 5
    }
    result = predict_salary(input_data, models_bundle)
    
    assert isinstance(result["predicted_salary"], (int, float))
    assert result["predicted_salary"] >= 0.0
    assert result["prediction_context"] == "conditional_on_placement"
    assert "residual uncertainty" in result["warning"]
    assert len(result["explanations"]) > 0


def test_predict_retention_requires_salary_and_executes(models_bundle):
    """Verifies retention inference rejects missing salary and executes when salary is present."""
    input_data_no_salary = {
        "programme_id": "PROG_001",
        "district": "North",
        "avg_skill_score": 82.0,
        "total_assessments": 5
    }
    with pytest.raises(ValueError, match="latest_salary"):
        predict_retention(input_data_no_salary, models_bundle)

    input_data_with_salary = {**input_data_no_salary, "latest_salary": 38000.0}
    result = predict_retention(input_data_with_salary, models_bundle)
    
    assert 0.0 <= result["probability"] <= 1.0
    assert result["prediction"] in (0, 1)
    assert result["prediction_context"] == "conditional_on_placement_and_salary"
    assert len(result["explanations"]) > 0


def test_generate_trajectory_prediction_pre_employment_state(models_bundle):
    """Verifies State A (Pre-Employment): retention is marked unavailable, employment & salary estimated."""
    input_data = {
        "programme_id": "PROG_001",
        "district": "North",
        "avg_skill_score": 82.0,
        "total_assessments": 5
    }
    trajectory = generate_trajectory_prediction(input_data, models_bundle)
    
    assert trajectory["prediction_point"] == "pre_employment"
    assert trajectory["employment"]["probability"] is not None
    assert trajectory["salary"]["available"] is True
    assert trajectory["salary"]["predicted_salary"] > 0
    assert trajectory["retention"]["available"] is False
    assert trajectory["retention"]["probability"] is None
    assert trajectory["trajectory"]["qualitative_category"] in (
        "HIGH POTENTIAL", "MODERATE POTENTIAL", "LOW POTENTIAL", "HUMAN REVIEW"
    )


def test_generate_trajectory_prediction_post_placement_state(models_bundle):
    """Verifies State B (Post-Placement): retention is evaluated with known starting salary."""
    input_data = {
        "programme_id": "PROG_001",
        "district": "North",
        "avg_skill_score": 88.0,
        "total_assessments": 6,
        "latest_salary": 42000.0
    }
    trajectory = generate_trajectory_prediction(input_data, models_bundle)
    
    assert trajectory["prediction_point"] == "post_placement"
    assert trajectory["employment"]["probability"] is not None
    assert trajectory["salary"]["known_salary"] == 42000.0
    assert trajectory["retention"]["available"] is True
    assert 0.0 <= trajectory["retention"]["probability"] <= 1.0
    assert trajectory["trajectory"]["stage"] == "Placed & Active"



