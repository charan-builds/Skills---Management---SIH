import pandas as pd
from typing import Dict, Any, List
from collections import defaultdict
import logging

from app.firebase.repository import FirestoreRepository

logger = logging.getLogger(__name__)

class SkillIntelligenceEngine:
    def __init__(self):
        self.min_sample_threshold = 5

    def _fetch_assessments(self):
        return FirestoreRepository.get_assessments()

    def _fetch_employer_feedback(self):
        return FirestoreRepository.get_employer_feedback()

    def _fetch_trainees(self):
        trainees = FirestoreRepository.get_trainees()
        return {t["id"]: t for t in trainees if t.get("id")}
        
    def _fetch_programmes(self):
        programmes = FirestoreRepository.get_programmes()
        return {p["id"]: p for p in programmes if p.get("id")}

    def analyze_skill_gaps(self) -> Dict[str, Any]:
        """
        Analyzes trainee assessments and employer feedback to identify skill gaps.
        Returns aggregated evidence by skill, programme, and district.
        """
        from datetime import datetime, timezone
        current_time = datetime.now(timezone.utc)
        
        assessments = self._fetch_assessments()
        feedback = self._fetch_employer_feedback()
        trainees = self._fetch_trainees()
        programmes = self._fetch_programmes()

        # 1. Deduplicate & Analyze Assessment Gaps (Trainee-Level)
        assessment_stats = defaultdict(lambda: {
            "total_trainees": 0,
            "below_threshold": 0,
            "sum_score": 0,
            "programmes": defaultdict(int),
            "districts": defaultdict(int),
            "providers": defaultdict(int),
            "trainees_affected": set()
        })
        
        # Deduplicate assessments per trainee per skill
        trainee_skill_scores = defaultdict(lambda: defaultdict(list))
        for asm in assessments:
            # Temporal Leakage Fix: Ignore future assessments
            created_at_str = asm.get("created_at") or asm.get("date")
            if created_at_str:
                created_at = pd.to_datetime(created_at_str)
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
                if created_at > current_time:
                    continue
            
            skill = asm.get("skill_name") or asm.get("skill_id", "Unknown")
            
            # Missing Score Defaulting Fix
            if "proficiency_score" not in asm or asm["proficiency_score"] is None:
                continue
                
            score = asm["proficiency_score"]
            trainee_id = asm.get("trainee_id")
            
            if trainee_id in trainees:
                trainee_skill_scores[trainee_id][skill].append(score)

        # Aggregate deduplicated scores
        for trainee_id, skills in trainee_skill_scores.items():
            trainee = trainees[trainee_id]
            prog_id = trainee.get("programme_id", "Unknown")
            district = trainee.get("district", "Unknown")
            provider = trainee.get("provider", "Unknown")
            
            for skill, scores in skills.items():
                # Average score for this trainee on this skill
                avg_score = sum(scores) / len(scores)
                
                stats = assessment_stats[skill]
                stats["total_trainees"] += 1
                stats["sum_score"] += avg_score
                
                if avg_score < 50:  # Threshold for deficiency
                    stats["below_threshold"] += 1
                    stats["programmes"][prog_id] += 1
                    stats["districts"][district] += 1
                    stats["providers"][provider] += 1
                    stats["trainees_affected"].add(trainee_id)

        # 2. Analyze Employer Feedback Gaps
        employer_complaints = defaultdict(lambda: {
            "frequency": 0,
            "programmes": defaultdict(int),
            "providers": defaultdict(int),
            "districts": defaultdict(int),
            "trainees_affected": set()
        })

        for fb in feedback:
            # Temporal Leakage Fix: Ignore future feedback
            created_at_str = fb.get("created_at") or fb.get("date")
            if created_at_str:
                created_at = pd.to_datetime(created_at_str)
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
                if created_at > current_time:
                    continue

            trainee_id = fb.get("trainee_id")
            if trainee_id not in trainees:
                continue
                
            trainee = trainees[trainee_id]
            prog_id = trainee.get("programme_id", "Unknown")
            district = trainee.get("district", "Unknown")
            provider = trainee.get("provider", "Unknown")
            
            tech_gaps = fb.get("technical_deficiencies", [])
            soft_gaps = fb.get("soft_skill_deficiencies", [])
            
            # Deduplicate gaps per feedback record
            unique_gaps = set(tech_gaps + soft_gaps)
            
            for gap in unique_gaps:
                employer_complaints[gap]["frequency"] += 1
                employer_complaints[gap]["programmes"][prog_id] += 1
                employer_complaints[gap]["providers"][provider] += 1
                employer_complaints[gap]["districts"][district] += 1  # District Aggregation Fix
                employer_complaints[gap]["trainees_affected"].add(trainee_id)

        # Combine into unified gaps
        all_skills = set(assessment_stats.keys()).union(set(employer_complaints.keys()))
        
        gaps = []
        for skill in all_skills:
            a_stats = assessment_stats.get(skill, {})
            e_stats = employer_complaints.get(skill, {})
            
            total_trainees = a_stats.get("total_trainees", 0)
            avg_score = a_stats.get("sum_score", 0) / total_trainees if total_trainees > 0 else None
            below_threshold = a_stats.get("below_threshold", 0)
            deficiency_rate = (below_threshold / total_trainees) if total_trainees > 0 else 0
            
            emp_freq = e_stats.get("frequency", 0)
            
            affected_prog_dict = a_stats.get("programmes", {})
            for p, c in e_stats.get("programmes", {}).items():
                affected_prog_dict[p] = affected_prog_dict.get(p, 0) + c
                
            affected_prov_dict = a_stats.get("providers", {})
            for p, c in e_stats.get("providers", {}).items():
                affected_prov_dict[p] = affected_prov_dict.get(p, 0) + c

            affected_dist_dict = a_stats.get("districts", {})
            for p, c in e_stats.get("districts", {}).items():
                affected_dist_dict[p] = affected_dist_dict.get(p, 0) + c
                
            # Filter low signal
            if total_trainees < self.min_sample_threshold and emp_freq < 2:
                continue
                
            # Only consider it a gap if deficiency rate is high OR employers complained
            if deficiency_rate >= 0.3 or emp_freq >= 2:
                gaps.append({
                    "skill": skill,
                    "evidence": {
                        "total_assessments": total_trainees, # Renamed semantically in logic, keeping key for contract
                        "average_proficiency": avg_score,
                        "deficiency_rate": deficiency_rate,
                        "employer_complaint_frequency": emp_freq,
                        "trainees_affected": len(a_stats.get("trainees_affected", set()).union(e_stats.get("trainees_affected", set()))),
                        "affected_programmes": dict(affected_prog_dict),
                        "affected_districts": dict(affected_dist_dict),
                        "affected_providers": dict(affected_prov_dict)
                    }
                })

        # Sort by severity (employer complaints weigh heavy, then deficiency rate)
        gaps.sort(key=lambda x: (x["evidence"]["employer_complaint_frequency"], x["evidence"]["deficiency_rate"]), reverse=True)
        
        return {
            "skill_gaps": gaps,
            "meta": {
                "total_assessments_analyzed": sum(len(scores) for t in trainee_skill_scores.values() for scores in t.values()),
                "total_feedback_analyzed": len(feedback),
                "insufficient_data": len(gaps) == 0
            }
        }
