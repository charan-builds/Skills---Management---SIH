from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class FollowUpStatus(str, Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"
    UNRESOLVED = "UNRESOLVED"
    CANCELLED = "CANCELLED"

class FollowUpStage(str, Enum):
    DAY_0 = "DAY_0"
    DAY_7 = "DAY_7"
    DAY_14 = "DAY_14"
    DAY_21 = "DAY_21"

class FollowUpAttempt(BaseModel):
    id: str
    follow_up_id: str
    stage: str
    scheduled_at: str
    executed_at: str
    method: str
    actor: str
    result: str
    notes: Optional[str] = None
    idempotency_key: str

class FollowUp(BaseModel):
    id: str
    trainee_id: str
    triggered_at: str
    current_stage: str
    status: str
    next_due_at: str
    resolved_at: Optional[str] = None
    unresolved_at: Optional[str] = None
