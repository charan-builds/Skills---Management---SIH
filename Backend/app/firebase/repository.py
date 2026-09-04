from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib
import uuid
from app.firebase.config import db
from app.schemas.programme import ProgrammeCreate
from app.schemas.trainee import TraineeCreate, TraineeEmploymentCreate, TraineeFollowupSubmit
from app.schemas.employer import EmployerVerificationCreate, EmployerFeedbackCreate
from app.schemas.intervention import InterventionCreate

class FirestoreRepository:
    _demo_data_cache = None

    @classmethod
    def _load_local_demo_data(cls):
        if cls._demo_data_cache is not None:
            return cls._demo_data_cache
        import json
        import os
        from app.core.config import BASE_DIR
        demo_file = os.path.join(BASE_DIR, 'demo_data.json')
        try:
            with open(demo_file, 'r', encoding='utf-8') as f:
                cls._demo_data_cache = json.load(f)
        except Exception as e:
            print(f'Failed to load demo data JSON: {e}')
            cls._demo_data_cache = {'trainees': [], 'programmes': [], 'employers': [], 'jobs': [], 'employer_feedback': [], 'interventions': []}
        return cls._demo_data_cache

    @staticmethod
    def _is_real(doc_dict: Optional[Dict[str, Any]]) -> bool:
        if doc_dict is None:
            return False
        return not doc_dict.get("is_synthetic", False)

    @staticmethod
    def _should_include(doc_dict: Optional[Dict[str, Any]]) -> bool:
        if doc_dict is None:
            return False
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            return True
        return FirestoreRepository._is_real(doc_dict)

    # --- Programmes ---
    @staticmethod
    def get_programmes() -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            return FirestoreRepository._load_local_demo_data().get('programmes', [])
        try:
            docs = db.collection("programmes").limit(100).stream()
            return [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e) or "ResourceExhausted" in str(e.__class__.__name__):
                print(f"Firestore quota exhausted (429) during get_programmes")
                return []
            raise e

    @staticmethod
    def get_programme(programme_id: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            programmes = FirestoreRepository._load_local_demo_data().get('programmes', [])
            return next((p for p in programmes if p.get("id") == programme_id), None)
        try:
            doc = db.collection("programmes").document(programme_id).get()
            data = doc.to_dict() if doc.exists else None
            return data if FirestoreRepository._should_include(data) else None
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e) or "ResourceExhausted" in str(e.__class__.__name__):
                print(f"Firestore quota exhausted (429) during get_programme")
                return None
            raise e

    @staticmethod
    def create_programme(programme: ProgrammeCreate) -> Dict[str, Any]:
        data = programme.model_dump()
        now = datetime.utcnow().isoformat() + "Z"
        data["created_at"] = now
        data["updated_at"] = now
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            demo_data.setdefault("programmes", []).append(data)
        elif db:
            try:
                db.collection("programmes").document(programme.id).set(data)
            except Exception as e:
                print(f"Firestore write error in create_programme: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for programmes")
        return data

    # --- Trainees ---
    @staticmethod
    def get_trainees(
        search: Optional[str] = None,
        district: Optional[str] = None,
        programme_id: Optional[str] = None,
        course_name: Optional[str] = None,
        outcome: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            trainees = FirestoreRepository._load_local_demo_data().get('trainees', [])
            if district and district != "All Districts":
                trainees = [t for t in trainees if t.get("district") == district]
            if programme_id:
                trainees = [t for t in trainees if t.get("programme_id") == programme_id]
            if course_name and course_name != "All Courses":
                trainees = [t for t in trainees if t.get("course_name") == course_name]
            if outcome and outcome != "All Status" and outcome != "All Outcomes":
                trainees = [t for t in trainees if t.get("outcome") == outcome]
            if search:
                search_lower = search.lower()
                trainees = [
                    t for t in trainees
                    if search_lower in t.get("name", "").lower() or
                       search_lower in t.get("id", "").lower() or
                       search_lower in t.get("course_name", "").lower()
                ]
            return trainees
        try:
            query = db.collection("trainees")
            
            # Simple Firestore filters
            if district and district != "All Districts":
                query = query.where("district", "==", district)
            if programme_id:
                query = query.where("programme_id", "==", programme_id)
            if course_name and course_name != "All Courses":
                query = query.where("course_name", "==", course_name)
            if outcome and outcome != "All Status" and outcome != "All Outcomes":
                query = query.where("outcome", "==", outcome)
                
            docs = query.limit(100).stream()
            trainees = [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]
            
            # Apply search filter client-side since Firestore doesn't support complex substring search natively
            if search:
                search_lower = search.lower()
                trainees = [
                    t for t in trainees
                    if search_lower in t.get("name", "").lower() or
                       search_lower in t.get("id", "").lower() or
                       search_lower in t.get("course_name", "").lower()
                ]
                
            return trainees
        except Exception as e:
            print(f"Exception in get_trainees: {e}")
            if "429" in str(e) or "Quota" in str(e) or "ResourceExhausted" in str(e.__class__.__name__):
                print(f"Firestore quota exhausted (429) during get_trainees")
                return []
            raise e

    @staticmethod
    def get_trainee(trainee_id: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            trainees = FirestoreRepository._load_local_demo_data().get('trainees', [])
            return next((t for t in trainees if t.get("id") == trainee_id), None)
        try:
            doc = db.collection("trainees").document(trainee_id).get()
            data = doc.to_dict() if doc.exists else None
            return data if FirestoreRepository._should_include(data) else None
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e) or "ResourceExhausted" in str(e.__class__.__name__):
                print(f"Firestore quota exhausted (429) during get_trainee")
                return None
            raise e

    @staticmethod
    def create_trainee(trainee: TraineeCreate) -> Dict[str, Any]:
        data = trainee.model_dump()
        now = datetime.utcnow().isoformat() + "Z"
        data["created_at"] = now
        data["updated_at"] = now
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            demo_data.setdefault("trainees", []).append(data)
        elif db:
            try:
                db.collection("trainees").document(trainee.id).set(data)
            except Exception as e:
                print(f"Firestore write error in create_trainee: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for trainees")
        return data

    @staticmethod
    def create_trainees_bulk(trainees: List[TraineeCreate]) -> List[Dict[str, Any]]:
        from app.core.config import settings
        created_data = []
        now = datetime.utcnow().isoformat() + "Z"
        
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            trainees_list = demo_data.setdefault("trainees", [])
            for trainee in trainees:
                data = trainee.model_dump()
                data["created_at"] = now
                data["updated_at"] = now
                trainees_list.append(data)
                created_data.append(data)
        elif db:
            batch = db.batch()
            trainees_collection = db.collection("trainees")
            for trainee in trainees:
                data = trainee.model_dump()
                data["created_at"] = now
                data["updated_at"] = now
                doc_ref = trainees_collection.document(trainee.id)
                batch.set(doc_ref, data)
                created_data.append(data)
            try:
                batch.commit()
            except Exception as e:
                print(f"Firestore batch write error in create_trainees_bulk: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for trainees")
            
        return created_data

    @staticmethod
    def update_trainee(trainee_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        updated_doc = None
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            for t in demo_data.get("trainees", []):
                if t.get("id") == trainee_id:
                    t.update(update_data)
                    t["updated_at"] = datetime.utcnow().isoformat() + "Z"
                    updated_doc = dict(t)
                    break
        elif db:
            try:
                doc_ref = db.collection("trainees").document(trainee_id)
                doc = doc_ref.get()
                if doc.exists:
                    update_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
                    doc_ref.update(update_data)
                    updated_doc = doc_ref.get().to_dict()
            except Exception as e:
                print(f"Firestore error in update_trainee: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for trainees")
        return updated_doc

    @staticmethod
    def add_trainee_employment(trainee_id: str, emp: TraineeEmploymentCreate) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        new_emp = emp.model_dump()
        new_emp["id"] = f"emp_{uuid.uuid4().hex[:8]}"
        new_emp["verified"] = False
        new_outcome = emp.employment_type

        updated_doc = None
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            for t in demo_data.get("trainees", []):
                if t.get("id") == trainee_id:
                    t.setdefault("employment_history", []).append(new_emp)
                    t["outcome"] = new_outcome
                    t["updated_at"] = datetime.utcnow().isoformat() + "Z"
                    updated_doc = dict(t)
                    break

        elif db:
            try:
                doc_ref = db.collection("trainees").document(trainee_id)
                doc = doc_ref.get()
                if doc.exists:
                    trainee_data = doc.to_dict()
                    employment_list = trainee_data.get("employment_history", [])
                    employment_list.append(new_emp)
                    doc_ref.update({
                        "employment_history": employment_list,
                        "outcome": new_outcome,
                        "updated_at": datetime.utcnow().isoformat() + "Z"
                    })
                    updated_doc = doc_ref.get().to_dict()
            except Exception as e:
                print(f"Firestore error in add_trainee_employment: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for trainees")

        return updated_doc

    @staticmethod
    def add_trainee_followup(trainee_id: str, followup: TraineeFollowupSubmit) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        updated_doc = None

        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            for t in demo_data.get("trainees", []):
                if t.get("id") == trainee_id:
                    timeline = t.setdefault("outcomes_timeline", [])
                    checkpoint_updated = False
                    for chk in timeline:
                        if chk.get("checkpoint", "").lower() == followup.checkpoint.lower():
                            chk["status"] = "Recorded"
                            chk["employment_status"] = followup.employment_status
                            chk["employer_or_activity"] = followup.employer_or_activity
                            chk["salary"] = followup.salary
                            chk["job_relevance"] = followup.job_relevance
                            chk["verification_status"] = followup.verification_status
                            chk["description"] = followup.description
                            checkpoint_updated = True
                            break
                    if not checkpoint_updated:
                        timeline.append({
                            "checkpoint": followup.checkpoint,
                            "date": datetime.utcnow().isoformat() + "Z",
                            "status": "Recorded",
                            "employment_status": followup.employment_status,
                            "employer_or_activity": followup.employer_or_activity,
                            "salary": followup.salary,
                            "job_relevance": followup.job_relevance,
                            "verification_status": followup.verification_status,
                            "description": followup.description
                        })
                    t["updated_at"] = datetime.utcnow().isoformat() + "Z"
                    updated_doc = dict(t)
                    break

        elif db:
            try:
                doc_ref = db.collection("trainees").document(trainee_id)
                doc = doc_ref.get()
                if doc.exists:
                    trainee_data = doc.to_dict()
                    timeline = trainee_data.get("outcomes_timeline", [])
                    checkpoint_updated = False
                    for chk in timeline:
                        if chk.get("checkpoint", "").lower() == followup.checkpoint.lower():
                            chk["status"] = "Recorded"
                            chk["employment_status"] = followup.employment_status
                            chk["employer_or_activity"] = followup.employer_or_activity
                            chk["salary"] = followup.salary
                            chk["job_relevance"] = followup.job_relevance
                            chk["verification_status"] = followup.verification_status
                            chk["description"] = followup.description
                            checkpoint_updated = True
                            break
                    if not checkpoint_updated:
                        timeline.append({
                            "checkpoint": followup.checkpoint,
                            "date": datetime.utcnow().isoformat() + "Z",
                            "status": "Recorded",
                            "employment_status": followup.employment_status,
                            "employer_or_activity": followup.employer_or_activity,
                            "salary": followup.salary,
                            "job_relevance": followup.job_relevance,
                            "verification_status": followup.verification_status,
                            "description": followup.description
                        })
                    doc_ref.update({
                        "outcomes_timeline": timeline,
                        "updated_at": datetime.utcnow().isoformat() + "Z"
                    })
                    updated_doc = doc_ref.get().to_dict()
            except Exception as e:
                print(f"Firestore error in add_trainee_followup: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for trainees")

        return updated_doc

    # --- Employers ---
    @staticmethod
    def get_employers() -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            return FirestoreRepository._load_local_demo_data().get('employers', [])
        docs = db.collection("employers").limit(100).stream()
        return [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]

    @staticmethod
    def get_employer(employer_id: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            employers = FirestoreRepository._load_local_demo_data().get('employers', [])
            return next((e for e in employers if e.get("id") == employer_id), None)
        doc = db.collection("employers").document(employer_id).get()
        data = doc.to_dict() if doc.exists else None
        return data if FirestoreRepository._should_include(data) else None

    @staticmethod
    def update_employer(employer_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing organization without fabricating a profile."""
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            for employer in demo_data.get("employers", []):
                if employer.get("id") == employer_id:
                    employer.update(update_data)
                    employer["updated_at"] = datetime.utcnow().isoformat() + "Z"
                    return dict(employer)
            return None
        if not db:
            raise RuntimeError("No datastore is configured for employers")
        doc_ref = db.collection("employers").document(employer_id)
        if not doc_ref.get().exists:
            return None
        data = {**update_data, "updated_at": datetime.utcnow().isoformat() + "Z"}
        doc_ref.update(data)
        updated = doc_ref.get().to_dict()
        return updated if FirestoreRepository._should_include(updated) else None

    @staticmethod
    def _interaction_document_id(*parts: str) -> str:
        raw_key = "\x1f".join(parts).encode("utf-8")
        return hashlib.sha256(raw_key).hexdigest()

    @staticmethod
    def get_employer_candidate_interactions(org_id: str) -> Dict[str, set]:
        """Return persisted shortlist and contact state for an organization.

        Demo interactions live in the API process so they reset with the demo
        session. Production interactions are stored in Firestore collections.
        """
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            return {"shortlists": set(), "contacts": set()}
        if not db:
            raise RuntimeError("No datastore is configured for employer interactions")

        shortlist_docs = (
            db.collection("employer_shortlists")
            .where("organization_id", "==", org_id)
            .stream()
        )
        contact_docs = (
            db.collection("employer_candidate_contacts")
            .where("organization_id", "==", org_id)
            .stream()
        )
        return {
            "shortlists": {
                (data.get("trainee_id"), data.get("job_id"))
                for doc in shortlist_docs
                if (data := doc.to_dict()).get("trainee_id") and data.get("job_id")
            },
            "contacts": {
                data.get("trainee_id")
                for doc in contact_docs
                if (data := doc.to_dict()).get("trainee_id")
            },
        }

    @staticmethod
    def toggle_employer_shortlist(org_id: str, trainee_id: str, job_id: str) -> bool:
        """Persist a shortlist toggle and return its resulting state."""
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            raise RuntimeError("Demo shortlist state is managed by the employer router")
        if not db:
            raise RuntimeError("No datastore is configured for employer shortlists")
        document_id = FirestoreRepository._interaction_document_id(org_id, trainee_id, job_id)
        doc_ref = db.collection("employer_shortlists").document(document_id)
        if doc_ref.get().exists:
            doc_ref.delete()
            return False
        doc_ref.set(
            {
                "organization_id": org_id,
                "trainee_id": trainee_id,
                "job_id": job_id,
                "created_at": datetime.utcnow().isoformat() + "Z",
            }
        )
        return True

    @staticmethod
    def record_employer_candidate_contact(
        org_id: str, trainee_id: str, message: str | None
    ) -> None:
        """Persist candidate contact metadata without claiming external delivery."""
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            raise RuntimeError("Demo contact state is managed by the employer router")
        if not db:
            raise RuntimeError("No datastore is configured for employer contacts")
        document_id = FirestoreRepository._interaction_document_id(org_id, trainee_id)
        db.collection("employer_candidate_contacts").document(document_id).set(
            {
                "organization_id": org_id,
                "trainee_id": trainee_id,
                "message": message or "",
                "updated_at": datetime.utcnow().isoformat() + "Z",
            },
            merge=True,
        )

    # --- Employer Verifications ---
    @staticmethod
    def get_pending_verifications() -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            return [
                verification
                for verification in FirestoreRepository._load_local_demo_data().get("employer_verifications", [])
                if verification.get("status") == "Pending"
            ]
        docs = db.collection("employer_verifications").where("status", "==", "Pending").stream()
        return [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]

    @staticmethod
    def create_verification(verify: EmployerVerificationCreate) -> Dict[str, Any]:
        verify_id = f"v_{uuid.uuid4().hex[:8]}"
        data = verify.model_dump()
        data["id"] = verify_id
        data["status"] = "Pending"
        now = datetime.utcnow().isoformat() + "Z"
        data["created_at"] = now
        data["updated_at"] = now
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            demo_data.setdefault("employer_verifications", []).append(data)
        elif db:
            try:
                db.collection("employer_verifications").document(verify_id).set(data)
            except Exception as e:
                print(f"Firestore write error in create_verification: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for employer verifications")
        return data

    @staticmethod
    def get_verification(verification_id: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            return next(
                (
                    verification
                    for verification in FirestoreRepository._load_local_demo_data().get("employer_verifications", [])
                    if verification.get("id") == verification_id
                ),
                None,
            )
        doc = db.collection("employer_verifications").document(verification_id).get()
        data = doc.to_dict() if doc.exists else None

        return data if FirestoreRepository._should_include(data) else None

    @staticmethod
    def update_verification_status(verification_id: str, status: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        now = datetime.utcnow().isoformat() + "Z"
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            verification_data = next(
                (
                    verification
                    for verification in demo_data.get("employer_verifications", [])
                    if verification.get("id") == verification_id
                ),
                None,
            )
            if not verification_data:
                return None
            verification_data.update({"status": status, "updated_at": now})
            if status == "Approved":
                trainee = next(
                    (
                        candidate
                        for candidate in demo_data.get("trainees", [])
                        if candidate.get("id") == verification_data.get("trainee_id")
                    ),
                    None,
                )
                if trainee:
                    employer_name = verification_data.get("employer_name")
                    role = verification_data.get("role")
                    for entry in trainee.get("employment_history", []):
                        if entry.get("employer_name") == employer_name and entry.get("role") == role:
                            entry["verified"] = True
                    for checkpoint in trainee.get("outcomes_timeline", []):
                        if checkpoint.get("employer_or_activity") == employer_name:
                            checkpoint["verification_status"] = "Verified"
                            checkpoint["status"] = "Recorded"
                    trainee["updated_at"] = now
            return dict(verification_data)

        doc_ref = db.collection("employer_verifications").document(verification_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None

        doc_ref.update({
            "status": status,
            "updated_at": now
        })
        
        verification_data = doc_ref.get().to_dict()
        trainee_id = verification_data.get("trainee_id")
        employer_name = verification_data.get("employer_name")
        role = verification_data.get("role")
        
        # If approved, update verification status in Trainee's history and timeline
        if status == "Approved" and trainee_id:
            trainee_ref = db.collection("trainees").document(trainee_id)
            t_doc = trainee_ref.get()
            if t_doc.exists:
                t_data = t_doc.to_dict()
                
                # Update employment history
                hist = t_data.get("employment_history", [])
                for entry in hist:
                    if entry.get("employer_name") == employer_name and entry.get("role") == role:
                        entry["verified"] = True
                        
                # Update timeline verification status
                timeline = t_data.get("outcomes_timeline", [])
                for chk in timeline:
                    if chk.get("employer_or_activity") == employer_name:
                        chk["verification_status"] = "Verified"
                        chk["status"] = "Recorded"
                        
                trainee_ref.update({
                    "employment_history": hist,
                    "outcomes_timeline": timeline,
                    "updated_at": now
                })
                
        return verification_data

    # --- Employer Feedback ---
    @staticmethod
    def get_employer_feedback(programme_id: Optional[str] = None) -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            feedback = FirestoreRepository._load_local_demo_data().get('employer_feedback', [])
            if programme_id:
                feedback = [f for f in feedback if f.get("programme_id") == programme_id]
            return feedback
        try:
            query = db.collection("employer_feedback")
            if programme_id:
                query = query.where("programme_id", "==", programme_id)
            docs = query.limit(100).stream()
            return [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e) or "ResourceExhausted" in str(e.__class__.__name__):
                print(f"Firestore quota exhausted (429) during get_employer_feedback")
                return []
            raise e

    @staticmethod
    def create_employer_feedback(feedback: EmployerFeedbackCreate) -> Dict[str, Any]:
        feedback_id = f"f_{uuid.uuid4().hex[:8]}"
        data = feedback.model_dump()
        data["id"] = feedback_id
        now = datetime.utcnow().isoformat() + "Z"
        data["created_at"] = now
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            demo_data.setdefault("employer_feedback", []).append(data)
        elif db:
            try:
                db.collection("employer_feedback").document(feedback_id).set(data)
            except Exception as e:
                print(f"Firestore write error in create_employer_feedback: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for employer feedback")
        return data

    # --- Interventions ---
    @staticmethod
    def get_interventions() -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            return FirestoreRepository._load_local_demo_data().get('interventions', [])
        try:
            docs = db.collection("interventions").limit(100).stream()
            return [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e) or "ResourceExhausted" in str(e.__class__.__name__):
                print(f"Firestore quota exhausted (429) during get_interventions")
                return []
            raise e

    @staticmethod
    def get_intervention(intervention_id: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            return next(
                (
                    intervention
                    for intervention in FirestoreRepository._load_local_demo_data().get("interventions", [])
                    if intervention.get("id") == intervention_id
                ),
                None,
            )
        try:
            doc = db.collection("interventions").document(intervention_id).get()
            data = doc.to_dict() if doc.exists else None
            return data if FirestoreRepository._should_include(data) else None
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e) or "ResourceExhausted" in str(e.__class__.__name__):
                print(f"Firestore quota exhausted (429) during get_intervention")
                return None
            raise e

    @staticmethod
    def create_intervention(intervention: Any) -> Dict[str, Any]:
        if hasattr(intervention, "model_dump"):
            data = intervention.model_dump()
        elif isinstance(intervention, dict):
            data = dict(intervention)
        else:
            data = dict(intervention)
        int_id = data.get("id") or f"int_{uuid.uuid4().hex[:8]}"
        data["id"] = int_id
        now = datetime.utcnow().isoformat() + "Z"
        data["created_at"] = now
        data["updated_at"] = now
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            demo_data.setdefault("interventions", []).append(data)
        elif db:
            try:
                db.collection("interventions").document(int_id).set(data)
            except Exception as e:
                print(f"Firestore write error in create_intervention: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for interventions")
        return data

    # --- Skill Master ---
    @staticmethod
    def get_skills() -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            return FirestoreRepository._load_local_demo_data().get('skill_master', [])
        docs = db.collection("skill_master").stream()
        return [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]

    @staticmethod
    def get_skill(skill_id: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            skills = FirestoreRepository._load_local_demo_data().get('skill_master', [])
            return next(
                (s for s in skills if s.get("skill_id") == skill_id or s.get("id") == skill_id),
                None,
            )
        doc = db.collection("skill_master").document(skill_id).get()
        data = doc.to_dict() if doc.exists else None

        return data if FirestoreRepository._should_include(data) else None

    @staticmethod
    def create_skill(skill_data: Dict[str, Any]) -> Dict[str, Any]:
        s_id = skill_data.get("skill_id")
        if not s_id:
            s_id = f"S{uuid.uuid4().hex[:4].upper()}"
            skill_data["skill_id"] = s_id
        now = datetime.utcnow().isoformat() + "Z"
        skill_data["created_at"] = now
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            demo_data.setdefault("skill_master", []).append(skill_data)
        elif db:
            try:
                db.collection("skill_master").document(s_id).set(skill_data)
            except Exception as e:
                print(f"Firestore write error in create_skill: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for skills")
        return skill_data

    # --- Skill Assessments ---
    @staticmethod
    def get_assessments(trainee_id: Optional[str] = None, skill_id: Optional[str] = None) -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            assessments = FirestoreRepository._load_local_demo_data().get('skill_assessments', [])
            if trainee_id:
                assessments = [a for a in assessments if a.get("trainee_id") == trainee_id]
            if skill_id:
                assessments = [a for a in assessments if a.get("skill_id") == skill_id]
            return assessments
        query = db.collection("skill_assessments")
        if trainee_id:
            query = query.where("trainee_id", "==", trainee_id)
        if skill_id:
            query = query.where("skill_id", "==", skill_id)
        docs = query.stream()
        return [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]

    @staticmethod
    def get_trainee_assessments(trainee_id: str) -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            assessments = FirestoreRepository._load_local_demo_data().get('skill_assessments', [])
            return [a for a in assessments if a.get("trainee_id") == trainee_id]
        docs = db.collection("skill_assessments").where("trainee_id", "==", trainee_id).stream()
        return [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]

    @staticmethod
    def create_assessment(assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        a_id = assessment_data.get("assessment_id") or f"asm_{uuid.uuid4().hex[:8]}"
        assessment_data["assessment_id"] = a_id
        if not assessment_data.get("assessment_date"):
            assessment_data["assessment_date"] = datetime.utcnow().strftime("%Y-%m-%d")
        now = datetime.utcnow().isoformat() + "Z"
        assessment_data["created_at"] = now
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            demo_data.setdefault("skill_assessments", []).append(assessment_data)
        elif db:
            try:
                db.collection("skill_assessments").document(a_id).set(assessment_data)
            except Exception as e:
                print(f"Firestore write error in create_assessment: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for skill assessments")
        return assessment_data

    # --- Jobs / Job Requirements ---
    @staticmethod
    def get_jobs(industry: Optional[str] = None, location: Optional[str] = None, role: Optional[str] = None) -> List[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            jobs = FirestoreRepository._load_local_demo_data().get('jobs', [])
            if industry:
                jobs = [j for j in jobs if j.get("industry") == industry]
            if location and location != "All Locations":
                jobs = [j for j in jobs if j.get("location") == location]
            if role:
                role_lower = role.lower()
                jobs = [j for j in jobs if role_lower in j.get("role", "").lower() or role_lower in j.get("title", "").lower()]
            return jobs
        query = db.collection("jobs")
        if industry:
            query = query.where("industry", "==", industry)
        if location and location != "All Locations":
            query = query.where("location", "==", location)
        docs = query.stream()
        jobs = [doc.to_dict() for doc in docs if FirestoreRepository._should_include(doc.to_dict())]
        if role:
            role_lower = role.lower()
            jobs = [j for j in jobs if role_lower in j.get("role", "").lower() or role_lower in j.get("title", "").lower()]
        return jobs

    @staticmethod
    def get_job(job_id: str) -> Optional[Dict[str, Any]]:
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            jobs = FirestoreRepository._load_local_demo_data().get('jobs', [])
            for j in jobs:
                if j.get("id") == job_id:
                    return j
            return None
            
        doc = db.collection("jobs").document(job_id).get()
        data = doc.to_dict() if doc.exists else None

        return data if FirestoreRepository._should_include(data) else None

    @staticmethod
    def create_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
        j_id = job_data.get("id") or f"J{uuid.uuid4().hex[:4].upper()}"
        job_data["id"] = j_id
        now = datetime.utcnow().isoformat() + "Z"
        job_data["created_at"] = now
        job_data["updated_at"] = now
        from app.core.config import settings
        if settings.ENABLE_DEMO_MODE:
            demo_data = FirestoreRepository._load_local_demo_data()
            demo_data.setdefault("jobs", []).append(job_data)
        elif db:
            try:
                db.collection("jobs").document(j_id).set(job_data)
            except Exception as e:
                print(f"Firestore write error in create_job: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for jobs")
        return job_data

    # --- 3-Way Skill Gap Intelligence Engine ---
    @staticmethod
    def calculate_3way_skill_gap(programme_id: str, trainee_id: str, job_id: str) -> Dict[str, Any]:
        prog = FirestoreRepository.get_programme(programme_id) or {}
        trainee = FirestoreRepository.get_trainee(trainee_id) or {}
        job = FirestoreRepository.get_job(job_id) or {}

        taught_skills = prog.get("skills_taught_structured", [])
        taught_map = {item.get("skill_id", item.get("skill_name")): item.get("target_level", 70) for item in taught_skills}
        if not taught_map and prog.get("skills_taught"):
            for s in prog.get("skills_taught", []):
                taught_map[s] = 70

        assessments = FirestoreRepository.get_trainee_assessments(trainee_id)
        acquired_map = {a.get("skill_id", a.get("skill_name")): a.get("proficiency_score", 60) for a in assessments}
        # also map by skill name
        for a in assessments:
            if a.get("skill_name"):
                acquired_map[a["skill_name"]] = a.get("proficiency_score", 60)

        job_reqs = job.get("skills_required", [])
        if not job_reqs:
            return {
                "programme_id": programme_id,
                "programme_name": prog.get("name", "Training Programme"),
                "trainee_id": trainee_id,
                "trainee_name": trainee.get("name", "Trainee"),
                "job_id": job_id,
                "job_role": job.get("role", job.get("title", "Job Role")),
                "overall_match_percentage": None,
                "skills_analysis": [],
                "recommendations": ["Insufficient data: Job requirements are missing."]
            }

        analysis = []
        weighted_score_total = 0.0
        weight_total = 0.0
        recommendations = []

        for req in job_reqs:
            s_id = req.get("skill_id", "")
            s_name = req.get("skill_name", "")
            req_level = req.get("required_level", 70)
            weight = req.get("importance", 1.0)

            taught_lvl = taught_map.get(s_id, taught_map.get(s_name, 0))
            acquired_score = acquired_map.get(s_id, acquired_map.get(s_name, 55))

            gap = req_level - acquired_score
            if gap <= 0:
                status = "Met"
                score_contrib = 1.0
            elif gap <= 15:
                status = "Minor Gap"
                score_contrib = max(0.5, acquired_score / req_level)
                recommendations.append(f"Reinforce {s_name} with practical projects to bridge {gap}pt gap.")
            else:
                status = "Major Gap"
                score_contrib = max(0.2, acquired_score / req_level)
                recommendations.append(f"Priority intervention: Add dedicated {s_name} module (gap of {gap}pts).")

            weighted_score_total += (score_contrib * weight)
            weight_total += weight

            analysis.append({
                "skill_id": s_id,
                "skill_name": s_name,
                "programme_taught_level": taught_lvl,
                "trainee_acquired_score": acquired_score,
                "job_required_level": req_level,
                "importance_weight": weight,
                "gap": gap,
                "status": status
            })

        overall_match = int((weighted_score_total / weight_total) * 100) if weight_total > 0 else None

        return {
            "programme_id": programme_id,
            "programme_name": prog.get("name", "Training Programme"),
            "trainee_id": trainee_id,
            "trainee_name": trainee.get("name", "Trainee"),
            "job_id": job_id,
            "job_role": job.get("role", job.get("title", "Job Role")),
            "overall_match_percentage": overall_match,
            "skills_analysis": analysis,
            "recommendations": recommendations or ["Candidate meets key baseline requirements for this role."]
        }
