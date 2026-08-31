import pytest
import pandas as pd
import numpy as np
from app.ai.features import (
    build_trainee_skill_features, build_programme_skill_gap,
    build_trainee_job_match, build_employment_wage_features,
    build_programme_employer_aggregates, build_curriculum_gap, engineer_features
)

def test_trainee_skill_features():
    df = pd.DataFrame({
        "trainee_id": ["T1", "T1", "T1", "T2"],
        "skill_id": ["S1", "S1", "S1", "S1"],
        "proficiency_score": [10, 50, 90, 30],
        "assessment_date": pd.to_datetime(["2024-01-01", "2024-02-01", "2024-03-01", "2024-01-01"], utc=True)
    })
    
    feats = build_trainee_skill_features(df)
    
    t1 = feats[feats["trainee_id"] == "T1"].iloc[0]
    assert t1["latest_score"] == 90
    assert t1["assessment_count"] == 3
    assert t1["skill_improvement"] == 80
    assert t1["skill_category"] == "Advanced"
    
    t2 = feats[feats["trainee_id"] == "T2"].iloc[0]
    assert t2["latest_score"] == 30
    assert t2["assessment_count"] == 1
    assert pd.isna(t2["skill_improvement"])
    assert t2["skill_category"] == "Beginner"

def test_programme_skill_gap():
    t_df = pd.DataFrame({"trainee_id": ["T1"], "programme_id": ["P1"]})
    t_skills = pd.DataFrame({"trainee_id": ["T1"], "skill_id": ["S1"], "latest_score": [50]})
    p_skills = pd.DataFrame({"programme_id": ["P1"], "skill_id": ["S1"], "target_level": [80]})
    
    gap_df = build_programme_skill_gap(t_df, t_skills, p_skills)
    assert len(gap_df) == 1
    assert gap_df.iloc[0]["skill_gap"] == 30
    assert gap_df.iloc[0]["skill_gap_percentage"] == 37.5
    assert gap_df.iloc[0]["skill_status"] == "Gap"
    
    # Test met
    t_skills_met = pd.DataFrame({"trainee_id": ["T1"], "skill_id": ["S1"], "latest_score": [90]})
    gap_met = build_programme_skill_gap(t_df, t_skills_met, p_skills)
    assert gap_met.iloc[0]["skill_gap"] == -10
    assert gap_met.iloc[0]["absolute_skill_gap"] == 0
    assert gap_met.iloc[0]["skill_status"] == "Met"

def test_trainee_job_match():
    t_feats = pd.DataFrame({
        "trainee_id": ["T1", "T2"],
        "skill_id": ["S1", "S1"],
        "latest_score": [40, 100]
    })
    j_skills = pd.DataFrame({
        "job_id": ["J1", "J1"],
        "skill_id": ["S1", "S2"],
        "required_level": [80, 50],
        "importance": [1.0, 0.5]
    })
    
    match_df = build_trainee_job_match(t_feats, j_skills)
    
    t1_j1 = match_df[(match_df["trainee_id"] == "T1") & (match_df["job_id"] == "J1")].iloc[0]
    assert t1_j1["missing_skills"] == 1 # S2 is missing
    assert t1_j1["major_gaps"] == 2 # S1 is 40 vs 80 (gap=40), S2 is missing vs 50 (gap=50)
    assert abs(t1_j1["weighted_skill_coverage"] - ((40/80)*1.0 + 0)/1.5) < 0.001
    
    t2_j1 = match_df[(match_df["trainee_id"] == "T2") & (match_df["job_id"] == "J1")].iloc[0]
    assert t2_j1["major_gaps"] == 1 # S2 is missing vs 50
    assert abs(t2_j1["weighted_skill_coverage"] - (1.0*1.0 + 0)/1.5) < 0.001

def test_employment_wage_features():
    emp = pd.DataFrame({
        "trainee_id": ["T1", "T1", "T2"],
        "employment_type": ["full-time", "full-time", "unemployed"],
        "start_date": ["2023-01-01", "2024-01-01", "2024-01-01"],
        "end_date": ["2023-06-01", None, None],
        "salary": [40000, 60000, None]
    })
    
    feats = build_employment_wage_features(emp)
    
    t1 = feats[feats["trainee_id"] == "T1"].iloc[0]
    assert t1["is_employed"] == True
    assert t1["starting_salary"] == 40000
    assert t1["latest_salary"] == 60000
    assert t1["wage_growth_amount"] == 20000
    assert t1["wage_growth_percentage"] == 50.0
    
    t2 = feats[feats["trainee_id"] == "T2"].iloc[0]
    assert t2["is_employed"] == False
    assert t2["is_unemployed"] == True
    assert pd.isna(t2["wage_growth_amount"])
    assert pd.isna(t2["job_relevance_score"])

def test_curriculum_gap():
    j_skills = pd.DataFrame({
        "job_id": ["J1", "J2"],
        "skill_id": ["S1", "S1"],
        "required_level": [50, 70],
        "importance": [1, 1]
    }) # avg req = 60
    
    p_skills = pd.DataFrame({
        "programme_id": ["P1"],
        "skill_id": ["S1"],
        "target_level": [40]
    })
    
    emp_feed = pd.DataFrame()
    gap = build_curriculum_gap(j_skills, p_skills, emp_feed)
    assert len(gap) == 1
    assert gap.iloc[0]["avg_required_level"] == 60
    assert gap.iloc[0]["target_level"] == 40
    assert gap.iloc[0]["missing_curriculum_skills"] == False
