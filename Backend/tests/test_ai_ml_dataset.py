import pytest
from app.ai.synthetic import generate_synthetic_dataset
from app.ai.features import engineer_features
from app.ai.ml_dataset import build_employment_dataset, build_salary_dataset, build_retention_dataset

@pytest.fixture
def sample_data():
    raw_dfs = generate_synthetic_dataset(num_trainees=500, seed=42)
    engineered = engineer_features(raw_dfs)
    return raw_dfs, engineered

def test_build_employment_dataset(sample_data):
    raw_dfs, engineered = sample_data
    X, y, meta = build_employment_dataset(engineered, raw_dfs)
    
    assert not X.empty
    assert len(X) == len(y)
    assert meta["target"] == "is_employed"
    
    # Check Leakage Exclusions
    assert "salary" not in X.columns
    assert "retained_6m" not in X.columns
    assert "is_employed" not in X.columns
    assert "trainee_id" not in X.columns

def test_build_salary_dataset(sample_data):
    raw_dfs, engineered = sample_data
    X, y, meta = build_salary_dataset(engineered, raw_dfs)
    
    assert not X.empty
    assert len(X) == len(y)
    assert meta["target"] == "latest_salary"
    
    # Salary should only contain employed people
    emp_count = engineered["employment_features"]["is_employed"].sum()
    assert len(X) == emp_count
    
    assert "latest_salary" not in X.columns
    assert "retained_6m" not in X.columns
    
def test_build_retention_dataset(sample_data):
    raw_dfs, engineered = sample_data
    X, y, meta = build_retention_dataset(engineered, raw_dfs)
    
    assert not X.empty
    assert len(X) == len(y)
    assert meta["target"] == "retained_6m"
    
    # Check that safe features exist
    assert "latest_salary" in X.columns  
    
    # Check leakage
    assert "retained_6m" not in X.columns
    assert "retained_12m" not in X.columns
