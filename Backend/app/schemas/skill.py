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
    assessment_id: Optional[str] = None
    trainee_id: str
    skill_id: str
    skill_name: str
    proficiency_score: int = Field(ge=0, le=100) # 0-100 score
    assessment_type: str = "project" # test, project, interview, practical
    assessment_date: Optional[str] = None # YYYY-MM-DD
    assessor: Optional[str] = "Automated Assessment Engine"
    is_synthetic: bool = False

class SkillAssessmentCreate(SkillAssessmentBase):
    pass

class SkillAssessmentResponse(SkillAssessmentBase):
    created_at: Optional[datetime] = None



class SkillGapBase(BaseModel):
    skill: str
    skill_id: Optional[str] = None
    current_proficiency: Optional[int] = None
    required_proficiency: int
    gap_size: Optional[int] = None
    priority: str
    evidence_state: str
    benchmark_source: str

class UpskillingRecommendationBase(BaseModel):
    gap_id: Optional[str] = None
    skill: str
    state: str
    recommended_programme: Optional[str] = None
    programme_id: Optional[str] = None
    provider: Optional[str] = None
    expected_impact: Optional[int] = None
    reason: Optional[str] = None
