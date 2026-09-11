import pytest
import pandas as pd
import os
import shutil
from app.ai.synthetic import generate_synthetic_dataset, export_synthetic_dataset

def test_synthetic_dataset_size():
    dfs = generate_synthetic_dataset(num_trainees=5000, seed=42)
    
    assert len(dfs["trainee_df"]) == 5000
    assert not dfs["trainee_skill_df"].empty
    assert not dfs["job_skill_df"].empty
    assert not dfs["programme_skill_df"].empty
    assert len(dfs["employment_outcome_df"]) == 5000

def test_no_data_leakage():
    dfs = generate_synthetic_dataset(num_trainees=100, seed=42)
    
    t_df = dfs["trainee_df"]
    # Ensure hidden causal variables are not leaked into the dataset
    assert "latent_ability" not in t_df.columns
    assert "target_job_id" not in t_df.columns

def test_synthetic_correlations():
    dfs = generate_synthetic_dataset(num_trainees=1000, seed=42)
    
    emp_df = dfs["employment_outcome_df"]
    
    employed = emp_df[emp_df['employment_type'] == 'Employed']
    unemployed = emp_df[emp_df['employment_type'] == 'Unemployed']
    
    # We generated causal data. At least some should be employed and unemployed.
    assert len(employed) > 0
    assert len(unemployed) > 0
    
    # In our causal model, employed people have a salary
    assert employed['salary'].notna().all()
    assert unemployed['salary'].isna().all()

def test_export_synthetic_dataset(tmp_path):
    output_dir = tmp_path / "synthetic_data"
    export_synthetic_dataset(str(output_dir))
    
    assert os.path.exists(output_dir)
    assert os.path.exists(output_dir / "trainee_df.csv")
    assert os.path.exists(output_dir / "employment_outcome_df.csv")
