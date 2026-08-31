import pytest
from app.ai.ingestion import (
    load_trainees, load_skills, load_skill_assessments, load_programmes,
    load_jobs, load_employer_feedback, load_employer_verifications, load_interventions,
    build_trainee_df, build_trainee_skill_df, build_job_skill_df, build_programme_skill_df,
    build_employment_outcome_df, build_outcomes_timeline_df, build_employer_feedback_df
)
from app.ai.validation import validate_pipeline_data
from unittest.mock import patch

@patch("app.ai.ingestion.FirestoreRepository.get_trainees", return_value=[{"id": "T1", "provider": "Provider A", "outcomes_timeline": [{"checkpoint": "6 Months"}], "status": "Certified"}])
@patch("app.ai.ingestion.FirestoreRepository.get_skills", return_value=[{"id": "S1", "name": "Python"}])
@patch("app.ai.ingestion.FirestoreRepository.get_assessments", return_value=[{"trainee_id": "T1", "skill_id": "S1", "proficiency_score": 80}])
@patch("app.ai.ingestion.FirestoreRepository.get_programmes", return_value=[{"id": "P1", "curriculum": [{"skill_id": "S1", "target_level": 70}]}])
@patch("app.ai.ingestion.FirestoreRepository.get_jobs", return_value=[{"id": "J1", "required_skills": [{"skill_id": "S1", "required_level": 80}]}])
@patch("app.ai.ingestion.FirestoreRepository.get_employer_feedback", return_value=[{"employer_id": "E1", "trainee_id": "T1"}])
def test_ingestion_and_validation(m1, m2, m3, m4, m5, m6):
    # 1. Load Data
    trainees_data = load_trainees()
    skills_data = load_skills()
    assessments_data = load_skill_assessments()
    programmes_data = load_programmes()
    jobs_data = load_jobs()
    feedback_data = load_employer_feedback()
    
    # 2. Build DataFrames
    trainee_df = build_trainee_df(trainees_data)
    trainee_skill_df = build_trainee_skill_df(assessments_data)
    job_skill_df = build_job_skill_df(jobs_data)
    programme_skill_df = build_programme_skill_df(programmes_data)
    employment_outcome_df = build_employment_outcome_df(trainees_data)
    outcomes_timeline_df = build_outcomes_timeline_df(trainees_data)
    employer_feedback_df = build_employer_feedback_df(feedback_data)
    
    # 3. Assert Column Stability (Schema verification)
    assert "trainee_id" in trainee_df.columns
    assert "provider" in trainee_df.columns
    
    assert "skill_id" in trainee_skill_df.columns
    assert "proficiency_score" in trainee_skill_df.columns
    
    assert "start_date" in employment_outcome_df.columns
    assert "employer_name" in employment_outcome_df.columns
    
    assert "required_level" in job_skill_df.columns
    assert "target_level" in programme_skill_df.columns
    
    # 4. Check nested lists flattened correctly
    # If trainees > 0, timelines > 0
    if len(trainees_data) > 0:
        assert len(outcomes_timeline_df) >= len(trainees_data)
    
    # 5. Run Validation
    dfs = {
        "trainee_df": trainee_df,
        "trainee_skill_df": trainee_skill_df,
        "job_skill_df": job_skill_df,
        "programme_skill_df": programme_skill_df,
        "employment_outcome_df": employment_outcome_df,
        "outcomes_timeline_df": outcomes_timeline_df,
        "employer_feedback_df": employer_feedback_df
    }
    
    report = validate_pipeline_data(dfs)
    
    # Print report for visibility in pytest output
    print("\n--- Validation Report ---")
    for k, v in report.items():
        print(f"  {k}: {v}")
    print("-------------------------\n")
    
    assert "records_checked" in report
    
    print(f"Loaded {len(trainee_df)} trainees.")
    print(f"Loaded {len(trainee_skill_df)} skill assessments.")
    print(f"Loaded {len(job_skill_df)} job skill requirements.")
    print(f"Loaded {len(programme_skill_df)} programme skill targets.")
    print(f"Loaded {len(employment_outcome_df)} employment outcomes.")
    print(f"Loaded {len(outcomes_timeline_df)} timeline checkpoints.")
    print(f"Loaded {len(employer_feedback_df)} employer feedback records.")
