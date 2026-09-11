from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class EmployerVerificationBase(BaseModel):
    trainee_id: str
    employer_email: EmailStr
    employer_name: str
    role: str
    salary: float
    is_synthetic: bool = False

class EmployerVerificationCreate(EmployerVerificationBase):
    pass

class EmployerVerificationResponse(EmployerVerificationBase):
    id: str
    status: str # Pending, Approved, Rejected
    created_at: datetime
    updated_at: datetime

class VerificationApprovalSchema(BaseModel):
    approve: bool # True to approve, False to reject

class EmployerFeedbackBase(BaseModel):
    trainee_id: str
    programme_id: str
    employer_name: str
    satisfaction_score: int
    technical_deficiencies: List[str] = []
    soft_skill_deficiencies: List[str] = []
    skills_required_in_job: List[str] = []
    is_synthetic: bool = False

class EmployerFeedbackCreate(EmployerFeedbackBase):
    pass

class EmployerFeedbackResponse(EmployerFeedbackCreate):
    id: str
    created_at: datetime

class EmployerOutcomeUpdate(BaseModel):
    employment_status: str
    employment_type: str
    joining_date: Optional[str]
    salary: float
    job_role: str
    retention_6m: str
    retention_12m: str
    employer_remarks: Optional[str]

class EmployerOutcomeResponse(EmployerOutcomeUpdate):
    trainee_id: str
    trainee_name: str
    programme_name: str
    district: str
    verification_status: str
