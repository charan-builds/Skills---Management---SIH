import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

def normalize_dates(df: pd.DataFrame, date_cols: list) -> pd.DataFrame:
    """Normalizes date columns safely and adds validity flags."""
    df_clean = df.copy()
    for col in date_cols:
        if col in df_clean.columns:
            # Convert to datetime using coerce so invalid dates become NaT
            df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce', format='mixed', utc=True)
            df_clean[f"{col}_valid"] = df_clean[col].notna()
    return df_clean

def normalize_numerics(df: pd.DataFrame, num_cols: dict) -> pd.DataFrame:
    """
    Normalizes numeric columns safely without clipping.
    num_cols format: {'col_name': (min_val, max_val)}
    Adds validity flags.
    """
    df_clean = df.copy()
    for col, (min_val, max_val) in num_cols.items():
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
            df_clean[f"{col}_valid"] = (
                df_clean[col].notna() & 
                (df_clean[col] >= min_val) & 
                (df_clean[col] <= max_val)
            )
    return df_clean

def get_latest_skill_assessments(trainee_skill_df: pd.DataFrame) -> pd.DataFrame:
    """Returns the latest valid assessment for each trainee_id + skill_id."""
    if trainee_skill_df.empty:
        return trainee_skill_df
        
    df_clean = trainee_skill_df.copy()
    
    # We want VALID assessments
    valid_mask = pd.Series(True, index=df_clean.index)
    if 'proficiency_score_valid' in df_clean.columns:
        valid_mask = valid_mask & df_clean['proficiency_score_valid']
    if 'assessment_date_valid' in df_clean.columns:
        valid_mask = valid_mask & df_clean['assessment_date_valid']
        
    df_valid = df_clean[valid_mask].copy()
    
    # Sort by date
    if 'assessment_date' in df_valid.columns:
        df_valid['assessment_date'] = pd.to_datetime(df_valid['assessment_date'], errors='coerce', format='mixed', utc=True)
        df_valid = df_valid.sort_values('assessment_date', ascending=True, na_position='first')
        
    if 'trainee_id' in df_valid.columns and 'skill_id' in df_valid.columns:
        latest = df_valid.drop_duplicates(subset=['trainee_id', 'skill_id'], keep='last')
        return latest
    return df_valid

def preprocess_pipeline(dfs: Dict[str, pd.DataFrame]) -> Tuple[Dict[str, pd.DataFrame], Dict[str, Any]]:
    """Runs preprocessing over ingested DataFrames and generates a clean output & report."""
    report = {
        "records_processed": 0,
        "missing_values": 0,
        "invalid_values": 0,
        "invalid_dates": 0,
        "duplicate_records": 0,
        "data_quality_flags": 0
    }
    
    clean_dfs = {}
    
    if "trainee_df" in dfs:
        df = dfs["trainee_df"].copy()
        report["records_processed"] += len(df)
        report["missing_values"] += int(df.isna().sum().sum())
        clean_dfs["trainee_df"] = df
        
    if "trainee_skill_df" in dfs:
        df = dfs["trainee_skill_df"].copy()
        df = normalize_dates(df, ['assessment_date'])
        df = normalize_numerics(df, {'proficiency_score': (0, 100)})
        
        if 'trainee_id' in df.columns and 'skill_id' in df.columns:
            report["duplicate_records"] += int(df.duplicated(subset=['trainee_id', 'skill_id']).sum())
            
        report["invalid_dates"] += int((~df['assessment_date_valid']).sum())
        report["invalid_values"] += int((~df['proficiency_score_valid'] & df['proficiency_score'].notna()).sum())
        report["missing_values"] += int(df.isna().sum().sum())
        report["data_quality_flags"] += int(df[['assessment_date_valid', 'proficiency_score_valid']].sum().sum())
        report["records_processed"] += len(df)
        clean_dfs["trainee_skill_df"] = df
        
    if "job_skill_df" in dfs:
        df = dfs["job_skill_df"].copy()
        df = normalize_numerics(df, {'required_level': (0, 100), 'importance': (0, 1)})
        report["invalid_values"] += int((~df['required_level_valid'] & df['required_level'].notna()).sum())
        report["invalid_values"] += int((~df['importance_valid'] & df['importance'].notna()).sum())
        report["missing_values"] += int(df.isna().sum().sum())
        report["data_quality_flags"] += int(df[['required_level_valid', 'importance_valid']].sum().sum())
        report["records_processed"] += len(df)
        clean_dfs["job_skill_df"] = df
        
    if "programme_skill_df" in dfs:
        df = dfs["programme_skill_df"].copy()
        df = normalize_numerics(df, {'target_level': (0, 100)})
        report["invalid_values"] += int((~df['target_level_valid'] & df['target_level'].notna()).sum())
        report["missing_values"] += int(df.isna().sum().sum())
        report["data_quality_flags"] += int(df[['target_level_valid']].sum().sum())
        report["records_processed"] += len(df)
        clean_dfs["programme_skill_df"] = df
        
    if "employment_outcome_df" in dfs:
        df = dfs["employment_outcome_df"].copy()
        df = normalize_dates(df, ['start_date', 'end_date'])
        
        if "salary" in df.columns:
            df["salary"] = pd.to_numeric(df["salary"], errors='coerce')
            
        report["invalid_dates"] += int((~df['start_date_valid']).sum())
        report["invalid_dates"] += int((~df['end_date_valid']).sum())
        report["missing_values"] += int(df.isna().sum().sum())
        report["data_quality_flags"] += int(df[['start_date_valid', 'end_date_valid']].sum().sum())
        report["records_processed"] += len(df)
        clean_dfs["employment_outcome_df"] = df
        
    if "outcomes_timeline_df" in dfs:
        df = dfs["outcomes_timeline_df"].copy()
        df = normalize_dates(df, ['date'])
        report["invalid_dates"] += int((~df['date_valid']).sum())
        report["missing_values"] += int(df.isna().sum().sum())
        report["data_quality_flags"] += int(df[['date_valid']].sum().sum())
        report["records_processed"] += len(df)
        clean_dfs["outcomes_timeline_df"] = df
        
    if "employer_feedback_df" in dfs:
        df = dfs["employer_feedback_df"].copy()
        df = normalize_numerics(df, {'satisfaction_score': (1, 5)})
        report["invalid_values"] += int((~df['satisfaction_score_valid'] & df['satisfaction_score'].notna()).sum())
        report["missing_values"] += int(df.isna().sum().sum())
        report["data_quality_flags"] += int(df[['satisfaction_score_valid']].sum().sum())
        report["records_processed"] += len(df)
        clean_dfs["employer_feedback_df"] = df
        
    return clean_dfs, report
