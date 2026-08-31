import pytest
from unittest.mock import MagicMock, patch
from app.firebase.repository import FirestoreRepository

def make_doc_mock(data):
    mock = MagicMock()
    mock.exists = bool(data)
    mock.to_dict.return_value = data
    return mock

def test_is_real_helper():
    assert FirestoreRepository._is_real(None) is False
    assert FirestoreRepository._is_real({}) is True
    assert FirestoreRepository._is_real({"is_synthetic": False}) is True
    assert FirestoreRepository._is_real({"is_synthetic": True}) is False
    # Check that missing key is treated as real data
    assert FirestoreRepository._is_real({"name": "Real Trainee"}) is True

@patch("app.firebase.repository.db.collection")
def test_exclude_synthetic_trainees(mock_collection):
    mock_query = MagicMock()
    mock_collection.return_value = mock_query
    
    mock_query.stream.return_value = [
        make_doc_mock({"id": "T1", "name": "Real", "is_synthetic": False}),
        make_doc_mock({"id": "T2", "name": "Fake", "is_synthetic": True}),
        make_doc_mock({"id": "T3", "name": "Implicit Real"}),
    ]
    
    trainees = FirestoreRepository.get_trainees()
    
    assert len(trainees) == 2
    ids = [t["id"] for t in trainees]
    assert "T1" in ids
    assert "T3" in ids
    assert "T2" not in ids

@patch("app.firebase.repository.db.collection")
def test_single_get_returns_none_for_synthetic(mock_collection):
    mock_doc_ref = MagicMock()
    mock_collection.return_value.document.return_value = mock_doc_ref
    
    # Mock a synthetic document
    mock_doc_ref.get.return_value = make_doc_mock({"id": "P1", "is_synthetic": True})
    
    prog = FirestoreRepository.get_programme("P1")
    assert prog is None
    
    # Mock a real document
    mock_doc_ref.get.return_value = make_doc_mock({"id": "P2", "is_synthetic": False})
    
    prog2 = FirestoreRepository.get_programme("P2")
    assert prog2 is not None
    assert prog2["id"] == "P2"

@patch("app.firebase.repository.db.collection")
def test_exclude_synthetic_employer_feedback(mock_collection):
    mock_query = MagicMock()
    mock_collection.return_value = mock_query
    
    mock_query.stream.return_value = [
        make_doc_mock({"id": "F1", "is_synthetic": True}),
        make_doc_mock({"id": "F2"}),
    ]
    
    feedback = FirestoreRepository.get_employer_feedback()
    
    assert len(feedback) == 1
    assert feedback[0]["id"] == "F2"

@patch("app.firebase.repository.db.collection")
def test_exclude_synthetic_assessments(mock_collection):
    mock_query = MagicMock()
    mock_collection.return_value = mock_query
    
    mock_query.stream.return_value = [
        make_doc_mock({"assessment_id": "A1", "is_synthetic": True}),
        make_doc_mock({"assessment_id": "A2", "is_synthetic": False}),
    ]
    
    assessments = FirestoreRepository.get_assessments()
    
    assert len(assessments) == 1
    assert assessments[0]["assessment_id"] == "A2"

@patch("app.firebase.repository.db.collection")
def test_missing_is_synthetic_behaves_safely(mock_collection):
    mock_query = MagicMock()
    mock_collection.return_value = mock_query
    
    mock_query.stream.return_value = [
        make_doc_mock({"id": "J1", "title": "Real Job"})
    ]
    
    jobs = FirestoreRepository.get_jobs()
    
    assert len(jobs) == 1
    assert jobs[0]["id"] == "J1"
