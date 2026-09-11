from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class CertificationSchema(BaseModel):
    name: str
    date: str
    issuing_body: str

class EmploymentHistorySchema(BaseModel):
    id: Optional[str] = None
    status: str # EMPLOYED, SELF_EMPLOYED, APPRENTICESHIP, SEEKING_EMPLOYMENT, UNKNOWN
    employer_name: Optional[str] = None
    organization_id: Optional[str] = None
    role: Optional[str] = None
    salary: Optional[float] = None
    start_date: Optional[str] = None
    timestamp: Optional[str] = None
    verification_state: str # SELF_REPORTED, EMPLOYER_VERIFIED, ADMIN_VERIFIED, CONFLICTING, UNVERIFIED
    employment_type: Optional[str] = None
    job_relevance: Optional[str] = None
    employer_remarks: Optional[str] = None

class ConsentRecordSchema(BaseModel):
    status: Optional[str] = None # GIVEN, REVOKED, NOT_GIVEN
    effective_timestamp: Optional[str] = None
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
    email: str
    phone: str
    district: Optional[str] = None
    programme_id: Optional[str] = None
    course_name: Optional[str] = None
    provider: Optional[str] = None
    status: Optional[str] = None
    outcome: Optional[str] = None
    skills: List[str] = []
    skill_ids: Optional[List[str]] = []
    certifications: List[CertificationSchema] = []
    employment_history: List[EmploymentHistorySchema] = []
    consent_history: List[ConsentRecordSchema] = []
    outcomes_timeline: List[TimelineCheckpointSchema] = []
    is_synthetic: bool = False
    target_role_id: Optional[str] = None
    target_role_name: Optional[str] = None

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
    
    model_config = {
        "extra": "forbid"
    }

class TraineeEmploymentCreate(BaseModel):
    status: str
    employer_name: Optional[str] = None
    role: Optional[str] = None
    salary: Optional[float] = None
    start_date: Optional[str] = None
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

class TraineeTargetRoleUpdate(BaseModel):
    target_role_id: str
    target_role_name: str
