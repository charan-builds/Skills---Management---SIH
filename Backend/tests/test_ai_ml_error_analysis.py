import pytest
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from app.ai.synthetic import generate_synthetic_dataset
from app.ai.features import engineer_features
from app.ai.ml_dataset import build_employment_dataset
from app.ai.ml_tuning import (
    run_hyperparameter_tuning,
    select_best_tuned_model,
    evaluate_final_holdout
)
from app.ai.ml_error_analysis import (
    categorize_test_predictions,
    analyze_errors_and_subgroups
)

@pytest.fixture(scope="module")
def evaluated_holdout():
    raw_dfs = generate_synthetic_dataset(num_trainees=500, seed=42)
    engineered = engineer_features(raw_dfs)
    X, y, meta = build_employment_dataset(engineered, raw_dfs)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    tuning_results = run_hyperparameter_tuning(X_train, y_train, meta)
    best_model = select_best_tuned_model(tuning_results)
    
    holdout = evaluate_final_holdout(
        best_model["best_pipeline"],
        X_train,
        y_train,
        X_test,
        y_test
    )
    return X_test, y_test, holdout["y_pred"], holdout["y_prob"]

def test_categorize_test_predictions_invariants(evaluated_holdout):
    X_test, y_test, y_pred, y_prob = evaluated_holdout
    original_cols = list(X_test.columns)
    
    analyzed_df = categorize_test_predictions(X_test, y_test, y_pred, y_prob)
    
    # 1. Immutability check: X_test columns unchanged
    assert list(X_test.columns) == original_cols
    assert "error_category" not in X_test.columns
    
    # 2. Invariant check: counts sum to total test length
    counts = analyzed_df["error_category"].value_counts().to_dict()
    total_categorized = sum(counts.values())
    assert total_categorized == len(X_test)
    
    # 3. Valid categories
    valid_categories = {"TP", "TN", "FP", "FN"}
    assert set(counts.keys()).issubset(valid_categories)
    
    # 4. Borderline uncertainty check
    borderline_mask = (analyzed_df["y_prob"] >= 0.40) & (analyzed_df["y_prob"] <= 0.60)
    assert (analyzed_df["is_borderline"] == borderline_mask.astype(int)).all()

def test_analyze_errors_and_subgroups_structure(evaluated_holdout):
    X_test, y_test, y_pred, y_prob = evaluated_holdout
    analyzed_df = categorize_test_predictions(X_test, y_test, y_pred, y_prob)
    
    report = analyze_errors_and_subgroups(analyzed_df, min_subgroup_size=5)
    
    assert "summary" in report
    summary = report["summary"]
    assert summary["tp"] + summary["tn"] + summary["fp"] + summary["fn"] == len(X_test)
    assert summary["total_errors"] == summary["fp"] + summary["fn"]
    assert 0.0 <= summary["overall_error_rate"] <= 1.0
    
    assert "skill_score_stats_by_category" in report
    assert "skill_proficiency_brackets" in report
    assert "programme_analysis" in report
    assert "district_analysis" in report
    assert "probability_uncertainty" in report
    
    # Probability distribution stats check
    prob_stats = report["probability_uncertainty"]
    assert 0.0 <= prob_stats["min_prob"] <= prob_stats["max_prob"] <= 1.0
    assert 0.0 <= prob_stats["borderline_pct"] <= 1.0

def test_insufficient_data_handling(evaluated_holdout):
    X_test, y_test, y_pred, y_prob = evaluated_holdout
    analyzed_df = categorize_test_predictions(X_test, y_test, y_pred, y_prob)
    
    # Set threshold very high to trigger INSUFFICIENT_DATA
    high_threshold_report = analyze_errors_and_subgroups(analyzed_df, min_subgroup_size=1000)
    
    # All subgroups should report INSUFFICIENT_DATA
    for prog, data in high_threshold_report["programme_analysis"].items():
        assert data["status"] == "INSUFFICIENT_DATA"
    for dist, data in high_threshold_report["district_analysis"].items():
        assert data["status"] == "INSUFFICIENT_DATA"
