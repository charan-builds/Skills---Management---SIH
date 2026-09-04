import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock

from app.routers.analytics import get_dashboard

def create_mock_trainee(history):
    return {
        "id": "T1",
        "status": "Certified",
        "employment_history": history
    }

@patch("app.routers.analytics.FirestoreRepository.get_employer_feedback")
@patch("app.routers.analytics.FirestoreRepository.get_trainees")
def test_valid_past_6m_outcome(mock_get_trainees, mock_feedback):
    mock_feedback.return_value = []
    
    # 200 days ago
    start = (datetime.now(timezone.utc) - timedelta(days=200)).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # A valid past placement still active
    trainee = create_mock_trainee([
        {"start_date": start, "end_date": None}
    ])
    mock_get_trainees.return_value = [trainee]
    
    resp = get_dashboard(district=None, course=None, provider=None)
    print("MOCK CALL COUNT:", mock_get_trainees.call_count)
    
    # Should be 100% 3M and 100% 6M
    retention_dict = {item["checkpoint"]: item["rate"] for item in resp.retention}
    assert retention_dict["3 Months"] == "100%"
    assert retention_dict["6 Months"] == "100%"

@patch("app.routers.analytics.FirestoreRepository.get_employer_feedback")
@patch("app.routers.analytics.FirestoreRepository.get_trainees")
def test_future_6m_outcome(mock_get_trainees, mock_feedback):
    mock_feedback.return_value = []
    
    # Start date in the future (temporal leak)
    start = (datetime.now(timezone.utc) + timedelta(days=200)).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    trainee = create_mock_trainee([
        {"start_date": start, "end_date": None}
    ])
    mock_get_trainees.return_value = [trainee]
    
    resp = get_dashboard(district=None, course=None, provider=None)
    
    # Should ignore the future date completely, resulting in a null rate.
    retention_dict = {item["checkpoint"]: item["rate"] for item in resp.retention}
    assert retention_dict["6 Months"] is None

@patch("app.routers.analytics.FirestoreRepository.get_employer_feedback")
@patch("app.routers.analytics.FirestoreRepository.get_trainees")
def test_missing_date(mock_get_trainees, mock_feedback):
    mock_feedback.return_value = []
    
    # Missing start_date
    trainee = create_mock_trainee([
        {"end_date": "2023-01-01T00:00:00Z"}
    ])
    mock_get_trainees.return_value = [trainee]
    
    resp = get_dashboard(district=None, course=None, provider=None)
    retention_dict = {item["checkpoint"]: item["rate"] for item in resp.retention}
    assert retention_dict["6 Months"] is None

@patch("app.routers.analytics.FirestoreRepository.get_employer_feedback")
@patch("app.routers.analytics.FirestoreRepository.get_trainees")
def test_malformed_date(mock_get_trainees, mock_feedback):
    mock_feedback.return_value = []
    
    # Pandas to_datetime usually raises ValueError on total garbage, 
    # but we will just pass garbage and see if it gracefully fails or errors out.
    # Note: If pandas raises an error, the application will crash.
    trainee = create_mock_trainee([
        {"start_date": "invalid-garbage-date", "end_date": None}
    ])
    mock_get_trainees.return_value = [trainee]
    
    with pytest.raises(Exception):
        get_dashboard(district=None, course=None, provider=None)
        
    # Pandas pd.to_datetime actually raises ValueError.
    # If the app intends to handle this gracefully without crashing, we'd need to catch it.
    # But for now, we just document it fails.

@patch("app.routers.analytics.FirestoreRepository.get_employer_feedback")
@patch("app.routers.analytics.FirestoreRepository.get_trainees")
def test_invalid_placement_dates(mock_get_trainees, mock_feedback):
    mock_feedback.return_value = []
    
    start = (datetime.now(timezone.utc) - timedelta(days=200)).strftime("%Y-%m-%dT%H:%M:%SZ")
    end = (datetime.now(timezone.utc) - timedelta(days=250)).strftime("%Y-%m-%dT%H:%M:%SZ") # End is before start (negative duration)
    
    trainee = create_mock_trainee([
        {"start_date": start, "end_date": end}
    ])
    mock_get_trainees.return_value = [trainee]
    
    resp = get_dashboard(district=None, course=None, provider=None)
    
    # The negative duration should be caught and discarded by RetentionIntelligenceEngine
    retention_dict = {item["checkpoint"]: item["rate"] for item in resp.retention}
    assert retention_dict["6 Months"] is None
