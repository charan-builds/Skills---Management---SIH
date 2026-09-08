import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.firebase.repository import FirestoreRepository
from datetime import datetime, timedelta
import json
import os
from app.core.config import BASE_DIR
from app.schemas.followup import FollowUpStatus, FollowUpStage

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_teardown():
    os.environ["ENABLE_DEMO_MODE"] = "True"
    demo_file = os.path.join(BASE_DIR, 'demo_data.json')
    with open(demo_file, 'r', encoding='utf-8') as f:
        original = f.read()
    yield
    with open(demo_file, 'w', encoding='utf-8') as f:
        f.write(original)
    FirestoreRepository._demo_data_cache = None

def test_cron_unauthorized():
    response = client.post("/api/cron/evaluate-followups")
    assert response.status_code == 401
    
    response = client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 403

def test_evaluate_followups():
    # 1. Setup mock followup that is due right now at DAY_0
    from app.schemas.trainee import TraineeCreate, TraineeConsentUpdate
    from app.schemas.followup import FollowUp
    
    t_id = "test-fu-trainee"
    db_data = FirestoreRepository._load_local_demo_data()
    db_data["trainees"].append({
        "id": t_id,
        "name": "Test",
        "email": "test@test.com",
        "phone": "123",
        "district": "Hyderabad",
        "programme_id": "P1",
        "course_name": "C1",
        "provider": "Prov",
        "status": "Completed",
        "outcome": "Seeking Employment",
        "employment_history": [],
        "consent_history": [
            {
                "status": "GIVEN",
                "effective_timestamp": datetime.utcnow().isoformat() + "Z",
                "version": "1.0",
                "source": "TraineePortal"
            }
        ]
    })
    
    fu = {
        "id": "fu-123",
        "trainee_id": t_id,
        "triggered_at": datetime.utcnow().isoformat() + "Z",
        "current_stage": "DAY_0",
        "status": "PENDING",
        "next_due_at": (datetime.utcnow() - timedelta(minutes=1)).isoformat() + "Z"
    }
    FirestoreRepository.create_or_update_follow_up(fu)
    
    # 2. Run evaluator
    response = client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
    assert response.status_code == 200
    
    # 3. Verify transition to DAY_7
    updated_fu = FirestoreRepository.get_follow_up("fu-123")
    assert updated_fu["current_stage"] == "DAY_7"
    assert updated_fu["status"] == "PENDING"
    
    # 4. Verify attempt created
    attempts = FirestoreRepository.get_follow_up_attempts("fu-123")
    assert len(attempts) == 1
    assert attempts[0]["stage"] == "DAY_0"
    assert attempts[0]["method"] == "SMS_DEMO"
    
def test_consent_gate():
    db_data = FirestoreRepository._load_local_demo_data()
    t_id = "test-no-consent"
    db_data["trainees"].append({
        "id": t_id,
        "name": "Test",
        "email": "test@test.com",
        "phone": "123",
        "district": "Hyderabad",
        "programme_id": "P1",
        "course_name": "C1",
        "provider": "Prov",
        "status": "Completed",
        "outcome": "Seeking Employment",
        "employment_history": [],
        "consent_history": [
            {
                "status": "REVOKED",
                "effective_timestamp": datetime.utcnow().isoformat() + "Z",
                "version": "1.0",
                "source": "TraineePortal"
            }
        ]
    })
    
    fu = {
        "id": "fu-456",
        "trainee_id": t_id,
        "triggered_at": datetime.utcnow().isoformat() + "Z",
        "current_stage": "DAY_0",
        "status": "PENDING",
        "next_due_at": (datetime.utcnow() - timedelta(minutes=1)).isoformat() + "Z"
    }
    FirestoreRepository.create_or_update_follow_up(fu)
    
    client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
    
    updated_fu = FirestoreRepository.get_follow_up("fu-456")
    assert updated_fu["status"] == "CANCELLED"
    assert updated_fu["current_stage"] == "DAY_0" # No transition
    
def test_no_response_invariant():
    # If Day 21 is due and we run cron, it should go to UNRESOLVED and preserve previous history
    db_data = FirestoreRepository._load_local_demo_data()
    t_id = "test-day21"
    db_data["trainees"].append({
        "id": t_id,
        "name": "Test",
        "email": "test@test.com",
        "phone": "123",
        "district": "Hyderabad",
        "programme_id": "P1",
        "course_name": "C1",
        "provider": "Prov",
        "status": "Completed",
        "outcome": "Employed",
        "employment_history": [
             {
                "id": "job1",
                "status": "EMPLOYED",
                "employer": "ABC",
                "role": "Dev",
                "salary": 1000,
                "joining_date": None,
                "timestamp": "2024-01-01T00:00:00Z",
                "verification_state": "EMPLOYER_VERIFIED"
            }
        ],
        "consent_history": [{"status": "GIVEN", "effective_timestamp": "2024-01-01T00:00:00Z"}]
    })
    
    fu = {
        "id": "fu-day21",
        "trainee_id": t_id,
        "triggered_at": "2024-01-01T00:00:00Z",
        "current_stage": "DAY_21",
        "status": "PENDING",
        "next_due_at": (datetime.utcnow() - timedelta(minutes=1)).isoformat() + "Z"
    }
    FirestoreRepository.create_or_update_follow_up(fu)
    
    client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
    
    updated_fu = FirestoreRepository.get_follow_up("fu-day21")
    assert updated_fu["status"] == "UNRESOLVED"
    
    # Verify current outcome remains intact
    t_data = FirestoreRepository.get_trainee(t_id)
    assert len(t_data["employment_history"]) == 1
    assert t_data["employment_history"][0]["status"] == "EMPLOYED"
    
def test_idempotency():
    db_data = FirestoreRepository._load_local_demo_data()
    t_id = "test-idem"
    db_data["trainees"].append({
        "id": t_id,
        "name": "Test",
        "email": "test@test.com",
        "phone": "123",
        "district": "Hyderabad",
        "programme_id": "P1",
        "course_name": "C1",
        "provider": "Prov",
        "status": "Completed",
        "outcome": "Seeking",
        "employment_history": [],
        "consent_history": [{"status": "GIVEN", "effective_timestamp": "2024-01-01T00:00:00Z"}]
    })
    
    fu = {
        "id": "fu-idem",
        "trainee_id": t_id,
        "triggered_at": "2024-01-01T00:00:00Z",
        "current_stage": "DAY_0",
        "status": "PENDING",
        "next_due_at": (datetime.utcnow() - timedelta(minutes=1)).isoformat() + "Z"
    }
    FirestoreRepository.create_or_update_follow_up(fu)
    
    # Add fake attempt manually with idempotency key
    FirestoreRepository.create_follow_up_attempt({
        "follow_up_id": "fu-idem",
        "stage": "DAY_0",
        "scheduled_at": "2024-01-01",
        "executed_at": "2024-01-01",
        "method": "SMS_DEMO",
        "actor": "TEST",
        "result": "OK",
        "idempotency_key": "fu-idem_DAY_0"
    })
    
    # Running cron will transition but NOT create a duplicate attempt
    client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
    
    attempts = FirestoreRepository.get_follow_up_attempts("fu-idem")
    assert len(attempts) == 1
    assert attempts[0]["actor"] == "TEST" # Old one preserved
