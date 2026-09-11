import pytest
from app.ai.decision_engine import DecisionEngine
from unittest.mock import patch

def test_decision_engine_initialization():
    engine = DecisionEngine()
    assert engine.version == "1.0.0"

def test_decision_engine_insights_structure():
    # Mock the internal engines to return fixed data
    skill_mock = {
        "skill_gaps": [
            {
                "skill": "Python",
                "evidence": {
                    "total_assessments": 10,
                    "average_proficiency": 40,
                    "deficiency_rate": 0.6,
                    "employer_complaint_frequency": 3,
                    "trainees_affected": 8,
                    "affected_programmes": {"P001": 8},
                    "affected_districts": {"D001": 8}
                }
            }
        ],
        "meta": {"total_assessments_analyzed": 10, "total_feedback_analyzed": 5, "insufficient_data": False}
    }
    
    retention_mock = {
        "risk_patterns": [
            {
                "factor_type": "PROGRAMME",
                "factor_value": "P002",
                "evidence": {
                    "observations": 20,
                    "retention_rate": 0.4,
                    "global_average": 0.7,
                    "difference": -0.3
                }
            }
        ],
        "meta": {"total_uncensored_observations": 100, "global_retention_rate": 0.7, "insufficient_data": False}
    }
    
    with patch("app.ai.skill_intelligence.SkillIntelligenceEngine.analyze_skill_gaps", return_value=skill_mock), \
         patch("app.ai.retention_intelligence.RetentionIntelligenceEngine.analyze_retention_risks", return_value=retention_mock):
        
        engine = DecisionEngine()
        insights = engine.generate_insights()
        
        assert "metadata" in insights
        assert "recommendations" in insights
        assert "raw_intelligence" in insights
        
        recommendations = insights["recommendations"]
        assert len(recommendations) == 2
        
        # Python gap should generate SKILL_REMEDIATION because employer_complaint >= 2
        rec_skill = next((r for r in recommendations if r["type"] == "SKILL_REMEDIATION"), None)
        assert rec_skill is not None
        assert rec_skill["affected_skill"] == "Python"
        assert rec_skill["strength"] == "HIGH"
        
        # P002 should generate PROGRAMME_INTERVENTION because difference <= -0.2
        rec_retention = next((r for r in recommendations if r["type"] == "PROGRAMME_INTERVENTION"), None)
        assert rec_retention is not None
        assert rec_retention["target_scope"] == "PROGRAMME"
        assert rec_retention["strength"] == "CRITICAL"
        
def test_no_causal_claims_in_recommendations():
    engine = DecisionEngine()
    # Ensure limitations disclaimer is present in the create function
    rec = engine._create_recommendation(
        "TEST", "Title", "Desc", "SCOPE", None, [], {}, "LOW", []
    )
    
    disclaimers = " ".join(rec["limitations"]).lower()
    assert "observational" in disclaimers
    assert "causality" in disclaimers
