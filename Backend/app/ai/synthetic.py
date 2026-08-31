import pandas as pd
import numpy as np
import os
import uuid
from typing import Dict
from datetime import datetime, timedelta

def generate_synthetic_dataset(num_trainees: int = 5000, seed: int = 42) -> Dict[str, pd.DataFrame]:
    """
    Generates a statistically correlated synthetic dataset for ML experimentation.
    Guarantees no leakage from production data and full reproducibility.
    """
    np.random.seed(seed)
    
    # 1. Generate Skills
    num_skills = 30
    skill_ids = [f"SKILL_{i:03d}" for i in range(1, num_skills + 1)]
    skills_df = pd.DataFrame({
        "id": skill_ids,
        "name": [f"Synthetic Skill {i}" for i in range(1, num_skills + 1)],
        "category": np.random.choice(["Technical", "Soft Skill", "Domain"], num_skills)
    })
    
    # 2. Generate Programmes
    num_programmes = 15
    prog_ids = [f"PROG_{i:03d}" for i in range(1, num_programmes + 1)]
    prog_quality = np.random.uniform(0.7, 1.3, num_programmes)
    
    programmes_data = []
    programme_skill_records = []
    for i, pid in enumerate(prog_ids):
        programmes_data.append({
            "id": pid,
            "name": f"Synthetic Programme {i+1}",
            "quality_factor": prog_quality[i]  # Hidden latent variable for ML
        })
        
        # Each programme teaches 5-10 skills
        taught = np.random.choice(skill_ids, size=np.random.randint(5, 11), replace=False)
        for s in taught:
            programme_skill_records.append({
                "programme_id": pid,
                "skill_id": s,
                "skill_name": f"Skill {s}",
                "target_level": np.clip(np.random.normal(70, 10), 40, 100)
            })
            
    programmes_df = pd.DataFrame(programmes_data)
    programme_skill_df = pd.DataFrame(programme_skill_records)
    
    # 3. Generate Jobs
    num_jobs = 40
    job_ids = [f"JOB_{i:03d}" for i in range(1, num_jobs + 1)]
    
    jobs_data = []
    job_skill_records = []
    for i, jid in enumerate(job_ids):
        jobs_data.append({
            "id": jid,
            "title": f"Synthetic Role {i+1}",
            "base_salary": np.random.normal(30000, 5000)
        })
        
        req = np.random.choice(skill_ids, size=np.random.randint(4, 10), replace=False)
        for s in req:
            job_skill_records.append({
                "job_id": jid,
                "skill_id": s,
                "skill_name": f"Skill {s}",
                "required_level": np.clip(np.random.normal(60, 15), 30, 95),
                "importance": np.clip(np.random.normal(0.7, 0.2), 0.1, 1.0)
            })
            
    jobs_df = pd.DataFrame(jobs_data)
    job_skill_df = pd.DataFrame(job_skill_records)
    
    # 4. Generate Trainees
    trainee_ids = [f"TRAINEE_{i:05d}" for i in range(1, num_trainees + 1)]
    t_prog = np.random.choice(prog_ids, num_trainees)
    t_latent = np.random.normal(1.0, 0.2, num_trainees) # Hidden latent ability
    
    trainee_df = pd.DataFrame({
        "trainee_id": trainee_ids,
        "programme_id": t_prog,
        "district": np.random.choice(["North", "South", "East", "West"], num_trainees),
        "course_name": "Synthetic Course",
        "provider": "Synthetic Provider",
        "latent_ability": t_latent # Hidden
    })
    
    # 5. Generate Skill Assessments (Correlated to Programme Target + Latent Ability)
    assessment_records = []
    for _, row in trainee_df.iterrows():
        tid = row['trainee_id']
        pid = row['programme_id']
        ability = row['latent_ability']
        
        # Get what the programme teaches
        p_skills = programme_skill_df[programme_skill_df['programme_id'] == pid]
        p_quality = programmes_df[programmes_df['id'] == pid]['quality_factor'].iloc[0]
        
        for _, s_row in p_skills.iterrows():
            sid = s_row['skill_id']
            target = s_row['target_level']
            
            # Causal equation for skill score
            # Proficiency = Target * ProgrammeQuality * TraineeAbility + Noise
            score = target * p_quality * ability + np.random.normal(0, 8)
            score = np.clip(score, 0, 100)
            
            assessment_records.append({
                "trainee_id": tid,
                "skill_id": sid,
                "skill_name": s_row['skill_name'],
                "proficiency_score": score,
                "assessment_type": "Final",
                "assessment_date": datetime(2025, 1, 1) + timedelta(days=np.random.randint(0, 30))
            })
            
    trainee_skill_df = pd.DataFrame(assessment_records)
    
    # Calculate pseudo job match to drive employment
    # We will pick a random job target for each trainee
    trainee_df['target_job_id'] = np.random.choice(job_ids, num_trainees)
    
    employment_records = []
    feedback_records = []
    
    # Group assessments by trainee for fast lookup
    t_skills_dict = trainee_skill_df.groupby('trainee_id').apply(lambda x: dict(zip(x.skill_id, x.proficiency_score))).to_dict()
    j_skills_dict = job_skill_df.groupby('job_id').apply(lambda x: x.to_dict('records')).to_dict()
    
    for _, row in trainee_df.iterrows():
        tid = row['trainee_id']
        pid = row['programme_id']
        jid = row['target_job_id']
        ability = row['latent_ability']
        p_quality = programmes_df[programmes_df['id'] == pid]['quality_factor'].iloc[0]
        base_sal = jobs_df[jobs_df['id'] == jid]['base_salary'].iloc[0]
        
        my_skills = t_skills_dict.get(tid, {})
        reqs = j_skills_dict.get(jid, [])
        
        # Compute pseudo match
        match_score = 0.0
        total_imp = 0.0
        missing = []
        for r in reqs:
            imp = r['importance']
            total_imp += imp
            prof = my_skills.get(r['skill_id'], 0.0)
            if prof < r['required_level']:
                missing.append(r['skill_id'])
            cov = min(prof / r['required_level'], 1.0) if r['required_level'] > 0 else 0
            match_score += cov * imp
            
        match_ratio = match_score / total_imp if total_imp > 0 else 0
        
        # Causal equation for employment (Logistic)
        logit = -3.0 + (5.0 * match_ratio) + (2.0 * (p_quality - 1.0)) + (1.5 * (ability - 1.0)) + np.random.normal(0, 0.5)
        prob = 1.0 / (1.0 + np.exp(-logit))
        
        is_employed = np.random.random() < prob
        
        if is_employed:
            # Causal equation for salary
            salary = base_sal * (0.8 + 0.4 * match_ratio) * p_quality + np.random.normal(0, 2000)
            
            # Causal equation for retention
            retention_logit = -1.0 + (3.0 * match_ratio) + ((salary - base_sal)/5000) + np.random.normal(0, 0.5)
            ret_prob = 1.0 / (1.0 + np.exp(-retention_logit))
            days = 0
            if ret_prob > 0.8: days = 400
            elif ret_prob > 0.5: days = 200
            else: days = 45
            
            start_date = datetime(2025, 2, 1) + timedelta(days=np.random.randint(0, 30))
            end_date = start_date + timedelta(days=days) if days < 365 else None
            
            employment_records.append({
                "trainee_id": tid,
                "employment_id": str(uuid.uuid4()),
                "employer_name": "Synthetic Employer",
                "role": jobs_df[jobs_df['id'] == jid]['title'].iloc[0],
                "salary": max(10000, salary),
                "start_date": start_date,
                "end_date": end_date,
                "employment_type": "Employed",
                "job_relevance": "High" if match_ratio > 0.7 else "Medium"
            })
            
            # Conditional Feedback
            if np.random.random() < 0.3: # 30% of employers give feedback
                sat = np.clip(1 + 4 * match_ratio + np.random.normal(0, 0.5), 1, 5)
                feedback_records.append({
                    "feedback_id": str(uuid.uuid4()),
                    "trainee_id": tid,
                    "programme_id": pid,
                    "employer_name": "Synthetic Employer",
                    "satisfaction_score": round(sat),
                    "technical_deficiencies": missing[:3] if missing else []
                })
        else:
            employment_records.append({
                "trainee_id": tid,
                "employment_id": str(uuid.uuid4()),
                "employer_name": None,
                "role": None,
                "salary": None,
                "start_date": None,
                "end_date": None,
                "employment_type": "Unemployed",
                "job_relevance": None
            })

    employment_outcome_df = pd.DataFrame(employment_records)
    employer_feedback_df = pd.DataFrame(feedback_records)
    outcomes_timeline_df = pd.DataFrame(columns=["trainee_id", "checkpoint", "date", "status", "employment_status", "employer_or_activity", "salary", "job_relevance", "verification_status"])

    # Remove latent/hidden helper columns to prevent leakage in the final output
    trainee_df = trainee_df.drop(columns=['latent_ability', 'target_job_id'])
    
    return {
        "trainee_df": trainee_df,
        "trainee_skill_df": trainee_skill_df,
        "job_skill_df": job_skill_df,
        "programme_skill_df": programme_skill_df,
        "employment_outcome_df": employment_outcome_df,
        "outcomes_timeline_df": outcomes_timeline_df,
        "employer_feedback_df": employer_feedback_df
    }

def export_synthetic_dataset(output_dir: str):
    """
    Generates and dumps the synthetic dataset to CSV for ML notebook consumption.
    """
    os.makedirs(output_dir, exist_ok=True)
    dfs = generate_synthetic_dataset(num_trainees=5000, seed=42)
    
    for name, df in dfs.items():
        if not df.empty:
            file_path = os.path.join(output_dir, f"{name}.csv")
            df.to_csv(file_path, index=False)
            print(f"Exported {name} -> {file_path}")
