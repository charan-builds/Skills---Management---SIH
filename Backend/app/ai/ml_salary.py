import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional
from sklearn.model_selection import train_test_split, KFold, cross_validate, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.dummy import DummyRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from app.ai.ml_dataset import build_salary_dataset
from app.ai.ml_preprocessing import build_preprocessing_pipeline

SAFE_FEATURES = [
    "programme_id",
    "district",
    "avg_skill_score",
    "total_assessments"
]

EXCLUDED_FEATURES = [
    "salary",
    "latest_salary",
    "starting_salary",
    "wage_growth_amount",
    "wage_growth_percentage",
    "retained_3m",
    "retained_6m",
    "retained_12m",
    "employment_duration_days",
    "max_duration_days",
    "employer_feedback",
    "satisfaction_score",
    "technical_deficiencies",
    "latent_ability",
    "quality_factor",
    "target_job_id"
]


def build_salary_regression_experiment(
    raw_dfs: Dict[str, pd.DataFrame],
    engineered_features: Dict[str, pd.DataFrame],
    test_size: float = 0.2,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Builds the isolated salary regression experiment dataset and executes an 80/20 train/test split.
    Guarantees the test set is partitioned before any modeling or preprocessing occurs.
    """
    X, y, metadata = build_salary_dataset(engineered_features, raw_dfs)
    
    if X.empty or y.empty:
        return {
            "X_train": pd.DataFrame(),
            "X_test": pd.DataFrame(),
            "y_train": pd.Series(dtype=float),
            "y_test": pd.Series(dtype=float),
            "metadata": metadata
        }
        
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    metadata["train_size"] = len(X_train)
    metadata["test_size"] = len(X_test)
    metadata["safe_features"] = SAFE_FEATURES
    metadata["excluded_features"] = EXCLUDED_FEATURES
    
    return {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "metadata": metadata
    }


def evaluate_regression_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    metadata: Dict[str, Any],
    cv_splits: int = 5,
    random_state: int = 42
) -> List[Dict[str, Any]]:
    """
    Evaluates 6 regression model families using 5-fold cross-validation exclusively on the training partition.
    """
    if X_train.empty or y_train.empty:
        return []
        
    cat_cols = metadata.get("categorical_features", ["programme_id", "district"])
    num_cols = metadata.get("numerical_features", ["avg_skill_score", "total_assessments"])
    
    models = [
        ("DummyRegressor", DummyRegressor(strategy="mean")),
        ("LinearRegression", LinearRegression()),
        ("Ridge", Ridge(alpha=1.0, random_state=random_state)),
        ("Lasso", Lasso(alpha=0.1, random_state=random_state)),
        ("RandomForestRegressor", RandomForestRegressor(n_estimators=100, random_state=random_state)),
        ("GradientBoostingRegressor", GradientBoostingRegressor(n_estimators=100, random_state=random_state))
    ]
    
    cv = KFold(n_splits=cv_splits, shuffle=True, random_state=random_state)
    results = []
    
    for name, estimator in models:
        preprocessor = build_preprocessing_pipeline(cat_cols, num_cols)
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", estimator)
        ])
        
        # Cross validation scores
        cv_res = cross_validate(
            pipeline, X_train, y_train,
            cv=cv,
            scoring={
                "rmse": "neg_root_mean_squared_error",
                "mae": "neg_mean_absolute_error",
                "r2": "r2"
            },
            return_train_score=True
        )
        
        cv_rmse = -cv_res["test_rmse"]
        cv_mae = -cv_res["test_mae"]
        cv_r2 = cv_res["test_r2"]
        
        train_rmse = -cv_res["train_rmse"].mean()
        train_mae = -cv_res["train_mae"].mean()
        train_r2 = cv_res["train_r2"].mean()
        
        # Fit on complete training set for baseline metrics
        pipeline.fit(X_train, y_train)
        y_train_pred = pipeline.predict(X_train)
        
        fit_train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
        fit_train_mae = mean_absolute_error(y_train, y_train_pred)
        fit_train_r2 = r2_score(y_train, y_train_pred)
        
        results.append({
            "model_name": name,
            "pipeline": pipeline,
            "cv_mean_rmse": round(float(cv_rmse.mean()), 2),
            "cv_std_rmse": round(float(cv_rmse.std()), 2),
            "cv_mean_mae": round(float(cv_mae.mean()), 2),
            "cv_std_mae": round(float(cv_mae.std()), 2),
            "cv_mean_r2": round(float(cv_r2.mean()), 4),
            "cv_std_r2": round(float(cv_r2.std()), 4),
            "train_rmse": round(float(fit_train_rmse), 2),
            "train_mae": round(float(fit_train_mae), 2),
            "train_r2": round(float(fit_train_r2), 4),
            "train_cv_gap": round(float(abs(fit_train_rmse - cv_rmse.mean())), 2)
        })
        
    return results


def tune_regression_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    metadata: Dict[str, Any],
    cv_splits: int = 5,
    random_state: int = 42
) -> List[Dict[str, Any]]:
    """
    Performs GridSearchCV tuning exclusively on the training partition using 5-fold cross-validation.
    """
    if X_train.empty or y_train.empty:
        return []
        
    cat_cols = metadata.get("categorical_features", ["programme_id", "district"])
    num_cols = metadata.get("numerical_features", ["avg_skill_score", "total_assessments"])
    
    cv = KFold(n_splits=cv_splits, shuffle=True, random_state=random_state)
    
    tuning_configs = [
        {
            "name": "DummyRegressor",
            "estimator": DummyRegressor(),
            "param_grid": {
                "regressor__strategy": ["mean", "median"]
            }
        },
        {
            "name": "LinearRegression",
            "estimator": LinearRegression(),
            "param_grid": {
                "regressor__fit_intercept": [True, False]
            }
        },
        {
            "name": "Ridge",
            "estimator": Ridge(random_state=random_state),
            "param_grid": {
                "regressor__alpha": [0.01, 0.1, 1.0, 10.0, 100.0]
            }
        },
        {
            "name": "Lasso",
            "estimator": Lasso(random_state=random_state),
            "param_grid": {
                "regressor__alpha": [0.001, 0.01, 0.1, 1.0]
            }
        },
        {
            "name": "RandomForestRegressor",
            "estimator": RandomForestRegressor(random_state=random_state),
            "param_grid": {
                "regressor__n_estimators": [50, 100],
                "regressor__max_depth": [3, 5, 8, None],
                "regressor__min_samples_split": [2, 5, 10],
                "regressor__min_samples_leaf": [1, 2, 5],
                "regressor__max_features": ["sqrt", "log2"]
            }
        },
        {
            "name": "GradientBoostingRegressor",
            "estimator": GradientBoostingRegressor(random_state=random_state),
            "param_grid": {
                "regressor__n_estimators": [50, 100],
                "regressor__learning_rate": [0.01, 0.05, 0.1],
                "regressor__max_depth": [2, 3, 5],
                "regressor__min_samples_split": [2, 5, 10]
            }
        }
    ]
    
    tuning_results = []
    
    for cfg in tuning_configs:
        name = cfg["name"]
        estimator = cfg["estimator"]
        param_grid = cfg["param_grid"]
        
        preprocessor = build_preprocessing_pipeline(cat_cols, num_cols)
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", estimator)
        ])
        
        grid_search = GridSearchCV(
            estimator=pipeline,
            param_grid=param_grid,
            cv=cv,
            scoring="neg_root_mean_squared_error",
            return_train_score=True,
            n_jobs=-1
        )
        grid_search.fit(X_train, y_train)
        
        best_pipeline = grid_search.best_estimator_
        best_params = grid_search.best_params_
        best_cv_rmse = -grid_search.best_score_
        
        # Calculate full CV metrics for the best estimator
        cv_eval = cross_validate(
            best_pipeline, X_train, y_train,
            cv=cv,
            scoring={
                "rmse": "neg_root_mean_squared_error",
                "mae": "neg_mean_absolute_error",
                "r2": "r2"
            }
        )
        
        # Fit on full training set to measure train performance & overfitting gap
        best_pipeline.fit(X_train, y_train)
        y_train_pred = best_pipeline.predict(X_train)
        
        train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
        train_mae = mean_absolute_error(y_train, y_train_pred)
        train_r2 = r2_score(y_train, y_train_pred)
        
        tuning_results.append({
            "model_name": name,
            "best_pipeline": best_pipeline,
            "best_params": best_params,
            "cv_mean_rmse": round(float(best_cv_rmse), 2),
            "cv_std_rmse": round(float((-cv_eval["test_rmse"]).std()), 2),
            "cv_mean_mae": round(float((-cv_eval["test_mae"]).mean()), 2),
            "cv_std_mae": round(float((-cv_eval["test_mae"]).std()), 2),
            "cv_mean_r2": round(float(cv_eval["test_r2"].mean()), 4),
            "cv_std_r2": round(float(cv_eval["test_r2"].std()), 4),
            "train_rmse": round(float(train_rmse), 2),
            "train_mae": round(float(train_mae), 2),
            "train_r2": round(float(train_r2), 4),
            "train_cv_gap": round(float(abs(train_rmse - best_cv_rmse)), 2)
        })
        
    return tuning_results


def select_best_regression_model(
    tuning_results: List[Dict[str, Any]],
    simplicity_margin_pct: float = 0.01
) -> Dict[str, Any]:
    """
    Selects the optimal model based purely on development-set CV RMSE.
    Includes a parsimony rule: If a simpler model (e.g. Ridge/Linear) is within 1% of a complex tree model,
    the simpler model is preferred for maintainability and explainability.
    """
    if not tuning_results:
        return {}
        
    # Exclude dummy baseline from competitive selection unless no other models exist
    candidates = [m for m in tuning_results if m["model_name"] != "DummyRegressor"]
    if not candidates:
        candidates = tuning_results
        
    # Sort strictly by cv_mean_rmse ascending
    sorted_candidates = sorted(
        candidates,
        key=lambda x: (x["cv_mean_rmse"], x["cv_std_rmse"], -x["cv_mean_r2"])
    )
    
    best_candidate = sorted_candidates[0]
    best_rmse = best_candidate["cv_mean_rmse"]
    
    # Check if a simpler linear model is within the simplicity margin
    simpler_models = [
        m for m in sorted_candidates 
        if m["model_name"] in ["Ridge", "LinearRegression", "Lasso"]
    ]
    
    if simpler_models:
        best_simpler = simpler_models[0]
        if (best_simpler["cv_mean_rmse"] - best_rmse) / best_rmse <= simplicity_margin_pct:
            best_candidate = best_simpler
            
    return best_candidate


def evaluate_salary_holdout(
    selected_pipeline: Pipeline,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series
) -> Dict[str, Any]:
    """
    Refits the selected pipeline on the full 80% training set and evaluates exactly once on the untouched test partition.
    """
    if selected_pipeline is None or X_train.empty or X_test.empty:
        return {}
        
    selected_pipeline.fit(X_train, y_train)
    y_pred = selected_pipeline.predict(X_test)
    
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    test_mae = mean_absolute_error(y_test, y_pred)
    test_r2 = r2_score(y_test, y_pred)
    
    residuals = y_test - y_pred
    abs_errors = np.abs(residuals)
    
    predictions_df = X_test.copy()
    predictions_df["actual_salary"] = y_test.values
    predictions_df["predicted_salary"] = np.round(y_pred, 2)
    predictions_df["prediction_error"] = np.round(residuals.values, 2)
    predictions_df["absolute_error"] = np.round(abs_errors.values, 2)
    
    return {
        "test_rmse": round(float(test_rmse), 2),
        "test_mae": round(float(test_mae), 2),
        "test_r2": round(float(test_r2), 4),
        "test_actual_mean": round(float(y_test.mean()), 2),
        "test_actual_std": round(float(y_test.std()), 2),
        "test_pred_mean": round(float(y_pred.mean()), 2),
        "test_pred_std": round(float(y_pred.std()), 2),
        "predictions_df": predictions_df
    }


def get_regression_feature_importance(
    pipeline: Pipeline,
    feature_names: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Extracts mapped model-derived predictive importance for linear regressors (coef_)
    or tree-based regressors (feature_importances_).
    """
    if pipeline is None or "regressor" not in pipeline.named_steps:
        return pd.DataFrame()
        
    model = pipeline.named_steps["regressor"]
    preprocessor = pipeline.named_steps.get("preprocessor")
    
    # Extract transformed feature names
    if preprocessor and hasattr(preprocessor, "get_feature_names_out"):
        try:
            transformed_names = preprocessor.get_feature_names_out()
        except Exception:
            transformed_names = feature_names or []
    else:
        transformed_names = feature_names or []
        
    if hasattr(model, "coef_"):
        coefs = model.coef_
        if coefs.ndim > 1:
            coefs = coefs[0]
        imp_df = pd.DataFrame({
            "feature_name": transformed_names[:len(coefs)],
            "importance": coefs,
            "absolute_importance": np.abs(coefs),
            "direction": np.where(coefs >= 0, "Positive", "Negative")
        }).sort_values(by="absolute_importance", ascending=False).reset_index(drop=True)
        return imp_df
        
    elif hasattr(model, "feature_importances_"):
        imps = model.feature_importances_
        imp_df = pd.DataFrame({
            "feature_name": transformed_names[:len(imps)],
            "importance": imps,
            "absolute_importance": imps,
            "direction": "Positive"
        }).sort_values(by="importance", ascending=False).reset_index(drop=True)
        return imp_df
        
    return pd.DataFrame()


def analyze_salary_errors(
    predictions_df: pd.DataFrame,
    metadata: Dict[str, Any],
    min_subgroup_size: int = 5
) -> Dict[str, Any]:
    """
    Conducts granular error, residual, and subgroup analysis on the holdout test predictions.
    Safely flags small subgroups (N < min_subgroup_size) with INSUFFICIENT_DATA.
    """
    if predictions_df.empty:
        return {}
        
    df = predictions_df.copy()
    
    # 1. Overall Residual Statistics
    residuals = df["prediction_error"]
    abs_errors = df["absolute_error"]
    actuals = df["actual_salary"]
    
    mean_residual = float(residuals.mean())
    median_residual = float(residuals.median())
    residual_std = float(residuals.std())
    
    # Correlation between actual salary and prediction error (tests for systematic over/under-prediction)
    salary_error_corr = float(actuals.corr(residuals)) if len(actuals) > 1 else 0.0
    
    residual_diagnostics = {
        "mean_residual": round(mean_residual, 2),
        "median_residual": round(median_residual, 2),
        "residual_std": round(residual_std, 2),
        "actual_vs_error_correlation": round(salary_error_corr, 4),
        "bias_tendency": (
            "Systematic underprediction at higher salaries" if salary_error_corr > 0.3 else
            "Systematic overprediction at higher salaries" if salary_error_corr < -0.3 else
            "Relatively balanced residual distribution"
        )
    }
    
    # 2. Salary Band Analysis
    # Dynamically define bands: < 20k, 20k-30k, 30k-45k, 45k-60k, 60k+
    def assign_salary_band(val):
        if val < 20000:
            return "< 20k"
        elif val < 30000:
            return "20k-30k"
        elif val < 45000:
            return "30k-45k"
        elif val < 60000:
            return "45k-60k"
        else:
            return "60k+"
            
    df["salary_band"] = df["actual_salary"].apply(assign_salary_band)
    
    salary_band_results = {}
    for band, grp in df.groupby("salary_band"):
        n = len(grp)
        if n < min_subgroup_size:
            salary_band_results[band] = {"status": "INSUFFICIENT_DATA", "n": n}
        else:
            mae = mean_absolute_error(grp["actual_salary"], grp["predicted_salary"])
            rmse = np.sqrt(mean_squared_error(grp["actual_salary"], grp["predicted_salary"]))
            salary_band_results[band] = {
                "n": n,
                "mae": round(float(mae), 2),
                "rmse": round(float(rmse), 2),
                "mean_error": round(float(grp["prediction_error"].mean()), 2),
                "median_error": round(float(grp["prediction_error"].median()), 2)
            }
            
    # 3. Skill Score Bracket Analysis
    def assign_skill_tier(score):
        if score < 40:
            return "Beginner (<40)"
        elif score < 60:
            return "Developing (40-59)"
        elif score < 80:
            return "Proficient (60-79)"
        else:
            return "Advanced (80-100)"
            
    if "avg_skill_score" in df.columns:
        df["skill_tier"] = df["avg_skill_score"].apply(assign_skill_tier)
    else:
        df["skill_tier"] = "Unknown"
        
    skill_tier_results = {}
    for tier, grp in df.groupby("skill_tier"):
        n = len(grp)
        if n < min_subgroup_size:
            skill_tier_results[tier] = {"status": "INSUFFICIENT_DATA", "n": n}
        else:
            mae = mean_absolute_error(grp["actual_salary"], grp["predicted_salary"])
            rmse = np.sqrt(mean_squared_error(grp["actual_salary"], grp["predicted_salary"]))
            skill_tier_results[tier] = {
                "n": n,
                "mae": round(float(mae), 2),
                "rmse": round(float(rmse), 2),
                "mean_error": round(float(grp["prediction_error"].mean()), 2),
                "median_error": round(float(grp["prediction_error"].median()), 2)
            }
            
    # 4. Programme Slice Analysis
    programme_results = {}
    if "programme_id" in df.columns:
        for prog, grp in df.groupby("programme_id"):
            n = len(grp)
            if n < min_subgroup_size:
                programme_results[prog] = {"status": "INSUFFICIENT_DATA", "n": n}
            else:
                mae = mean_absolute_error(grp["actual_salary"], grp["predicted_salary"])
                rmse = np.sqrt(mean_squared_error(grp["actual_salary"], grp["predicted_salary"]))
                programme_results[prog] = {
                    "n": n,
                    "mae": round(float(mae), 2),
                    "rmse": round(float(rmse), 2),
                    "mean_error": round(float(grp["prediction_error"].mean()), 2)
                }
                
    # 5. District Slice Analysis
    district_results = {}
    if "district" in df.columns:
        for dist, grp in df.groupby("district"):
            n = len(grp)
            if n < min_subgroup_size:
                district_results[dist] = {"status": "INSUFFICIENT_DATA", "n": n}
            else:
                mae = mean_absolute_error(grp["actual_salary"], grp["predicted_salary"])
                rmse = np.sqrt(mean_squared_error(grp["actual_salary"], grp["predicted_salary"]))
                district_results[dist] = {
                    "n": n,
                    "mae": round(float(mae), 2),
                    "rmse": round(float(rmse), 2),
                    "mean_error": round(float(grp["prediction_error"].mean()), 2)
                }
                
    # 6. High-Error Outlier Cases (Top 5 anonymized)
    top_errors = df.sort_values(by="absolute_error", ascending=False).head(5)
    anonymized_outliers = []
    for _, row in top_errors.iterrows():
        outlier_info = {
            "programme_id": row.get("programme_id", "N/A"),
            "district": row.get("district", "N/A"),
            "avg_skill_score": round(float(row.get("avg_skill_score", 0)), 1),
            "actual_salary": round(float(row["actual_salary"]), 2),
            "predicted_salary": round(float(row["predicted_salary"]), 2),
            "absolute_error": round(float(row["absolute_error"]), 2)
        }
        anonymized_outliers.append(outlier_info)
        
    return {
        "residual_diagnostics": residual_diagnostics,
        "salary_bands": salary_band_results,
        "skill_tiers": skill_tier_results,
        "programmes": programme_results,
        "districts": district_results,
        "high_error_outliers": anonymized_outliers
    }
