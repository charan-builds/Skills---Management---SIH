import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

from app.ai.ml_preprocessing import build_preprocessing_pipeline

def evaluate_classification_model(name: str, pipeline: Pipeline, X_train: pd.DataFrame, y_train: pd.Series, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
    """
    Evaluates a single model using cross-validation on the training set,
    followed by a final test on the holdout set.
    """
    # Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    cv_metrics = cross_validate(
        pipeline, X_train, y_train, cv=cv,
        scoring=['roc_auc', 'f1', 'precision', 'recall'],
        return_train_score=True
    )
    
    # Train final model on entire training set
    pipeline.fit(X_train, y_train)
    
    # Predict on holdout test set
    y_pred = pipeline.predict(X_test)
    if hasattr(pipeline.named_steps['classifier'], 'predict_proba'):
        y_prob = pipeline.predict_proba(X_test)[:, 1]
    else:
        y_prob = y_pred  # Fallback for models without proba
        
    try:
        test_roc_auc = roc_auc_score(y_test, y_prob)
    except ValueError:
        test_roc_auc = 0.5
        
    # Overfitting check: train vs val ROC-AUC gap
    train_roc = cv_metrics['train_roc_auc'].mean()
    val_roc = cv_metrics['test_roc_auc'].mean()
    overfit_gap = train_roc - val_roc
    
    return {
        "model_name": name,
        "cv_mean_roc_auc": round(val_roc, 4),
        "cv_std_roc_auc": round(cv_metrics['test_roc_auc'].std(), 4),
        "cv_mean_f1": round(cv_metrics['test_f1'].mean(), 4),
        "cv_std_f1": round(cv_metrics['test_f1'].std(), 4),
        "cv_mean_precision": round(cv_metrics['test_precision'].mean(), 4),
        "cv_mean_recall": round(cv_metrics['test_recall'].mean(), 4),
        "train_roc_auc": round(train_roc, 4),
        "val_roc_auc": round(val_roc, 4),
        "train_val_gap": round(overfit_gap, 4),
        "test_roc_auc": round(test_roc_auc, 4),
        "test_accuracy": round(accuracy_score(y_test, y_pred), 4),
        "test_precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "test_recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "test_f1": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "pipeline": pipeline # Keep reference for feature importance extraction
    }

def run_employment_experiments(X: pd.DataFrame, y: pd.Series, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Runs controlled experiments for Employment Classification across 5 approved model families.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    preprocessor = build_preprocessing_pipeline(
        metadata["categorical_features"], 
        metadata["numerical_features"]
    )
    
    models = {
        "Dummy": DummyClassifier(strategy="prior"),
        "LogisticRegression": LogisticRegression(random_state=42, max_iter=1000),
        "DecisionTree": DecisionTreeClassifier(random_state=42, max_depth=5),
        "RandomForest": RandomForestClassifier(random_state=42, n_estimators=100, max_depth=5),
        "GradientBoosting": GradientBoostingClassifier(random_state=42, n_estimators=100, max_depth=3)
    }
    
    results = []
    
    for name, clf in models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor), 
            ('classifier', clf)
        ])
        
        result = evaluate_classification_model(name, pipeline, X_train, y_train, X_test, y_test)
        results.append(result)
        
    return results

def get_model_feature_importance(pipeline: Pipeline, metadata: Dict[str, Any]) -> pd.DataFrame:
    """
    Extracts feature importances safely from fitted Scikit-Learn pipelines.
    """
    preprocessor = pipeline.named_steps['preprocessor']
    model = pipeline.named_steps['classifier']
    
    # Try extracting feature names
    feature_names = []
    
    # Numerics
    if 'num' in preprocessor.named_transformers_:
        feature_names.extend(metadata["numerical_features"])
        
    # Categoricals
    if 'cat' in preprocessor.named_transformers_:
        cat_transformer = preprocessor.named_transformers_['cat'].named_steps['onehot']
        try:
            cat_features = cat_transformer.get_feature_names_out(metadata["categorical_features"])
            feature_names.extend(cat_features)
        except Exception:
            pass
            
    if hasattr(model, 'coef_'):
        importances = model.coef_[0]
    elif hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    else:
        return pd.DataFrame()
        
    # If dimensions mismatch due to dropped features, fallback gracefully
    if len(feature_names) != len(importances):
        feature_names = [f"feature_{i}" for i in range(len(importances))]
        
    df = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    })
    
    df['abs_importance'] = df['importance'].abs()
    return df.sort_values(by='abs_importance', ascending=False).drop(columns=['abs_importance'])

def compare_models(results: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Returns a standardized DataFrame of model performance sorted by Test ROC-AUC.
    """
    records = []
    for r in results:
        records.append({
            "Model": r["model_name"],
            "Test ROC-AUC": r["test_roc_auc"],
            "CV ROC-AUC": r["cv_mean_roc_auc"],
            "Train-Val Gap": r["train_val_gap"],
            "Test F1": r["test_f1"],
            "Test Precision": r["test_precision"],
            "Test Recall": r["test_recall"]
        })
        
    df = pd.DataFrame(records)
    return df.sort_values(by="Test ROC-AUC", ascending=False).reset_index(drop=True)

def select_best_model(results: List[Dict[str, Any]], max_overfit_gap: float = 0.05) -> Dict[str, Any]:
    """
    Deterministic rule: Selects the model with highest Test ROC-AUC, 
    but strictly penalizes models if their Train-Val ROC-AUC gap exceeds max_overfit_gap.
    """
    valid_candidates = [r for r in results if r["train_val_gap"] <= max_overfit_gap]
    
    # If all models overfit, just pick the least overfitting one
    if not valid_candidates:
        valid_candidates = results
        return sorted(valid_candidates, key=lambda x: x["train_val_gap"])[0]
        
    # Normal case: Sort by Test ROC-AUC descending
    return sorted(valid_candidates, key=lambda x: x["test_roc_auc"], reverse=True)[0]
