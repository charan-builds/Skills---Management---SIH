import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.model_selection import StratifiedKFold, GridSearchCV, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

from app.ai.ml_preprocessing import build_preprocessing_pipeline

def tune_single_model(
    name: str,
    estimator: Any,
    param_grid: Dict[str, List[Any]],
    X_train: pd.DataFrame,
    y_train: pd.Series,
    metadata: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Performs grid search cross-validation exclusively on the training set.
    """
    preprocessor = build_preprocessing_pipeline(
        metadata["categorical_features"],
        metadata["numerical_features"]
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', estimator)
    ])
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    if param_grid:
        grid_search = GridSearchCV(
            pipeline,
            param_grid=param_grid,
            cv=cv,
            scoring='roc_auc',
            refit=True,
            return_train_score=True
        )
        grid_search.fit(X_train, y_train)
        best_pipeline = grid_search.best_estimator_
        best_params = grid_search.best_params_
    else:
        pipeline.fit(X_train, y_train)
        best_pipeline = pipeline
        best_params = {}
        
    # Run multi-metric cross validation on the best pipeline
    cv_metrics = cross_validate(
        best_pipeline,
        X_train,
        y_train,
        cv=cv,
        scoring=['roc_auc', 'f1', 'precision', 'recall', 'accuracy'],
        return_train_score=True
    )
    
    train_roc = float(np.mean(cv_metrics['train_roc_auc']))
    val_roc = float(np.mean(cv_metrics['test_roc_auc']))
    overfit_gap = train_roc - val_roc
    
    return {
        "model_name": name,
        "best_params": best_params,
        "cv_mean_roc_auc": round(val_roc, 4),
        "cv_std_roc_auc": round(float(np.std(cv_metrics['test_roc_auc'])), 4),
        "cv_mean_f1": round(float(np.mean(cv_metrics['test_f1'])), 4),
        "cv_std_f1": round(float(np.std(cv_metrics['test_f1'])), 4),
        "cv_mean_precision": round(float(np.mean(cv_metrics['test_precision'])), 4),
        "cv_mean_recall": round(float(np.mean(cv_metrics['test_recall'])), 4),
        "cv_mean_accuracy": round(float(np.mean(cv_metrics['test_accuracy'])), 4),
        "train_roc_auc": round(train_roc, 4),
        "val_roc_auc": round(val_roc, 4),
        "train_cv_gap": round(overfit_gap, 4),
        "best_pipeline": best_pipeline
    }

def run_hyperparameter_tuning(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    metadata: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Executes controlled hyperparameter search across 4 classifiers plus the Dummy baseline.
    Operates strictly within the training set.
    """
    model_configs = [
        {
            "name": "Dummy",
            "estimator": DummyClassifier(strategy="prior"),
            "param_grid": {}
        },
        {
            "name": "LogisticRegression",
            "estimator": LogisticRegression(random_state=42, max_iter=1000),
            "param_grid": {
                "classifier__C": [0.01, 0.1, 1.0, 10.0]
            }
        },
        {
            "name": "DecisionTree",
            "estimator": DecisionTreeClassifier(random_state=42),
            "param_grid": {
                "classifier__max_depth": [3, 5, 8],
                "classifier__min_samples_split": [2, 10],
                "classifier__min_samples_leaf": [1, 5],
                "classifier__criterion": ["gini", "entropy"]
            }
        },
        {
            "name": "RandomForest",
            "estimator": RandomForestClassifier(random_state=42),
            "param_grid": {
                "classifier__n_estimators": [50, 100],
                "classifier__max_depth": [3, 5, 8],
                "classifier__min_samples_split": [2, 5],
                "classifier__min_samples_leaf": [1, 4],
                "classifier__max_features": ["sqrt", "log2"]
            }
        },
        {
            "name": "GradientBoosting",
            "estimator": GradientBoostingClassifier(random_state=42),
            "param_grid": {
                "classifier__n_estimators": [50, 100],
                "classifier__learning_rate": [0.01, 0.1, 0.2],
                "classifier__max_depth": [2, 3, 5],
                "classifier__min_samples_split": [2, 5]
            }
        }
    ]
    
    results = []
    for cfg in model_configs:
        res = tune_single_model(
            name=cfg["name"],
            estimator=cfg["estimator"],
            param_grid=cfg["param_grid"],
            X_train=X_train,
            y_train=y_train,
            metadata=metadata
        )
        results.append(res)
        
    return results

def compare_tuned_models(tuning_results: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Returns a standardized DataFrame of model performance sorted strictly by CV Mean ROC-AUC.
    """
    records = []
    for r in tuning_results:
        records.append({
            "Model": r["model_name"],
            "Best Params": str(r["best_params"]),
            "CV Mean ROC-AUC": r["cv_mean_roc_auc"],
            "CV Std ROC-AUC": r["cv_std_roc_auc"],
            "CV Mean F1": r["cv_mean_f1"],
            "CV Mean Precision": r["cv_mean_precision"],
            "CV Mean Recall": r["cv_mean_recall"],
            "CV Mean Accuracy": r["cv_mean_accuracy"],
            "Train-CV Gap": r["train_cv_gap"]
        })
        
    df = pd.DataFrame(records)
    return df.sort_values(by="CV Mean ROC-AUC", ascending=False).reset_index(drop=True)

def select_best_tuned_model(
    tuning_results: List[Dict[str, Any]],
    max_overfit_gap: float = 0.08
) -> Dict[str, Any]:
    """
    Deterministic model selection rule using ONLY CV metrics.
    1. Filters out Dummy baseline.
    2. Penalizes models with train-CV gap > max_overfit_gap.
    3. Selects highest CV Mean ROC-AUC, breaking ties with CV Mean F1 and lower CV Std.
    """
    candidates = [r for r in tuning_results if r["model_name"] != "Dummy"]
    if not candidates:
        return tuning_results[0]
        
    valid_candidates = [r for r in candidates if r["train_cv_gap"] <= max_overfit_gap]
    if not valid_candidates:
        # Fallback to candidate with minimum overfit gap
        valid_candidates = candidates
        return sorted(valid_candidates, key=lambda x: x["train_cv_gap"])[0]
        
    # Primary: CV Mean ROC-AUC (desc), Secondary: CV Mean F1 (desc), Tertiary: CV Std ROC-AUC (asc)
    sorted_candidates = sorted(
        valid_candidates,
        key=lambda x: (x["cv_mean_roc_auc"], x["cv_mean_f1"], -x["cv_std_roc_auc"]),
        reverse=True
    )
    return sorted_candidates[0]

def evaluate_final_holdout(
    selected_pipeline: Pipeline,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series
) -> Dict[str, Any]:
    """
    Fits the selected pipeline on the complete 80% training set,
    and evaluates exactly once on the untouched 20% holdout test set.
    """
    # Fit on full training portion
    selected_pipeline.fit(X_train, y_train)
    
    # Predict on holdout test set
    y_pred = selected_pipeline.predict(X_test)
    if hasattr(selected_pipeline.named_steps['classifier'], 'predict_proba'):
        y_prob = selected_pipeline.predict_proba(X_test)[:, 1]
    else:
        y_prob = y_pred.astype(float)
        
    try:
        test_roc_auc = round(float(roc_auc_score(y_test, y_prob)), 4)
    except ValueError:
        test_roc_auc = 0.5
        
    return {
        "test_roc_auc": test_roc_auc,
        "test_accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "test_precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "test_recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "test_f1": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "y_pred": y_pred,
        "y_prob": y_prob,
        "fitted_pipeline": selected_pipeline
    }
