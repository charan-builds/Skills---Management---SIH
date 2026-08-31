from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SkillRequirement(BaseModel):
    skill_id: str
    skill_name: str
    required_level: int = Field(ge=0, le=100) # 0-100
    importance: float = Field(ge=0.0, le=1.0) # 0.0 - 1.0 weight

class JobBase(BaseModel):
    id: str
    title: str
    role: str
    industry: str
    location: str
    min_salary: Optional[float] = 18000.0
    max_salary: Optional[float] = 35000.0
    openings: int = 1
    skills_required: List[SkillRequirement] = []
    applications: Optional[int] = 0
    match: Optional[int] = 85
    employer_id: Optional[str] = None
    employer_name: Optional[str] = None
    status: str = "Active" # Active, Closed, Draft

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
