import pytest
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.dummy import DummyClassifier

from app.ai.synthetic import generate_synthetic_dataset
from app.ai.features import engineer_features
from app.ai.ml_dataset import build_retention_dataset
from app.ai.ml_retention import (
    SAFE_FEATURES,
    EXCLUDED_FEATURES,
    build_retention_experiment,
    evaluate_retention_models,
    tune_retention_models,
    select_best_retention_model,
    evaluate_retention_holdout,
    get_retention_feature_importance,
    analyze_retention_errors
)


@pytest.fixture(scope="module")
def retention_experiment_data():
    """Generates synthetic dataset and prepares retention experiment partitions."""
    raw_dfs = generate_synthetic_dataset(num_trainees=500, seed=42)
    engineered_features = engineer_features(raw_dfs)
    experiment = build_retention_experiment(raw_dfs, engineered_features, test_size=0.2, random_state=42)
    return raw_dfs, engineered_features, experiment


def test_retention_dataset_schema_and_target_binary(retention_experiment_data):
    """Verifies retention target exists, is binary (0/1), and non-null."""
    _, _, experiment = retention_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    
    assert not X_train.empty, "X_train should not be empty"
    assert not y_train.empty, "y_train should not be empty"
    assert pd.api.types.is_integer_dtype(y_train), "Target y must be integer"
    assert set(np.unique(y_train)).issubset({0, 1}), "Target must only contain {0, 1}"
    assert y_train.isna().sum() == 0, "Target must not contain NaNs"


def test_retention_leakage_and_hidden_variable_exclusion(retention_experiment_data):
    """Verifies post-retention fields and synthetic generator hidden variables are excluded, while pre-retention latest_salary is included."""
    _, _, experiment = retention_experiment_data
    X_train = experiment["X_train"]
    X_test = experiment["X_test"]
    
    for feature in EXCLUDED_FEATURES:
        assert feature not in X_train.columns, f"Leakage/hidden feature '{feature}' detected in X_train"
        assert feature not in X_test.columns, f"Leakage/hidden feature '{feature}' detected in X_test"
        
    for safe_col in ["programme_id", "district", "avg_skill_score", "total_assessments", "latest_salary"]:
        assert safe_col in X_train.columns, f"Safe feature '{safe_col}' missing from X_train"


def test_retention_train_test_split_determinism_and_isolation(retention_experiment_data):
    """Verifies stratified split determinism and that test partition remains strictly separated."""
    raw_dfs, engineered_features, experiment1 = retention_experiment_data
    experiment2 = build_retention_experiment(raw_dfs, engineered_features, test_size=0.2, random_state=42)
    
    pd.testing.assert_frame_equal(experiment1["X_train"], experiment2["X_train"])
    pd.testing.assert_frame_equal(experiment1["X_test"], experiment2["X_test"])
    pd.testing.assert_series_equal(experiment1["y_train"], experiment2["y_train"])
    pd.testing.assert_series_equal(experiment1["y_test"], experiment2["y_test"])
    
    train_idx = set(experiment1["X_train"].index)
    test_idx = set(experiment1["X_test"].index)
    assert train_idx.isdisjoint(test_idx), "Train and test index partitions must be strictly disjoint"


def test_all_retention_models_execution_and_metrics_validity(retention_experiment_data):
    """Verifies all 5 model families execute on train set and return valid CV metrics."""
    _, _, experiment = retention_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    metadata = experiment["metadata"]
    
    results = evaluate_retention_models(X_train, y_train, metadata, cv_splits=3, random_state=42)
    
    expected_models = {
        "DummyClassifier", "LogisticRegression", "DecisionTreeClassifier",
        "RandomForestClassifier", "GradientBoostingClassifier"
    }
    evaluated_models = {r["model_name"] for r in results}
    assert expected_models.issubset(evaluated_models), f"Missing models: {expected_models - evaluated_models}"
    
    for res in results:
        assert 0.0 <= res["cv_mean_roc_auc"] <= 1.0, f"CV ROC-AUC out of bounds for {res['model_name']}"
        assert 0.0 <= res["cv_mean_accuracy"] <= 1.0, f"CV Accuracy out of bounds for {res['model_name']}"
        assert not np.isnan(res["cv_mean_roc_auc"]), f"CV ROC-AUC is NaN for {res['model_name']}"


def test_model_selection_uses_only_cv_metrics(retention_experiment_data):
    """Verifies model selection ranks models solely based on CV results and guards against overfitting."""
    mock_tuning_results = [
        {
            "model_name": "DummyClassifier",
            "cv_mean_roc_auc": 0.50,
            "cv_std_roc_auc": 0.0,
            "cv_mean_f1": 0.0,
            "train_cv_gap": 0.0
        },
        {
            "model_name": "DecisionTreeClassifier",
            "cv_mean_roc_auc": 0.85,
            "cv_std_roc_auc": 0.04,
            "cv_mean_f1": 0.75,
            "train_cv_gap": 0.15  # overfit > 0.08
        },
        {
            "model_name": "GradientBoostingClassifier",
            "cv_mean_roc_auc": 0.82,
            "cv_std_roc_auc": 0.02,
            "cv_mean_f1": 0.78,
            "train_cv_gap": 0.04  # healthy <= 0.08
        }
    ]
    
    # Should choose GradientBoostingClassifier because DecisionTree violates max_train_cv_gap (0.15 > 0.08)
    best = select_best_retention_model(mock_tuning_results, max_train_cv_gap=0.08)
    assert best["model_name"] == "GradientBoostingClassifier"


def test_holdout_evaluation_and_confusion_matrix_invariants(retention_experiment_data):
    """Verifies holdout evaluation satisfies TP+TN+FP+FN == N_test and probability bounds [0, 1]."""
    _, _, experiment = retention_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    X_test = experiment["X_test"]
    y_test = experiment["y_test"]
    metadata = experiment["metadata"]
    
    pipeline = evaluate_retention_models(X_train, y_train, metadata, cv_splits=3)[1]["pipeline"]
    eval_res = evaluate_retention_holdout(pipeline, X_train, y_train, X_test, y_test)
    
    assert "test_roc_auc" in eval_res
    assert "confusion_matrix" in eval_res
    
    cm = eval_res["confusion_matrix"]
    assert cm["TP"] + cm["TN"] + cm["FP"] + cm["FN"] == len(X_test)
    
    preds_df = eval_res["predictions_df"]
    assert (preds_df["predicted_probability"] >= 0.0).all()
    assert (preds_df["predicted_probability"] <= 1.0).all()


def test_retention_feature_importance_mapping(retention_experiment_data):
    """Verifies feature importance mapping extracts transformed feature names for linear and tree models."""
    _, _, experiment = retention_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    metadata = experiment["metadata"]
    
    results = evaluate_retention_models(X_train, y_train, metadata, cv_splits=3)
    lr_pipeline = next(r["pipeline"] for r in results if r["model_name"] == "LogisticRegression")
    rf_pipeline = next(r["pipeline"] for r in results if r["model_name"] == "RandomForestClassifier")
    
    lr_imp = get_retention_feature_importance(lr_pipeline)
    assert not lr_imp.empty
    assert "feature_name" in lr_imp.columns
    assert "importance" in lr_imp.columns
    assert "direction" in lr_imp.columns
    
    rf_imp = get_retention_feature_importance(rf_pipeline)
    assert not rf_imp.empty
    assert (rf_imp["importance"] >= 0).all(), "Tree feature importances must be non-negative"


def test_retention_error_analysis_and_insufficient_data(retention_experiment_data):
    """Verifies error analysis correctly calculates salary bands, skill tiers, and guards with INSUFFICIENT_DATA."""
    _, _, experiment = retention_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    X_test = experiment["X_test"]
    y_test = experiment["y_test"]
    metadata = experiment["metadata"]
    
    pipeline = evaluate_retention_models(X_train, y_train, metadata, cv_splits=3)[1]["pipeline"]
    eval_res = evaluate_retention_holdout(pipeline, X_train, y_train, X_test, y_test)
    preds_df = eval_res["predictions_df"]
    
    analysis = analyze_retention_errors(preds_df, metadata, min_subgroup_size=5)
    
    assert "uncertainty_analysis" in analysis
    assert "salary_bands" in analysis
    assert "skill_tiers" in analysis
    assert "programmes" in analysis
    assert "districts" in analysis
    
    # Test insufficient data handling on a tiny slice
    tiny_df = preds_df.head(3)
    tiny_analysis = analyze_retention_errors(tiny_df, metadata, min_subgroup_size=5)
    for band_info in tiny_analysis["salary_bands"].values():
        assert band_info["status"] == "INSUFFICIENT_DATA"
