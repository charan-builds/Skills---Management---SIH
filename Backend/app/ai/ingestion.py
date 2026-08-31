import pandas as pd
from typing import List, Dict, Any
from app.firebase.repository import FirestoreRepository
from app.firebase.config import db
import numpy as np

# Loader Functions
def load_trainees() -> List[Dict[str, Any]]:
    return FirestoreRepository.get_trainees()

def load_skills() -> List[Dict[str, Any]]:
    return FirestoreRepository.get_skills()

def load_skill_assessments() -> List[Dict[str, Any]]:
    return FirestoreRepository.get_assessments()

def load_programmes() -> List[Dict[str, Any]]:
    return FirestoreRepository.get_programmes()

def load_jobs() -> List[Dict[str, Any]]:
    return FirestoreRepository.get_jobs()

def load_employer_feedback() -> List[Dict[str, Any]]:
    return FirestoreRepository.get_employer_feedback()

def load_employer_verifications() -> List[Dict[str, Any]]:
    docs = db.collection("employer_verifications").stream()
    return [doc.to_dict() for doc in docs]

def load_interventions() -> List[Dict[str, Any]]:
    return FirestoreRepository.get_interventions()


# Flattening Functions
def build_trainee_df(trainees_data: List[Dict[str, Any]]) -> pd.DataFrame:
    if not trainees_data:
        return pd.DataFrame(columns=["trainee_id", "programme_id", "district", "course_name", "provider"])
    
    df = pd.DataFrame(trainees_data)
    if "id" in df.columns:
        df = df.rename(columns={"id": "trainee_id"})
    
    cols = ["trainee_id", "programme_id", "district", "course_name", "provider"]
    for col in cols:
        if col not in df.columns:
            df[col] = None
            
    return df[cols]

def build_trainee_skill_df(assessments_data: List[Dict[str, Any]]) -> pd.DataFrame:
    if not assessments_data:
        return pd.DataFrame(columns=["trainee_id", "skill_id", "skill_name", "proficiency_score", "assessment_type", "assessment_date"])
        
    df = pd.DataFrame(assessments_data)
    
    if "assessment_date" in df.columns:
        df["assessment_date"] = pd.to_datetime(df["assessment_date"], errors="coerce")
        
    if "proficiency_score" in df.columns:
        df["proficiency_score"] = pd.to_numeric(df["proficiency_score"], errors="coerce")
        
    cols = ["trainee_id", "skill_id", "skill_name", "proficiency_score", "assessment_type", "assessment_date"]
    for col in cols:
        if col not in df.columns:
            df[col] = None
            
    return df[cols]

def build_job_skill_df(jobs_data: List[Dict[str, Any]]) -> pd.DataFrame:
    records = []
    for job in jobs_data:
        job_id = job.get("id")
        reqs = job.get("skills_required", [])
        for req in reqs:
            records.append({
                "job_id": job_id,
                "skill_id": req.get("skill_id"),
                "skill_name": req.get("skill_name"),
                "required_level": req.get("required_level"),
                "importance": req.get("importance")
            })
            
    if not records:
        return pd.DataFrame(columns=["job_id", "skill_id", "skill_name", "required_level", "importance"])
        
    df = pd.DataFrame(records)
    df["required_level"] = pd.to_numeric(df["required_level"], errors="coerce")
    df["importance"] = pd.to_numeric(df["importance"], errors="coerce")
    return df

def build_programme_skill_df(programmes_data: List[Dict[str, Any]]) -> pd.DataFrame:
    records = []
    for p in programmes_data:
        p_id = p.get("id")
        skills = p.get("skills_taught_structured", [])
        for s in skills:
            records.append({
                "programme_id": p_id,
                "skill_id": s.get("skill_id"),
                "skill_name": s.get("skill_name"),
                "target_level": s.get("target_level")
            })
            
    if not records:
        return pd.DataFrame(columns=["programme_id", "skill_id", "skill_name", "target_level"])
        
    df = pd.DataFrame(records)
    df["target_level"] = pd.to_numeric(df["target_level"], errors="coerce")
    return df

def build_employment_outcome_df(trainees_data: List[Dict[str, Any]]) -> pd.DataFrame:
    records = []
    for t in trainees_data:
        t_id = t.get("id")
        history = t.get("employment_history", [])
        for emp in history:
            records.append({
                "trainee_id": t_id,
                "employment_id": emp.get("id"),
                "employer_name": emp.get("employer_name"),
                "role": emp.get("role"),
                "salary": emp.get("salary"),
                "start_date": emp.get("start_date"),
                "end_date": emp.get("end_date"),
                "employment_type": emp.get("employment_type"),
                "job_relevance": emp.get("job_relevance"),
                "verified": emp.get("verified")
            })
            
    if not records:
        return pd.DataFrame(columns=["trainee_id", "employment_id", "employer_name", "role", "salary", "start_date", "end_date", "employment_type", "job_relevance", "verified"])
        
    df = pd.DataFrame(records)
    df["start_date"] = pd.to_datetime(df["start_date"], errors="coerce")
    df["end_date"] = pd.to_datetime(df["end_date"], errors="coerce")
    df["salary"] = pd.to_numeric(df["salary"], errors="coerce")
    return df

def build_outcomes_timeline_df(trainees_data: List[Dict[str, Any]]) -> pd.DataFrame:
    records = []
    for t in trainees_data:
        t_id = t.get("id")
        timeline = t.get("outcomes_timeline", [])
        for chk in timeline:
            records.append({
                "trainee_id": t_id,
                "checkpoint": chk.get("checkpoint"),
                "date": chk.get("date"),
                "status": chk.get("status"),
                "employment_status": chk.get("employment_status"),
                "employer_or_activity": chk.get("employer_or_activity"),
                "salary": chk.get("salary"),
                "job_relevance": chk.get("job_relevance"),
                "verification_status": chk.get("verification_status")
            })
            
    if not records:
        return pd.DataFrame(columns=["trainee_id", "checkpoint", "date", "status", "employment_status", "employer_or_activity", "salary", "job_relevance", "verification_status"])
        
    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    return df

def build_employer_feedback_df(feedback_data: List[Dict[str, Any]]) -> pd.DataFrame:
    if not feedback_data:
        return pd.DataFrame(columns=["feedback_id", "trainee_id", "programme_id", "employer_name", "satisfaction_score", "technical_deficiencies", "soft_skill_deficiencies", "skills_required_in_job"])
        
    df = pd.DataFrame(feedback_data)
    if "id" in df.columns:
        df = df.rename(columns={"id": "feedback_id"})
        
    if "satisfaction_score" in df.columns:
        df["satisfaction_score"] = pd.to_numeric(df["satisfaction_score"], errors="coerce")
        
    cols = ["feedback_id", "trainee_id", "programme_id", "employer_name", "satisfaction_score", "technical_deficiencies", "soft_skill_deficiencies", "skills_required_in_job"]
    for col in cols:
        if col not in df.columns:
            df[col] = None
            
    return df[cols]
