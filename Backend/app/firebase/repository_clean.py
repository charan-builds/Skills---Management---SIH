from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib
import uuid
from app.firebase.config import db
from app.schemas.programme import ProgrammeCreate
from app.schemas.trainee import TraineeCreate, TraineeEmploymentCreate, TraineeFollowupSubmit, TraineeConsentUpdate
from app.schemas.employer import EmployerVerificationCreate, EmployerFeedbackCreate
from app.schemas.intervention import InterventionCreate

class FirestoreRepository:

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
        # Phase 3F Fix: Baseline synthetic records are the authoritative dataset, so treat them as real for now.
        return True

    @staticmethod
    def _should_include(doc_dict: Optional[Dict[str, Any]]) -> bool:
        if doc_dict is None:
            return False
        if not db:
            return False
        try:
            return db.collection(collection_name).document(document_id).get().exists
        except Exception:
            return False

    # --- Programmes ---
    @staticmethod
    def get_programmes() -> List[Dict[str, Any]]:
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
        if db:
            try:
                db.collection("programmes").document(programme.id).set(data)
            except Exception as e:
                print(f"Firestore write error in create_programme: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for programmes")
        return data

    @staticmethod
    def delete_programme(programme_id: str) -> None:
        if db:
            try:
                db.collection("programmes").document(programme_id).delete()
            except Exception as e:
                print(f"Firestore write error in delete_programme: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for programmes")

    # --- Trainees ---
    @staticmethod
    def get_trainees(
        search: Optional[str] = None,
        district: Optional[str] = None,
        programme_id: Optional[str] = None,
        course_name: Optional[str] = None,
        outcome: Optional[str] = None,
        cohort: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        try:
            query = db.collection("trainees")

            # Simple Firestore filters
            if district and district != "All Districts":
                query = query.where("district", "==", district)
            if programme_id:
                query = query.where("programme_id", "==", programme_id)
            if course_name and course_name != "All Courses":
                query = query.where("course_name", "==", course_name)
            if cohort and cohort != "All Cohorts":
                query = query.where("cohort", "==", cohort)
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
        if trainee.programme_id and not FirestoreRepository._verify_document_exists("programmes", trainee.programme_id):
            raise ValueError(f"Programme with ID {trainee.programme_id} does not exist.")
        if trainee.target_role_id and not FirestoreRepository._verify_document_exists("role_benchmarks", trainee.target_role_id):
            raise ValueError(f"Role benchmark with ID {trainee.target_role_id} does not exist.")
            
        data = trainee.model_dump()
        now = datetime.utcnow().isoformat() + "Z"
        data["created_at"] = now
        data["updated_at"] = now
        if db:
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
        if db:
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
        prog_id = update_data.get("programme_id")
        role_id = update_data.get("target_role_id")
        if prog_id and not FirestoreRepository._verify_document_exists("programmes", prog_id):
            raise ValueError(f"Programme with ID {prog_id} does not exist.")
        if role_id and not FirestoreRepository._verify_document_exists("role_benchmarks", role_id):
            raise ValueError(f"Role benchmark with ID {role_id} does not exist.")
            
        if db:
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
        if db:
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
    def add_trainee_consent(trainee_id: str, consent: TraineeConsentUpdate) -> Optional[Dict[str, Any]]:
        if db:
            try:
                doc_ref = db.collection("trainees").document(trainee_id)
                doc = doc_ref.get()
                if doc.exists:
                    trainee_data = doc.to_dict()
                    consent_list = trainee_data.get("consent_history", [])
                    consent_list.append(new_consent)
                    doc_ref.update({
                        "consent_history": consent_list,
                        "updated_at": datetime.utcnow().isoformat() + "Z"
                    })
                    updated_doc = doc_ref.get().to_dict()
            except Exception as e:
                print(f"Firestore error in add_trainee_consent: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for trainees")

        return updated_doc

        return updated_doc

    @staticmethod
    def add_trainee_followup(trainee_id: str, followup: TraineeFollowupSubmit) -> Optional[Dict[str, Any]]:
        if db:
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



    # --- Employer Verifications ---
    @staticmethod
    def get_pending_verifications() -> List[Dict[str, Any]]:
        if db:
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
        if db:
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
        if db:
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
        if db:
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
        if db:
            try:
                db.collection("skill_assessments").document(a_id).set(assessment_data)
            except Exception as e:
                print(f"Firestore write error in create_assessment: {e}")
                raise
        else:
            raise RuntimeError("No datastore is configured for skill assessments")
        return assessment_data

    # --- Role Benchmarks ---
    @staticmethod
    def get_role_benchmarks(industry: Optional[str] = None, role: Optional[str] = None) -> List[Dict[str, Any]]:
        if db:
            db.collection("follow_ups").document(data["id"]).set(data)
        return data

    @staticmethod
    def update_follow_up(id: str, updates: Dict[str, Any]) -> bool: