from typing import Optional, Dict, Any
from app.firebase.config import db

class AuthRepository:
    @staticmethod
    def authenticate_admin(email: str, password: str) -> Optional[Dict[str, Any]]:
        # For MVP, we will hardcode a single admin or fetch from 'admins' collection
        if (email == "admin@sih.gov.in" or email == "demo.admin@sih.gov.in") and password == "admin123":
            return {"id": "A001", "name": "System Admin", "role": "admin"}
        return None

    @staticmethod
    def authenticate_employer(org_id: str, email: str, password: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            from app.firebase.repository import FirestoreRepository
            demo_data = FirestoreRepository._load_local_demo_data()
            for e in demo_data.get('employers', []):
                # We use 'id' in demo_data instead of 'organization_id' because of how we generated it
                if e.get('id') == org_id:
                    # In demo mode, support organisation.demo@sih.gov.in / demo123
                    if email == "organisation.demo@sih.gov.in" and password == "demo123":
                        e_copy = dict(e)
                        e_copy["organization_id"] = e_copy.get("id")
                        return e_copy
                    # Support legacy fallback for the other employers
                    if email == "demo.organisation@sih.gov.in" and password == "admin123":
                        e_copy = dict(e)
                        e_copy["organization_id"] = e_copy.get("id")
                        return e_copy
                    
                    # Fallback to existing demo logic without password check if it's the exact email
                    if email == "demo.organisation@sih.gov.in":
                        e_copy = dict(e)
                        e_copy["organization_id"] = e_copy.get("id")
                        return e_copy
            return None

        try:
            docs = db.collection("employers").where("organization_id", "==", org_id).where("email", "==", email).where("password", "==", password).limit(1).stream()
            for doc in docs:
                data = doc.to_dict()
                if not data.get("is_synthetic", False):
                    return data
        except Exception:
            pass
        return None

    @staticmethod
    def authenticate_trainee(trainee_id: str, email: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            from app.firebase.repository import FirestoreRepository
            demo_data = FirestoreRepository._load_local_demo_data()
            for t in demo_data.get('trainees', []):
                if t.get('id') == trainee_id and (t.get('email') == email or email == "demo.trainee@sih.gov.in"):
                    return t
            return None

        try:
            doc = db.collection("trainees").document(trainee_id).get()
            if doc.exists:
                data = doc.to_dict()
                if not data.get("is_synthetic", False) and data.get("email") == email:
                    return data
        except Exception:
            pass
        return None

    @staticmethod
    def register_trainee(trainee_id: str, email: str, name: str, programme_id: str = "PROG-DEMO-001") -> Dict[str, Any]:
        from datetime import datetime
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
        db.collection("trainees").document(trainee_id).set(new_trainee)
        return new_trainee

