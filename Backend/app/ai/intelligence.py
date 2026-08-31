import pandas as pd
import numpy as np
from typing import Dict, Any, List

def personal_skill_intelligence(trainee_id: str, job_id: str, trainee_job_features: pd.DataFrame, trainee_skill_features: pd.DataFrame, job_skill_df: pd.DataFrame) -> Dict[str, Any]:
    if trainee_job_features.empty or 'trainee_id' not in trainee_job_features.columns or 'job_id' not in trainee_job_features.columns:
        return {"error": "INSUFFICIENT_DATA"}
    match_row = trainee_job_features[(trainee_job_features['trainee_id'] == trainee_id) & (trainee_job_features['job_id'] == job_id)]
    overall_score = float(match_row.iloc[0]['overall_job_match_score']) if not match_row.empty and not pd.isna(match_row.iloc[0]['overall_job_match_score']) else None
    
    if job_skill_df.empty or 'job_id' not in job_skill_df.columns:
        return {"error": "INSUFFICIENT_DATA"}
    job_skills = job_skill_df[job_skill_df['job_id'] == job_id]
    if trainee_skill_features.empty or 'trainee_id' not in trainee_skill_features.columns:
        return {"error": "INSUFFICIENT_DATA"}
    trainee_skills = trainee_skill_features[trainee_skill_features['trainee_id'] == trainee_id]
    
    priority_skills = []
    
    for _, j_row in job_skills.iterrows():
        skill_id = j_row['skill_id']
        req_level = float(j_row['required_level'])
        importance = float(j_row['importance'])
        
        t_row = trainee_skills[trainee_skills['skill_id'] == skill_id]
        if t_row.empty or pd.isna(t_row.iloc[0]['latest_score']):
            is_missing = True
            current_prof = 0.0
            gap = req_level
        else:
            is_missing = False
            current_prof = float(t_row.iloc[0]['latest_score'])
            gap = req_level - current_prof
            
        if gap > 0:
            priority_score = (gap / 100.0) * importance
            if is_missing:
                priority_score *= 1.5
                
            priority = "HIGH" if priority_score >= 0.4 else "MEDIUM" if priority_score >= 0.2 else "LOW"
            reason = "Required job proficiency exceeds trainee proficiency" if not is_missing else "Skill is missing from trainee profile but required by job"
            
            priority_skills.append({
                "skill_id": skill_id,
                "skill_name": j_row.get("skill_name", skill_id),
                "current_proficiency": current_prof,
                "required_level": req_level,
                "gap": gap,
                "importance": importance,
                "priority_score": priority_score,
                "priority": priority,
                "reason": reason
            })
            
    priority_skills = sorted(priority_skills, key=lambda x: x['priority_score'], reverse=True)
    
    return {
        "trainee_id": trainee_id,
        "job_id": job_id,
        "overall_match_score": overall_score,
        "priority_skills": priority_skills
    }

def outcome_diagnosis(programme_id: str, programme_features: pd.DataFrame, curriculum_gap_features: pd.DataFrame, employer_feedback_features: pd.DataFrame) -> List[Dict[str, Any]]:
    diagnoses = []
    
    p_row = programme_features[programme_features['programme_id'] == programme_id]
    if p_row.empty:
        return [{"issue": "INSUFFICIENT_DATA", "severity": "UNKNOWN"}]
        
    p_row = p_row.iloc[0]
    
    emp_rate = p_row.get('employment_rate')
    if pd.isna(emp_rate):
        diagnoses.append({"issue": "INSUFFICIENT_DATA", "metrics": "employment_rate"})
    elif emp_rate < 50.0:
        diagnoses.append({
            "issue": "LOW_EMPLOYMENT",
            "severity": "HIGH",
            "evidence": f"Employment rate is {emp_rate:.1f}%",
            "recommended_action": "Investigate placement support and employer connections"
        })
        
    ret_rate = p_row.get('retention_6m_rate')
    if pd.isna(ret_rate):
        diagnoses.append({"issue": "INSUFFICIENT_DATA", "metrics": "retention_6m_rate"})
    elif ret_rate < 50.0:
        diagnoses.append({
            "issue": "LOW_RETENTION",
            "severity": "HIGH",
            "evidence": f"6m Retention rate is {ret_rate:.1f}%",
            "recommended_action": "Analyze workplace alignment and support systems"
        })
        
    e_row = employer_feedback_features[employer_feedback_features['programme_id'] == programme_id] if not employer_feedback_features.empty else pd.DataFrame()
    if not e_row.empty:
        gaps = e_row.iloc[0].get('most_common_technical_gaps')
        if isinstance(gaps, list) and len(gaps) > 0:
            diagnoses.append({
                "issue": "EMPLOYER_SKILL_DEFICIENCY",
                "severity": "MEDIUM",
                "evidence": "Employers frequently reported technical deficiencies.",
                "affected_skills": gaps,
                "recommended_action": "Review curriculum for these specific skills"
            })
            
    if not curriculum_gap_features.empty:
        c_gaps = curriculum_gap_features[curriculum_gap_features['programme_id'] == programme_id]
        missing = c_gaps[c_gaps['missing_curriculum_skills'] == True]
        if not missing.empty:
             diagnoses.append({
                 "issue": "CURRICULUM_GAP",
                 "severity": "HIGH",
                 "evidence": f"{len(missing)} skills required by industry are missing from programme.",
                 "affected_skills": missing['skill_id'].tolist(),
                 "recommended_action": "Integrate missing industry skills into training"
             })
         
    return diagnoses

def programme_impact_score(programme_id: str, programme_features: pd.DataFrame, employer_feedback_features: pd.DataFrame) -> Dict[str, Any]:
    if programme_features.empty or 'programme_id' not in programme_features.columns:
        return {"error": "INSUFFICIENT_DATA"}
    p_row = programme_features[programme_features['programme_id'] == programme_id]
    e_row = employer_feedback_features[employer_feedback_features['programme_id'] == programme_id] if not employer_feedback_features.empty and 'programme_id' in employer_feedback_features.columns else pd.DataFrame()
    
    if p_row.empty:
        return {"error": "INSUFFICIENT_DATA"}
    p_row = p_row.iloc[0]
    
    weights = {
        "employment": 30.0,
        "retention": 20.0,
        "skill_alignment": 20.0,
        "wage_growth": 15.0,
        "employer_satisfaction": 15.0
    }
    
    components = {}
    emp_rate = p_row.get('employment_rate')
    if pd.notna(emp_rate): components['employment'] = emp_rate
    
    ret_rate = p_row.get('retention_6m_rate')
    if pd.notna(ret_rate): components['retention'] = ret_rate
    
    wg = p_row.get('average_wage_growth')
    if pd.notna(wg): components['wage_growth'] = min(max((wg / 50000.0) * 100, 0), 100)
    
    if not e_row.empty:
        sat = e_row.iloc[0].get('average_employer_satisfaction')
        if pd.notna(sat):
            components['employer_satisfaction'] = (sat / 5.0) * 100
            
    active_weights_sum = sum([weights[k] for k in components.keys()])
    if active_weights_sum == 0:
        return {"error": "INSUFFICIENT_DATA"}
        
    final_score = 0
    adjusted_weights = {}
    for k, v in components.items():
        w = (weights[k] / active_weights_sum) * 100
        adjusted_weights[k] = w
        final_score += (v * w) / 100.0
        
    return {
        "programme_id": programme_id,
        "final_impact_score": final_score,
        "component_scores": components,
        "adjusted_weights": adjusted_weights
    }
    
def curriculum_recommendations(programme_id: str, curriculum_gap_features: pd.DataFrame, employer_feedback_features: pd.DataFrame) -> List[Dict[str, Any]]:
    recs = []
    
    c_gaps = curriculum_gap_features[curriculum_gap_features['programme_id'] == programme_id] if not curriculum_gap_features.empty else pd.DataFrame()
    e_row = employer_feedback_features[employer_feedback_features['programme_id'] == programme_id] if not employer_feedback_features.empty else pd.DataFrame()
    
    emp_tech_gaps = []
    if not e_row.empty and isinstance(e_row.iloc[0].get('most_common_technical_gaps'), list):
        emp_tech_gaps = e_row.iloc[0].get('most_common_technical_gaps')
        
    for _, row in c_gaps.iterrows():
        skill_id = row['skill_id']
        reasons = []
        is_missing = row.get('missing_curriculum_skills', False)
        
        if is_missing:
            reasons.append("Required by industry but not targeted by programme")
            
        if pd.notna(row.get('target_level')) and pd.notna(row.get('avg_required_level')) and row['target_level'] < row['avg_required_level']:
            reasons.append(f"Target level ({row['target_level']}) is below industry requirement ({row['avg_required_level']})")
            
        if skill_id in emp_tech_gaps:
            reasons.append("Frequently reported as deficient by employers")
            
        if len(reasons) > 0:
            priority = "HIGH" if len(reasons) >= 2 or is_missing else "MEDIUM"
            recs.append({
                "skill": skill_id,
                "reason": reasons,
                "priority": priority
            })
            
    return sorted(recs, key=lambda x: 1 if x['priority'] == 'HIGH' else 2)

def simulate_scenario(scenario_type: str, params: Dict[str, Any], current_features: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    if scenario_type == 'increase_target_proficiency':
        prog_id = params['programme_id']
        skill_id = params['skill_id']
        increase = params['increase_amount']
        
        c_gap = current_features.get('curriculum_gap_features', pd.DataFrame())
        
        current_target = 40
        req = 75
        
        if not c_gap.empty:
            row = c_gap[(c_gap['programme_id'] == prog_id) & (c_gap['skill_id'] == skill_id)]
            if not row.empty:
                t = row.iloc[0].get('target_level')
                r = row.iloc[0].get('avg_required_level')
                if not pd.isna(t): current_target = t
                if not pd.isna(r): req = r
                
        new_target = current_target + increase
        
        baseline_gap = req - current_target
        scenario_gap = req - new_target
        
        return {
            "scenario": "increase_target_proficiency",
            "baseline_target": current_target,
            "estimated_scenario_target": new_target,
            "baseline_industry_gap": baseline_gap,
            "estimated_scenario_gap": scenario_gap,
            "impact_delta": scenario_gap - baseline_gap,
            "message": "Estimated Scenario Impact"
        }
    return {"error": "Scenario unsupported or insufficient data"}

def run_intelligence_pipeline(features_dict: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    progs = features_dict.get('programme_features', pd.DataFrame())
    prog_ids = progs['programme_id'].dropna().unique() if not progs.empty else []
    
    diag = {pid: outcome_diagnosis(pid, progs, features_dict.get('curriculum_gap_features', pd.DataFrame()), features_dict.get('employer_feedback_features', pd.DataFrame())) for pid in prog_ids}
    impact = {pid: programme_impact_score(pid, progs, features_dict.get('employer_feedback_features', pd.DataFrame())) for pid in prog_ids}
    curr = {pid: curriculum_recommendations(pid, features_dict.get('curriculum_gap_features', pd.DataFrame()), features_dict.get('employer_feedback_features', pd.DataFrame())) for pid in prog_ids}
    
    personal = {}
    tj = features_dict.get('trainee_job_features', pd.DataFrame())
    if not tj.empty:
        first_pair = tj.iloc[0]
        personal = personal_skill_intelligence(first_pair['trainee_id'], first_pair['job_id'], tj, features_dict.get('trainee_skill_features', pd.DataFrame()), features_dict.get('job_skill_df', pd.DataFrame()))
        
    return {
        "personal_skill_intelligence": personal,
        "outcome_diagnosis": diag,
        "programme_intelligence": impact,
        "curriculum_recommendations": curr
    }
