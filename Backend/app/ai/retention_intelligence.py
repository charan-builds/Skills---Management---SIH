import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import logging

from app.firebase.repository import FirestoreRepository

logger = logging.getLogger(__name__)

class RetentionIntelligenceEngine:
    def __init__(self):
        self.min_sample_threshold = 10

    def _fetch_trainees(self):
        return FirestoreRepository.get_trainees()

    def analyze_retention_risks(self, trainees: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        if trainees is None:
            trainees = self._fetch_trainees()
        
        current_time = datetime.now(timezone.utc)
        
        observations = []
        for t in trainees:
            emp_history = t.get("employment_history", [])
            
            trainee_3m = []
            trainee_6m = []
            trainee_12m = []
            
            for emp in emp_history:
                start_str = emp.get("start_date")
                end_str = emp.get("end_date")
                
                if not start_str:
                    continue
                    
                start_date = pd.to_datetime(start_str)
                if start_date.tzinfo is None:
                    start_date = start_date.replace(tzinfo=timezone.utc)
                    
                # Temporal Leakage Fix: Ignore future placements
                if start_date > current_time:
                    continue
                    
                days_elapsed = (current_time - start_date).days
                duration = (pd.to_datetime(end_str).replace(tzinfo=timezone.utc) - start_date).days if end_str else days_elapsed
                
                # Invalid Date Fix: Discard negative durations
                if duration < 0:
                    continue
                
                # 3 Months (90 days)
                if end_str and duration < 90:
                    trainee_3m.append(0)
                elif days_elapsed >= 90:
                    trainee_3m.append(1)
                else:
                    trainee_3m.append(None)
                    
                # 6 Months (180 days)
                if end_str and duration < 180:
                    trainee_6m.append(0)
                elif days_elapsed >= 180:
                    trainee_6m.append(1)
                else:
                    trainee_6m.append(None)
                    
                # 12 Months (365 days)
                if end_str and duration < 365:
                    trainee_12m.append(0)
                elif days_elapsed >= 365:
                    trainee_12m.append(1)
                else:
                    trainee_12m.append(None)
                    
            if not trainee_3m and not trainee_6m and not trainee_12m:
                continue
                
            def aggregate_retention(status_list):
                if 1 in status_list:
                    return 1
                if None in status_list:
                    return None
                if status_list and all(s == 0 for s in status_list):
                    return 0
                return None
                
            obs = {
                "trainee_id": t.get("id"),
                "programme_id": t.get("programme_id", "Unknown"),
                "district": t.get("district", "Unknown"),
                "provider": t.get("provider", "Unknown"),
                "retained_3m": aggregate_retention(trainee_3m),
                "retained_6m": aggregate_retention(trainee_6m),
                "retained_12m": aggregate_retention(trainee_12m)
            }
            observations.append(obs)
                    
        df = pd.DataFrame(observations)
        if df.empty:
            return {
                "risk_patterns": [],
                "meta": {
                    "total_observations": 0,
                    "insufficient_data": True
                }
            }
            
        risk_patterns = []
        meta = {"total_observations": len(df), "insufficient_data": False}
        
        for period, col in [("3m", "retained_3m"), ("6m", "retained_6m"), ("12m", "retained_12m")]:
            valid_df = df.dropna(subset=[col])
            if valid_df.empty:
                continue
                
            global_rate = valid_df[col].mean()
            meta[f"global_rate_{period}"] = global_rate
            meta[f"observations_{period}"] = len(valid_df)
            
            for factor_type, factor_col in [("PROGRAMME", "programme_id"), ("DISTRICT", "district"), ("PROVIDER", "provider")]:
                stats = valid_df.groupby(factor_col)[col].agg(["count", "mean"]).reset_index()
                for _, row in stats.iterrows():
                    if row["count"] >= self.min_sample_threshold and row["mean"] < (global_rate - 0.1):
                        risk_patterns.append({
                            "factor_type": factor_type,
                            "factor_value": row[factor_col],
                            "period": period,
                            "evidence": {
                                "observations": int(row["count"]),
                                "retention_rate": float(row["mean"]),
                                "global_average": float(global_rate),
                                "difference": float(row["mean"] - global_rate)
                            }
                        })
                
        # Sort by severity of risk
        risk_patterns.sort(key=lambda x: x["evidence"]["difference"])
        
        return {
            "risk_patterns": risk_patterns,
            "meta": meta
        }
