import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)

from app.ai.ml_dataset import build_retention_dataset
from app.ai.ml_preprocessing import build_preprocessing_pipeline

SAFE_FEATURES = [
    "programme_id",
    "district",
    "avg_skill_score",
    "total_assessments",
    "latest_salary"
]

EXCLUDED_FEATURES = [
    "retained_3m",
    "retained_6m",
    "retained_12m",
    "employment_duration_days",
    "max_duration_days",
    "wage_growth_amount",
    "wage_growth_percentage",
    "employer_feedback",
    "satisfaction_score",
    "technical_deficiencies",
    "latent_ability",
    "quality_factor",
    "target_job_id"
]


def build_retention_experiment(
    raw_dfs: Dict[str, pd.DataFrame],
    engineered_features: Dict[str, pd.DataFrame],
    test_size: float = 0.2,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Builds the isolated 6-month retention classification experiment dataset and executes an 80/20 stratified train/test split.
    Guarantees the test set is partitioned before any modeling or preprocessing occurs.
    """
    X, y, metadata = build_retention_dataset(engineered_features, raw_dfs)
    
    if X.empty or y.empty:
        return {
            "X_train": pd.DataFrame(),
            "X_test": pd.DataFrame(),
            "y_train": pd.Series(dtype=int),
            "y_test": pd.Series(dtype=int),
            "metadata": metadata
        }
        
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
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


def evaluate_retention_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    metadata: Dict[str, Any],
    cv_splits: int = 5,
    random_state: int = 42
) -> List[Dict[str, Any]]:
    """
    Evaluates 5 classification model families using 5-fold StratifiedKFold exclusively on the training partition.
    """
    if X_train.empty or y_train.empty:
        return []
        
    cat_cols = metadata.get("categorical_features", ["programme_id", "district"])
    num_cols = metadata.get("numerical_features", ["avg_skill_score", "total_assessments", "latest_salary"])
    
    models = [
        ("DummyClassifier", DummyClassifier(strategy="prior")),
        ("LogisticRegression", LogisticRegression(random_state=random_state, max_iter=1000)),
        ("DecisionTreeClassifier", DecisionTreeClassifier(random_state=random_state)),
        ("RandomForestClassifier", RandomForestClassifier(n_estimators=100, random_state=random_state)),
        ("GradientBoostingClassifier", GradientBoostingClassifier(n_estimators=100, random_state=random_state))
    ]
    
    cv = StratifiedKFold(n_splits=cv_splits, shuffle=True, random_state=random_state)
    results = []
    
    for name, estimator in models:
        preprocessor = build_preprocessing_pipeline(cat_cols, num_cols)
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", estimator)
        ])
        
        cv_res = cross_validate(
            pipeline, X_train, y_train,
            cv=cv,
            scoring={
                "roc_auc": "roc_auc",
                "f1": "f1",
                "precision": "precision",
                "recall": "recall",
                "accuracy": "accuracy"
            },
            return_train_score=True
        )
        
        cv_roc_auc = cv_res["test_roc_auc"]
        cv_f1 = cv_res["test_f1"]
        cv_precision = cv_res["test_precision"]
        cv_recall = cv_res["test_recall"]
        cv_accuracy = cv_res["test_accuracy"]
        
        train_roc_auc = cv_res["train_roc_auc"].mean()
        
        pipeline.fit(X_train, y_train)
        if hasattr(pipeline, "predict_proba"):
            y_train_prob = pipeline.predict_proba(X_train)[:, 1]
            fit_train_roc_auc = roc_auc_score(y_train, y_train_prob)
        else:
            fit_train_roc_auc = 0.5
            
        results.append({
            "model_name": name,
            "pipeline": pipeline,
            "cv_mean_roc_auc": round(float(cv_roc_auc.mean()), 4),
            "cv_std_roc_auc": round(float(cv_roc_auc.std()), 4),
            "cv_mean_f1": round(float(cv_f1.mean()), 4),
            "cv_std_f1": round(float(cv_f1.std()), 4),
            "cv_mean_precision": round(float(cv_precision.mean()), 4),
            "cv_mean_recall": round(float(cv_recall.mean()), 4),
            "cv_mean_accuracy": round(float(cv_accuracy.mean()), 4),
            "train_roc_auc": round(float(fit_train_roc_auc), 4),
            "train_cv_gap": round(float(abs(fit_train_roc_auc - cv_roc_auc.mean())), 4)
        })
        
    return results


def tune_retention_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    metadata: Dict[str, Any],
    cv_splits: int = 5,
    random_state: int = 42
) -> List[Dict[str, Any]]:
    """
    Performs GridSearchCV tuning exclusively on the training partition using 5-fold StratifiedKFold.
    """
    if X_train.empty or y_train.empty:
        return []
        
    cat_cols = metadata.get("categorical_features", ["programme_id", "district"])
    num_cols = metadata.get("numerical_features", ["avg_skill_score", "total_assessments", "latest_salary"])
    
    cv = StratifiedKFold(n_splits=cv_splits, shuffle=True, random_state=random_state)
    
    tuning_configs = [
        {
            "name": "DummyClassifier",
            "estimator": DummyClassifier(strategy="prior"),
            "param_grid": {}
        },
        {
            "name": "LogisticRegression",
            "estimator": LogisticRegression(random_state=random_state, max_iter=1000),
            "param_grid": {
                "classifier__C": [0.01, 0.1, 1.0, 10.0]
            }
        },
        {
            "name": "DecisionTreeClassifier",
            "estimator": DecisionTreeClassifier(random_state=random_state),
            "param_grid": {
                "classifier__max_depth": [3, 5, 8],
                "classifier__min_samples_split": [2, 10],
                "classifier__min_samples_leaf": [1, 5],
                "classifier__criterion": ["gini", "entropy"]
            }
        },
        {
            "name": "RandomForestClassifier",
            "estimator": RandomForestClassifier(random_state=random_state),
            "param_grid": {
                "classifier__n_estimators": [50, 100],
                "classifier__max_depth": [3, 5, 8],
                "classifier__min_samples_split": [2, 5],
                "classifier__min_samples_leaf": [1, 4],
                "classifier__max_features": ["sqrt", "log2"]
            }
        },
        {
            "name": "GradientBoostingClassifier",
            "estimator": GradientBoostingClassifier(random_state=random_state),
            "param_grid": {
                "classifier__n_estimators": [50, 100],
                "classifier__learning_rate": [0.01, 0.05, 0.1],
                "classifier__max_depth": [2, 3, 5],
                "classifier__min_samples_split": [2, 5]
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
            ("classifier", estimator)
        ])
        
        grid_search = GridSearchCV(
            estimator=pipeline,
            param_grid=param_grid,
            cv=cv,
            scoring="roc_auc",
            return_train_score=True,
            n_jobs=-1
        )
        grid_search.fit(X_train, y_train)
        
        best_pipeline = grid_search.best_estimator_
        best_params = grid_search.best_params_
        best_cv_roc_auc = grid_search.best_score_
        
        cv_eval = cross_validate(
            best_pipeline, X_train, y_train,
            cv=cv,
            scoring={
                "roc_auc": "roc_auc",
                "f1": "f1",
                "precision": "precision",
                "recall": "recall",
                "accuracy": "accuracy"
            }
        )
        
        best_pipeline.fit(X_train, y_train)
        if hasattr(best_pipeline, "predict_proba"):
            y_train_prob = best_pipeline.predict_proba(X_train)[:, 1]
            train_roc_auc = roc_auc_score(y_train, y_train_prob)
        else:
            train_roc_auc = 0.5
            
        train_cv_gap = abs(train_roc_auc - best_cv_roc_auc)
        
        tuning_results.append({
            "model_name": name,
            "best_pipeline": best_pipeline,
            "best_params": best_params,
            "cv_mean_roc_auc": round(float(best_cv_roc_auc), 4),
            "cv_std_roc_auc": round(float(cv_eval["test_roc_auc"].std()), 4),
            "cv_mean_f1": round(float(cv_eval["test_f1"].mean()), 4),
            "cv_std_f1": round(float(cv_eval["test_f1"].std()), 4),
            "cv_mean_precision": round(float(cv_eval["test_precision"].mean()), 4),
            "cv_mean_recall": round(float(cv_eval["test_recall"].mean()), 4),
            "cv_mean_accuracy": round(float(cv_eval["test_accuracy"].mean()), 4),
            "train_roc_auc": round(float(train_roc_auc), 4),
            "train_cv_gap": round(float(train_cv_gap), 4)
        })
        
    return tuning_results


def select_best_retention_model(
    tuning_results: List[Dict[str, Any]],
    max_train_cv_gap: float = 0.08
) -> Dict[str, Any]:
    """
    Selects the best model solely based on development-set CV ROC-AUC, breaking ties with F1 and stability,
    while enforcing an overfitting gap constraint (train_cv_gap <= max_train_cv_gap).
    """
    if not tuning_results:
        return {}
        
    # Exclude dummy baseline from competitive selection unless no other models exist
    candidates = [m for m in tuning_results if m["model_name"] != "DummyClassifier"]
    if not candidates:
        candidates = tuning_results
        
    # Filter by overfitting gap
    healthy_candidates = [m for m in candidates if m.get("train_cv_gap", 0) <= max_train_cv_gap]
    pool = healthy_candidates if healthy_candidates else candidates
    
    # Sort strictly by (cv_mean_roc_auc, cv_mean_f1, -cv_std_roc_auc) descending
    sorted_models = sorted(
        pool,
        key=lambda x: (x["cv_mean_roc_auc"], x["cv_mean_f1"], -x["cv_std_roc_auc"]),
        reverse=True
    )
    
    return sorted_models[0]


def evaluate_retention_holdout(
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
    
    if hasattr(selected_pipeline, "predict_proba"):
        y_prob = selected_pipeline.predict_proba(X_test)[:, 1]
    else:
        y_prob = np.zeros(len(y_test))
        
    test_roc_auc = roc_auc_score(y_test, y_prob) if len(np.unique(y_test)) > 1 else 0.5
    test_acc = accuracy_score(y_test, y_pred)
    test_prec = precision_score(y_test, y_pred, zero_division=0)
    test_rec = recall_score(y_test, y_pred, zero_division=0)
    test_f1 = f1_score(y_test, y_pred, zero_division=0)
    
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred, labels=[0, 1]).ravel()
    
    predictions_df = X_test.copy()
    predictions_df["actual_retention"] = y_test.values
    predictions_df["predicted_retention"] = y_pred
    predictions_df["predicted_probability"] = np.round(y_prob, 4)
    
    # Error classification
    def classify_outcome(row):
        act = row["actual_retention"]
        pred = row["predicted_retention"]
        if act == 1 and pred == 1:
            return "TP"
        elif act == 0 and pred == 0:
            return "TN"
        elif act == 0 and pred == 1:
            return "FP"
        else:
            return "FN"
            
    predictions_df["error_type"] = predictions_df.apply(classify_outcome, axis=1)
    predictions_df["is_error"] = predictions_df["error_type"].isin(["FP", "FN"])
    predictions_df["is_borderline"] = (predictions_df["predicted_probability"] >= 0.40) & (predictions_df["predicted_probability"] <= 0.60)
    
    return {
        "test_roc_auc": round(float(test_roc_auc), 4),
        "test_accuracy": round(float(test_acc), 4),
        "test_precision": round(float(test_prec), 4),
        "test_recall": round(float(test_rec), 4),
        "test_f1": round(float(test_f1), 4),
        "confusion_matrix": {
            "TP": int(tp),
            "TN": int(tn),
            "FP": int(fp),
            "FN": int(fn),
            "total": int(tp + tn + fp + fn)
        },
        "predictions_df": predictions_df
    }


def get_retention_feature_importance(
    pipeline: Pipeline,
    feature_names: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Extracts mapped model-derived predictive importance for linear classifiers (coef_[0])
    or tree-based classifiers (feature_importances_).
    """
    if pipeline is None or "classifier" not in pipeline.named_steps:
        return pd.DataFrame()
        
    model = pipeline.named_steps["classifier"]
    preprocessor = pipeline.named_steps.get("preprocessor")
    
    if preprocessor and hasattr(preprocessor, "get_feature_names_out"):
        try:
            transformed_names = preprocessor.get_feature_names_out()
        except Exception:
            transformed_names = feature_names or []
    else:
        transformed_names = feature_names or []
        
    if hasattr(model, "coef_"):
        coefs = model.coef_[0] if model.coef_.ndim > 1 else model.coef_
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


def analyze_retention_errors(
    predictions_df: pd.DataFrame,
    metadata: Dict[str, Any],
    min_subgroup_size: int = 5
) -> Dict[str, Any]:
    """
    Conducts granular classification error and uncertainty analysis across subgroups.
    Safely flags small subgroups (N < min_subgroup_size) with INSUFFICIENT_DATA.
    """
    if predictions_df.empty:
        return {}
        
    df = predictions_df.copy()
    total_n = len(df)
    
    # 1. Uncertainty / Borderline Analysis
    borderline_df = df[df["is_borderline"]]
    borderline_count = len(borderline_df)
    borderline_error_count = int(borderline_df["is_error"].sum()) if borderline_count > 0 else 0
    borderline_error_rate = round(borderline_error_count / borderline_count, 4) if borderline_count > 0 else 0.0
    
    uncertainty_analysis = {
        "prob_min": round(float(df["predicted_probability"].min()), 4),
        "prob_max": round(float(df["predicted_probability"].max()), 4),
        "prob_mean": round(float(df["predicted_probability"].mean()), 4),
        "prob_median": round(float(df["predicted_probability"].median()), 4),
        "borderline_count": borderline_count,
        "borderline_pct": round(float(borderline_count / total_n) * 100, 2) if total_n > 0 else 0.0,
        "borderline_error_rate": borderline_error_rate
    }
    
    # 2. Salary Band Analysis
    def assign_salary_band(val):
        if pd.isna(val):
            return "Unknown"
        elif val < 20000:
            return "< 20k"
        elif val < 30000:
            return "20k-30k"
        elif val < 45000:
            return "30k-45k"
        elif val < 60000:
            return "45k-60k"
        else:
            return "60k+"
            
    if "latest_salary" in df.columns:
        df["salary_band"] = df["latest_salary"].apply(assign_salary_band)
    else:
        df["salary_band"] = "Unknown"
        
    salary_band_results = {}
    for band, grp in df.groupby("salary_band"):
        n = len(grp)
        if n < min_subgroup_size:
            salary_band_results[band] = {"status": "INSUFFICIENT_DATA", "n": n}
        else:
            err_count = int(grp["is_error"].sum())
            salary_band_results[band] = {
                "n": n,
                "error_count": err_count,
                "error_rate": round(err_count / n, 4),
                "accuracy": round(accuracy_score(grp["actual_retention"], grp["predicted_retention"]), 4)
            }
            
    # 3. Skill Proficiency Tiers
    def assign_skill_tier(score):
        if pd.isna(score):
            return "Unknown"
        elif score < 40:
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
            err_count = int(grp["is_error"].sum())
            skill_tier_results[tier] = {
                "n": n,
                "error_count": err_count,
                "error_rate": round(err_count / n, 4),
                "accuracy": round(accuracy_score(grp["actual_retention"], grp["predicted_retention"]), 4)
            }
            
    # 4. Programme Slices
    programme_results = {}
    if "programme_id" in df.columns:
        for prog, grp in df.groupby("programme_id"):
            n = len(grp)
            if n < min_subgroup_size:
                programme_results[prog] = {"status": "INSUFFICIENT_DATA", "n": n}
            else:
                err_count = int(grp["is_error"].sum())
                programme_results[prog] = {
                    "n": n,
                    "error_count": err_count,
                    "error_rate": round(err_count / n, 4),
                    "accuracy": round(accuracy_score(grp["actual_retention"], grp["predicted_retention"]), 4)
                }
                
    # 5. District Slices
    district_results = {}
    if "district" in df.columns:
        for dist, grp in df.groupby("district"):
            n = len(grp)
            if n < min_subgroup_size:
                district_results[dist] = {"status": "INSUFFICIENT_DATA", "n": n}
            else:
                err_count = int(grp["is_error"].sum())
                district_results[dist] = {
                    "n": n,
                    "error_count": err_count,
                    "error_rate": round(err_count / n, 4),
                    "accuracy": round(accuracy_score(grp["actual_retention"], grp["predicted_retention"]), 4)
                }
                
    return {
        "uncertainty_analysis": uncertainty_analysis,
        "salary_bands": salary_band_results,
        "skill_tiers": skill_tier_results,
        "programmes": programme_results,
        "districts": district_results
    }
