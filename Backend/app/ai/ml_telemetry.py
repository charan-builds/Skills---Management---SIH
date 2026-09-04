import uuid
import datetime
import logging
from typing import Dict, Any, List, Optional
import pandas as pd
from scipy.stats import ks_2samp, chisquare

try:
    from app.firebase.config import db
except ImportError:
    db = None

from app.core.config import settings
from app.ai.ml_inference import FORBIDDEN_LEAKAGE_FEATURES
from app.ai.synthetic import generate_synthetic_dataset

logger = logging.getLogger(__name__)

# Fallback in-memory log if Firestore is unavailable (e.g., during tests)
_LOCAL_TELEMETRY_LOG = []


from app.ai.ml_inference import SAFE_PRE_EMPLOYMENT_FEATURES, SAFE_PLACEMENT_FEATURES

def sanitize_telemetry_payload(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Removes any forbidden/leakage fields and PII by strictly allowlisting."""
    sanitized = {}
    allowed_keys = set(SAFE_PRE_EMPLOYMENT_FEATURES + SAFE_PLACEMENT_FEATURES)
    for key, value in input_data.items():
        if key in allowed_keys:
            sanitized[key] = value
    return sanitized


def log_prediction_telemetry(
    endpoint: str,
    input_data: Dict[str, Any],
    output_data: Dict[str, Any]
) -> str:
    """
    Logs an inference event. Explicitly designed to be non-blocking when called
    via FastAPI BackgroundTasks.
    """
    if input_data.get("is_synthetic", False):
        return "synthetic-telemetry-skipped"
        
    inference_id = str(uuid.uuid4())
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    sanitized_input = sanitize_telemetry_payload(input_data)
    
    # Flatten the telemetry event
    telemetry_event = {
        "inference_id": inference_id,
        "timestamp": timestamp,
        "endpoint": endpoint,
        "inputs": sanitized_input,
    }
    
    if "data" in output_data:
        data = output_data["data"]
    else:
        data = output_data
        
    telemetry_event["prediction_version"] = data.get("prediction_version")
    telemetry_event["prediction_point"] = data.get("prediction_point")
    
    if "employment" in data:
        telemetry_event["employment_probability"] = data["employment"].get("probability")
        telemetry_event["employment_prediction"] = data["employment"].get("prediction")
        
    if "salary" in data:
        telemetry_event["salary_prediction"] = data["salary"].get("predicted_salary", data["salary"].get("predicted_baseline_salary"))
        telemetry_event["known_salary"] = data["salary"].get("known_salary")
        
    if "retention" in data:
        telemetry_event["retention_probability"] = data["retention"].get("probability")
        telemetry_event["retention_prediction"] = data["retention"].get("prediction")
        
    if "trajectory" in data:
        telemetry_event["trajectory_category"] = data["trajectory"].get("qualitative_category")
        
    # Demo sessions must remain local even if Firebase credentials are available.
    # Production telemetry falls back to process memory on a transient write failure.
    try:
        if not settings.ENABLE_DEMO_MODE and db is not None:
            db.collection("ai_inference_logs").document(inference_id).set(telemetry_event)
        else:
            _LOCAL_TELEMETRY_LOG.append(telemetry_event)
    except Exception as e:
        logger.error(f"Failed to log telemetry for {inference_id}: {str(e)}")
        _LOCAL_TELEMETRY_LOG.append(telemetry_event)
        # Do not raise: telemetry must not break inference.
        
    return inference_id


def get_telemetry_dataframe() -> pd.DataFrame:
    """Retrieves recent telemetry logs for drift calculation."""
    logs = []
    try:
        if not settings.ENABLE_DEMO_MODE and db is not None:
            # For drift, grab up to last 1000 logs
            query = db.collection("ai_inference_logs").order_by("timestamp", direction="DESCENDING").limit(1000)
            for doc in query.stream():
                logs.append(doc.to_dict())
        else:
            logs = _LOCAL_TELEMETRY_LOG[-1000:]
    except Exception as e:
        logger.error(f"Failed to fetch telemetry for drift: {str(e)}")
        
    if not logs:
        return pd.DataFrame()
        
    # Flatten inputs for analysis
    flat_logs = []
    for log in logs:
        flat = {**log}
        inputs = flat.pop("inputs", {})
        flat.update(inputs)
        flat_logs.append(flat)
        
    return pd.DataFrame(flat_logs)


def calculate_drift_metrics() -> Dict[str, Any]:
    """
    Compares recent telemetry to the Phase 6 Synthetic Training Baseline.
    Implements safeguards for minimum sample sizes.
    """
    telemetry_df = get_telemetry_dataframe()
    
    if len(telemetry_df) < 30:
        return {
            "status": "INSUFFICIENT_DATA",
            "message": f"Requires at least 30 inference logs to calculate drift. Currently have {len(telemetry_df)}.",
            "baseline": "Phase 6 Synthetic Training Baseline"
        }
        
    # Generate the baseline data (deterministic Phase 6 generator)
    raw_dfs = generate_synthetic_dataset(num_trainees=5000, seed=42)
    baseline_df = raw_dfs["trainee_df"]
    
    # We will compute drift on: avg_skill_score (KS), programme_id (Chi2), district (Chi2)
    metrics = {}
    is_drifted = False
    
    # 1. Continuous feature: avg_skill_score (Requires merging baseline with assessments, or simpler: just use synthetic distribution)
    # The synthetic skill score in Phase 6 uses a normal distribution. We'll reconstruct the baseline skill score array.
    baseline_scores = raw_dfs["assessment_df"]["score"] if "assessment_df" in raw_dfs else pd.Series([75]*5000)
    
    if "avg_skill_score" in telemetry_df.columns:
        prod_scores = telemetry_df["avg_skill_score"].dropna().astype(float)
        if len(prod_scores) >= 30 and len(baseline_scores) > 0:
            stat, p_value = ks_2samp(prod_scores, baseline_scores)
            drifted = bool(p_value < 0.05)
            is_drifted = is_drifted or drifted
            metrics["avg_skill_score"] = {
                "test": "Kolmogorov-Smirnov",
                "p_value": float(p_value),
                "drift_detected": drifted
            }
            
    # 2. Categorical feature: district
    if "district" in telemetry_df.columns:
        prod_dist = telemetry_df["district"].value_counts(normalize=True)
        base_dist = baseline_df["district"].value_counts(normalize=True)
        
        # Align indexes
        all_districts = list(set(prod_dist.index).union(set(base_dist.index)))
        prod_freq = [prod_dist.get(d, 0.0) * len(telemetry_df) for d in all_districts]
        base_freq = [base_dist.get(d, 0.01) * len(telemetry_df) for d in all_districts] # Expected counts scaled to prod size
        
        # Handle zero expected frequencies which break chisquare
        base_freq = [max(f, 0.1) for f in base_freq]
        
        stat, p_value = chisquare(f_obs=prod_freq, f_exp=base_freq)
        drifted = bool(p_value < 0.05)
        is_drifted = is_drifted or drifted
        metrics["district"] = {
            "test": "Chi-Square",
            "p_value": float(p_value),
            "drift_detected": drifted
        }
        
    # 3. Employment prediction distribution deviation
    if "employment_probability" in telemetry_df.columns:
        prod_mean_prob = telemetry_df["employment_probability"].dropna().astype(float).mean()
        # Synthetic baseline typically hovers around 78% placement
        baseline_emp_mean = 0.78
        deviation = abs(prod_mean_prob - baseline_emp_mean)
        drifted = bool(deviation > 0.10) # 10% deviation threshold
        is_drifted = is_drifted or drifted
        metrics["employment_probability_distribution"] = {
            "test": "Mean Deviation",
            "production_mean": float(prod_mean_prob),
            "baseline_mean": baseline_emp_mean,
            "deviation": float(deviation),
            "drift_detected": drifted
        }

    return {
        "status": "DRIFT_DETECTED" if is_drifted else "HEALTHY",
        "sample_size": len(telemetry_df),
        "metrics": metrics,
        "baseline": "Phase 6 Synthetic Training Baseline",
        "disclaimer": "Current drift metrics are relative to the synthetic experimental training baseline."
    }
