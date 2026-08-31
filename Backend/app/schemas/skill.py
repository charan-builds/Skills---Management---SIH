from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SkillMasterBase(BaseModel):
    skill_id: str
    skill_name: str
    category: str # Programming, Database, Analytics, Web, Engineering, Soft Skills, Cloud
    description: Optional[str] = None

class SkillMasterCreate(SkillMasterBase):
    pass

class SkillMasterResponse(SkillMasterBase):
    created_at: Optional[datetime] = None

class SkillAssessmentBase(BaseModel):
    assessment_id: str
    trainee_id: str
    skill_id: str
    skill_name: str
    proficiency_score: int = Field(ge=0, le=100) # 0-100 score
    assessment_type: str = "project" # test, project, interview, practical
    assessment_date: str # YYYY-MM-DD
    assessor: Optional[str] = "Automated Assessment Engine"
    is_synthetic: bool = False

class SkillAssessmentCreate(SkillAssessmentBase):
    pass

class SkillAssessmentResponse(SkillAssessmentBase):
    created_at: Optional[datetime] = None

class SkillGapItem(BaseModel):
    skill_id: str
    skill_name: str
    programme_taught_level: int
    trainee_acquired_score: int
    job_required_level: int
    importance_weight: float
    gap: int # job_required - trainee_acquired (positive = gap, negative/0 = met)
    status: str # "Met", "Minor Gap", "Major Gap"

class ThreeWayGapResponse(BaseModel):
    programme_id: str
    programme_name: str
    trainee_id: str
    trainee_name: str
    job_id: str
    job_role: str
    overall_match_percentage: int
    skills_analysis: List[SkillGapItem]
    recommendations: List[str]
