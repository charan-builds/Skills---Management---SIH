import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

def categorize_test_predictions(
    X_test: pd.DataFrame,
    y_test: pd.Series,
    y_pred: np.ndarray,
    y_prob: np.ndarray
) -> pd.DataFrame:
    """
    Categorizes test observations into TP, TN, FP, FN and flags uncertain/borderline predictions.
    Guarantees no mutation of input DataFrames.
    """
    df = X_test.copy()
    df["y_true"] = y_test.values
    df["y_pred"] = y_pred
    df["y_prob"] = np.round(y_prob, 4)
    
    # Assign error category
    conditions = [
        (df["y_true"] == 1) & (df["y_pred"] == 1),
        (df["y_true"] == 0) & (df["y_pred"] == 0),
        (df["y_true"] == 0) & (df["y_pred"] == 1),
        (df["y_true"] == 1) & (df["y_pred"] == 0)
    ]
    choices = ["TP", "TN", "FP", "FN"]
    df["error_category"] = np.select(conditions, choices, default="UNKNOWN")
    df["is_error"] = ((df["error_category"] == "FP") | (df["error_category"] == "FN")).astype(int)
    
    # Flag borderline / uncertain predictions (0.40 <= p <= 0.60)
    df["is_borderline"] = ((df["y_prob"] >= 0.40) & (df["y_prob"] <= 0.60)).astype(int)
    
    return df

def analyze_errors_and_subgroups(
    analyzed_df: pd.DataFrame,
    min_subgroup_size: int = 5
) -> Dict[str, Any]:
    """
    Performs subgroup slice and uncertainty analysis on categorized predictions.
    Reports INSUFFICIENT_DATA for small subgroups.
    """
    total_samples = len(analyzed_df)
    if total_samples == 0:
        return {"error": "Empty test set provided"}
        
    counts = analyzed_df["error_category"].value_counts().to_dict()
    tp = int(counts.get("TP", 0))
    tn = int(counts.get("TN", 0))
    fp = int(counts.get("FP", 0))
    fn = int(counts.get("FN", 0))
    total_errors = fp + fn
    
    # Verify sum invariant
    assert tp + tn + fp + fn == total_samples, "Error categories must sum to total test observations"
    
    # Skill score distribution by category
    skill_stats = {}
    if "avg_skill_score" in analyzed_df.columns:
        for cat in ["TP", "TN", "FP", "FN"]:
            subset = analyzed_df[analyzed_df["error_category"] == cat]["avg_skill_score"]
            if len(subset) > 0:
                skill_stats[cat] = {
                    "count": len(subset),
                    "mean_score": round(float(subset.mean()), 2),
                    "min_score": round(float(subset.min()), 2),
                    "max_score": round(float(subset.max()), 2)
                }
            else:
                skill_stats[cat] = {"count": 0, "status": "INSUFFICIENT_DATA"}
                
    # Skill score brackets analysis
    skill_brackets = {}
    if "avg_skill_score" in analyzed_df.columns:
        bins = [-1, 39.99, 59.99, 79.99, 101]
        labels = ["Beginner (<40)", "Developing (40-59)", "Proficient (60-79)", "Advanced (80-100)"]
        binned = pd.cut(analyzed_df["avg_skill_score"], bins=bins, labels=labels)
        
        for bracket in labels:
            bracket_df = analyzed_df[binned == bracket]
            b_count = len(bracket_df)
            if b_count < min_subgroup_size:
                skill_brackets[bracket] = {
                    "sample_size": b_count,
                    "status": "INSUFFICIENT_DATA"
                }
            else:
                b_errors = int(bracket_df["is_error"].sum())
                skill_brackets[bracket] = {
                    "sample_size": b_count,
                    "error_count": b_errors,
                    "error_rate": round(float(b_errors / b_count), 4),
                    "fp_count": int((bracket_df["error_category"] == "FP").sum()),
                    "fn_count": int((bracket_df["error_category"] == "FN").sum())
                }

    # Programme breakdown
    programme_analysis = {}
    if "programme_id" in analyzed_df.columns:
        for prog, p_df in analyzed_df.groupby("programme_id"):
            p_count = len(p_df)
            if p_count < min_subgroup_size:
                programme_analysis[str(prog)] = {
                    "sample_size": p_count,
                    "status": "INSUFFICIENT_DATA"
                }
            else:
                p_errors = int(p_df["is_error"].sum())
                programme_analysis[str(prog)] = {
                    "sample_size": p_count,
                    "error_count": p_errors,
                    "error_rate": round(float(p_errors / p_count), 4)
                }
                
    # District breakdown
    district_analysis = {}
    if "district" in analyzed_df.columns:
        for dist, d_df in analyzed_df.groupby("district"):
            d_count = len(d_df)
            if d_count < min_subgroup_size:
                district_analysis[str(dist)] = {
                    "sample_size": d_count,
                    "status": "INSUFFICIENT_DATA"
                }
            else:
                d_errors = int(d_df["is_error"].sum())
                district_analysis[str(dist)] = {
                    "sample_size": d_count,
                    "error_count": d_errors,
                    "error_rate": round(float(d_errors / d_count), 4)
                }

    # Probability uncertainty analysis
    y_prob = analyzed_df["y_prob"]
    borderline_df = analyzed_df[analyzed_df["is_borderline"] == 1]
    borderline_count = len(borderline_df)
    borderline_errors = int(borderline_df["is_error"].sum()) if borderline_count > 0 else 0
    
    probability_analysis = {
        "min_prob": round(float(y_prob.min()), 4),
        "max_prob": round(float(y_prob.max()), 4),
        "mean_prob": round(float(y_prob.mean()), 4),
        "median_prob": round(float(y_prob.median()), 4),
        "q25_prob": round(float(y_prob.quantile(0.25)), 4),
        "q75_prob": round(float(y_prob.quantile(0.75)), 4),
        "borderline_count": borderline_count,
        "borderline_pct": round(float(borderline_count / total_samples), 4),
        "borderline_errors": borderline_errors,
        "borderline_error_rate": round(float(borderline_errors / max(1, borderline_count)), 4)
    }

    return {
        "summary": {
            "total_samples": total_samples,
            "tp": tp,
            "tn": tn,
            "fp": fp,
            "fn": fn,
            "total_errors": total_errors,
            "overall_error_rate": round(float(total_errors / total_samples), 4)
        },
        "skill_score_stats_by_category": skill_stats,
        "skill_proficiency_brackets": skill_brackets,
        "programme_analysis": programme_analysis,
        "district_analysis": district_analysis,
        "probability_uncertainty": probability_analysis
    }
