import pytest
import math
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from app.ai.synthetic import generate_synthetic_dataset
from app.ai.features import engineer_features
from app.ai.ml_dataset import build_employment_dataset
from app.ai.ml_experiments import get_model_feature_importance
from app.ai.ml_tuning import (
    run_hyperparameter_tuning,
    compare_tuned_models,
    select_best_tuned_model,
    evaluate_final_holdout
)

@pytest.fixture(scope="module")
def dataset_split():
    raw_dfs = generate_synthetic_dataset(num_trainees=500, seed=42)
    engineered = engineer_features(raw_dfs)
    X, y, meta = build_employment_dataset(engineered, raw_dfs)
    
    # 80/20 train/test split with fixed random_state and stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    return X_train, X_test, y_train, y_test, meta

def test_hyperparameter_search_uses_only_train(dataset_split):
    X_train, X_test, y_train, y_test, meta = dataset_split
    
    # Run tuning strictly on X_train, y_train
    results = run_hyperparameter_tuning(X_train, y_train, meta)
    
    assert len(results) == 5
    model_names = [r["model_name"] for r in results]
    assert "Dummy" in model_names
    assert "LogisticRegression" in model_names
    assert "DecisionTree" in model_names
    assert "RandomForest" in model_names
    assert "GradientBoosting" in model_names
    
    for r in results:
        assert "best_params" in r
        assert "cv_mean_roc_auc" in r
        assert "cv_std_roc_auc" in r
        assert "train_cv_gap" in r
        assert not math.isnan(r["cv_mean_roc_auc"])
        assert 0.0 <= r["cv_mean_roc_auc"] <= 1.0
        # Verify no test metrics were generated during tuning
        assert "test_roc_auc" not in r
        assert "test_accuracy" not in r

def test_model_selection_uses_only_cv_metrics(dataset_split):
    X_train, X_test, y_train, y_test, meta = dataset_split
    results = run_hyperparameter_tuning(X_train, y_train, meta)
    
    comp_df = compare_tuned_models(results)
    assert len(comp_df) == 5
    assert "CV Mean ROC-AUC" in comp_df.columns
    assert comp_df.iloc[0]["CV Mean ROC-AUC"] >= comp_df.iloc[1]["CV Mean ROC-AUC"]
    
    # Deterministic selection based on CV metrics
    best = select_best_tuned_model(results, max_overfit_gap=0.08)
    assert best["model_name"] != "Dummy"
    assert "best_pipeline" in best
    assert "cv_mean_roc_auc" in best

def test_final_holdout_evaluation_occurs_after_selection(dataset_split):
    X_train, X_test, y_train, y_test, meta = dataset_split
    results = run_hyperparameter_tuning(X_train, y_train, meta)
    best = select_best_tuned_model(results)
    
    # Evaluate holdout test set exactly once after model selection
    holdout = evaluate_final_holdout(
        best["best_pipeline"],
        X_train,
        y_train,
        X_test,
        y_test
    )
    
    assert "test_roc_auc" in holdout
    assert "test_accuracy" in holdout
    assert "test_precision" in holdout
    assert "test_recall" in holdout
    assert "test_f1" in holdout
    assert "confusion_matrix" in holdout
    assert len(holdout["confusion_matrix"]) == 2
    
    # Check predictions length
    assert len(holdout["y_pred"]) == len(X_test)
    assert len(holdout["y_prob"]) == len(X_test)
    assert np.all((holdout["y_prob"] >= 0.0) & (holdout["y_prob"] <= 1.0))

def test_tuning_determinism(dataset_split):
    X_train, X_test, y_train, y_test, meta = dataset_split
    
    res1 = run_hyperparameter_tuning(X_train, y_train, meta)
    res2 = run_hyperparameter_tuning(X_train, y_train, meta)
    
    for r1, r2 in zip(res1, res2):
        assert r1["best_params"] == r2["best_params"]
        assert r1["cv_mean_roc_auc"] == r2["cv_mean_roc_auc"]
        assert r1["cv_mean_f1"] == r2["cv_mean_f1"]

def test_feature_importance_on_selected_model(dataset_split):
    X_train, X_test, y_train, y_test, meta = dataset_split
    results = run_hyperparameter_tuning(X_train, y_train, meta)
    best = select_best_tuned_model(results)
    
    # Extract feature importances
    importances = get_model_feature_importance(best["best_pipeline"], meta)
    assert not importances.empty
    assert "feature" in importances.columns
    assert "importance" in importances.columns
