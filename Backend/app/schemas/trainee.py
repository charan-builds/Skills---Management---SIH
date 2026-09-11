from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional, Union
from datetime import datetime

class CertificationSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    name: str
    date: Optional[str] = None
    issue_date: Optional[str] = None
    issuing_body: Optional[str] = None
    status: Optional[str] = "Verified"

class EmploymentHistorySchema(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    status: Optional[str] = "EMPLOYED"
    employer: Optional[str] = None
    employer_name: Optional[str] = None
    organization_id: Optional[str] = None
    role: Optional[str] = None
    salary: Optional[Union[float, int, str]] = None
    joining_date: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    timestamp: Optional[str] = None
    verification_state: Optional[str] = "SELF_REPORTED"
    employment_type: Optional[str] = "Full-Time"
    verified: Optional[bool] = False
    employer_remarks: Optional[str] = None

class ConsentRecordSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: Optional[str] = "GIVEN"
    effective_timestamp: Optional[str] = None
    version: Optional[str] = "1.0"
    source: Optional[str] = "TraineePortal"

class TimelineCheckpointSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")
    checkpoint: str
    date: Optional[str] = None
    status: Optional[str] = "Completed"
    employment_status: Optional[str] = None
    employer_or_activity: Optional[str] = None
    salary: Optional[Union[str, float, int]] = None
    job_relevance: Optional[str] = None
    verification_status: Optional[str] = None
    description: Optional[str] = ""

class TraineeBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = None
    programme_id: Optional[str] = None
    course_name: Optional[str] = None
    provider: Optional[str] = None
    status: Optional[str] = "Certified"
    outcome: Optional[str] = "Seeking"
    skills: List[Union[str, dict]] = []
    skill_ids: Optional[List[str]] = []
    certifications: List[CertificationSchema] = []
    employment_history: List[EmploymentHistorySchema] = []
    consent_history: List[ConsentRecordSchema] = []
    outcomes_timeline: List[TimelineCheckpointSchema] = []
    assessments: Optional[List[dict]] = []
    attendance: Optional[Union[float, int]] = None
    is_synthetic: Optional[bool] = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    @property
    def current_outcome(self) -> Optional[EmploymentHistorySchema]:
        """Derive current employment outcome from most recent valid history record."""
        if not self.employment_history:
            return None
        sorted_history = sorted(
            self.employment_history,
            key=lambda x: getattr(x, 'timestamp', '') or getattr(x, 'start_date', '') or '',
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
