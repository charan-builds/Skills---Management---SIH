import os
import sys
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, mean_absolute_error, r2_score
import logging
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from app.ai.training.registry import register_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ARTIFACT_DIR = "Backend/app/ai/artifacts/models"
DATA_DIR = "Backend/app/ai/artifacts/datasets"

def _build_preprocessor():
    numeric_features = ['avg_skill_score', 'total_assessments']
    categorical_features = ['programme_id', 'district']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    return preprocessor

def train_employment_model(version):
    logger.info(f"Training Employment Model v{version}...")
    train_df = pd.read_csv(os.path.join(DATA_DIR, "employment_train.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "employment_test.csv"))
    
    X_train, y_train = train_df.drop(columns=['trainee_id', 'is_employed']), train_df['is_employed']
    X_test, y_test = test_df.drop(columns=['trainee_id', 'is_employed']), test_df['is_employed']
    
    pipeline = Pipeline(steps=[
        ('preprocessor', _build_preprocessor()),
        ('classifier', RandomForestClassifier(random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    
    try:
        auc = roc_auc_score(y_test, y_pred_proba)
    except ValueError:
        auc = 0.5
        logger.warning("ROC AUC undefined (only one class present in y_true). Defaulting to 0.5")
    
    metrics = {"roc_auc": auc, "train_size": len(X_train), "test_size": len(X_test)}
    
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    model_path = os.path.join(ARTIFACT_DIR, f"employment_model_v{version}.joblib")
    joblib.dump(pipeline, model_path)
    
    register_model("employment", version, "RandomForestClassifier", metrics, model_path, "candidate")
    logger.info(f"Employment model saved with AUC: {auc:.4f}")

def train_salary_model(version):
    logger.info(f"Training Salary Model v{version}...")
    train_df = pd.read_csv(os.path.join(DATA_DIR, "salary_train.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "salary_test.csv"))
    
    X_train, y_train = train_df.drop(columns=['trainee_id', 'latest_salary']), train_df['latest_salary']
    X_test, y_test = test_df.drop(columns=['trainee_id', 'latest_salary']), test_df['latest_salary']
    
    pipeline = Pipeline(steps=[
        ('preprocessor', _build_preprocessor()),
        ('regressor', GradientBoostingRegressor(random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    metrics = {"mae": mae, "r2": r2, "train_size": len(X_train), "test_size": len(X_test)}
    
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    model_path = os.path.join(ARTIFACT_DIR, f"salary_model_v{version}.joblib")
    joblib.dump(pipeline, model_path)
    
    register_model("salary", version, "GradientBoostingRegressor", metrics, model_path, "candidate")
    logger.info(f"Salary model saved with MAE: {mae:.2f}")

def train_retention_model(version):
    logger.info(f"Training Retention Model v{version}...")
    train_df = pd.read_csv(os.path.join(DATA_DIR, "retention_train.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "retention_test.csv"))
    
    def _build_retention_preprocessor():
        numeric_features = ['avg_skill_score', 'total_assessments', 'latest_salary']
        categorical_features = ['programme_id', 'district']
        return ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
            ])
            
    X_train, y_train = train_df.drop(columns=['trainee_id', 'retained_6m']), train_df['retained_6m']
    X_test, y_test = test_df.drop(columns=['trainee_id', 'retained_6m']), test_df['retained_6m']
    
    pipeline = Pipeline(steps=[
        ('preprocessor', _build_retention_preprocessor()),
        ('classifier', LogisticRegression(random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    
    try:
        auc = roc_auc_score(y_test, y_pred_proba)
    except ValueError:
        auc = 0.5
        logger.warning("ROC AUC undefined for retention. Defaulting to 0.5")
    
    metrics = {"roc_auc": auc, "train_size": len(X_train), "test_size": len(X_test)}
    
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    model_path = os.path.join(ARTIFACT_DIR, f"retention_model_v{version}.joblib")
    joblib.dump(pipeline, model_path)
    
    register_model("retention", version, "LogisticRegression", metrics, model_path, "candidate")
    logger.info(f"Retention model saved with AUC: {auc:.4f}")

if __name__ == "__main__":
    v = datetime.now().strftime("%Y%m%d_%H%M%S")
    train_employment_model(v)
    train_salary_model(v)
    train_retention_model(v)
