from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class CertificationSchema(BaseModel):
    name: str
    date: str
    issuing_body: str

class EmploymentHistorySchema(BaseModel):
    id: str
    status: str # EMPLOYED, SELF_EMPLOYED, APPRENTICESHIP, SEEKING_EMPLOYMENT, UNKNOWN
    employer: Optional[str] = None
    role: Optional[str] = None
    salary: Optional[float] = None
    joining_date: Optional[str] = None
    timestamp: str
    verification_state: str # SELF_REPORTED, EMPLOYER_VERIFIED, ADMIN_VERIFIED, CONFLICTING, UNVERIFIED

class ConsentRecordSchema(BaseModel):
    status: str # GIVEN, REVOKED, NOT_GIVEN
    effective_timestamp: str
    version: str = "1.0"
    source: str = "TraineePortal"

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
    consent_history: List[ConsentRecordSchema] = []
    outcomes_timeline: List[TimelineCheckpointSchema] = []
    is_synthetic: bool = False

    @property
    def current_outcome(self) -> Optional[EmploymentHistorySchema]:
        """Derive current employment outcome from most recent valid history record."""
        if not self.employment_history:
            return None
        # Sort by timestamp descending
        sorted_history = sorted(
            self.employment_history,
            key=lambda x: getattr(x, 'timestamp', ''),
            reverse=True
        )
        for record in sorted_history:
            if getattr(record, 'verification_state', '') != "CONFLICTING":
                return record
        return None

    @property
    def current_consent(self) -> ConsentRecordSchema:
        """Derive current consent from most recent effective record."""
        if not self.consent_history:
            return ConsentRecordSchema(
                status="NOT_GIVEN",
                effective_timestamp=datetime.utcnow().isoformat(),
                source="System"
            )
        sorted_consent = sorted(
            self.consent_history,
            key=lambda x: getattr(x, 'effective_timestamp', ''),
            reverse=True
        )
        return sorted_consent[0]

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
    status: str
    employer: Optional[str] = None
    role: Optional[str] = None
    salary: Optional[float] = None
    joining_date: Optional[str] = None
    verification_state: str = "SELF_REPORTED"

class TraineeConsentUpdate(BaseModel):
    status: str # GIVEN, REVOKED, NOT_GIVEN
    source: str = "TraineePortal"

class TraineeFollowupSubmit(BaseModel):
    checkpoint: str # "3 Month Follow-up", "6 Month Follow-up", "12 Month Follow-up"
    employment_status: str
    employer_or_activity: str
    salary: str
    job_relevance: str
    verification_status: str = "Pending"
    description: str
