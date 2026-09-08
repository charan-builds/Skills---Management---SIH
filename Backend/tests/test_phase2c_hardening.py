import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.firebase.repository import FirestoreRepository
from datetime import datetime, timedelta
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

def setup_mock_trainee(t_id, consent_status="GIVEN", outcome="Seeking Employment", emp_history=None):
    if emp_history is None:
        emp_history = []
    db_data = FirestoreRepository._load_local_demo_data()
    db_data["trainees"].append({
        "id": t_id,
        "name": "Hardening Test Trainee",
        "email": f"{t_id}@test.com",
        "phone": "123",
        "district": "Hyderabad",
        "programme_id": "P1",
        "course_name": "C1",
        "provider": "Prov",
        "status": "Completed",
        "outcome": outcome,
        "employment_history": emp_history,
        "consent_history": [
            {
                "status": consent_status,
                "effective_timestamp": "2024-01-01T00:00:00Z",
                "version": "1.0",
                "source": "TraineePortal"
            }
        ]
    })

def create_mock_followup(f_id, t_id, stage, status, due_delta_days=-1, triggered_delta_days=-2):
    db_data = FirestoreRepository._load_local_demo_data()
    fu = {
        "id": f_id,
        "trainee_id": t_id,
        "triggered_at": (datetime.utcnow() + timedelta(days=triggered_delta_days)).isoformat() + "Z",
        "current_stage": stage,
        "status": status,
        "next_due_at": (datetime.utcnow() + timedelta(days=due_delta_days)).isoformat() + "Z" if status == "PENDING" else None
    }
    db_data.setdefault("follow_ups", []).append(fu)
    return fu

def test_1_invalid_transitions():
    # Attempt to transition a RESOLVED follow_up
    setup_mock_trainee("t_invalid")
    create_mock_followup("f_resolved", "t_invalid", "DAY_7", "RESOLVED")
    create_mock_followup("f_cancelled", "t_invalid", "DAY_14", "CANCELLED")
    
    # Run evaluator
    client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
    
    # Should safely ignore them
    f1 = FirestoreRepository.get_follow_up("f_resolved")
    assert f1["current_stage"] == "DAY_7"
    assert f1["status"] == "RESOLVED"
    
    f2 = FirestoreRepository.get_follow_up("f_cancelled")
    assert f2["current_stage"] == "DAY_14"
    assert f2["status"] == "CANCELLED"

def test_2_duplicate_execution():
    setup_mock_trainee("t_dup")
    create_mock_followup("f_dup", "t_dup", "DAY_0", "PENDING")
    
    # Run rapid repeated runs
    for _ in range(5):
        client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
        
    fu = FirestoreRepository.get_follow_up("f_dup")
    assert fu["current_stage"] == "DAY_7" # Moved exactly once from DAY_0 to DAY_7
    attempts = FirestoreRepository.get_follow_up_attempts("f_dup")
    assert len(attempts) == 1
    assert attempts[0]["stage"] == "DAY_0"

def test_3_late_scheduler():
    setup_mock_trainee("t_late")
    # Due Day 7, pretending we missed it by 1 day
    fu = create_mock_followup("f_late", "t_late", "DAY_7", "PENDING", due_delta_days=-1, triggered_delta_days=-8)
    
    # Run Day 8
    client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
    
    f1 = FirestoreRepository.get_follow_up("f_late")
    assert f1["current_stage"] == "DAY_14"
    assert f1["status"] == "PENDING"
    
    # Run Day 10 (which is still before next_due_at of Day 14 (triggered + 14 = -8 + 14 = +6 days in future))
    client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
    
    f2 = FirestoreRepository.get_follow_up("f_late")
    assert f2["current_stage"] == "DAY_14" # No premature transition

def test_4_multiple_overdue_stages():
    setup_mock_trainee("t_mult")
    # Triggered 20 days ago, so both Day 7 and Day 14 are technically overdue from the initial trigger.
    # The state machine processes ONE stage transition per run right now, because each run advances next_due_at.
    fu = create_mock_followup("f_mult", "t_mult", "DAY_7", "PENDING", due_delta_days=-10, triggered_delta_days=-20)
    
    # First run advances it from Day 7 -> Day 14, and sets next_due_at = triggered(-20) + 14 = -6 days (still overdue)
    client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
    
    f1 = FirestoreRepository.get_follow_up("f_mult")
    assert f1["current_stage"] == "DAY_14"
    assert f1["status"] == "PENDING"
    
    # Second run advances it from Day 14 -> Day 21, sets next_due_at = triggered(-20) + 21 = +1 day (in future)
    client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
    
    f2 = FirestoreRepository.get_follow_up("f_mult")
    assert f2["current_stage"] == "DAY_21"
    assert f2["status"] == "PENDING"
    
    attempts = FirestoreRepository.get_follow_up_attempts("f_mult")
    assert len(attempts) == 2
    assert {a["stage"] for a in attempts} == {"DAY_7", "DAY_14"}

def test_14_partial_failure():
    # If one processing throws, others should continue
    from app.services.followup_service import FirestoreRepository as FSR
    original_get_trainee = FSR.get_trainee
    
    def mocked_get_trainee(t_id):
        if t_id == "t_fail":
            raise Exception("Simulated DB failure")
        return original_get_trainee(t_id)
        
    FSR.get_trainee = mocked_get_trainee
    
    try:
        setup_mock_trainee("t_success")
        create_mock_followup("f_fail", "t_fail", "DAY_0", "PENDING")
        create_mock_followup("f_success", "t_success", "DAY_0", "PENDING")
        
        res = client.post("/api/cron/evaluate-followups", headers={"Authorization": "Bearer cron-secret-token"})
        data = res.json()
        assert data["data"]["processed"] >= 1
        assert data["data"]["errors"] == 1
        
        # Verify success one transitioned
        fs = FirestoreRepository.get_follow_up("f_success")
        assert fs["current_stage"] == "DAY_7"
    finally:
        FSR.get_trainee = original_get_trainee