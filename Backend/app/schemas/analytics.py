from pydantic import BaseModel
from typing import List, Dict, Optional

class StatCard(BaseModel):
    title: str
    value: Optional[str] = None
    change: Optional[str] = None
    icon: str # name of icon matching lucide

class AlertNotification(BaseModel):
    id: str
    type: str # warning, success
    title: str
    message: str

class DashboardResponse(BaseModel):
    stats: List[StatCard]
    notifications: List[AlertNotification]
    employment_trend: List[Dict[str, Optional[str]]] # e.g. [{"month": "Jan", "rate": "55%"}, ...]
    retention: List[Dict[str, Optional[str]]] # e.g. [{"checkpoint": "3 Months", "rate": "82%"}, ...]
    priority_insight: Optional[Dict[str, str]] = None
    top_skills: Optional[List[Dict[str, str]]] = None

class SkillComparison(BaseModel):
    taught: str
    required: str
    match: bool

class CourseGap(BaseModel):
    skill: str
    percentage: int

class SkillGapResponse(BaseModel):
    course_name: str
    job_skill_match: Optional[str] = None
    skills_comparison: List[SkillComparison]
    common_gaps: List[CourseGap]

class CauseCard(BaseModel):
    cause_num: str
    title: str
    description: str
    icon: str

class DiagnosisResponse(BaseModel):
    programme_name: str
    placement: str
    retention_12m: str
    wage_growth: str
    skill_match: str
    root_problem: str
    root_rate: str
    causes: List[CauseCard]
    recommended_actions: List[Dict[str, str]]

class SimulationRequest(BaseModel):
    programme_id: str
    intervention: str

class SimulationMetrics(BaseModel):
    skillMatch: str
    retention: str
    wageGrowth: str

class SimulationResponse(BaseModel):
    programme_name: str
    intervention: str
    current: SimulationMetrics
    projected: SimulationMetrics
