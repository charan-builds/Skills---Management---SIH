import pytest
import pandas as pd
import numpy as np
from app.ai.intelligence import (
    personal_skill_intelligence, outcome_diagnosis, programme_impact_score,
    curriculum_recommendations, simulate_scenario, run_intelligence_pipeline
)

def test_personal_skill_intelligence():
    t_job_feats = pd.DataFrame({
        "trainee_id": ["T1"], "job_id": ["J1"], "overall_job_match_score": [75.0]
    })
    t_skill_feats = pd.DataFrame({
        "trainee_id": ["T1", "T1"],
        "skill_id": ["S1", "S2"],
        "latest_score": [50.0, np.nan]
    })
    j_skill = pd.DataFrame({
        "job_id": ["J1", "J1", "J1"],
        "skill_id": ["S1", "S2", "S3"],
        "required_level": [80.0, 50.0, 40.0],
        "importance": [1.0, 0.8, 0.5]
    })
    
    res = personal_skill_intelligence("T1", "J1", t_job_feats, t_skill_feats, j_skill)
    
    assert res["overall_match_score"] == 75.0
    p_skills = res["priority_skills"]
    assert len(p_skills) == 3
    
    assert p_skills[0]["skill_id"] == "S2"
    assert p_skills[0]["priority"] == "HIGH"

def test_outcome_diagnosis():
    prog = pd.DataFrame({
        "programme_id": ["P1", "P2"],
        "employment_rate": [40.0, np.nan],
        "retention_6m_rate": [80.0, np.nan]
    })
    curr = pd.DataFrame({
        "programme_id": ["P1"], "skill_id": ["S1"], "missing_curriculum_skills": [True]
    })
    emp = pd.DataFrame({
        "programme_id": ["P1"], "most_common_technical_gaps": [["S1", "S2"]]
    })
    
    d1 = outcome_diagnosis("P1", prog, curr, emp)
    issues = [x["issue"] for x in d1]
    assert "LOW_EMPLOYMENT" in issues
    assert "CURRICULUM_GAP" in issues
    assert "EMPLOYER_SKILL_DEFICIENCY" in issues
    
    d2 = outcome_diagnosis("P2", prog, curr, emp)
    issues2 = [x["issue"] for x in d2]
    assert "INSUFFICIENT_DATA" in issues2

def test_programme_impact_score():
    prog = pd.DataFrame({
        "programme_id": ["P1"],
        "employment_rate": [80.0],
        "retention_6m_rate": [90.0],
        "average_wage_growth": [10000.0]
    })
    emp = pd.DataFrame({
        "programme_id": ["P1"], "average_employer_satisfaction": [4.0]
    })
    
    res = programme_impact_score("P1", prog, emp)
    assert "final_impact_score" in res
    assert abs(res["adjusted_weights"]["employment"] - (30/80)*100) < 0.001
    
def test_scenario_simulation():
    c_gap = pd.DataFrame({
        "programme_id": ["P1"],
        "skill_id": ["S1"],
        "target_level": [40],
        "avg_required_level": [80]
    })
    feats = {"curriculum_gap_features": c_gap}
    
    res = simulate_scenario('increase_target_proficiency', {'programme_id': 'P1', 'skill_id': 'S1', 'increase_amount': 20}, feats)
    assert res["baseline_target"] == 40
    assert res["estimated_scenario_target"] == 60
    assert res["baseline_industry_gap"] == 40
    assert res["estimated_scenario_gap"] == 20
    assert res["impact_delta"] == -20

def test_insufficient_data():
    res = programme_impact_score("P99", pd.DataFrame(), pd.DataFrame())
    assert "error" in res
