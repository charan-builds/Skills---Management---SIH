import pytest
import math
import pandas as pd
from app.ai.synthetic import generate_synthetic_dataset
from app.ai.features import engineer_features
from app.ai.ml_dataset import build_employment_dataset
from app.ai.ml_experiments import (
    run_employment_experiments, 
    compare_models, 
    select_best_model, 
    get_model_feature_importance
)

@pytest.fixture(scope="module")
def sample_data():
    raw_dfs = generate_synthetic_dataset(num_trainees=500, seed=42)
    engineered = engineer_features(raw_dfs)
    X, y, meta = build_employment_dataset(engineered, raw_dfs)
    return X, y, meta

def test_leakage_and_target(sample_data):
    X, y, meta = sample_data
    assert meta["target"] == "is_employed"
    assert "salary" not in X.columns
    assert "retained_6m" not in X.columns
    assert "is_employed" not in X.columns

def test_run_employment_experiments_schema_and_metrics(sample_data):
    X, y, meta = sample_data
    results = run_employment_experiments(X, y, meta)
    
    assert len(results) == 5
    
    model_names = [r["model_name"] for r in results]
    assert "Dummy" in model_names
    assert "LogisticRegression" in model_names
    assert "RandomForest" in model_names
    
    for r in results:
        # Schema checks
        assert "test_roc_auc" in r
        assert "train_val_gap" in r
        assert "confusion_matrix" in r
        assert "pipeline" in r
        
        # Finite metric checks
        assert not math.isnan(r["test_roc_auc"])
        assert not math.isnan(r["test_accuracy"])
        assert not math.isinf(r["cv_mean_roc_auc"])
        
        # Binary ROC-AUC boundary
        assert 0.0 <= r["test_roc_auc"] <= 1.0

def test_experiment_reproducibility(sample_data):
    X, y, meta = sample_data
    
    # Run twice
    res1 = run_employment_experiments(X, y, meta)
    res2 = run_employment_experiments(X, y, meta)
    
    for r1, r2 in zip(res1, res2):
        assert r1["test_roc_auc"] == r2["test_roc_auc"]
        assert r1["test_f1"] == r2["test_f1"]

def test_model_comparison_and_selection(sample_data):
    X, y, meta = sample_data
    results = run_employment_experiments(X, y, meta)
    
    df = compare_models(results)
    assert len(df) == 5
    assert list(df.columns) == ["Model", "Test ROC-AUC", "CV ROC-AUC", "Train-Val Gap", "Test F1", "Test Precision", "Test Recall"]
    
    # Ensure it's sorted by Test ROC-AUC descending
    assert df.iloc[0]["Test ROC-AUC"] >= df.iloc[1]["Test ROC-AUC"]
    
    # Selection deterministic
    best = select_best_model(results, max_overfit_gap=0.05)
    assert best["model_name"] is not None
    assert best["train_val_gap"] <= 0.05 or best["train_val_gap"] == min([r["train_val_gap"] for r in results])

def test_feature_importance_extraction(sample_data):
    X, y, meta = sample_data
    results = run_employment_experiments(X, y, meta)
    
    # Test LogisticRegression (coef_)
    lr_res = next(r for r in results if r["model_name"] == "LogisticRegression")
    lr_importances = get_model_feature_importance(lr_res["pipeline"], meta)
    assert not lr_importances.empty
    assert "feature" in lr_importances.columns
    assert "importance" in lr_importances.columns
    
    # Test RandomForest (feature_importances_)
    rf_res = next(r for r in results if r["model_name"] == "RandomForest")
    rf_importances = get_model_feature_importance(rf_res["pipeline"], meta)
    assert not rf_importances.empty
    
    # Test Dummy (None)
    dummy_res = next(r for r in results if r["model_name"] == "Dummy")
    dummy_importances = get_model_feature_importance(dummy_res["pipeline"], meta)
    assert dummy_importances.empty
