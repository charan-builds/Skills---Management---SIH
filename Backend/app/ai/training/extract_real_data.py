import os
import sys
import pandas as pd
from datetime import datetime, timezone
import logging

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from app.firebase.config import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_datasets(include_synthetic=False, output_dir="Backend/app/ai/artifacts/datasets"):
    logger.info("Extracting data from Firestore...")
    
    # 1. Fetch Trainees
    trainees_ref = db.collection("trainees").stream()
    trainees = []
    for doc in trainees_ref:
        data = doc.to_dict()
        if not include_synthetic and data.get("is_synthetic", False):
            continue
        trainees.append(data)
        
    logger.info(f"Fetched {len(trainees)} eligible trainees.")

    # 2. Fetch Assessments
    assessments_ref = db.collection("skill_assessments").stream()
    assessments = []
    for doc in assessments_ref:
        data = doc.to_dict()
        if not include_synthetic and data.get("is_synthetic", False):
            continue
        assessments.append(data)
        
    assessments_df = pd.DataFrame(assessments)
    if not assessments_df.empty and 'created_at' in assessments_df.columns:
        assessments_df['created_at'] = pd.to_datetime(assessments_df['created_at'])

    # 3. Construct Longitudinal Observations
    observations = []
    current_time = datetime.now(timezone.utc)
    
    for t in trainees:
        trainee_id = t.get("id")
        created_at = t.get("created_at")
        prog_id = t.get("programme_id")
        district = t.get("district")
        
        emp_history = t.get("employment_history", [])
        
        if not emp_history:
            is_employed = 1 if t.get("outcome") in ["Employed", "Apprentice", "Self-Employed"] else 0
            
            # Prediction point for non-employed is either their updated_at or created_at
            pred_point = pd.to_datetime(t.get("updated_at", created_at))
            if pred_point.tzinfo is None:
                pred_point = pred_point.replace(tzinfo=timezone.utc)
            
            avg_score = 0
            num_assessments = 0
            if not assessments_df.empty:
                t_asms = assessments_df[(assessments_df['trainee_id'] == trainee_id) & (assessments_df['created_at'] <= pred_point)]
                if not t_asms.empty:
                    avg_score = t_asms['proficiency_score'].mean()
                    num_assessments = len(t_asms)
                    
            observations.append({
                "trainee_id": trainee_id,
                "programme_id": prog_id,
                "district": district,
                "avg_skill_score": avg_score,
                "total_assessments": num_assessments,
                "is_employed": is_employed,
                "latest_salary": None,
                "retained_6m": None,
                "prediction_timestamp": pred_point,
                "censored": False
            })
            continue

        for emp in emp_history:
            start_date_str = emp.get("start_date")
            if not start_date_str:
                continue
            
            start_date = pd.to_datetime(start_date_str)
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
                
            # Point in Time logic for this placement
            avg_score = 0
            num_assessments = 0
            if not assessments_df.empty:
                t_asms = assessments_df[(assessments_df['trainee_id'] == trainee_id) & (assessments_df['created_at'] <= start_date)]
                if not t_asms.empty:
                    avg_score = t_asms['proficiency_score'].mean()
                    num_assessments = len(t_asms)
                    
            salary = emp.get("salary")
            
            end_date_str = emp.get("end_date")
            retained_6m = None
            censored = False
            
            days_elapsed = (current_time - start_date).days
            
            if end_date_str:
                end_date = pd.to_datetime(end_date_str)
                if end_date.tzinfo is None:
                    end_date = end_date.replace(tzinfo=timezone.utc)
                duration = (end_date - start_date).days
                if duration >= 180:
                    retained_6m = 1
                else:
                    retained_6m = 0
            else:
                if days_elapsed >= 180:
                    retained_6m = 1
                else:
                    censored = True
                    
            observations.append({
                "trainee_id": trainee_id,
                "programme_id": prog_id,
                "district": district,
                "avg_skill_score": avg_score,
                "total_assessments": num_assessments,
                "is_employed": 1,
                "latest_salary": salary,
                "retained_6m": retained_6m,
                "prediction_timestamp": start_date,
                "censored": censored
            })
            
    df = pd.DataFrame(observations)
    if df.empty:
        logger.warning("No observations generated.")
        return df
        
    os.makedirs(output_dir, exist_ok=True)
    
    emp_df = df[['trainee_id', 'programme_id', 'district', 'avg_skill_score', 'total_assessments', 'is_employed']].copy()
    emp_df.to_csv(os.path.join(output_dir, "employment_dataset.csv"), index=False)
    
    salary_df = df[(df['is_employed'] == 1) & (df['latest_salary'].notnull())].copy()
    salary_df = salary_df[['trainee_id', 'programme_id', 'district', 'avg_skill_score', 'total_assessments', 'latest_salary']]
    salary_df.to_csv(os.path.join(output_dir, "salary_dataset.csv"), index=False)
    
    ret_df = df[(df['is_employed'] == 1) & (df['latest_salary'].notnull()) & (~df['censored'])].copy()
    ret_df = ret_df[['trainee_id', 'programme_id', 'district', 'avg_skill_score', 'total_assessments', 'latest_salary', 'retained_6m']]
    ret_df.to_csv(os.path.join(output_dir, "retention_dataset.csv"), index=False)
    
    logger.info(f"Extracted {len(emp_df)} employment records, {len(salary_df)} salary records, {len(ret_df)} retention records.")
    return df

if __name__ == "__main__":
    # For testing the pipeline, we include synthetic since real data doesn't exist yet.
    extract_datasets(include_synthetic=True)
