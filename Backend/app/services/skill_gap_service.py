from typing import List, Dict, Any, Optional
from app.firebase.repository import FirestoreRepository
from app.schemas.skill import SkillGapBase, UpskillingRecommendationBase
import hashlib

class SkillGapService:
    @staticmethod
    def calculate_skill_gaps(trainee_id: str) -> Dict[str, Any]:
        trainee = FirestoreRepository.get_trainee(trainee_id)
        if not trainee:
            return {"status": "TRAINEE_NOT_FOUND", "gaps": []}
        
        target_role_id = trainee.get("target_role_id")
        if not target_role_id:
            return {"status": "NO_BENCHMARK", "gaps": []}
            
        benchmark = FirestoreRepository.get_role_benchmark(target_role_id)
        if not benchmark:
            return {"status": "NO_BENCHMARK", "gaps": []}
            
        assessments = FirestoreRepository.get_trainee_assessments(trainee_id)
        # Deduplicate assessments (take max score per skill_id/name)
        verified_skills = {}
        for a in assessments:
            s_id = a.get("skill_id", a.get("skill_name", "").lower())
            score = a.get("proficiency_score", 0)
            if s_id not in verified_skills or score > verified_skills[s_id]:
                verified_skills[s_id] = score
                
        # Self-reported skills
        unverified_skills = [s.lower() for s in trainee.get("skills", [])]
        
        gaps = []
        required_skills = benchmark.get("skills_required", [])
        for req in required_skills:
            req_id = req.get("skill_id", req.get("skill_name", "").lower())
            req_score = req.get("required_level", 0)
            importance = req.get("importance", 0.5)
            
            # Determine current proficiency
            current_score = None
            if req_id in verified_skills:
                current_score = verified_skills[req_id]
                evidence_state = "VERIFIED_ASSESSMENT"
            else:
                if req.get("skill_name", "").lower() in unverified_skills:
                    evidence_state = "INSUFFICIENT_SKILL_EVIDENCE"
                else:
                    evidence_state = "NO_EVIDENCE"
                    
            gap_size = req_score - current_score if current_score is not None else None
            
            if gap_size is None or gap_size > 0:
                if gap_size is None:
                    # Treat unknown gaps based on importance to avoid fabricated priorities
                    if importance >= 0.8:
                        priority = "HIGH"
                    elif importance >= 0.5:
                        priority = "MEDIUM"
                    else:
                        priority = "LOW"
                else:
                    if gap_size >= 40 and importance >= 0.8:
                        priority = "CRITICAL"
                    elif gap_size >= 20 and importance >= 0.6:
                        priority = "HIGH"
                    elif gap_size > 0 and importance >= 0.4:
                        priority = "MEDIUM"
                    else:
                        priority = "LOW"
                    
                skill_name = req.get("skill_name")
                if not skill_name and req.get("skill_id"):
                    skill_doc = FirestoreRepository.get_skill(req.get("skill_id"))
                    if skill_doc:
                        skill_name = skill_doc.get("skill_name")
                if not skill_name:
                    skill_name = req.get("skill_id", "Unknown Skill")

                gaps.append(SkillGapBase(
                    skill=skill_name,
                    skill_id=req.get("skill_id"),
                    current_proficiency=current_score,
                    required_proficiency=req_score,
                    gap_size=gap_size,
                    priority=priority,
                    evidence_state=evidence_state,
                    benchmark_source=benchmark.get("title", "Occupational Benchmark")
                ))
                
        # Sort gaps by priority severity
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        gaps.sort(key=lambda x: (priority_order.get(x.priority, 4), -(x.gap_size or 0)))
        
        return {"status": "SUCCESS", "gaps": gaps}

    @staticmethod
    def generate_recommendations(gaps: List[SkillGapBase]) -> List[UpskillingRecommendationBase]:
        recommendations = []
        programmes = FirestoreRepository.get_programmes()
        
        # Phase 2E: Process valid gaps with evidence and gap_size > 0, but allow self-reported (INSUFFICIENT_SKILL_EVIDENCE)
        valid_gaps = [g for g in gaps if (g.gap_size is None and g.evidence_state != "NO_EVIDENCE") or (g.gap_size is not None and g.gap_size > 0)]
        
        for gap in valid_gaps:
            gap_id = hashlib.md5(f"{gap.skill_id or gap.skill}_{gap.gap_size}".encode()).hexdigest()[:8]
            
            eligible_programmes = []
            
            for p in programmes:
                taught_skills = p.get("skills_taught_structured", [])
                for ts in taught_skills:
                    ts_id = ts.get("skill_id", ts.get("skill_name", "").lower())
                    gap_s_id = gap.skill_id if gap.skill_id else gap.skill.lower()
                    
                    if ts_id == gap_s_id or ts.get("skill_name", "").lower() == gap.skill.lower():
                        # Match found, check proficiency
                        target_level = ts.get("target_level", 0)
                        if target_level >= gap.required_proficiency:
                            if gap.gap_size is None:
                                impact = 0
                            else:
                                impact = target_level - (gap.current_proficiency if gap.current_proficiency is not None else 0)
                            eligible_programmes.append({
                                "programme": p,
                                "impact": impact
                            })
                            break # Move to next programme once matched for this gap
            
            if eligible_programmes:
                # Phase 2E: Deterministic ranking/tie-breaking (impact DESC, name ASC)
                eligible_programmes.sort(key=lambda x: (-x["impact"], x["programme"].get("name", "")))
                best = eligible_programmes[0]
                best_programme = best["programme"]
                best_impact = best["impact"]
                
                recommendations.append(UpskillingRecommendationBase(
                    gap_id=gap_id,
                    skill=gap.skill,
                    state="RECOMMENDATION_AVAILABLE",
                    recommended_programme=best_programme.get("name"),
                    programme_id=best_programme.get("id"),
                    provider=best_programme.get("provider"),
                    expected_impact=best_impact,
                    reason=f"Programme addresses {gap.skill} proficiency gap."
                ))
            else:
                recommendations.append(UpskillingRecommendationBase(
                    gap_id=gap_id,
                    skill=gap.skill,
                    state="NO_MATCHING_PROGRAMME",
                    recommended_programme=None,
                    programme_id=None,
                    provider=None,
                    expected_impact=None,
                    reason="No existing training programme currently maps to this skill gap."
                ))
                
        return recommendations
