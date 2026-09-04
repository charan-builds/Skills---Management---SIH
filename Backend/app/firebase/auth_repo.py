from typing import Optional, Dict, Any

from app.core.config import settings
from app.firebase.config import db

class AuthRepository:
    @staticmethod
    def authenticate_admin(email: str, password: str) -> Optional[Dict[str, Any]]:
        # Local credentials are intentionally limited to the bundled demo. Production
        # clients authenticate with Firebase ID tokens verified by dependencies.py.
        if not settings.ENABLE_DEMO_MODE:
            return None
        if (email == "admin@sih.gov.in" or email == "demo.admin@sih.gov.in") and password == "admin123":
            return {"id": "A001", "name": "System Admin", "role": "admin"}
        return None

    @staticmethod
    def authenticate_employer(org_id: str, email: str, password: str) -> Optional[Dict[str, Any]]:
        if settings.ENABLE_DEMO_MODE:
            from app.firebase.repository import FirestoreRepository
            demo_data = FirestoreRepository._load_local_demo_data()
            for e in demo_data.get('employers', []):
                # We use 'id' in demo_data instead of 'organization_id' because of how we generated it
                if e.get('id') == org_id:
                    # The demo account is deliberately explicit; no email-only bypass.
                    if email in {"organisation.demo@sih.gov.in", "recruitment@techflowsolutions.demo"} and password == "demo123":
                        e_copy = dict(e)
                        e_copy["organization_id"] = e_copy.get("id")
                        return e_copy
            return None
        # Firestore is not an identity provider; never query plaintext password fields.
        return None

    @staticmethod
    def authenticate_trainee(trainee_id: str, email: str) -> Optional[Dict[str, Any]]:
        if settings.ENABLE_DEMO_MODE:
            from app.firebase.repository import FirestoreRepository
            demo_data = FirestoreRepository._load_local_demo_data()
            for t in demo_data.get('trainees', []):
                if t.get('id') == trainee_id and (t.get('email') == email or email == "demo.trainee@sih.gov.in"):
                    return t
            return None
        # Production authentication must come from the configured identity provider.
        return None

    @staticmethod
    def register_trainee(trainee_id: str, email: str, name: str, programme_id: str = "PROG-DEMO-001") -> Dict[str, Any]:
        from app.firebase.repository import FirestoreRepository
        from datetime import datetime
        if FirestoreRepository.get_trainee(trainee_id):
            raise ValueError("A trainee with this ID already exists")
        new_trainee = {
            "id": trainee_id,
            "name": name,
            "email": email,
            "phone": "+91 99999 99999",
            "district": "Hyderabad",
            "programme_id": programme_id,
            "course_name": "Data Analytics",
            "provider": "Centre A",
            "status": "Enrolled",
            "outcome": "Unemployed",
            "skills": [],
            "certifications": [],
            "employment_history": [],
            "outcomes_timeline": [
                {
                    "checkpoint": "Training Completed",
                    "date": "Aug 2026",
                    "status": "Pending",
                    "description": "Training registered."
                }
            ],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            demo_data.setdefault("trainees", []).append(new_trainee)
        elif db:
            try:
                db.collection("trainees").document(trainee_id).set(new_trainee)
            except Exception as e:
                print(f"Firestore error in register_trainee: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for trainee registration")
        return new_trainee

