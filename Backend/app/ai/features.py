import pandas as pd
import numpy as np
from typing import Dict

def build_trainee_skill_features(trainee_skill_df: pd.DataFrame) -> pd.DataFrame:
    if trainee_skill_df.empty:
        return pd.DataFrame(columns=["trainee_id", "skill_id", "latest_score", "assessment_count", "skill_improvement", "skill_category"])
        
    df = trainee_skill_df.dropna(subset=['trainee_id', 'skill_id', 'proficiency_score']).copy()
    
    if df.empty:
        return pd.DataFrame(columns=["trainee_id", "skill_id", "latest_score", "assessment_count", "skill_improvement", "skill_category"])
        
    if 'assessment_date' in df.columns:
        df['assessment_date'] = pd.to_datetime(df['assessment_date'], errors='coerce', utc=True)
        df = df.sort_values(by=['trainee_id', 'skill_id', 'assessment_date'])
        
    grouped = df.groupby(['trainee_id', 'skill_id'])
    features = grouped.agg(
        latest_score=('proficiency_score', 'last'),
        earliest_score=('proficiency_score', 'first'),
        assessment_count=('proficiency_score', 'count')
    ).reset_index()
    
    features['skill_improvement'] = np.where(
        features['assessment_count'] > 1, 
        features['latest_score'] - features['earliest_score'], 
        np.nan
    )
    
    def categorize(score):
        if pd.isna(score): return np.nan
        if score < 40: return 'Beginner'
        elif score < 60: return 'Developing'
        elif score < 80: return 'Proficient'
        else: return 'Advanced'
        
    features['skill_category'] = features['latest_score'].apply(categorize)
    features.drop(columns=['earliest_score'], inplace=True)
    return features

def build_programme_skill_gap(trainee_df: pd.DataFrame, trainee_skill_features: pd.DataFrame, programme_skill_df: pd.DataFrame) -> pd.DataFrame:
    if trainee_df.empty or trainee_skill_features.empty or programme_skill_df.empty:
        return pd.DataFrame()
        
    df = pd.merge(trainee_skill_features, trainee_df[['trainee_id', 'programme_id']], on='trainee_id', how='inner')
    df = pd.merge(df, programme_skill_df[['programme_id', 'skill_id', 'target_level']], on=['programme_id', 'skill_id'], how='inner')
    
    df['skill_gap'] = df['target_level'] - df['latest_score']
    df['absolute_skill_gap'] = np.maximum(0, df['skill_gap'])
    df['skill_gap_percentage'] = (df['skill_gap'] / df['target_level']).replace([np.inf, -np.inf], np.nan) * 100
    df['skill_status'] = np.where(df['skill_gap'] <= 0, 'Met', 'Gap')
    
    return df

def build_trainee_job_match(trainee_features: pd.DataFrame, job_skill_df: pd.DataFrame) -> pd.DataFrame:
    if trainee_features.empty or job_skill_df.empty:
        return pd.DataFrame()
        
    trainees = trainee_features['trainee_id'].unique()
    jobs = job_skill_df['job_id'].dropna().unique()
    
    if len(trainees) == 0 or len(jobs) == 0:
        return pd.DataFrame()
        
    t_df = pd.DataFrame({'trainee_id': trainees})
    j_df = pd.DataFrame({'job_id': jobs})
    cross = pd.merge(t_df.assign(key=1), j_df.assign(key=1), on='key').drop('key', axis=1)
    
    cross_skills = pd.merge(cross, job_skill_df, on='job_id', how='left')
    cross_skills = pd.merge(cross_skills, trainee_features[['trainee_id', 'skill_id', 'latest_score']], on=['trainee_id', 'skill_id'], how='left')
    
    def calc_coverage(row):
        if pd.isna(row['latest_score']) or pd.isna(row['required_level']) or row['required_level'] <= 0:
            return 0.0
        return min(row['latest_score'] / row['required_level'], 1.0) * row['importance']
        
    cross_skills['weighted_cov'] = cross_skills.apply(calc_coverage, axis=1)
    cross_skills['gap'] = cross_skills['required_level'] - cross_skills['latest_score'].fillna(0)
    
    cross_skills['is_missing'] = cross_skills['latest_score'].isna()
    cross_skills['is_minor_gap'] = (cross_skills['gap'] > 0) & (cross_skills['gap'] <= 20)
    cross_skills['is_major_gap'] = cross_skills['gap'] > 20
    cross_skills['is_critical_gap'] = cross_skills['is_major_gap'] & (cross_skills['importance'] >= 0.8)
    
    match_df = cross_skills.groupby(['trainee_id', 'job_id']).agg(
        total_importance=('importance', 'sum'),
        total_weighted_cov=('weighted_cov', 'sum'),
        skills_met=('gap', lambda x: (x <= 0).sum()),
        missing_skills=('is_missing', 'sum'),
        minor_gaps=('is_minor_gap', 'sum'),
        major_gaps=('is_major_gap', 'sum'),
        critical_skill_gaps=('is_critical_gap', 'sum')
    ).reset_index()
    
    match_df['weighted_skill_coverage'] = np.where(
        match_df['total_importance'] > 0, 
        match_df['total_weighted_cov'] / match_df['total_importance'], 
        np.nan
    )
    match_df['overall_job_match_score'] = match_df['weighted_skill_coverage'] * 100
    
    return match_df

def build_employment_wage_features(employment_outcome_df: pd.DataFrame) -> pd.DataFrame:
    if employment_outcome_df.empty:
        return pd.DataFrame()
        
    df = employment_outcome_df.copy()
    
    df['start_date'] = pd.to_datetime(df.get('start_date', pd.NaT), utc=True, errors='coerce')
    df['end_date'] = pd.to_datetime(df.get('end_date', pd.NaT), utc=True, errors='coerce')
    
    df = df.sort_values(by=['trainee_id', 'start_date'])
    
    df['is_employed'] = (df['employment_type'].str.lower() != 'unemployed') & df['end_date'].isna()
    df['is_self_employed'] = df['employment_type'].str.lower() == 'self-employed'
    df['is_apprentice'] = df['employment_type'].str.lower() == 'apprentice'
    df['is_unemployed'] = df['employment_type'].str.lower() == 'unemployed'
    
    now = pd.Timestamp.now('UTC')
    def calc_duration(row):
        end = row['end_date'] if pd.notna(row['end_date']) else now
        start = row['start_date']
        if pd.isna(start):
            return np.nan
        return (end - start).days
        
    df['employment_duration_days'] = df.apply(calc_duration, axis=1)
    
    df['retained_3m'] = df['employment_duration_days'] >= 90
    df['retained_6m'] = df['employment_duration_days'] >= 180
    df['retained_12m'] = df['employment_duration_days'] >= 365
    
    # Missing explicit structured match for Job Relevance
    df['job_relevance_score'] = np.nan 
    
    # Wages per trainee
    wages = df.dropna(subset=['salary']).groupby('trainee_id').agg(
        starting_salary=('salary', 'first'),
        latest_salary=('salary', 'last')
    ).reset_index()
    
    wages['wage_growth_amount'] = wages['latest_salary'] - wages['starting_salary']
    wages['wage_growth_percentage'] = np.where(
        wages['starting_salary'] > 0,
        (wages['wage_growth_amount'] / wages['starting_salary']) * 100,
        np.nan
    )
    
    trainee_emp = df.groupby('trainee_id').agg(
        is_employed=('is_employed', 'any'),
        is_self_employed=('is_self_employed', 'any'),
        is_apprentice=('is_apprentice', 'any'),
        is_unemployed=('is_unemployed', 'all'),
        max_duration_days=('employment_duration_days', 'max'),
        retained_3m=('retained_3m', 'any'),
        retained_6m=('retained_6m', 'any'),
        retained_12m=('retained_12m', 'any'),
        job_relevance_score=('job_relevance_score', 'first')
    ).reset_index()
    
    trainee_emp = pd.merge(trainee_emp, wages, on='trainee_id', how='left')
    return trainee_emp

def build_programme_employer_aggregates(trainee_df, emp_features, employer_feedback_df):
    prog_features = pd.DataFrame()
    if not trainee_df.empty and not emp_features.empty:
        t_prog = pd.merge(trainee_df[['trainee_id', 'programme_id']], emp_features, on='trainee_id', how='left')
        
        prog_features = t_prog.groupby('programme_id').agg(
            employment_rate=('is_employed', lambda x: x.mean() * 100 if len(x.dropna()) > 0 else np.nan),
            retention_6m_rate=('retained_6m', lambda x: x.mean() * 100 if len(x.dropna()) > 0 else np.nan),
            retention_12m_rate=('retained_12m', lambda x: x.mean() * 100 if len(x.dropna()) > 0 else np.nan),
            average_salary=('latest_salary', 'mean'),
            average_wage_growth=('wage_growth_amount', 'mean')
        ).reset_index()
        
        # Unavailable deterministic fields
        prog_features['completion_rate'] = np.nan
        prog_features['certification_rate'] = np.nan
        prog_features['relevant_employment_rate'] = np.nan
        prog_features['average_skill_match'] = np.nan
        
    emp_feed_features = pd.DataFrame()
    if not employer_feedback_df.empty:
        df = employer_feedback_df.copy()
        agg = df.groupby('programme_id').agg(
            average_employer_satisfaction=('satisfaction_score', 'mean')
        ).reset_index()
        
        if 'technical_deficiencies' in df.columns:
            tech_gaps = df[['programme_id', 'technical_deficiencies']].explode('technical_deficiencies').dropna()
            if not tech_gaps.empty:
                tech_gaps_freq = tech_gaps.groupby('programme_id')['technical_deficiencies'].agg(
                    most_common_technical_gaps=lambda x: list(x.value_counts().index[:3])
                ).reset_index()
                agg = pd.merge(agg, tech_gaps_freq, on='programme_id', how='left')
        
        if 'soft_skill_deficiencies' in df.columns:
            soft_gaps = df[['programme_id', 'soft_skill_deficiencies']].explode('soft_skill_deficiencies').dropna()
            if not soft_gaps.empty:
                soft_gaps_freq = soft_gaps.groupby('programme_id')['soft_skill_deficiencies'].agg(
                    most_common_soft_skill_gaps=lambda x: list(x.value_counts().index[:3])
                ).reset_index()
                agg = pd.merge(agg, soft_gaps_freq, on='programme_id', how='left')
                
        emp_feed_features = agg
        
    return prog_features, emp_feed_features

def build_curriculum_gap(job_skill_df, programme_skill_df, employer_feedback_df):
    if job_skill_df.empty or programme_skill_df.empty:
        return pd.DataFrame()
        
    job_reqs = job_skill_df.groupby('skill_id').agg(
        avg_required_level=('required_level', 'mean'),
        avg_importance=('importance', 'mean')
    ).reset_index()
    
    prog_reqs = programme_skill_df.groupby(['programme_id', 'skill_id']).agg(
        target_level=('target_level', 'mean')
    ).reset_index()
    
    curr = pd.merge(prog_reqs, job_reqs, on='skill_id', how='outer')
    curr['missing_curriculum_skills'] = curr['target_level'].isna() & curr['avg_required_level'].notna()
    
    return curr

def engineer_features(clean_dfs: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    trainee_df = clean_dfs.get("trainee_df", pd.DataFrame())
    trainee_skill_df = clean_dfs.get("trainee_skill_df", pd.DataFrame())
    job_skill_df = clean_dfs.get("job_skill_df", pd.DataFrame())
    programme_skill_df = clean_dfs.get("programme_skill_df", pd.DataFrame())
    employment_outcome_df = clean_dfs.get("employment_outcome_df", pd.DataFrame())
    employer_feedback_df = clean_dfs.get("employer_feedback_df", pd.DataFrame())
    
    trainee_skill_features = build_trainee_skill_features(trainee_skill_df)
    trainee_job_features = build_trainee_job_match(trainee_skill_features, job_skill_df)
    programme_skill_gap = build_programme_skill_gap(trainee_df, trainee_skill_features, programme_skill_df)
    employment_features = build_employment_wage_features(employment_outcome_df)
    
    programme_features, employer_feedback_features = build_programme_employer_aggregates(
        trainee_df, employment_features, employer_feedback_df
    )
    
    curriculum_gap_features = build_curriculum_gap(job_skill_df, programme_skill_df, employer_feedback_df)
    
    return {
        "trainee_skill_features": trainee_skill_features,
        "programme_skill_gap": programme_skill_gap,
        "trainee_job_features": trainee_job_features,
        "employment_features": employment_features,
        "programme_features": programme_features,
        "employer_feedback_features": employer_feedback_features,
        "curriculum_gap_features": curriculum_gap_features
    }
