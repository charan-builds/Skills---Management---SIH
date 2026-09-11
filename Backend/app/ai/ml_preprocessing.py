import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split, StratifiedKFold, KFold, cross_validate
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.dummy import DummyClassifier, DummyRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, mean_absolute_error, mean_squared_error, r2_score

def build_preprocessing_pipeline(categorical_features: list, numerical_features: list) -> ColumnTransformer:
    """
    Creates a scikit-learn ColumnTransformer that safely scales numerics and One-Hot Encodes categoricals.
    """
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='drop'  # Drop anything not explicitly mapped
    )
    
    return preprocessor

def run_classification_baseline(X: pd.DataFrame, y: pd.Series, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Splits the data, builds a preprocessing pipeline on the train set, 
    and evaluates LogisticRegression vs DummyClassifier.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    preprocessor = build_preprocessing_pipeline(
        metadata["categorical_features"], 
        metadata["numerical_features"]
    )
    
    # Dummy Baseline
    dummy = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', DummyClassifier(strategy="prior"))])
    dummy.fit(X_train, y_train)
    y_pred_dummy = dummy.predict(X_test)
    
    # Logistic Baseline
    model = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', LogisticRegression(random_state=42, max_iter=1000))])
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if len(np.unique(y)) > 1 else np.zeros(len(y_test))
    
    results = {
        "train_size": len(X_train),
        "test_size": len(X_test),
        "dummy_accuracy": round(accuracy_score(y_test, y_pred_dummy), 4),
        "logistic_accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_test, y_pred, zero_division=0), 4)
    }
    
    try:
        results["roc_auc"] = round(roc_auc_score(y_test, y_prob), 4)
    except ValueError:
        results["roc_auc"] = None  # Single class edge case
        
    # Cross Validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = cross_validate(model, X, y, cv=cv, scoring='accuracy')
    results["cv_mean_accuracy"] = round(cv_results['test_score'].mean(), 4)
    
    return results

def run_regression_baseline(X: pd.DataFrame, y: pd.Series, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Splits the data, builds a preprocessing pipeline on the train set, 
    and evaluates LinearRegression vs DummyRegressor.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    preprocessor = build_preprocessing_pipeline(
        metadata["categorical_features"], 
        metadata["numerical_features"]
    )
    
    # Dummy Baseline
    dummy = Pipeline(steps=[('preprocessor', preprocessor), ('regressor', DummyRegressor(strategy="mean"))])
    dummy.fit(X_train, y_train)
    y_pred_dummy = dummy.predict(X_test)
    
    # Linear Baseline
    model = Pipeline(steps=[('preprocessor', preprocessor), ('regressor', LinearRegression())])
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    results = {
        "train_size": len(X_train),
        "test_size": len(X_test),
        "dummy_mae": round(mean_absolute_error(y_test, y_pred_dummy), 2),
        "linear_mae": round(mean_absolute_error(y_test, y_pred), 2),
        "linear_rmse": round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
        "linear_r2": round(r2_score(y_test, y_pred), 4)
    }
    
    # Cross Validation
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = cross_validate(model, X, y, cv=cv, scoring='r2')
    results["cv_mean_r2"] = round(cv_results['test_score'].mean(), 4)
    
    return results
