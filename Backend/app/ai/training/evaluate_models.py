import os
import sys
import pandas as pd
import joblib
import json
from sklearn.metrics import roc_auc_score, mean_absolute_error, r2_score
import logging

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from app.ai.training.registry import _load_registry
from app.ai.ml_inference import _train_employment_model_internal, _train_salary_model_internal, _train_retention_model_internal
from app.ai.synthetic import generate_synthetic_dataset
from app.ai.features import engineer_features
from app.ai.ml_dataset import build_employment_dataset, build_salary_dataset, build_retention_dataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = "Backend/app/ai/artifacts/datasets"

def evaluate_shadow():
    logger.info("Starting Shadow Evaluation...")
    
    registry = _load_registry()
    candidates = [m for m in registry if m["status"] == "candidate"]
    
    if not candidates:
        logger.warning("No candidate models to evaluate.")
        return
        
    emp_cand = next((m for m in sorted(candidates, key=lambda x: x["updated_at"], reverse=True) if m["model_name"] == "employment"), None)
    sal_cand = next((m for m in sorted(candidates, key=lambda x: x["updated_at"], reverse=True) if m["model_name"] == "salary"), None)
    ret_cand = next((m for m in sorted(candidates, key=lambda x: x["updated_at"], reverse=True) if m["model_name"] == "retention"), None)
    
    logger.info("Training synthetic baseline models...")
    raw_dfs = generate_synthetic_dataset(num_trainees=5000, seed=42)
    feat_dfs = engineer_features(raw_dfs)
    
    emp_data = build_employment_dataset(feat_dfs, raw_dfs)
    baseline_emp = _train_employment_model_internal(emp_data)
    
    sal_data = build_salary_dataset(feat_dfs, raw_dfs)
    baseline_sal = _train_salary_model_internal(sal_data)
    
    ret_data = build_retention_dataset(feat_dfs, raw_dfs)
    baseline_ret = _train_retention_model_internal(ret_data)
    
    report = []
    
    if emp_cand and os.path.exists(emp_cand["artifact_path"]):
        cand_model = joblib.load(emp_cand["artifact_path"])
        test_df = pd.read_csv(os.path.join(DATA_DIR, "employment_test.csv"))
        
        X_test, y_test = test_df.drop(columns=['trainee_id', 'is_employed']), test_df['is_employed']
        
        cand_preds = cand_model.predict_proba(X_test)[:, 1]
        try:
            cand_auc = roc_auc_score(y_test, cand_preds)
        except ValueError:
            cand_auc = 0.5
            
        try:
            base_preds = baseline_emp.predict_proba(X_test)[:, 1]
            base_auc = roc_auc_score(y_test, base_preds)
        except ValueError:
            base_auc = 0.5
            
        report.append({
            "model": "Employment",
            "candidate_version": emp_cand["version"],
            "candidate_auc": cand_auc,
            "baseline_auc": base_auc,
            "test_size": len(X_test)
        })
        
    if sal_cand and os.path.exists(sal_cand["artifact_path"]):
        cand_model = joblib.load(sal_cand["artifact_path"])
        test_df = pd.read_csv(os.path.join(DATA_DIR, "salary_test.csv"))
        
        X_test, y_test = test_df.drop(columns=['trainee_id', 'latest_salary']), test_df['latest_salary']
        
        cand_preds = cand_model.predict(X_test)
        base_preds = baseline_sal.predict(X_test)
        
        cand_mae = mean_absolute_error(y_test, cand_preds)
        base_mae = mean_absolute_error(y_test, base_preds)
        
        report.append({
            "model": "Salary",
            "candidate_version": sal_cand["version"],
            "candidate_mae": cand_mae,
            "baseline_mae": base_mae,
            "test_size": len(X_test)
        })
        
    if ret_cand and os.path.exists(ret_cand["artifact_path"]):
        cand_model = joblib.load(ret_cand["artifact_path"])
        test_df = pd.read_csv(os.path.join(DATA_DIR, "retention_test.csv"))
        
        X_test, y_test = test_df.drop(columns=['trainee_id', 'retained_6m']), test_df['retained_6m']
        
        cand_preds = cand_model.predict_proba(X_test)[:, 1]
        try:
            cand_auc = roc_auc_score(y_test, cand_preds)
        except ValueError:
            cand_auc = 0.5
            
        try:
            base_preds = baseline_ret.predict_proba(X_test)[:, 1]
            base_auc = roc_auc_score(y_test, base_preds)
        except ValueError:
            base_auc = 0.5
            
        report.append({
            "model": "Retention",
            "candidate_version": ret_cand["version"],
            "candidate_auc": cand_auc,
            "baseline_auc": base_auc,
            "test_size": len(X_test)
        })
        
    print("\n" + "="*50)
    print("SHADOW EVALUATION REPORT")
    print("="*50)
    for r in report:
        print(f"\nModel: {r['model']} (v{r['candidate_version']})")
        print(f"Test Size: {r['test_size']}")
        if "candidate_auc" in r:
            print(f"Candidate AUC: {r['candidate_auc']:.4f}")
            print(f"Baseline AUC:  {r['baseline_auc']:.4f}")
        else:
            print(f"Candidate MAE: {r['candidate_mae']:.4f}")
            print(f"Baseline MAE:  {r['baseline_mae']:.4f}")
    print("="*50 + "\n")
    
    with open("Backend/app/ai/artifacts/shadow_evaluation_report.json", "w") as f:
        json.dump(report, f, indent=4)

if __name__ == "__main__":
    evaluate_shadow()
