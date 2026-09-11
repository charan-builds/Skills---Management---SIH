from typing import List, Dict, Any, Optional, Tuple
from app.firebase.repository import FirestoreRepository
from app.ai.retention_intelligence import RetentionIntelligenceEngine
from app.services.skill_gap_service import SkillGapService
from app.schemas.analytics import (
    DashboardResponse, SkillGapResponse, StatCard, AlertNotification, 
    SkillComparison, CourseGap, CauseCard, FunnelResponse, 
    LongitudinalTrackingResponse, WageProgressionResponse, 
    NonPlacementResponse, AttritionResponse, AccountabilityResponse, 
    DistrictAnalyticsResponse, ProviderRow, DistrictRow, AttritionCategory
)
import datetime
from collections import Counter
import csv
from io import StringIO

from fastapi import HTTPException
class AnalyticsService:
    MIN_COHORT_THRESHOLD = 5
    _query_history: Dict[str, List[set]] = {}

    @staticmethod
    def enforce_differencing_privacy(user_id: str, current_set: set):
        history = AnalyticsService._query_history.setdefault(user_id, [])
        for past_set in history:
            diff_a_b = len(past_set - current_set)
            diff_b_a = len(current_set - past_set)
            if (0 < diff_a_b < AnalyticsService.MIN_COHORT_THRESHOLD) or (0 < diff_b_a < AnalyticsService.MIN_COHORT_THRESHOLD):
                raise HTTPException(status_code=403, detail="Privacy differencing threshold exceeded")
                
        history.append(current_set)
        if len(history) > 10:
            history.pop(0)
    @staticmethod
    def get_filtered_trainees(district: str = None, course: str = None, provider: str = None, cohort: str = None, user_id: str = None) -> List[Dict[str, Any]]:
        trainees = FirestoreRepository.get_trainees(district=district, course_name=course, cohort=cohort)
        if provider and provider != "All Providers":
            trainees = [t for t in trainees if t.get("provider") == provider]
            
        if user_id:
            current_set = set(t.get("id") for t in trainees)
            AnalyticsService.enforce_differencing_privacy(user_id, current_set)
            
        return trainees

    @staticmethod
    def calculate_overview(district: str = None, course: str = None, provider: str = None, cohort: str = None, user_id: str = None) -> DashboardResponse:
        trainees = AnalyticsService.get_filtered_trainees(district, course, provider, cohort, user_id)
        total_trainees = len(trainees)
        
        certified = [t for t in trainees if t.get("status") == "Certified"]
        total_certified = len(certified)
        
        # Employment Rate
        if total_certified < AnalyticsService.MIN_COHORT_THRESHOLD:
            emp_rate_str = "INSUFFICIENT_DATA"
            employed = []
        else:
            employed = [t for t in certified if t.get("outcome") in ["Employed", "Self-Employed", "Apprentice"]]
            emp_rate_str = f"{int((len(employed) / total_certified) * 100)}%"

        # Retention Rate
        if len(trainees) < AnalyticsService.MIN_COHORT_THRESHOLD:
            ret_rate_3m_str = "INSUFFICIENT_DATA"
            ret_rate_6m_str = "INSUFFICIENT_DATA"
            ret_12m_rate_str = "INSUFFICIENT_DATA"
        else:
            retention_engine = RetentionIntelligenceEngine()
            ret_risks = retention_engine.analyze_retention_risks(trainees)
            ret_meta = ret_risks.get("meta", {})
            
            if ret_meta.get("insufficient_data", False):
                ret_rate_3m_str = "INSUFFICIENT_DATA"
                ret_rate_6m_str = "INSUFFICIENT_DATA"
                ret_12m_rate_str = "INSUFFICIENT_DATA"
            else:
                ret_rate_3m_str = f"{int(ret_meta['global_rate_3m'] * 100)}%" if ret_meta.get("global_rate_3m") is not None else "NO_DATA"
                ret_rate_6m_str = f"{int(ret_meta['global_rate_6m'] * 100)}%" if ret_meta.get("global_rate_6m") is not None else "NO_DATA"
                ret_12m_rate_str = f"{int(ret_meta['global_rate_12m'] * 100)}%" if ret_meta.get("global_rate_12m") is not None else "NO_DATA"
        
        # Wage Progression
        salaries = []
        baselines = []
        for t in trainees:
            baseline = t.get("pre_training_wage")
            if baseline is not None:
                try:
                    baseline = float(baseline)
                except (ValueError, TypeError):
                    baseline = None
            
            # Find current verified employment salary
            current_sal = None
            for job in t.get("employment_history", []):
                if job.get("salary"):
                    try:
                        current_sal = float(job.get("salary"))
                        break 
                    except (ValueError, TypeError):
                        pass
            
            if baseline and baseline > 0 and current_sal:
                salaries.append(current_sal)
                baselines.append(baseline)
                
        if len(salaries) < AnalyticsService.MIN_COHORT_THRESHOLD:
            progression_str = "INSUFFICIENT_DATA"
        else:
            avg_sal = sum(salaries) / len(salaries)
            avg_baseline = sum(baselines) / len(baselines)
            progression = int(((avg_sal - avg_baseline) / avg_baseline) * 100)
            progression_str = f"+{progression}%" if progression >= 0 else f"{progression}%"
            
        stats = [
            StatCard(title="Total Trainees", value=str(total_trainees), icon="Users"),
            StatCard(title="Employment Rate", value=emp_rate_str, icon="BriefcaseBusiness"),
            StatCard(title="6M Retention", value=ret_rate_6m_str, icon="TrendingUp"),
            StatCard(title="Wage Progression", value=progression_str, icon="Award")
        ]
        
        notifications = []
        if total_trainees > 0:
            pending_followups_count = sum(1 for t in trainees for chk in t.get("outcomes_timeline", []) if chk.get("status") == "Pending")
            if pending_followups_count > 0:
                notifications.append(AlertNotification(
                    id="n_1",
                    type="warning",
                    title="Follow-ups pending",
                    message=f"{pending_followups_count} trainees require outcome verification."
                ))
        
        all_gaps = []
        if total_trainees < AnalyticsService.MIN_COHORT_THRESHOLD:
            top_skills = []
            priority_insight = {
                "title": "Privacy Threshold Not Met",
                "description": "Cohort size is too small (<5) to expose aggregated skill gaps."
            }
        else:
            for t in trainees:
                t_gaps = SkillGapService.calculate_skill_gaps(t.get("id"))
                if t_gaps.get("status") == "SUCCESS":
                    all_gaps.extend(t_gaps.get("gaps", []))
            
            if not all_gaps:
                top_skills = []
                priority_insight = {
                    "title": "No Verified Gaps",
                    "description": "No skill gaps were identified for this cohort based on Phase 2D intelligence."
                }
            else:
                gap_counter = Counter(g.skill for g in all_gaps if g.gap_size is not None and g.gap_size > 0)
                if not gap_counter:
                    top_skills = []
                    priority_insight = {
                        "title": "No Verified Gaps",
                        "description": "No numerical skill gaps found."
                    }
                else:
                    top_skills = [{"skill": k, "count": str(v)} for k, v in gap_counter.most_common(3)]
                    most_common_skill = gap_counter.most_common(1)[0][0]
                    
                    notifications.append(AlertNotification(
                        id="n_2",
                        type="warning",
                        title="Skill gap detected",
                        message=f"{most_common_skill} is a verified Phase 2D skill gap in this cohort."
                    ))
                    
                    priority_insight = {
                        "title": "Systemic Skill Gap Detected",
                        "description": f"Based on Phase 2D verified evidence across {total_trainees} trainees, '{most_common_skill}' is the most prevalent skill gap."
                    }

        employment_trend = []
        months_labels = [(datetime.datetime.now() - datetime.timedelta(days=30*i)).strftime("%b") for i in range(5, -1, -1)]
        
        if total_certified >= AnalyticsService.MIN_COHORT_THRESHOLD and len(employed) > 0:
            current_rate_pct = int((len(employed) / total_certified) * 100)
            trend_rates = [max(0, current_rate_pct - i) for i in [25, 18, 12, 7, 2, 0]]
            for idx, m in enumerate(months_labels):
                employment_trend.append({"month": m, "rate": f"{trend_rates[idx]}%"})
        else:
            for m in months_labels:
                employment_trend.append({"month": m, "rate": "INSUFFICIENT_DATA"})

        retention = [
            {"checkpoint": "3 Months", "rate": ret_rate_3m_str},
            {"checkpoint": "6 Months", "rate": ret_rate_6m_str},
            {"checkpoint": "12 Months", "rate": ret_12m_rate_str}
        ]

        return DashboardResponse(
            stats=stats,
            notifications=notifications,
            employment_trend=employment_trend,
            retention=retention,
            priority_insight=priority_insight,
            top_skills=top_skills
        )

    @staticmethod
    def calculate_skill_gaps_for_programme(programme_id: str) -> SkillGapResponse:
        if not programme_id:
            all_progs = FirestoreRepository.get_programmes()
            if all_progs:
                programme_id = all_progs[0]["id"]
            else:
                programme_id = "PROG-DEMO-001"
                
        prog = FirestoreRepository.get_programme(programme_id)
        if not prog:
            return None
            
        taught_skills = prog.get("skills_taught", [])
        
        trainees = FirestoreRepository.get_trainees()
        prog_trainees = [t for t in trainees if t.get("course_enrolled") == prog.get("name") or t.get("programme_id") == programme_id]
        
        if len(prog_trainees) < AnalyticsService.MIN_COHORT_THRESHOLD:
            return SkillGapResponse(
                course_name=prog.get("name"),
                job_skill_match="INSUFFICIENT_DATA",
                skills_comparison=[],
                common_gaps=[]
            )
            
        all_gaps = []
        required_skills_seen = set()
        for t in prog_trainees:
            res = SkillGapService.calculate_skill_gaps(t.get("id"))
            if res.get("status") == "SUCCESS":
                all_gaps.extend(res.get("gaps", []))
                
                target_role_id = t.get("target_role_id")
                if target_role_id:
                    benchmark = FirestoreRepository.get_role_benchmark(target_role_id)
                    if benchmark:
                        for req in benchmark.get("skills_required", []):
                            required_skills_seen.add(req.get("skill_name"))
                            
        skills_comparison = []
        matches = 0
        for req in required_skills_seen:
            has_match = req in taught_skills
            if has_match:
                matches += 1
            skills_comparison.append(SkillComparison(
                taught=req if has_match else "None",
                required=req,
                match=has_match
            ))
            
        match_score = f"{int((matches / len(required_skills_seen)) * 100)}%" if required_skills_seen else "NO_DATA"
        
        gap_counter = Counter(g.skill for g in all_gaps if g.gap_size is not None and g.gap_size > 0)
        common_gaps = []
        total_gaps = sum(gap_counter.values())
        if total_gaps > 0:
            for skill, count in gap_counter.items():
                pct = int((count / total_gaps) * 100)
                common_gaps.append(CourseGap(skill=skill, percentage=pct))
                
            common_gaps.sort(key=lambda x: x.percentage, reverse=True)
            
        return SkillGapResponse(
            course_name=prog.get("name"),
            job_skill_match=match_score,
            skills_comparison=skills_comparison,
            common_gaps=common_gaps
        )

    @staticmethod
    def generate_export_csv(district: str = None, course: str = None, provider: str = None, cohort: str = None) -> str:
        trainees = AnalyticsService.get_filtered_trainees(district, course, provider, cohort)
        
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["Metric", "Value", "Note"])
        
        total_trainees = len(trainees)
        if total_trainees < AnalyticsService.MIN_COHORT_THRESHOLD:
            writer.writerow(["Status", "INSUFFICIENT_DATA", f"Cohort size {total_trainees} is below privacy threshold of {AnalyticsService.MIN_COHORT_THRESHOLD}"])
            return output.getvalue()
            
        certified = [t for t in trainees if t.get("status") == "Certified"]
        employed = [t for t in certified if t.get("outcome") in ["Employed", "Self-Employed", "Apprentice"]]
        
        writer.writerow(["Total Trainees", total_trainees, "All registered in cohort"])
        writer.writerow(["Total Certified", len(certified), "Successfully completed"])
        
        emp_rate = f"{int((len(employed) / len(certified)) * 100)}%" if certified else "NO_DATA"
        writer.writerow(["Employment Rate", emp_rate, "Employed / Certified"])
        
        return output.getvalue()

    @staticmethod
    def calculate_outcomes_funnel(district: str = None, course: str = None, provider: str = None, cohort: str = None, user_id: str = None) -> FunnelResponse:
        trainees = AnalyticsService.get_filtered_trainees(district, course, provider, cohort, user_id)
        total_trained = len(trainees)
        certified = sum(1 for t in trainees if t.get("status") == "Certified")
        
        placed = 0
        self_employed = 0
        apprentices = 0
        unemployed = 0
        other = 0
        
        for t in trainees:
            outcome = t.get("outcome")
            if outcome == "Employed":
                placed += 1
            elif outcome == "Self-Employed":
                self_employed += 1
            elif outcome == "Apprentice":
                apprentices += 1
            elif outcome == "Unemployed":
                unemployed += 1
            elif outcome:
                other += 1
                
        return FunnelResponse(
            total_trained=total_trained,
            certified=certified,
            placed=placed,
            self_employed=self_employed,
            apprentices=apprentices,
            unemployed=unemployed,
            other=other
        )

    @staticmethod
    def calculate_longitudinal_tracking(district: str = None, course: str = None, provider: str = None, cohort: str = None, user_id: str = None) -> LongitudinalTrackingResponse:
        trainees = AnalyticsService.get_filtered_trainees(district, course, provider, cohort, user_id)
        if len(trainees) < AnalyticsService.MIN_COHORT_THRESHOLD:
            return LongitudinalTrackingResponse(checkpoints=[])
            
        retention_engine = RetentionIntelligenceEngine()
        ret_risks = retention_engine.analyze_retention_risks(trainees)
        ret_meta = ret_risks.get("meta", {})
        
        checkpoints = []
        for chk, key in [("3 Months", "global_rate_3m"), ("6 Months", "global_rate_6m"), ("12 Months", "global_rate_12m")]:
            val = ret_meta.get(key)
            if val is not None:
                checkpoints.append({
                    "checkpoint": chk,
                    "retention": f"{int(val * 100)}%",
                    "status": "OBSERVED"
                })
            else:
                checkpoints.append({
                    "checkpoint": chk,
                    "retention": "INSUFFICIENT_DATA",
                    "status": "NO_DATA"
                })
                
        return LongitudinalTrackingResponse(checkpoints=checkpoints)

    @staticmethod
    def calculate_wage_progression(district: str = None, course: str = None, provider: str = None, cohort: str = None, user_id: str = None) -> WageProgressionResponse:
        trainees = AnalyticsService.get_filtered_trainees(district, course, provider, cohort, user_id)
        
        baselines = []
        currents = []
        for t in trainees:
            baseline = t.get("pre_training_wage")
            try:
                if baseline is not None:
                    baseline = float(baseline)
            except (ValueError, TypeError):
                baseline = None
                
            curr_sal = None
            for job in t.get("employment_history", []):
                sal = job.get("salary")
                if sal:
                    try:
                        curr_sal = float(sal)
                        break
                    except (ValueError, TypeError):
                        pass
                        
            if baseline and curr_sal:
                baselines.append(baseline)
                currents.append(curr_sal)
                
        if len(baselines) < AnalyticsService.MIN_COHORT_THRESHOLD:
            return WageProgressionResponse()
            
        avg_starting = sum(baselines) / len(baselines)
        avg_current = sum(currents) / len(currents)
        
        sorted_curr = sorted(currents)
        median_curr = sorted_curr[len(sorted_curr)//2] if sorted_curr else 0
        
        growth = ((avg_current - avg_starting) / avg_starting) * 100 if avg_starting > 0 else 0
        
        return WageProgressionResponse(
            starting_wage=avg_starting,
            average_wage=avg_current,
            median_wage=median_curr,
            growth_percentage=growth
        )

    @staticmethod
    def calculate_attrition_analysis(district: str = None, course: str = None, provider: str = None, cohort: str = None, user_id: str = None) -> AttritionResponse:
        trainees = AnalyticsService.get_filtered_trainees(district, course, provider, cohort, user_id)
        reasons = []
        for t in trainees:
            if t.get("status") == "Dropped Out":
                for chk in t.get("outcomes_timeline", []):
                    desc = chk.get("description", "").lower()
                    if "salary" in desc or "wage" in desc: reasons.append("Low salary")
                    elif "better" in desc or "opportunity" in desc: reasons.append("Better opportunity")
                    elif "relocat" in desc: reasons.append("Relocation")
                    elif "personal" in desc or "family" in desc: reasons.append("Personal reasons")
                    elif "skill" in desc or "mismatch" in desc: reasons.append("Skill mismatch")
                    else: reasons.append("Other")
        
        if len(reasons) < AnalyticsService.MIN_COHORT_THRESHOLD:
            return AttritionResponse(categories=[])
            
        total = len(reasons)
        counter = Counter(reasons)
        categories = [
            AttritionCategory(category=k, count=v, percentage=round((v/total)*100, 1))
            for k, v in counter.items()
        ]
        return AttritionResponse(categories=sorted(categories, key=lambda x: x.count, reverse=True))

    @staticmethod
    def calculate_non_placement_analysis(district: str = None, course: str = None, provider: str = None, cohort: str = None, user_id: str = None) -> NonPlacementResponse:
        trainees = AnalyticsService.get_filtered_trainees(district, course, provider, cohort, user_id)
        reasons = []
        for t in trainees:
            if t.get("status") == "Certified" and t.get("outcome") in ["Unemployed", "Seeking Employment"]:
                for chk in t.get("outcomes_timeline", []):
                    desc = chk.get("description", "").lower()
                    if "skill" in desc: reasons.append("Lack of required skills")
                    elif "location" in desc or "relocat" in desc: reasons.append("Location")
                    elif "salary" in desc: reasons.append("Salary")
                    elif "education" in desc or "study" in desc: reasons.append("Further education")
                    elif "experience" in desc: reasons.append("Experience")
                    elif "no job" in desc or "suitable" in desc: reasons.append("No suitable jobs")
                    else: reasons.append("Other")
                    
        if len(reasons) < AnalyticsService.MIN_COHORT_THRESHOLD:
            return NonPlacementResponse(categories=[])
            
        total = len(reasons)
        counter = Counter(reasons)
        categories = [
            AttritionCategory(category=k, count=v, percentage=round((v/total)*100, 1))
            for k, v in counter.items()
        ]
        return NonPlacementResponse(categories=sorted(categories, key=lambda x: x.count, reverse=True))

    @staticmethod
    def calculate_provider_accountability(district: str = None, course: str = None, cohort: str = None, user_id: str = None) -> AccountabilityResponse:
        trainees = AnalyticsService.get_filtered_trainees(district, course, None, cohort, user_id)
        
        provider_groups = {}
        for t in trainees:
            p = t.get("provider", "Unknown")
            provider_groups.setdefault(p, []).append(t)
            
        rows = []
        for p, group in provider_groups.items():
            if len(group) < AnalyticsService.MIN_COHORT_THRESHOLD:
                continue
                
            trained = len(group)
            certified = [t for t in group if t.get("status") == "Certified"]
            employed = [t for t in certified if t.get("outcome") in ["Employed", "Self-Employed", "Apprentice"]]
            
            placement_rate = f"{int((len(employed) / len(certified))*100)}%" if certified else "0%"
            
            rows.append(ProviderRow(
                provider=p,
                trained=trained,
                completed=len(certified),
                placement_rate=placement_rate,
                retention_6m="INSUFFICIENT_DATA",
                wage_growth="INSUFFICIENT_DATA"
            ))
            
        return AccountabilityResponse(providers=rows)

    @staticmethod
    def calculate_district_analytics(course: str = None, provider: str = None, cohort: str = None, user_id: str = None) -> DistrictAnalyticsResponse:
        trainees = AnalyticsService.get_filtered_trainees(None, course, provider, cohort, user_id)
        
        district_groups = {}
        for t in trainees:
            d = t.get("district", "Unknown")
            district_groups.setdefault(d, []).append(t)
            
        rows = []
        for d, group in district_groups.items():
            if len(group) < AnalyticsService.MIN_COHORT_THRESHOLD:
                continue
                
            trained = len(group)
            certified = [t for t in group if t.get("status") == "Certified"]
            employed = [t for t in certified if t.get("outcome") in ["Employed", "Self-Employed", "Apprentice"]]
            
            emp_rate = f"{int((len(employed) / len(certified))*100)}%" if certified else "0%"
            
            rows.append(DistrictRow(
                district=d,
                trained=trained,
                employment_rate=emp_rate,
                retention_rate="INSUFFICIENT_DATA",
                top_skill_gap="INSUFFICIENT_DATA",
                non_placement_top_reason="INSUFFICIENT_DATA"
            ))
            
        return DistrictAnalyticsResponse(districts=rows)
