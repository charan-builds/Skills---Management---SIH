from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class CertificationSchema(BaseModel):
    name: str
    date: str
    issuing_body: str

class EmploymentHistorySchema(BaseModel):
    id: str
    employer_name: str
    role: str
    start_date: str
    end_date: Optional[str] = None
    reason_for_exit: Optional[str] = None
    salary: float
    verified: bool = False
    employment_type: str = "Employed" # Employed, Self-Employed, Apprentice, Unemployed, Exit
    job_relevance: str = "High" # High, Medium, Low

class TimelineCheckpointSchema(BaseModel):
    checkpoint: str # e.g. "Training Completed", "3 Month Follow-up"
    date: str
    status: str # Completed, Recorded, Pending
    employment_status: Optional[str] = None
    employer_or_activity: Optional[str] = None
    salary: Optional[str] = None
    job_relevance: Optional[str] = None
    verification_status: Optional[str] = None
    description: str

class TraineeBase(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    district: str
    programme_id: str
    course_name: str
    provider: str
    status: str
    outcome: str
    skills: List[str] = []
    skill_ids: Optional[List[str]] = []
    certifications: List[CertificationSchema] = []
    employment_history: List[EmploymentHistorySchema] = []
    outcomes_timeline: List[TimelineCheckpointSchema] = []
    is_synthetic: bool = False


class TraineeCreate(TraineeBase):
    pass

class TraineeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    district: Optional[str] = None
    status: Optional[str] = None
    outcome: Optional[str] = None
    skills: Optional[List[str]] = None

class TraineeEmploymentCreate(BaseModel):
    employer_name: str
    role: str
    start_date: str
    end_date: Optional[str] = None
    salary: float
    employment_type: str = "Employed"
    job_relevance: str = "High"

class TraineeFollowupSubmit(BaseModel):
    checkpoint: str # "3 Month Follow-up", "6 Month Follow-up", "12 Month Follow-up"
    employment_status: str
    employer_or_activity: str
    salary: str
    job_relevance: str
    verification_status: str = "Pending"
    description: str
