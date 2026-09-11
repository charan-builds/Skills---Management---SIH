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
                    # Allow registered email or generic demo employer credentials
                    if (email in {"organisation.demo@sih.gov.in", "recruitment@techflowsolutions.demo", e.get("email")} or email.endswith("@sih.gov.in")) and password in {"demo123", "admin123"}:
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
            tid_norm = (trainee_id or "").strip().upper()
            email_norm = (email or "").strip().lower()
            
            for t in demo_data.get('trainees', []):
                t_id = (t.get('id') or "").strip().upper()
                t_email = (t.get('email') or "").strip().lower()
                
                # Check direct match or friendly alias
                id_matches = (t_id == tid_norm) or \
                             (tid_norm in {"T1006", "TR-DEMO-1006", "KALYAN"} and t_id in {"TR-DEMO-1006", "T1006"})
                
                if id_matches:
                    if t_email == email_norm or email_norm.endswith("@sih.gov.in") or email_norm == "demo.trainee@sih.gov.in":
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

    @staticmethod
    def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """
        Centrally resolves user identity and role across Admin, Employer, and Trainee accounts.
        Guarantees role integrity: role is determined server-side from database, never by the client.
        """
        from app.firebase.repository import FirestoreRepository
        email_clean = (email or "").strip().lower()
        if not email_clean:
            return None

        # 1. Admin Role Lookup
        if email_clean in {"admin@sih.gov.in", "demo.admin@sih.gov.in"}:
            return {
                "id": "A001",
                "name": "System Administrator",
                "email": email_clean,
                "role": "admin"
            }

        # 2. Employer Role Lookup
        employers = FirestoreRepository.get_employers()
        for emp in employers:
            emp_email = (emp.get("email") or "").strip().lower()
            if emp_email == email_clean:
                return {
                    "id": emp.get("id"),
                    "name": emp.get("name"),
                    "email": email_clean,
                    "role": "employer",
                    "organization_id": emp.get("id")
                }
        if email_clean in {"organisation.demo@sih.gov.in", "recruitment@techflowsolutions.demo"}:
            return {
                "id": "EMP-DEMO-001",
                "name": "TechFlow Solutions",
                "email": email_clean,
                "role": "employer",
                "organization_id": "EMP-DEMO-001"
            }

        # 3. Trainee Role Lookup
        trainees = FirestoreRepository.get_trainees()
        for t in trainees:
            t_email = (t.get("email") or "").strip().lower()
            if t_email == email_clean:
                return {
                    "id": t.get("id"),
                    "name": t.get("name"),
                    "email": email_clean,
                    "role": "trainee",
                    "trainee_id": t.get("id")
                }
        if email_clean == "demo.trainee@sih.gov.in":
            return {
                "id": "T102",
                "name": "Vikram Sharma",
                "email": email_clean,
                "role": "trainee",
                "trainee_id": "T102"
            }

        return None


