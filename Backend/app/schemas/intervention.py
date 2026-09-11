from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class MetricsState(BaseModel):
    skill_match: Optional[str] = None
    retention_12m: Optional[str] = None
    wage_growth: Optional[str] = None

class InterventionImpactSchema(BaseModel):
    before: MetricsState
    after: MetricsState

class InterventionBase(BaseModel):
    title: str
    description: str
    programme_id: str
    date: str
    impact: Optional[InterventionImpactSchema] = None

class InterventionCreate(InterventionBase):
    pass

class InterventionResponse(InterventionBase):
    id: str
    created_at: datetime
    updated_at: datetime
