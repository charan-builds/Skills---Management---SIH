from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SkillRequirement(BaseModel):
    skill_id: str
    skill_name: str
    required_level: int = Field(ge=1, le=5) # 1-5 level
    importance: float = Field(ge=0.0, le=1.0) # 0.0 - 1.0 weight

class RoleBenchmarkBase(BaseModel):
    id: str
    title: str
    role: str
    industry: str
    skills_required: List[SkillRequirement] = []
    status: str = "Active" # Active, Closed, Draft
    is_synthetic: bool = False

class RoleBenchmarkCreate(RoleBenchmarkBase):
    pass

class RoleBenchmarkResponse(RoleBenchmarkBase):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
