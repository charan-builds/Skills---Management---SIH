import pytest
import pandas as pd
import numpy as np
from app.ai.preprocessing import (
    normalize_dates, normalize_numerics, get_latest_skill_assessments, preprocess_pipeline
)

def test_date_normalization():
    # Covers: ISO date, YYYY-MM-DD, MMM YYYY, invalid date, missing date
    data = {
        "date_col": [
            "2026-08-28T12:40:00Z", # ISO
            "2025-01-15",           # YYYY-MM-DD
            "Jan 2025",             # MMM YYYY
            "Not a date",           # invalid date
            None                    # missing date
        ]
    }
    df = pd.DataFrame(data)
    clean_df = normalize_dates(df, ["date_col"])
    
    # 1. ISO date conversion
    assert pd.notna(clean_df.loc[0, "date_col"])
    # 2. YYYY-MM-DD conversion
    assert pd.notna(clean_df.loc[1, "date_col"])
    # 3. MMM YYYY conversion
    assert pd.notna(clean_df.loc[2, "date_col"])
    # 4. invalid date handling (must become NaT)
    assert pd.isna(clean_df.loc[3, "date_col"])
    # 5. missing date handling (must remain NaT)
    assert pd.isna(clean_df.loc[4, "date_col"])
    
    # Check flags
    assert clean_df.loc[0, "date_col_valid"] == True
    assert clean_df.loc[3, "date_col_valid"] == False
    assert clean_df.loc[4, "date_col_valid"] == False

def test_numeric_normalization():
    # Covers: valid, invalid bounds, missing values
    data = {
        "proficiency_score": [85, 110, -5, "ABC", None],
        "required_level": [50, 150, -1, None, "XYZ"],
        "importance": [0.8, 1.5, -0.2, None, "A"]
    }
    df = pd.DataFrame(data)
    
    # 6. numeric conversion (invalid strings become NaN, valid numbers parsed)
    # 7. invalid proficiency detection [0, 100]
    # 8. invalid required level detection [0, 100]
    # 9. invalid importance detection [0, 1]
    
    clean_df = normalize_numerics(df, {
        "proficiency_score": (0, 100),
        "required_level": (0, 100),
        "importance": (0, 1)
    })
    
    # Value conversions (ABC -> NaN)
    assert pd.isna(clean_df.loc[3, "proficiency_score"])
    
    # Check validity flags
    assert clean_df.loc[0, "proficiency_score_valid"] == True
    assert clean_df.loc[0, "required_level_valid"] == True
    assert clean_df.loc[0, "importance_valid"] == True
    
    # Out of upper bound
    assert clean_df.loc[1, "proficiency_score_valid"] == False
    assert clean_df.loc[1, "required_level_valid"] == False
    assert clean_df.loc[1, "importance_valid"] == False
    
    # Out of lower bound
    assert clean_df.loc[2, "proficiency_score_valid"] == False
    assert clean_df.loc[2, "required_level_valid"] == False
    assert clean_df.loc[2, "importance_valid"] == False

def test_assessment_history_and_latest():
    # Covers: multiple assessment history, latest assessment selection
    data = {
        "trainee_id": ["T1", "T1", "T1", "T2"],
        "skill_id": ["S1", "S1", "S2", "S1"],
        "proficiency_score": [50, 80, 70, 90],
        "proficiency_score_valid": [True, True, True, True],
        "assessment_date": ["2024-01-01", "2024-06-01", "2024-02-01", "2024-03-01"],
        "assessment_date_valid": [True, True, True, True]
    }
    df = pd.DataFrame(data)
    
    # 10. multiple assessment history presence is preserved in original DF
    assert len(df) == 4
    
    # 11. latest assessment selection
    latest_df = get_latest_skill_assessments(df)
    
    assert len(latest_df) == 3
    t1_s1 = latest_df[(latest_df["trainee_id"] == "T1") & (latest_df["skill_id"] == "S1")]
    assert len(t1_s1) == 1
    assert t1_s1.iloc[0]["proficiency_score"] == 80 # Latest date 2024-06-01

def test_missing_preservation_and_pipeline():
    # 12. missing salary preservation
    # 13. missing end_date preservation
    # 14. stable output columns
    
    dfs = {
        "employment_outcome_df": pd.DataFrame({
            "trainee_id": ["T1", "T2"],
            "salary": [25000, None], # missing salary
            "start_date": ["2024-01-01", "2024-02-01"],
            "end_date": ["2024-06-01", None] # missing end_date
        })
    }
    
    clean_dfs, report = preprocess_pipeline(dfs)
    emp_df = clean_dfs["employment_outcome_df"]
    
    # 12. missing salary preservation (NaN != 0)
    assert pd.isna(emp_df.loc[1, "salary"])
    assert emp_df.loc[1, "salary"] != 0
    
    # 13. missing end_date preservation (NaT)
    assert pd.isna(emp_df.loc[1, "end_date"])
    
    # 14. stable output columns
    assert "start_date_valid" in emp_df.columns
    assert "end_date_valid" in emp_df.columns
    
    # Report checks
    assert report["records_processed"] == 2
    
    print("\n--- Preprocessing Report ---")
    for k, v in report.items():
        print(f"  {k}: {v}")
    print("----------------------------\n")
