from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SkillTaught(BaseModel):
    skill_id: str
    skill_name: str
    target_level: int = Field(ge=0, le=100, default=70) # 0-100 target proficiency

class ProgrammeBase(BaseModel):
    id: str
    name: str
    provider: str
    status: str = "Active"
    skills_taught: List[str] = []
    skills_taught_structured: Optional[List[SkillTaught]] = []
    employment_rate_num: Optional[float] = 0.78 # Float representation 0.0 - 1.0
    retention_6m_num: Optional[float] = 0.64
    retention_12m_num: Optional[float] = 0.49

class ProgrammeCreate(ProgrammeBase):
    pass

class ProgrammeResponse(ProgrammeBase):
    trainees: Optional[int] = 0
    employment: Optional[str] = "0%"
    retention: Optional[str] = "0%"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ProgrammeSummaryResponse(BaseModel):
    id: str
    name: str
    provider: str
    status: str
    trainees: int
    employment: str
    retention: str
    employment_rate_num: Optional[float] = None
    retention_6m_num: Optional[float] = None
    retention_12m_num: Optional[float] = None
