from datetime import datetime, timedelta
import uuid
import logging
from app.firebase.repository import FirestoreRepository
from app.schemas.followup import FollowUpStatus, FollowUpStage, FollowUp, FollowUpAttempt
from app.schemas.employer import EmployerVerificationCreate
from app.schemas.trainee import TraineeBase

logger = logging.getLogger(__name__)

class FollowUpService:
    @staticmethod
    def evaluate_followups():
        all_followups = FirestoreRepository.get_follow_ups()
        pending = [f for f in all_followups if f.get("status") == FollowUpStatus.PENDING]

        now = datetime.utcnow()
        results = {"processed": 0, "errors": 0}

        for f_data in pending:
            try:
                trainee_data = FirestoreRepository.get_trainee(f_data["trainee_id"])
                if not trainee_data:
                    continue

                trainee = TraineeBase(**trainee_data)
                
                # 1. Evaluate Consent
                consent = trainee.current_consent
                if consent.status in ["REVOKED", "NOT_GIVEN"]:
                    f_data["status"] = FollowUpStatus.CANCELLED
                    FirestoreRepository.create_or_update_follow_up(f_data)
                    results["processed"] += 1
                    continue

                # 2. Check if due
                next_due_str = f_data.get("next_due_at")
                if not next_due_str:
                    continue
                next_due = datetime.fromisoformat(next_due_str.replace("Z", "+00:00").split('+')[0])
                if now.timestamp() < next_due.timestamp():
                    continue

                # 3. Process Transition
                current_stage = f_data.get("current_stage")
                triggered_at = datetime.fromisoformat(f_data["triggered_at"].replace("Z", "+00:00").split('+')[0])
                
                method = "UNKNOWN"
                next_stage = current_stage
                next_due_at = next_due
                status = FollowUpStatus.PENDING
                unresolved_at = None

                if current_stage == FollowUpStage.DAY_0:
                    method = "SMS_DEMO"
                    next_stage = FollowUpStage.DAY_7
                    next_due_at = triggered_at + timedelta(days=7)
                elif current_stage == FollowUpStage.DAY_7:
                    method = "TRAINING_CENTRE_CONTACT"
                    next_stage = FollowUpStage.DAY_14
                    next_due_at = triggered_at + timedelta(days=14)
                elif current_stage == FollowUpStage.DAY_14:
                    method = "EMPLOYER_VERIFICATION_TRIGGER"
                    next_stage = FollowUpStage.DAY_21
                    next_due_at = triggered_at + timedelta(days=21)
                    
                    # Trigger verification if there is an unverified employment record
                    outcome = trainee.current_outcome
                    if outcome and outcome.verification_state in ["SELF_REPORTED", "UNVERIFIED"]:
                        ev = EmployerVerificationCreate(
                            trainee_id=trainee.id,
                            employer_name=outcome.employer or "Unknown Employer",
                            role=outcome.role or "Unknown Role"
                        )
                        FirestoreRepository.create_verification(ev)
                        
                elif current_stage == FollowUpStage.DAY_21:
                    method = "CALL_CENTRE"
                    status = FollowUpStatus.UNRESOLVED
                    unresolved_at = now.isoformat() + "Z"

                # Idempotency Key
                idemp_key = f"{f_data['id']}_{current_stage}"
                
                # Attempt record
                attempt = {
                    "id": "",
                    "follow_up_id": f_data["id"],
                    "stage": current_stage,
                    "scheduled_at": next_due_str,
                    "executed_at": now.isoformat() + "Z",
                    "method": method,
                    "actor": "SYSTEM_CRON",
                    "result": "EXECUTED",
                    "idempotency_key": idemp_key
                }
                
                # Use idempotency. If already created, skip duplicate.
                created_att = FirestoreRepository.create_follow_up_attempt(attempt)
                if created_att.get("executed_at") != attempt["executed_at"] and created_att.get("id"):
                    # means it already existed (idempotency caught it)
                    # wait, this means someone else ran it and created the attempt. But the followup didn't transition?
                    # This shouldn't normally happen. For safety, we still transition.
                    pass

                # Update FollowUp state
                f_data["current_stage"] = next_stage
                f_data["status"] = status
                f_data["next_due_at"] = next_due_at.isoformat() + "Z"
                if unresolved_at:
                    f_data["unresolved_at"] = unresolved_at

                FirestoreRepository.create_or_update_follow_up(f_data)
                results["processed"] += 1

            except Exception as e:
                logger.error(f"Error processing followup {f_data.get('id')}: {e}")
                results["errors"] += 1
                
        return results