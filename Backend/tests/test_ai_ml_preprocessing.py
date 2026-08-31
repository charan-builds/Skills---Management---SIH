import pytest
from app.ai.synthetic import generate_synthetic_dataset
from app.ai.features import engineer_features
from app.ai.ml_dataset import build_employment_dataset, build_salary_dataset
from app.ai.ml_preprocessing import run_classification_baseline, run_regression_baseline

@pytest.fixture
def sample_data():
    raw_dfs = generate_synthetic_dataset(num_trainees=500, seed=42)
    engineered = engineer_features(raw_dfs)
    return raw_dfs, engineered

def test_employment_classification_baseline(sample_data):
    raw_dfs, engineered = sample_data
    X, y, meta = build_employment_dataset(engineered, raw_dfs)
    
    results = run_classification_baseline(X, y, meta)
    
    assert "dummy_accuracy" in results
    assert "logistic_accuracy" in results
    assert "roc_auc" in results
    assert "cv_mean_accuracy" in results
    
    # Ensure train and test sets were split 80/20
    assert results["train_size"] == 400
    assert results["test_size"] == 100

def test_salary_regression_baseline(sample_data):
    raw_dfs, engineered = sample_data
    X, y, meta = build_salary_dataset(engineered, raw_dfs)
    
    # This might have less than 500 rows because not everyone is employed
    results = run_regression_baseline(X, y, meta)
    
    assert "dummy_mae" in results
    assert "linear_mae" in results
    assert "linear_r2" in results
    assert "cv_mean_r2" in results
