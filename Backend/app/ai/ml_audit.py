import pandas as pd
import numpy as np
from typing import Dict, Any

def audit_synthetic_dataset(dfs: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """
    Rigorously audits the structure, distribution, and completeness of the synthetic dataset.
    """
    report = {
        "tables_analyzed": list(dfs.keys()),
        "record_counts": {},
        "missing_values": {},
        "duplicates": {},
        "warnings": []
    }
    
    for name, df in dfs.items():
        report["record_counts"][name] = len(df)
        try:
            report["duplicates"][name] = df.duplicated().sum()
        except TypeError:
            # Handle unhashable types like lists in columns
            report["duplicates"][name] = df.astype(str).duplicated().sum()
        
        # Missing value analysis
        missing = df.isnull().sum()
        missing = missing[missing > 0].to_dict()
        if missing:
            report["missing_values"][name] = missing
            
    # Trainee and Employment specific deep-dive
    emp_df = dfs.get("employment_outcome_df", pd.DataFrame())
    if not emp_df.empty:
        employed = emp_df[emp_df['employment_type'] == 'Employed']
        unemployed = emp_df[emp_df['employment_type'] == 'Unemployed']
        report["class_balance_employment"] = {
            "employed_count": len(employed),
            "unemployed_count": len(unemployed),
            "employment_rate": round(len(employed) / max(1, len(emp_df)) * 100, 2)
        }
        
        if len(employed) > 0:
            report["salary_distribution"] = {
                "min": employed['salary'].min(),
                "max": employed['salary'].max(),
                "mean": round(employed['salary'].mean(), 2)
            }
            if employed['salary'].min() < 0:
                report["warnings"].append("Negative salaries detected in employment_outcome_df.")

    return report

def analyze_signal(dfs: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """
    Measures the signal between observable variables and target outcomes.
    If the signal is 1.0 (perfect correlation), that indicates suspicious leakage.
    If the signal is ~0.0, the causal model failed to generate useful dependencies.
    """
    signals = {}
    
    t_skills = dfs.get("trainee_skill_df", pd.DataFrame())
    emp = dfs.get("employment_outcome_df", pd.DataFrame())
    
    if t_skills.empty or emp.empty:
        return signals
        
    # Aggregate trainee skill score mean as a naive observable feature
    mean_skills = t_skills.groupby('trainee_id')['proficiency_score'].mean().reset_index()
    
    merged = pd.merge(emp[['trainee_id', 'employment_type', 'salary']], mean_skills, on='trainee_id', how='inner')
    merged['is_employed'] = (merged['employment_type'] == 'Employed').astype(int)
    
    # Biserial correlation approximation for continuous vs binary
    if merged['proficiency_score'].std() > 0:
        emp_corr = merged[['proficiency_score', 'is_employed']].corr().iloc[0, 1]
        signals["skill_score_to_employment_correlation"] = round(emp_corr, 4)
        if emp_corr > 0.95:
            signals["employment_leakage_warning"] = "Suspiciously high correlation (>=0.95). Possible deterministic target leakage."
    
    # Pearson correlation for continuous vs continuous (salary)
    salaried = merged[merged['is_employed'] == 1]
    if len(salaried) > 1 and salaried['proficiency_score'].std() > 0:
        sal_corr = salaried[['proficiency_score', 'salary']].corr().iloc[0, 1]
        signals["skill_score_to_salary_correlation"] = round(sal_corr, 4)
        if sal_corr > 0.95:
             signals["salary_leakage_warning"] = "Suspiciously high salary correlation (>=0.95). Possible target leakage."
             
    return signals
