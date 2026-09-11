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

class DataStateMetadata(BaseModel):
    data_available: bool = True
    insufficient_data: bool = False
    reason: Optional[str] = None
    population: Optional[int] = None
    numerator: Optional[int] = None
    denominator: Optional[int] = None

class DashboardResponse(DataStateMetadata):
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

class SkillGapResponse(DataStateMetadata):
    course_name: str
    job_skill_match: Optional[str] = None
    skills_comparison: List[SkillComparison]
    common_gaps: List[CourseGap]

class CauseCard(BaseModel):
    cause_num: str
    title: str
    description: str
    icon: str

class DiagnosisResponse(DataStateMetadata):
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

class FunnelResponse(DataStateMetadata):
    total_trained: Optional[int] = None
    certified: Optional[int] = None
    placed: Optional[int] = None
    self_employed: Optional[int] = None
    apprentices: Optional[int] = None
    unemployed: Optional[int] = None
    other: Optional[int] = None

class LongitudinalTrackingResponse(DataStateMetadata):
    checkpoints: List[Dict[str, str]]

class WageProgressionResponse(DataStateMetadata):
    starting_wage: Optional[float] = None
    wage_3m: Optional[float] = None
    wage_6m: Optional[float] = None
    wage_12m: Optional[float] = None
    average_wage: Optional[float] = None
    median_wage: Optional[float] = None
    growth_percentage: Optional[float] = None

class AttritionCategory(BaseModel):
    category: str
    count: Optional[int] = None
    percentage: Optional[float] = None

class NonPlacementResponse(DataStateMetadata):
    categories: List[AttritionCategory]

class AttritionResponse(DataStateMetadata):
    categories: List[AttritionCategory]

class ProviderRow(BaseModel):
    provider: str
    trained: int
    completed: int
    placement_rate: str
    retention_6m: str
    wage_growth: str

class AccountabilityResponse(BaseModel):
    providers: List[ProviderRow]

class DistrictRow(BaseModel):
    district: str
    trained: int
    employment_rate: str
    retention_rate: str
    top_skill_gap: str
    non_placement_top_reason: str

class DistrictAnalyticsResponse(BaseModel):
    districts: List[DistrictRow]
