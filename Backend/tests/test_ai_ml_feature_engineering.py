import pytest
import pandas as pd
import numpy as np
from app.ai.features import (
    build_trainee_skill_features,
    build_employment_wage_features,
    build_programme_employer_aggregates,
    build_programme_skill_gap,
    engineer_features
)
from app.ai.ingestion import build_trainee_df, build_trainee_skill_df

def test_build_trainee_skill_features_normal_and_duplicates():
    # Covers: A (normal), G (duplicates), H (deterministic ordering)
    df = pd.DataFrame([
        {"trainee_id": "T1", "skill_id": "S1", "proficiency_score": 10, "assessment_date": "2023-01-01T00:00:00Z"},
        {"trainee_id": "T1", "skill_id": "S1", "proficiency_score": 50, "assessment_date": "2023-02-01T00:00:00Z"}, # improvement
        {"trainee_id": "T1", "skill_id": "S1", "proficiency_score": 50, "assessment_date": "2023-02-01T00:00:00Z"}, # duplicate
    ])
    res = build_trainee_skill_features(df)
    assert len(res) == 1
    assert res.iloc[0]["latest_score"] == 50
    assert res.iloc[0]["skill_improvement"] == 40
    assert res.iloc[0]["skill_category"] == "Developing"

def test_empty_and_missing_inputs():
    # Covers: B (empty input), C (missing fields), E (missing employment history), F (missing skill assessments)
    # Empty frames should return empty structured frames
    assert build_trainee_skill_features(pd.DataFrame()).empty
    assert build_employment_wage_features(pd.DataFrame()).empty
    
    # Missing fields
    df = pd.DataFrame([{"trainee_id": "T1"}]) # Missing skill_id, proficiency
    res = build_trainee_skill_features(df)
    assert res.empty

def test_temporal_leakage_protection():
    # Covers: M (temporal leakage - Mandatory)
    now = pd.Timestamp.now('UTC')
    future = (now + pd.Timedelta(days=10)).strftime('%Y-%m-%dT%H:%M:%SZ')
    past = (now - pd.Timedelta(days=10)).strftime('%Y-%m-%dT%H:%M:%SZ')
    
    # Skills Temporal Leakage
    df_skills = pd.DataFrame([
        {"trainee_id": "T1", "skill_id": "S1", "proficiency_score": 10, "assessment_date": past},
        {"trainee_id": "T1", "skill_id": "S1", "proficiency_score": 90, "assessment_date": future}, # LEAK!
    ])
    res_skills = build_trainee_skill_features(df_skills)
    assert len(res_skills) == 1
    assert res_skills.iloc[0]["latest_score"] == 10 # Future 90 is ignored
    
    # Employment Temporal Leakage
    df_emp = pd.DataFrame([
        {"trainee_id": "T1", "employment_type": "FULL_TIME", "salary": 50000, "start_date": past},
        {"trainee_id": "T2", "employment_type": "FULL_TIME", "salary": 100000, "start_date": future} # LEAK!
    ])
    res_emp = build_employment_wage_features(df_emp)
    assert "T1" in res_emp["trainee_id"].values
    assert "T2" not in res_emp["trainee_id"].values # Future employment dropped

def test_malformed_and_invalid_numeric_data():
    # Covers: D (malformed), N (invalid numeric), P (no fabricated defaults)
    df = pd.DataFrame([
        {"trainee_id": "T1", "skill_id": "S1", "proficiency_score": "NotANumber", "assessment_date": "bad_date"},
    ])
    # Ingestion layer coerces to NaN
    ingested = build_trainee_skill_df(df.to_dict('records'))
    assert pd.isna(ingested.iloc[0]["proficiency_score"])
    assert pd.isna(ingested.iloc[0]["assessment_date"])

def test_privacy_thresholds_cohorts():
    # Covers: I (privacy threshold), J (cohort 4), K (cohort 5)
    def make_cohort(n, prog_id):
        return (
            pd.DataFrame([{"trainee_id": f"T{i}", "programme_id": prog_id} for i in range(n)]),
            pd.DataFrame([{"trainee_id": f"T{i}", "is_employed": True, "retained_6m": True, "retained_12m": False, "latest_salary": 50000.0, "wage_growth_amount": 0.0} for i in range(n)])
        )
    
    t4, e4 = make_cohort(4, "P4")
    p4, _ = build_programme_employer_aggregates(t4, e4, pd.DataFrame())
    assert pd.isna(p4.iloc[0]["employment_rate"]) # Suppressed (cohort 4)
    
    t5, e5 = make_cohort(5, "P5")
    p5, _ = build_programme_employer_aggregates(t5, e5, pd.DataFrame())
    assert p5.iloc[0]["employment_rate"] == 100.0 # Permitted (cohort 5)

def test_synthetic_data_separation():
    # Covers: L (synthetic data separation)
    data = [
        {"id": "TR-DEMO-001", "programme_id": "P1"},
        {"id": "T-SYN-001", "programme_id": "P1"},
        {"id": "REAL-123", "programme_id": "P1"}
    ]
    df = build_trainee_df(data)
    assert df.loc[df["trainee_id"] == "TR-DEMO-001", "is_synthetic"].iloc[0] == True
    assert df.loc[df["trainee_id"] == "T-SYN-001", "is_synthetic"].iloc[0] == True
    assert df.loc[df["trainee_id"] == "REAL-123", "is_synthetic"].iloc[0] == False
