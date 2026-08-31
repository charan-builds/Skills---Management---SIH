import pandas as pd
import numpy as np
import math
from typing import Dict, Any, List
from app.ai.ingestion import (
    load_trainees, load_skills, load_skill_assessments, load_programmes,
    load_jobs, load_employer_feedback, load_employer_verifications, load_interventions,
    build_trainee_df, build_trainee_skill_df, build_job_skill_df, build_programme_skill_df,
    build_employment_outcome_df, build_outcomes_timeline_df, build_employer_feedback_df
)
from app.ai.preprocessing import preprocess_pipeline
from app.ai.features import engineer_features
from app.ai.intelligence import run_intelligence_pipeline

def clean_nan(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: clean_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan(i) for i in obj]
    elif isinstance(obj, (float, np.floating)):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, (int, np.integer)):
        return int(obj)
    return obj

class AIService:
    @classmethod
    def process_intelligence(cls) -> tuple[Dict[str, Any], Dict[str, pd.DataFrame]]:
        trainees = load_trainees()
        assessments = load_skill_assessments()
        jobs = load_jobs()
        programmes = load_programmes()
        employer_feedback = load_employer_feedback()
        
        raw_dfs = {
            "trainee_df": build_trainee_df(trainees),
            "trainee_skill_df": build_trainee_skill_df(assessments),
            "job_skill_df": build_job_skill_df(jobs),
            "programme_skill_df": build_programme_skill_df(programmes),
            "employment_outcome_df": build_employment_outcome_df(trainees),
            "outcomes_timeline_df": build_outcomes_timeline_df(trainees),
            "employer_feedback_df": build_employer_feedback_df(employer_feedback)
        }
        
        clean_dfs, _ = preprocess_pipeline(raw_dfs)
        features = engineer_features(clean_dfs)
        intel = run_intelligence_pipeline(features)
        
        return clean_nan(intel), features

    @classmethod
    def get_trainee_skills(cls, trainee_id: str) -> List[Dict[str, Any]]:
        intel, features = cls.process_intelligence()
        df = features.get('trainee_skill_features', pd.DataFrame())
        if df.empty:
            return []
            
        t_df = df[df['trainee_id'] == trainee_id]
        return clean_nan(t_df.to_dict(orient='records'))

    @classmethod
    def get_trainee_job_match(cls, trainee_id: str, job_id: str) -> Dict[str, Any]:
        intel, features = cls.process_intelligence()
        from app.ai.intelligence import personal_skill_intelligence
        tj = features.get('trainee_job_features', pd.DataFrame())
        ts = features.get('trainee_skill_features', pd.DataFrame())
        js = features.get('job_skill_df', pd.DataFrame())
        
        if tj.empty or ts.empty or js.empty:
            return {"error": "INSUFFICIENT_DATA"}
            
        match = personal_skill_intelligence(trainee_id, job_id, tj, ts, js)
        return clean_nan(match)

    @classmethod
    def get_programme_diagnosis(cls, programme_id: str) -> List[Dict[str, Any]]:
        intel, _ = cls.process_intelligence()
        diag = intel.get('outcome_diagnosis', {})
        if programme_id in diag:
            return diag[programme_id]
        return [{"issue": "INSUFFICIENT_DATA", "severity": "UNKNOWN"}]

    @classmethod
    def get_programme_curriculum(cls, programme_id: str) -> List[Dict[str, Any]]:
        intel, _ = cls.process_intelligence()
        curr = intel.get('curriculum_recommendations', {})
        if programme_id in curr:
            return curr[programme_id]
        return []
        
    @classmethod
    def get_programme_overview(cls, programme_id: str) -> Dict[str, Any]:
        intel, _ = cls.process_intelligence()
        impact = intel.get('programme_intelligence', {})
        if programme_id in impact:
            return impact[programme_id]
        return {"error": "INSUFFICIENT_DATA"}

    @classmethod
    def simulate_scenario(cls, req: Dict[str, Any]) -> Dict[str, Any]:
        from app.ai.intelligence import simulate_scenario
        intel, features = cls.process_intelligence()
        res = simulate_scenario(req.get('type'), req.get('params', {}), features)
        return clean_nan(res)
