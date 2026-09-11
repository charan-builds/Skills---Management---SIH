import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os
import sys

os.environ["ENABLE_DEMO_MODE"] = "False"
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from app.main import app
from app.auth.dependencies import get_current_user, get_admin_user, get_employer_user

client = TestClient(app)

def get_dummy_trainee(extra_fields=None):
    base = {
        "id": "T1", "name": "Test", "email": "test@test.com", "phone": "123",
        "district": "North", "programme_id": "P1", "course_name": "C1",
        "provider": "Pratham", "status": "Active", "outcome": "None",
        "skills": [], "certifications": [], "employment_history": [],
        "consent_history": [], "outcomes_timeline": [], "is_synthetic": True
    }
    if extra_fields:
        base.update(extra_fields)
    return base

with patch("app.firebase.repository.db") as mock_db:
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin123", "role": "admin"}
    
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = get_dummy_trainee({"outcome": "EMPLOYED"})
    mock_doc.id = "T1"
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc
    
    payload = {
        "status": "IN_TRAINING",
        "employer_name": "Tech Corp",
        "start_date": "2025-08-01"
    }
    response = client.post("/api/trainees/T1/outcome", json=payload)
    print("STATUS CODE:", response.status_code)
    print("RESPONSE:", response.json())
