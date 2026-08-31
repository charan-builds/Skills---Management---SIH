import pytest
from app.ai.ml_telemetry import (
    sanitize_telemetry_payload,
    log_prediction_telemetry,
    calculate_drift_metrics,
    _LOCAL_TELEMETRY_LOG
)
from app.ai.ml_inference import FORBIDDEN_LEAKAGE_FEATURES
from fastapi.testclient import TestClient
from app.main import app
from app.auth.dependencies import get_current_user

app.dependency_overrides[get_current_user] = lambda: {"uid": "test_user"}
client = TestClient(app)

from unittest.mock import patch
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

@pytest.fixture(autouse=True)
def reset_local_telemetry():
    """Clear local telemetry array before each test and mock db."""
    import app.ai.ml_telemetry
    app.ai.ml_telemetry.db = None
    _LOCAL_TELEMETRY_LOG.clear()


def test_telemetry_sanitization_and_leakage_rejection():
    """Ensure that leakage features are actively removed from telemetry payloads."""
    dirty_input = {
        "programme_id": "PROG_001",
        "avg_skill_score": 85.0,
        "latest_salary": 45000.0,
        "retained_6m": 1,
        "wage_growth_amount": 5000.0,
        "employer_feedback": "Great"
    }
    
    clean_input = sanitize_telemetry_payload(dirty_input)
    
    assert "programme_id" in clean_input
    assert "avg_skill_score" in clean_input
    assert "latest_salary" in clean_input
    assert "retained_6m" not in clean_input
    assert "wage_growth_amount" not in clean_input
    assert "employer_feedback" not in clean_input
    
    # Ensure every forbidden feature is stripped if present
    for feature in FORBIDDEN_LEAKAGE_FEATURES:
        assert feature not in clean_input


def test_log_prediction_telemetry_execution():
    """Ensure logging successfully falls back to local and formats correctly."""
    input_data = {"programme_id": "PROG_001", "avg_skill_score": 75.0}
    output_data = {
        "prediction_version": "v1.0",
        "prediction_point": "pre_employment",
        "employment": {"probability": 0.8, "prediction": 1},
        "trajectory": {"qualitative_category": "HIGH POTENTIAL"}
    }
    
    inference_id = log_prediction_telemetry("/test/endpoint", input_data, output_data)
    
    assert inference_id is not None
    assert len(_LOCAL_TELEMETRY_LOG) == 1
    
    log_entry = _LOCAL_TELEMETRY_LOG[0]
    assert log_entry["inference_id"] == inference_id
    assert log_entry["endpoint"] == "/test/endpoint"
    assert log_entry["inputs"]["programme_id"] == "PROG_001"
    assert log_entry["prediction_version"] == "v1.0"
    assert log_entry["employment_probability"] == 0.8
    assert log_entry["trajectory_category"] == "HIGH POTENTIAL"


def test_insufficient_data_guards_for_drift():
    """Ensure drift calculation returns INSUFFICIENT_DATA when logs < 30."""
    # We cleared logs in fixture, so len should be 0
    metrics = calculate_drift_metrics()
    assert metrics["status"] == "INSUFFICIENT_DATA"
    assert "Requires at least 30" in metrics["message"]


def test_drift_calculation_execution():
    """Ensure drift calculations run successfully when data is sufficient."""
    # Seed 35 fake logs to bypass insufficient data guard
    for _ in range(35):
        log_prediction_telemetry(
            "/test",
            {"programme_id": "PROG_001", "district": "North", "avg_skill_score": 75.0},
            {"employment": {"probability": 0.85, "prediction": 1}}
        )
        
    metrics = calculate_drift_metrics()
    assert metrics["status"] in ["HEALTHY", "DRIFT_DETECTED"]
    assert metrics["sample_size"] == 35
    assert "avg_skill_score" in metrics["metrics"]
    assert "district" in metrics["metrics"]
    assert "employment_probability_distribution" in metrics["metrics"]
    assert metrics["baseline"] == "Phase 6 Synthetic Training Baseline"

