import pytest
from app.services.skill_gap_service import SkillGapService
from app.schemas.skill import SkillGapBase, UpskillingRecommendationBase
from unittest.mock import patch

# ---------------------------------------------------------
# Phase 2E: Comprehensive Test Matrix
# ---------------------------------------------------------

@patch('app.services.skill_gap_service.FirestoreRepository')
def test_1_no_benchmark(mock_repo):
    mock_repo.get_trainee.return_value = {"id": "t1", "target_role_id": None}
    res = SkillGapService.calculate_skill_gaps("t1")
    assert res["status"] == "NO_BENCHMARK"

@patch('app.services.skill_gap_service.FirestoreRepository')
def test_2_no_verified_evidence_and_3_no_skill_gap(mock_repo):
    # Trainee has no assessments (None gap) and one assessment that exceeds required (<=0 gap)
    mock_repo.get_trainee.return_value = {"id": "t1", "target_role_id": "j1"}
    mock_repo.get_role_benchmark.return_value = {
        "id": "j1", "title": "Dev",
        "skills_required": [
            {"skill_id": "s1", "skill_name": "Python", "required_level": 80, "importance": 0.9},
            {"skill_id": "s2", "skill_name": "SQL", "required_level": 70, "importance": 0.6}
        ]
    }
    mock_repo.get_trainee_assessments.return_value = [
        {"skill_id": "s2", "skill_name": "SQL", "proficiency_score": 90}
    ]
    
    res = SkillGapService.calculate_skill_gaps("t1")
    assert res["status"] == "SUCCESS"
    gaps = res["gaps"]
    
    # Python gap is None (No evidence)
    python_gap = next(g for g in gaps if g.skill_id == "s1")
    assert python_gap.gap_size is None
    assert python_gap.evidence_state == "NO_EVIDENCE"
    
    # SQL gap is <= 0 (No skill gap), so it should be filtered entirely by Phase 2D logic
    assert not any(g.skill_id == "s2" for g in gaps)
    
    # Recommendation engine should skip the Python gap since it has no evidence
    recs = SkillGapService.generate_recommendations(gaps)
    assert len(recs) == 0

@patch('app.services.skill_gap_service.FirestoreRepository')
def test_4_one_gap_matching_programme_and_10_insufficient_proficiency(mock_repo):
    gaps = [SkillGapBase(skill="Python", skill_id="s1", current_proficiency=40, required_proficiency=80, gap_size=40, priority="CRITICAL", evidence_state="VERIFIED", benchmark_source="Job")]
    
    mock_repo.get_programmes.return_value = [
        {
            "id": "p1", "name": "Basic Python",
            "skills_taught_structured": [{"skill_id": "s1", "target_level": 50}] # Insufficient
        },
        {
            "id": "p2", "name": "Advanced Python",
            "skills_taught_structured": [{"skill_id": "s1", "target_level": 90}] # Matches
        }
    ]
    
    recs = SkillGapService.generate_recommendations(gaps)
    assert len(recs) == 1
    assert recs[0].state == "RECOMMENDATION_AVAILABLE"
    assert recs[0].recommended_programme == "Advanced Python"
    
@patch('app.services.skill_gap_service.FirestoreRepository')
def test_5_one_gap_no_matching_programme_and_8_unrelated_skill(mock_repo):
    gaps = [SkillGapBase(skill="Java", skill_id="s_java", current_proficiency=40, required_proficiency=80, gap_size=40, priority="CRITICAL", evidence_state="VERIFIED", benchmark_source="Job")]
    
    mock_repo.get_programmes.return_value = [
        {
            "id": "p1", "name": "Advanced Python",
            "skills_taught_structured": [{"skill_id": "s_py", "target_level": 90}] # Unrelated
        }
    ]
    
    recs = SkillGapService.generate_recommendations(gaps)
    assert len(recs) == 1
    assert recs[0].state == "NO_MATCHING_PROGRAMME"
    assert recs[0].recommended_programme is None

@patch('app.services.skill_gap_service.FirestoreRepository')
def test_6_multiple_gaps_one_programme_and_7_different_programmes(mock_repo):
    gaps = [
        SkillGapBase(skill="Python", skill_id="s_py", current_proficiency=40, required_proficiency=80, gap_size=40, priority="CRITICAL", evidence_state="VERIFIED", benchmark_source="Job"),
        SkillGapBase(skill="SQL", skill_id="s_sql", current_proficiency=40, required_proficiency=80, gap_size=40, priority="HIGH", evidence_state="VERIFIED", benchmark_source="Job"),
        SkillGapBase(skill="AWS", skill_id="s_aws", current_proficiency=40, required_proficiency=80, gap_size=40, priority="MEDIUM", evidence_state="VERIFIED", benchmark_source="Job")
    ]
    
    mock_repo.get_programmes.return_value = [
        {
            "id": "p1", "name": "Data Bootcamp",
            "skills_taught_structured": [
                {"skill_id": "s_py", "target_level": 90},
                {"skill_id": "s_sql", "target_level": 90}
            ]
        },
        {
            "id": "p2", "name": "Cloud Bootcamp",
            "skills_taught_structured": [
                {"skill_id": "s_aws", "target_level": 90}
            ]
        }
    ]
    
    recs = SkillGapService.generate_recommendations(gaps)
    assert len(recs) == 3
    
    py_rec = next(r for r in recs if r.skill == "Python")
    sql_rec = next(r for r in recs if r.skill == "SQL")
    aws_rec = next(r for r in recs if r.skill == "AWS")
    
    assert py_rec.programme_id == "p1"
    assert sql_rec.programme_id == "p1" # One programme covers multiple
    assert aws_rec.programme_id == "p2" # Different programme

@patch('app.services.skill_gap_service.FirestoreRepository')
def test_14_tie_breaking(mock_repo):
    gaps = [SkillGapBase(skill="Python", skill_id="s1", current_proficiency=40, required_proficiency=80, gap_size=40, priority="CRITICAL", evidence_state="VERIFIED", benchmark_source="Job")]
    
    mock_repo.get_programmes.return_value = [
        {
            "id": "p1", "name": "Zeta Python",
            "skills_taught_structured": [{"skill_id": "s1", "target_level": 90}]
        },
        {
            "id": "p2", "name": "Alpha Python",
            "skills_taught_structured": [{"skill_id": "s1", "target_level": 90}]
        }
    ]
    
    recs = SkillGapService.generate_recommendations(gaps)
    # Both have impact = 50. Should tie-break by name alphabetically, so Alpha Python wins.
    assert recs[0].recommended_programme == "Alpha Python"

@patch('app.services.skill_gap_service.FirestoreRepository')
def test_12_invalid_skill_ids_and_9_incomplete_metadata(mock_repo):
    gaps = [SkillGapBase(skill="Unknown", skill_id="invalid_id", current_proficiency=40, required_proficiency=80, gap_size=40, priority="CRITICAL", evidence_state="VERIFIED", benchmark_source="Job")]
    
    mock_repo.get_programmes.return_value = [
        {
            "id": "p1", "name": "Mystery Prog",
            # No target level provided, assumed 0 -> rejected.
            "skills_taught_structured": [{"skill_id": "invalid_id"}] 
        }
    ]
    
    recs = SkillGapService.generate_recommendations(gaps)
    assert recs[0].state == "NO_MATCHING_PROGRAMME"
