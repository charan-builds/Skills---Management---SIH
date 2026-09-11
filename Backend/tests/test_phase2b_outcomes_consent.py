import pytest
from app.schemas.trainee import TraineeBase, EmploymentHistorySchema, ConsentRecordSchema

def test_derive_current_employment_outcome():
    trainee_data = {
        "id": "T001",
        "name": "Test Trainee",
        "email": "test@test.com",
        "phone": "123",
        "district": "Hyderabad",
        "programme_id": "P1",
        "course_name": "Course",
        "provider": "Provider",
        "status": "Certified",
        "outcome": "Employed",
        "employment_history": [
            {
                "id": "e1",
                "status": "EMPLOYED",
                "employer": "Tech Corp",
                "role": "Engineer",
                "salary": 30000.0,
                "joining_date": "2023-01-01",
                "timestamp": "2023-01-01T10:00:00Z",
                "verification_state": "EMPLOYER_VERIFIED"
            },
            {
                "id": "e2",
                "status": "SEEKING_EMPLOYMENT",
                "employer": None,
                "role": None,
                "salary": None,
                "joining_date": None,
                "timestamp": "2023-06-01T10:00:00Z",
                "verification_state": "SELF_REPORTED"
            },
            {
                "id": "e3",
                "status": "EMPLOYED",
                "employer": "New Corp",
                "role": "Senior Engineer",
                "salary": 50000.0,
                "joining_date": "2023-07-01",
                "timestamp": "2023-07-01T10:00:00Z",
                "verification_state": "CONFLICTING" # This should be ignored
            }
        ]
    }
    
    trainee = TraineeBase(**trainee_data)
    outcome = trainee.current_outcome
    assert outcome is not None
    assert outcome.id == "e2" # Because e3 is conflicting, e2 is the next most recent valid record
    assert outcome.status == "SEEKING_EMPLOYMENT"


def test_derive_current_consent():
    trainee_data = {
        "id": "T002",
        "name": "Test Trainee",
        "email": "test2@test.com",
        "phone": "123",
        "district": "Hyderabad",
        "programme_id": "P1",
        "course_name": "Course",
        "provider": "Provider",
        "status": "Certified",
        "outcome": "Employed",
        "consent_history": [
            {
                "status": "GIVEN",
                "effective_timestamp": "2023-01-01T10:00:00Z",
                "version": "1.0",
                "source": "TraineePortal"
            },
            {
                "status": "REVOKED",
                "effective_timestamp": "2023-06-01T10:00:00Z",
                "version": "1.0",
                "source": "TraineePortal"
            }
        ]
    }
    
    trainee = TraineeBase(**trainee_data)
    consent = trainee.current_consent
    assert consent.status == "REVOKED"
    
    # Test fallback
    trainee_data_no_consent = {**trainee_data, "consent_history": []}
    trainee2 = TraineeBase(**trainee_data_no_consent)
    assert trainee2.current_consent.status == "NOT_GIVEN"
