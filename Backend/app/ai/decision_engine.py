import uuid
from typing import Dict, Any, List
from datetime import datetime, timezone
import logging

from app.ai.skill_intelligence import SkillIntelligenceEngine
from app.ai.retention_intelligence import RetentionIntelligenceEngine

logger = logging.getLogger(__name__)

class DecisionEngine:
    def __init__(self):
        self.skill_engine = SkillIntelligenceEngine()
        self.retention_engine = RetentionIntelligenceEngine()
        self.version = "1.0.0"

    def generate_insights(self) -> Dict[str, Any]:
        """
        Aggregates evidence from Skill and Retention engines to form recommendations.
        """
        logger.info("Generating AI Decision Engine insights...")
        
        skill_data = self.skill_engine.analyze_skill_gaps()
        retention_data = self.retention_engine.analyze_retention_risks()
        
        recommendations = []
        
        # Process Skill Gaps into Recommendations
        for gap in skill_data.get("skill_gaps", []):
            skill = gap["skill"]
            evidence = gap["evidence"]
            
            # Rule 1: High employer complaint -> Urgent Remediation
            if evidence["employer_complaint_frequency"] >= 2:
                recommendations.append(self._create_recommendation(
                    rec_type="SKILL_REMEDIATION",
                    title=f"Address recurring employer complaints regarding {skill}",
                    description=f"Employers frequently cite {skill} as a deficiency among placed trainees.",
                    target_scope="PROGRAMME_WIDE",
                    affected_skill=skill,
                    evidence=[
                        f"Frequency of employer complaints: {evidence['employer_complaint_frequency']}",
                        f"Trainees affected across dataset: {evidence['trainees_affected']}"
                    ],
                    metrics=evidence,
                    strength="CRITICAL" if evidence["employer_complaint_frequency"] >= 5 else "HIGH",
                    reasoning=[
                        "Employer feedback is a direct indicator of workplace readiness gaps.",
                        "Recurring complaints justify immediate curriculum review."
                    ]
                ))
            
            # Rule 2: High assessment deficiency -> Curriculum Improvement
            elif evidence["deficiency_rate"] >= 0.3 and evidence["total_assessments"] >= 5:
                recommendations.append(self._create_recommendation(
                    rec_type="CURRICULUM_IMPROVEMENT",
                    title=f"Improve training outcomes for {skill}",
                    description=f"A significant portion of trainees are failing to reach proficiency in {skill}.",
                    target_scope="PROGRAMME_WIDE",
                    affected_skill=skill,
                    evidence=[
                        f"Deficiency rate: {evidence['deficiency_rate']*100:.1f}%",
                        f"Total assessments recorded: {evidence['total_assessments']}"
                    ],
                    metrics=evidence,
                    strength="HIGH" if evidence["deficiency_rate"] >= 0.5 else "MEDIUM",
                    reasoning=[
                        "Assessment scores below threshold indicate potential instructional gaps.",
                        "Review training materials for this specific skill module."
                    ]
                ))
                
        # Process Retention Risks into Recommendations
        for risk in retention_data.get("risk_patterns", []):
            evidence = risk["evidence"]
            factor_type = risk["factor_type"]
            factor_val = risk["factor_value"]
            period = risk.get("period", "6m")
            
            period_labels = {"3m": "3-month", "6m": "6-month", "12m": "12-month"}
            period_label = period_labels.get(period, f"{period}")
            
            recommendations.append(self._create_recommendation(
                rec_type=f"{factor_type}_INTERVENTION",
                title=f"Investigate elevated {period_label} attrition in {factor_val}",
                description=f"Observed {period_label} retention rates for this {factor_type.lower()} are significantly below the global average.",
                target_scope=factor_type,
                affected_skill=None,
                evidence=[
                    f"Observations: {evidence['observations']}",
                    f"Local Retention Rate: {evidence['retention_rate']*100:.1f}%",
                    f"Global Average: {evidence['global_average']*100:.1f}%"
                ],
                metrics=evidence,
                strength="CRITICAL" if evidence["difference"] <= -0.3 else ("HIGH" if evidence["difference"] <= -0.2 else "MEDIUM"),
                reasoning=[
                    f"Historical placement data indicates higher risk of {period_label} attrition.",
                    "Associations do not prove causality, but highlight areas requiring admin review."
                ]
            ))

        # Sort recommendations by strength (CRITICAL first, then HIGH)
        def _strength_sort(r):
            order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
            return order.get(r["strength"], 4)
            
        recommendations.sort(key=_strength_sort)
        
        return {
            "metadata": {
                "engine_version": self.version,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "skill_gaps_analyzed": len(skill_data.get("skill_gaps", [])),
                "retention_risks_analyzed": len(retention_data.get("risk_patterns", [])),
            },
            "recommendations": recommendations,
            "raw_intelligence": {
                "skill_gaps": skill_data,
                "retention": retention_data
            }
        }

    def _create_recommendation(self, rec_type, title, description, target_scope, affected_skill, evidence, metrics, strength, reasoning):
        return {
            "recommendation_id": f"REC-{uuid.uuid4().hex[:8].upper()}",
            "type": rec_type,
            "title": title,
            "description": description,
            "target_scope": target_scope,
            "affected_skill": affected_skill,
            "evidence": evidence,
            "metrics": metrics,
            "strength": strength,
            "reasoning": reasoning,
            "limitations": [
                "Associations are observational and do not imply definitive causality.",
                "Small sample sizes may cause volatility in metrics."
            ]
        }
