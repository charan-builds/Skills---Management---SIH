import os
import json
import pytest
from unittest.mock import MagicMock
from tests.fake_firestore import FakeFirestoreClient
from app.core.config import BASE_DIR

@pytest.fixture(autouse=True)
def isolated_firestore(monkeypatch):
    """
    Ensures that every test gets a fresh, isolated FakeFirestoreClient.
    This safely blocks any modifications to the actual production Firestore,
    and replaces the ENABLE_DEMO_MODE bypass so that tests hit real repository logic.
    """
    demo_file = os.path.join(BASE_DIR, 'demo_data.json')
    try:
        with open(demo_file, 'r', encoding='utf-8') as f:
            fresh_data = json.load(f)
    except Exception as e:
        fresh_data = {
            'trainees': [], 'programmes': [], 'employers': [], 
            'jobs': [], 'employer_feedback': [], 'interventions': [],
            'employer_verifications': [], 'follow_ups': [], 
            'skill_assessments': [], 'role_benchmarks': [], 'skill_master': []
        }
        
    fake_db = FakeFirestoreClient(fresh_data)
    
    # Inject the fake client directly into the repository layer where `db` is used.
    monkeypatch.setattr("app.firebase.repository.db", fake_db)
    
    yield
    # Cleanup implicitly handled by fake_db going out of scope
