import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock

from app.ai.features import build_programme_employer_aggregates
from app.ai.skill_intelligence import SkillIntelligenceEngine
from app.ai.retention_intelligence import RetentionIntelligenceEngine
from app.ai.decision_engine import DecisionEngine

# ==================================================
# 1. EXACT THRESHOLD TEST (features.py)
# ==================================================
def test_build_programme_employer_aggregates_thresholds():
    # Helper to generate N trainees
    def generate_data(n, programme_id):
        trainee_df = pd.DataFrame({
            'trainee_id': [f"T{i}" for i in range(n)],
            'programme_id': [programme_id] * n
        })
        
        emp_features = pd.DataFrame({
            'trainee_id': [f"T{i}" for i in range(n)],
            'is_employed': [True] * n,
            'retained_6m': [True] * n,
            'retained_12m': [False] * n,
            'latest_salary': [50000.0] * n,
            'wage_growth_amount': [1000.0] * n
        })
        return trainee_df, emp_features

    employer_feedback = pd.DataFrame() # empty for this test

    # CASE C: 3 (Suppressed)
    t3, e3 = generate_data(3, "PROG-3")
    p3, _ = build_programme_employer_aggregates(t3, e3, employer_feedback)
    assert p3.iloc[0]['employment_rate'] is np.nan or pd.isna(p3.iloc[0]['employment_rate'])

    # CASE A: 4 (Suppressed)
    t4, e4 = generate_data(4, "PROG-4")
    p4, _ = build_programme_employer_aggregates(t4, e4, employer_feedback)
    assert pd.isna(p4.iloc[0]['employment_rate'])

    # CASE B: 5 (Permitted)
    t5, e5 = generate_data(5, "PROG-5")
    p5, _ = build_programme_employer_aggregates(t5, e5, employer_feedback)
    assert not pd.isna(p5.iloc[0]['employment_rate'])
    assert p5.iloc[0]['employment_rate'] == 100.0

    # CASE D: 6 (Permitted)
    t6, e6 = generate_data(6, "PROG-6")
    p6, _ = build_programme_employer_aggregates(t6, e6, employer_feedback)
    assert not pd.isna(p6.iloc[0]['employment_rate'])
    assert p6.iloc[0]['average_salary'] == 50000.0

# ==================================================
# 2. BYPASS REGRESSION TEST (skill_intelligence.py)
# ==================================================
@patch("app.ai.skill_intelligence.FirestoreRepository")
def test_skill_intelligence_bypass_regression(mock_firestore):
    # 4 trainees, 3 employer complaints -> should be suppressed
    
    # 4 trainees assessed
    mock_firestore.get_assessments.return_value = [
        {"trainee_id": f"T{i}", "skill_id": "SK-001", "proficiency_score": 20, "created_at": "2023-01-01T00:00:00Z"}
        for i in range(4)
    ]
    
    # 3 employer complaints for SK-001
    mock_firestore.get_employer_feedback.return_value = [
        {"trainee_id": f"T{i}", "technical_deficiencies": ["SK-001"], "created_at": "2023-01-01T00:00:00Z"}
        for i in range(3)
    ]
    
    # Setup trainees map
    mock_firestore.get_trainees.return_value = [
        {"id": f"T{i}", "programme_id": "PROG-1", "district": "D1", "provider": "P1"}
        for i in range(4)
    ]
    mock_firestore.get_programmes.return_value = []
    
    engine = SkillIntelligenceEngine()
    result = engine.analyze_skill_gaps()
    
    # Ensure SK-001 is completely suppressed despite 3 employer complaints
    assert len(result["skill_gaps"]) == 0
    assert result["meta"]["insufficient_data"] == True

# ==================================================
# 3. RETENTION THRESHOLD TEST (retention_intelligence.py)
# ==================================================
@patch("app.ai.retention_intelligence.FirestoreRepository")
def test_retention_intelligence_threshold(mock_firestore):
    # 4 trainees with perfect 6m retention
    trainees = [
        {
            "id": f"T{i}", 
            "programme_id": "PROG-1",
            "employment_history": [
                {
                    "start_date": "2022-01-01T00:00:00Z",
                    "end_date": "2023-01-01T00:00:00Z"
                }
            ]
        }
        for i in range(4)
    ]
    
    mock_firestore.get_trainees.return_value = trainees
    
    engine = RetentionIntelligenceEngine()
    result = engine.analyze_retention_risks()
    
    assert len(result["risk_patterns"]) == 0
    assert result["meta"]["total_observations"] == 4
    # Because valid counts per factor < min_sample_threshold (5)
    
# ==================================================
# 4. DECISION ENGINE GRACEFUL HANDLING
# ==================================================
@patch.object(SkillIntelligenceEngine, 'analyze_skill_gaps')
@patch.object(RetentionIntelligenceEngine, 'analyze_retention_risks')
def test_decision_engine_insufficient_data(mock_ret, mock_skill):
    # Mock engines returning NO data (insufficient)
    mock_skill.return_value = {"skill_gaps": [], "meta": {"insufficient_data": True}}
    mock_ret.return_value = {"risk_patterns": [], "meta": {"insufficient_data": True}}
    
    engine = DecisionEngine()
    result = engine.generate_insights()
    
    # Should safely return 0 recommendations, no crashes, no hallucinations
    assert len(result["recommendations"]) == 0
    assert result["metadata"]["skill_gaps_analyzed"] == 0
    assert result["metadata"]["retention_risks_analyzed"] == 0
