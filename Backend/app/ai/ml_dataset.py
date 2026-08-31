import pandas as pd
from typing import Tuple, Dict, Any

def _build_flat_trainee_features(trainee_df: pd.DataFrame, trainee_skill_features: pd.DataFrame) -> pd.DataFrame:
    """Flattens safe pre-employment observable features for ML."""
    if trainee_df.empty:
        return pd.DataFrame()
        
    base_x = trainee_df[['trainee_id', 'programme_id', 'district']].copy()
    
    if not trainee_skill_features.empty:
        # Flatten skills into mean aggregates to keep dimensions fixed
        skill_agg = trainee_skill_features.groupby('trainee_id').agg(
            avg_skill_score=('latest_score', 'mean'),
            total_assessments=('assessment_count', 'sum')
        ).reset_index()
        
        base_x = pd.merge(base_x, skill_agg, on='trainee_id', how='left')
        
    # Fill NAs in aggregates
    if 'avg_skill_score' in base_x.columns:
        base_x['avg_skill_score'] = base_x['avg_skill_score'].fillna(0)
    if 'total_assessments' in base_x.columns:
        base_x['total_assessments'] = base_x['total_assessments'].fillna(0)
        
    return base_x

def build_employment_dataset(engineered_features: Dict[str, pd.DataFrame], raw_dfs: Dict[str, pd.DataFrame]) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
    """
    Constructs X (Features), y (Target: is_employed) preventing data leakage.
    """
    trainee_df = raw_dfs.get('trainee_df', pd.DataFrame())
    emp_feats = engineered_features.get('employment_features', pd.DataFrame())
    t_skills = engineered_features.get('trainee_skill_features', pd.DataFrame())
    
    if trainee_df.empty or emp_feats.empty:
        return pd.DataFrame(), pd.Series(dtype=int), {}
        
    # TARGET: is_employed
    target_df = emp_feats[['trainee_id', 'is_employed']].copy()
    target_df['is_employed'] = target_df['is_employed'].astype(int)
    
    # FEATURES (SAFE)
    base_x = _build_flat_trainee_features(trainee_df, t_skills)
    
    # Merge and align
    dataset = pd.merge(base_x, target_df, on='trainee_id', how='inner')
    
    # Explicitly drop identifiers and target from X
    X = dataset.drop(columns=['trainee_id', 'is_employed'])
    y = dataset['is_employed']
    
    metadata = {
        "task": "employment_classification",
        "target": "is_employed",
        "row_count": len(X),
        "categorical_features": ["programme_id", "district"],
        "numerical_features": ["avg_skill_score", "total_assessments"],
        "leakage_exclusions": ["salary", "retained_6m", "wage_growth_amount"]
    }
    
    return X, y, metadata

def build_salary_dataset(engineered_features: Dict[str, pd.DataFrame], raw_dfs: Dict[str, pd.DataFrame]) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
    """
    Constructs X, y (Target: latest_salary) preventing data leakage.
    Only includes employed trainees.
    """
    trainee_df = raw_dfs.get('trainee_df', pd.DataFrame())
    emp_feats = engineered_features.get('employment_features', pd.DataFrame())
    t_skills = engineered_features.get('trainee_skill_features', pd.DataFrame())
    
    if trainee_df.empty or emp_feats.empty:
        return pd.DataFrame(), pd.Series(dtype=float), {}
        
    # Only pick employed trainees for salary regression
    salaried = emp_feats[emp_feats['is_employed'] == True].copy()
    if salaried.empty:
        return pd.DataFrame(), pd.Series(dtype=float), {}
        
    target_df = salaried[['trainee_id', 'latest_salary']].copy()
    target_df = target_df.dropna(subset=['latest_salary'])
    
    base_x = _build_flat_trainee_features(trainee_df, t_skills)
    
    dataset = pd.merge(base_x, target_df, on='trainee_id', how='inner')
    
    X = dataset.drop(columns=['trainee_id', 'latest_salary'])
    y = dataset['latest_salary']
    
    metadata = {
        "task": "salary_regression",
        "target": "latest_salary",
        "row_count": len(X),
        "categorical_features": ["programme_id", "district"],
        "numerical_features": ["avg_skill_score", "total_assessments"],
        "leakage_exclusions": ["wage_growth_amount", "retained_6m", "employer_feedback"]
    }
    
    return X, y, metadata

def build_retention_dataset(engineered_features: Dict[str, pd.DataFrame], raw_dfs: Dict[str, pd.DataFrame]) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
    """
    Constructs X, y (Target: retained_6m) preventing data leakage.
    Includes salary in X since retention happens post-salary negotiation.
    """
    trainee_df = raw_dfs.get('trainee_df', pd.DataFrame())
    emp_feats = engineered_features.get('employment_features', pd.DataFrame())
    t_skills = engineered_features.get('trainee_skill_features', pd.DataFrame())
    
    if trainee_df.empty or emp_feats.empty:
        return pd.DataFrame(), pd.Series(dtype=int), {}
        
    # Pick all placed trainees with starting/latest salary to evaluate retention
    employed = emp_feats[emp_feats['latest_salary'].notna()].copy()
    
    target_df = employed[['trainee_id', 'retained_6m', 'latest_salary']].copy()
    target_df['retained_6m'] = target_df['retained_6m'].astype(int)
    
    base_x = _build_flat_trainee_features(trainee_df, t_skills)
    
    dataset = pd.merge(base_x, target_df, on='trainee_id', how='inner')
    
    # Notice we keep latest_salary in X as a safe feature for retention prediction
    X = dataset.drop(columns=['trainee_id', 'retained_6m'])
    y = dataset['retained_6m']
    
    metadata = {
        "task": "retention_classification",
        "target": "retained_6m",
        "row_count": len(X),
        "categorical_features": ["programme_id", "district"],
        "numerical_features": ["avg_skill_score", "total_assessments", "latest_salary"],
        "leakage_exclusions": ["retained_12m", "employment_duration_days"]
    }
    
    return X, y, metadata
