import pandas as pd
from typing import Dict, Any
import numpy as np

def validate_pipeline_data(dfs: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    report = {
        "records_checked": 0,
        "invalid_dates": 0,
        "invalid_scores": 0,
        "broken_references": 0,
        "duplicates": 0,
        "missing_required_fields": 0
    }
    
    # 1. Total records
    for name, df in dfs.items():
        report["records_checked"] += len(df)
        
    # 2. Invalid dates (NaT in datetime columns)
    for name, df in dfs.items():
        for col in df.select_dtypes(include=['datetime64', 'datetimetz']).columns:
            report["invalid_dates"] += df[col].isna().sum()
            
    # 3. Invalid scores/levels/importance
    if "trainee_skill_df" in dfs:
        df = dfs["trainee_skill_df"]
        invalid = df[~df["proficiency_score"].between(0, 100) & df["proficiency_score"].notna()]
        report["invalid_scores"] += len(invalid)
        
    if "job_skill_df" in dfs:
        df = dfs["job_skill_df"]
        invalid_levels = df[~df["required_level"].between(0, 100) & df["required_level"].notna()]
        report["invalid_scores"] += len(invalid_levels)
        
        invalid_imp = df[~df["importance"].between(0, 1) & df["importance"].notna()]
        report["invalid_scores"] += len(invalid_imp)
        
    if "programme_skill_df" in dfs:
        df = dfs["programme_skill_df"]
        invalid_tgt = df[~df["target_level"].between(0, 100) & df["target_level"].notna()]
        report["invalid_scores"] += len(invalid_tgt)
        
    # 4. Duplicates
    if "trainee_skill_df" in dfs:
        df = dfs["trainee_skill_df"]
        if "trainee_id" in df.columns and "skill_id" in df.columns:
            dups = df.duplicated(subset=["trainee_id", "skill_id"]).sum()
            report["duplicates"] += dups
            
    # 5. Broken references
    if "trainee_df" in dfs:
        valid_trainees = set(dfs["trainee_df"]["trainee_id"].dropna())
        
        for df_name in ["trainee_skill_df", "employment_outcome_df", "outcomes_timeline_df", "employer_feedback_df"]:
            if df_name in dfs:
                df = dfs[df_name]
                if "trainee_id" in df.columns:
                    broken = df[~df["trainee_id"].isin(valid_trainees) & df["trainee_id"].notna()]
                    report["broken_references"] += len(broken)
    
    # 6. Missing required fields
    if "trainee_df" in dfs:
        report["missing_required_fields"] += dfs["trainee_df"]["trainee_id"].isna().sum()
    
    if "job_skill_df" in dfs:
        if "job_id" in dfs["job_skill_df"].columns:
            report["missing_required_fields"] += dfs["job_skill_df"]["job_id"].isna().sum()
        if "skill_id" in dfs["job_skill_df"].columns:
            report["missing_required_fields"] += dfs["job_skill_df"]["skill_id"].isna().sum()

    if "trainee_skill_df" in dfs:
        if "skill_id" in dfs["trainee_skill_df"].columns:
            report["missing_required_fields"] += dfs["trainee_skill_df"]["skill_id"].isna().sum()
        
    # Convert np ints to native ints for JSON serialization
    for k, v in report.items():
        if isinstance(v, (np.integer, int, np.int64, np.int32)):
            report[k] = int(v)
            
    return report
