import pytest
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge

from app.ai.synthetic import generate_synthetic_dataset
from app.ai.features import engineer_features
from app.ai.ml_dataset import build_salary_dataset
from app.ai.ml_salary import (
    SAFE_FEATURES,
    EXCLUDED_FEATURES,
    build_salary_regression_experiment,
    evaluate_regression_models,
    tune_regression_models,
    select_best_regression_model,
    evaluate_salary_holdout,
    get_regression_feature_importance,
    analyze_salary_errors
)


@pytest.fixture(scope="module")
def salary_experiment_data():
    """Generates synthetic dataset and prepares salary regression experiment partitions."""
    raw_dfs = generate_synthetic_dataset(num_trainees=500, seed=42)
    engineered_features = engineer_features(raw_dfs)
    experiment = build_salary_regression_experiment(raw_dfs, engineered_features, test_size=0.2, random_state=42)
    return raw_dfs, engineered_features, experiment


def test_salary_dataset_schema_and_target_numeric(salary_experiment_data):
    """1, 2, 18: Verifies salary target exists, is numeric, positive, and empty/missing cases handled safely."""
    raw_dfs, engineered_features, experiment = salary_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    
    assert not X_train.empty, "X_train should not be empty"
    assert not y_train.empty, "y_train should not be empty"
    assert pd.api.types.is_numeric_dtype(y_train), "Target y must be numeric"
    assert (y_train > 0).all(), "All salaries for employed candidates must be positive"
    assert y_train.isna().sum() == 0, "There should be no NaN values in the salary target"


def test_salary_leakage_and_hidden_variable_exclusion(salary_experiment_data):
    """3, 4: Verifies post-salary leakage fields and synthetic generator hidden variables are strictly excluded from X."""
    _, _, experiment = salary_experiment_data
    X_train = experiment["X_train"]
    X_test = experiment["X_test"]
    
    for feature in EXCLUDED_FEATURES:
        assert feature not in X_train.columns, f"Leakage/hidden feature '{feature}' detected in X_train"
        assert feature not in X_test.columns, f"Leakage/hidden feature '{feature}' detected in X_test"
        
    for safe_col in ["programme_id", "district", "avg_skill_score", "total_assessments"]:
        assert safe_col in X_train.columns, f"Safe feature '{safe_col}' missing from X_train"


def test_salary_train_test_split_determinism_and_isolation(salary_experiment_data):
    """5, 6: Verifies split determinism and that test partition remains strictly separated."""
    raw_dfs, engineered_features, experiment1 = salary_experiment_data
    experiment2 = build_salary_regression_experiment(raw_dfs, engineered_features, test_size=0.2, random_state=42)
    
    pd.testing.assert_frame_equal(experiment1["X_train"], experiment2["X_train"])
    pd.testing.assert_frame_equal(experiment1["X_test"], experiment2["X_test"])
    pd.testing.assert_series_equal(experiment1["y_train"], experiment2["y_train"])
    pd.testing.assert_series_equal(experiment1["y_test"], experiment2["y_test"])
    
    # Ensure test indices are completely disjoint from train indices
    train_idx = set(experiment1["X_train"].index)
    test_idx = set(experiment1["X_test"].index)
    assert train_idx.isdisjoint(test_idx), "Train and test index partitions must be strictly disjoint"


def test_all_regression_models_execution_and_metrics_validity(salary_experiment_data):
    """7, 8, 9, 10, 11, 12, 13: Verifies all 6 model families execute on train set and return valid CV metrics."""
    _, _, experiment = salary_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    metadata = experiment["metadata"]
    
    results = evaluate_regression_models(X_train, y_train, metadata, cv_splits=3, random_state=42)
    
    expected_models = {
        "DummyRegressor", "LinearRegression", "Ridge", 
        "Lasso", "RandomForestRegressor", "GradientBoostingRegressor"
    }
    evaluated_models = {r["model_name"] for r in results}
    assert expected_models.issubset(evaluated_models), f"Missing models in evaluation: {expected_models - evaluated_models}"
    
    for res in results:
        assert res["cv_mean_rmse"] >= 0, f"CV RMSE must be >= 0 for {res['model_name']}"
        assert res["cv_mean_mae"] >= 0, f"CV MAE must be >= 0 for {res['model_name']}"
        assert not np.isnan(res["cv_mean_rmse"]), f"CV RMSE is NaN for {res['model_name']}"
        assert not np.isnan(res["cv_mean_r2"]), f"CV R2 is NaN for {res['model_name']}"
        assert res["train_rmse"] >= 0, f"Train RMSE must be >= 0 for {res['model_name']}"
        assert res["train_cv_gap"] >= 0, f"Train-CV gap must be >= 0 for {res['model_name']}"


def test_model_selection_uses_only_cv_metrics(salary_experiment_data):
    """14: Verifies model selection ranks models solely based on CV results on the training set."""
    mock_tuning_results = [
        {
            "model_name": "DummyRegressor",
            "cv_mean_rmse": 5000.0,
            "cv_std_rmse": 200.0,
            "cv_mean_r2": 0.0
        },
        {
            "model_name": "RandomForestRegressor",
            "cv_mean_rmse": 2400.0,
            "cv_std_rmse": 80.0,
            "cv_mean_r2": 0.45
        },
        {
            "model_name": "Ridge",
            "cv_mean_rmse": 2410.0,  # within 1% of RF
            "cv_std_rmse": 75.0,
            "cv_mean_r2": 0.445
        }
    ]
    
    # Should choose Ridge due to simplicity margin (within 1% of 2400 is 2424)
    best = select_best_regression_model(mock_tuning_results, simplicity_margin_pct=0.01)
    assert best["model_name"] == "Ridge", f"Expected Ridge due to parsimony margin, got {best['model_name']}"
    
    # If simplicity margin is 0, should choose lowest RMSE (RandomForestRegressor)
    best_strict = select_best_regression_model(mock_tuning_results, simplicity_margin_pct=0.0)
    assert best_strict["model_name"] == "RandomForestRegressor"


def test_holdout_evaluation_and_residual_invariants(salary_experiment_data):
    """15: Verifies holdout evaluation executes only on test data and satisfies mathematical invariants."""
    _, _, experiment = salary_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    X_test = experiment["X_test"]
    y_test = experiment["y_test"]
    metadata = experiment["metadata"]
    
    preprocessor = evaluate_regression_models(X_train, y_train, metadata, cv_splits=3)[2]["pipeline"]
    
    eval_res = evaluate_salary_holdout(preprocessor, X_train, y_train, X_test, y_test)
    
    assert "test_rmse" in eval_res
    assert "test_mae" in eval_res
    assert "test_r2" in eval_res
    assert eval_res["test_rmse"] >= 0
    assert eval_res["test_mae"] >= 0
    
    preds_df = eval_res["predictions_df"]
    assert len(preds_df) == len(X_test)
    
    # Check invariant: prediction_error = actual_salary - predicted_salary
    expected_error = preds_df["actual_salary"] - preds_df["predicted_salary"]
    np.testing.assert_allclose(preds_df["prediction_error"], expected_error, atol=0.05)
    
    # Check invariant: absolute_error = abs(prediction_error)
    np.testing.assert_allclose(preds_df["absolute_error"], np.abs(expected_error), atol=0.05)


def test_feature_importance_mapping(salary_experiment_data):
    """16: Verifies feature importance mapping extracts transformed feature names for linear and tree models."""
    _, _, experiment = salary_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    metadata = experiment["metadata"]
    
    results = evaluate_regression_models(X_train, y_train, metadata, cv_splits=3)
    ridge_pipeline = next(r["pipeline"] for r in results if r["model_name"] == "Ridge")
    rf_pipeline = next(r["pipeline"] for r in results if r["model_name"] == "RandomForestRegressor")
    
    ridge_imp = get_regression_feature_importance(ridge_pipeline)
    assert not ridge_imp.empty
    assert "feature_name" in ridge_imp.columns
    assert "importance" in ridge_imp.columns
    assert "direction" in ridge_imp.columns
    
    rf_imp = get_regression_feature_importance(rf_pipeline)
    assert not rf_imp.empty
    assert (rf_imp["importance"] >= 0).all(), "Tree feature importances must be non-negative"


def test_salary_error_analysis_and_insufficient_data(salary_experiment_data):
    """17: Verifies error analysis correctly calculates bands, skill tiers, and guards with INSUFFICIENT_DATA."""
    _, _, experiment = salary_experiment_data
    X_train = experiment["X_train"]
    y_train = experiment["y_train"]
    X_test = experiment["X_test"]
    y_test = experiment["y_test"]
    metadata = experiment["metadata"]
    
    pipeline = evaluate_regression_models(X_train, y_train, metadata, cv_splits=3)[2]["pipeline"]
    eval_res = evaluate_salary_holdout(pipeline, X_train, y_train, X_test, y_test)
    preds_df = eval_res["predictions_df"]
    
    analysis = analyze_salary_errors(preds_df, metadata, min_subgroup_size=5)
    
    assert "residual_diagnostics" in analysis
    assert "salary_bands" in analysis
    assert "skill_tiers" in analysis
    assert "programmes" in analysis
    assert "districts" in analysis
    assert "high_error_outliers" in analysis
    
    # Test insufficient data handling on a tiny slice
    tiny_df = preds_df.head(3)
    tiny_analysis = analyze_salary_errors(tiny_df, metadata, min_subgroup_size=5)
    for band_info in tiny_analysis["salary_bands"].values():
        assert band_info["status"] == "INSUFFICIENT_DATA"
