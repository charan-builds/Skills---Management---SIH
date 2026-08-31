import pytest
import pandas as pd
from app.ai.synthetic import generate_synthetic_dataset
from app.ai.ml_audit import audit_synthetic_dataset, analyze_signal

@pytest.fixture
def sample_data():
    return generate_synthetic_dataset(num_trainees=500, seed=42)

def test_audit_synthetic_dataset(sample_data):
    report = audit_synthetic_dataset(sample_data)
    
    assert "tables_analyzed" in report
    assert "record_counts" in report
    assert report["record_counts"]["trainee_df"] == 500
    
    # We should have class balance stats for employment
    assert "class_balance_employment" in report
    assert report["class_balance_employment"]["employed_count"] > 0
    assert report["class_balance_employment"]["unemployed_count"] > 0
    
def test_analyze_signal(sample_data):
    signals = analyze_signal(sample_data)
    
    assert "skill_score_to_employment_correlation" in signals
    assert "skill_score_to_salary_correlation" in signals
    
    # Check that there's no suspicious deterministic leakage 
    # (i.e., correlation should not be perfectly 1.0)
    assert signals["skill_score_to_employment_correlation"] < 0.99
    assert signals["skill_score_to_salary_correlation"] < 0.99
