# Phase 2C Implementation Plan: Follow-Up & Escalation Protocol

## 1. Existing Architecture Findings
- **EmploymentHistory & ConsentRecord**: Phase 2B introduced append-only logs for employment outcomes and data sharing consent. Current outcome and consent states are deterministically derived rather than statically stored.
- **Employer Verification**: Phase 2B supports logging an outcome and triggering `EmployerVerificationCreate`. An employer verifying the record marks it as `EMPLOYER_VERIFIED`. Conflicts mark the state appropriately.
- **Trainee Schema**: `TraineeBase` exposes `current_outcome` and `current_consent`.
- **Background/Scheduled Tasks**: The backend does not currently possess a robust distributed job queue (e.g., Celery). A cron endpoint strategy is ideal to allow external schedulers (e.g., Cloud Scheduler) to trigger periodic checks via HTTP.
- **Persistence**: Using a `FirestoreRepository` which runs in-memory demo logic during prototype mode.

## 2. Proposed Data Model

**FollowUp** (represents one tracking cycle per trainee):
- `id` (str): Unique identifier.
- `trainee_id` (str): Reference to the trainee.
- `triggered_at` (datetime): Timestamp when Day 0 evaluation began (typically programme completion).
- `current_stage` (str): `DAY_0`, `DAY_7`, `DAY_14`, `DAY_21`.
- `status` (str): `PENDING`, `RESOLVED`, `UNRESOLVED`, `CANCELLED`.
- `next_due_at` (datetime): Exact timestamp when the next evaluation attempt should occur.
- `resolved_at` (datetime | None): Timestamp if status is `RESOLVED`.
- `unresolved_at` (datetime | None): Timestamp if status is `UNRESOLVED`.

**FollowUpAttempt** (represents individual actions/audit trail within a cycle):
- `id` (str): Unique identifier.
- `follow_up_id` (str): Reference to the parent `FollowUp`.
- `stage` (str): The stage being attempted (e.g., `DAY_7`).
- `scheduled_at` (datetime): When it was meant to occur.
- `executed_at` (datetime): When it actually occurred.
- `method` (str): `SMS`, `TRAINING_CENTRE_CONTACT`, `EMPLOYER_VERIFICATION`, `CALL_CENTRE`.
- `result` (str): The outcome of this specific attempt (e.g., `SENT`, `NO_RESPONSE`, `CONFLICT`).
- `idempotency_key` (str): Unique key to prevent duplicate execution (e.g., `{follow_up_id}_{stage}`).

## 3. State Machine

**Required Outcomes:** `PENDING`, `RESOLVED`, `UNRESOLVED`, `CANCELLED`.

**Behavior Rules:**
- **Response Arrives Late:** Resolves the `FollowUp` correctly regardless of the current stage.
- **Response Arrives Later:** If a follow up is in `DAY_14` and trainee responds, it shifts to `RESOLVED`.
- **Consent Revoked:** Transitions to `CANCELLED`.
- **Consent Re-given:** If re-given within the 21-day window of completion, it could resume if applicable, but for safety, it will require manual/admin triggering to avoid unprompted spamming.
- **Outcome Already Confirmed:** Transitions to `CANCELLED` or `RESOLVED` immediately on cycle creation.
- **Employer Verification:** Successful verification transitions `FollowUp` to `RESOLVED`.
- **Already Resolved/Unresolved:** No further automated stage evaluations occur.

## 4. Transition Table

| Current State | Condition / Trigger | Next State | Next Stage / Action |
| ------------- | ------------------- | ---------- | ------------------- |
| Any | Consent Revoked | `CANCELLED` | Execution halts |
| `PENDING` (`DAY_0`) | No response by `next_due_at` | `PENDING` | Shift to `DAY_7` |
| `PENDING` (`DAY_0`) | Valid Response Received | `RESOLVED` | Update `EmploymentHistory` |
| `PENDING` (`DAY_7`) | No response by `next_due_at` | `PENDING` | Shift to `DAY_14` |
| `PENDING` (`DAY_14`) | No response by `next_due_at` | `PENDING` | Shift to `DAY_21` |
| `PENDING` (`DAY_14`) | Employer Verifies | `RESOLVED` | Log `EMPLOYER_VERIFIED` |
| `PENDING` (`DAY_14`) | Employer Conflict | `PENDING` | Log `CONFLICTING` wait for Admin |
| `PENDING` (`DAY_21`) | No response by `next_due_at` | `UNRESOLVED`| Evaluation halts |
| Any | Trainee updates outcome | `RESOLVED` | Evaluation halts |

## 5. Consent Interaction
- **Rule:** Phase 2C will check the derived `current_consent` via `trainee.current_consent`.
- `REVOKED` / `NOT_GIVEN`: No automated follow-up attempts are triggered or evaluated. Active follow-ups transition to `CANCELLED`.
- `GIVEN`: Follow-up proceeds according to schedule.
- **Re-Consent:** If consent is re-given, we do not automatically resume a `CANCELLED` follow-up. An admin must manually authorize resuming the cycle to prevent disjointed automated messaging.

## 6. Scheduler Design
- **Endpoint:** `POST /api/cron/evaluate-followups`
- **Execution:** Processes all `PENDING` FollowUps where `next_due_at <= NOW()`.
- **Day 0 Boundary:** Day 0 represents the first scheduled evaluation directly following the program completion timestamp. If completion was today, Day 0 evaluates immediately upon the next cron run.
- **Due-Time Calculation:**
  - Day 7: `triggered_at + 7 days`
  - Day 14: `triggered_at + 14 days`
  - Day 21: `triggered_at + 21 days`
- **Late Execution Tolerance:** If the scheduler runs late (e.g., runs on Day 8 for a Day 7 stage), it executes the Day 7 stage immediately and schedules Day 14 relative to the original `triggered_at`. It does not skip stages.

## 7. Idempotency Design
- To prevent duplicate stage executions (e.g., two cron jobs running concurrently), each `FollowUpAttempt` requires an `idempotency_key`.
- **Key Formula:** `{follow_up_id}_{stage}` (e.g., `FU-1001_DAY_7`).
- The database (or repository layer) must enforce uniqueness on this key. If an attempt with this key exists, the scheduler skips executing the stage action.

## 8. Failure Handling (Partial Failure)
- The cron evaluator processes follow-ups iteratively. 
- If a failure occurs processing record 41 out of 100, the error is caught, logged, and the loop continues to record 42.
- The `idempotency_key` ensures that when the scheduler retries later, it safely skips 1-40 and retries 41.
- In Demo Mode/JSON persistence, transactional safety will be mocked by saving state after each successful record processing, preventing global rollback on single failures.

## 9. Employer Integration
- Day 14 specifically targets Employer Verification.
- If a trainee logs an outcome but it's unverified, Day 14 will trigger/remind the employer.
- If the employer responds via the existing Employer Portal, the `FollowUp` is instantly marked `RESOLVED`.
- If the employer reports a mismatch, the verification becomes `CONFLICTING`. The `FollowUp` stays `PENDING` (or enters a manual Admin queue) rather than automatically overwriting trainee history.

## 10. Authorization
- **Cron Endpoint:** Protected by a dedicated bearer token (e.g., `Bearer X-Cron-Secret`). Cannot be triggered by Trainees, Employers, or unauthenticated users.
- **Trainees:** Can view their own `FollowUp` status but cannot manually trigger cycles.
- **Employers:** Unaware of the internal FollowUp object; they only interact with `EmployerVerification`.
- **Admins:** Have read/write access to all `FollowUps` and `FollowUpAttempts`.

## 11. API Changes
- `POST /api/cron/evaluate-followups`: Protected cron endpoint.
- `GET /api/trainees/{id}/follow-ups`: Fetch cycle history for a trainee.
- `GET /api/admin/follow-ups/pending`: For admin dashboards.
- `POST /api/admin/follow-ups/{id}/cancel`: Manual admin override.
- `POST /api/trainees/{id}/follow-ups/response`: Webhook/Endpoint for receiving simulated SMS/WhatsApp responses.

## 12. Frontend Changes
- **Trainee Overview:** Add a minimal UI banner indicating "Outcome verification pending" or "Follow-up scheduled" if a cycle is active.
- **Admin Dashboard:** A new sub-view or table for "Pending Follow-ups", displaying Trainee, Current Stage, and Due Date.
- **No external messaging integration** will be built; prototype methods will be marked "DEMO_SMS_SENT".

## 13. Demo Data
`generate_json_demo.py` will generate illustrative scenarios:
1. `DAY_0` pending.
2. `DAY_7` pending.
3. `DAY_14` pending.
4. `RESOLVED` at Day 7 (via simulated SMS response).
5. `UNRESOLVED` after Day 21 completion.
6. `CANCELLED` due to `REVOKED` consent.
7. `CONFLICTING` due to employer disagreement.

## 14. Test Plan
- **State Transitions:** Unit tests advancing the state machine from Day 0 -> Day 21 -> UNRESOLVED.
- **Resolution:** Unit test simulating a valid response at Day 7 transitioning state to `RESOLVED`.
- **Consent:** Test that `evaluate_followup` skips and cancels cycles where `current_consent != GIVEN`.
- **Idempotency:** Test executing the cron function twice concurrently; verify only one `FollowUpAttempt` is created per stage.
- **Data Integrity (No-Response Invariant):** Assert that when a cycle hits `UNRESOLVED`, the trainee's `current_outcome` remains entirely unchanged.
- **Partial Failure:** Mock a failure on record 2 of 3, ensure records 1 and 3 succeed and save.
- **Authorization:** Assert 401/403 for Trainee/Employer accessing the cron endpoint.

## 15. Implementation Sequence
1. **Domain Models**: Define `FollowUp` and `FollowUpAttempt` Pydantic schemas.
2. **Repository Layer**: Add CRUD methods for FollowUps and enforce idempotency logic.
3. **State Machine Service**: Implement the core `evaluate_cycle(follow_up)` logic.
4. **Cron Evaluator API**: Implement `POST /api/cron/evaluate-followups` with authentication and loop logic.
5. **Consent Gate**: Wire the trainee's consent state into the evaluator.
6. **Employer & Response APIs**: Implement the webhook/response endpoints that resolve active cycles.
7. **Demo Data**: Update `generate_json_demo.py`.
8. **Tests**: Implement the test suite.
9. **Frontend Integration**: Admin and Trainee UI hooks.

## 16. Acceptance Criteria
- [ ] Day 0, Day 7, Day 14, Day 21 stage progression works.
- [ ] Successful response yields `RESOLVED`.
- [ ] 21 days without response yields `UNRESOLVED` while preserving previous outcome history.
- [ ] Lack of `GIVEN` consent halts/cancels follow-up execution.
- [ ] Duplicate execution of the cron endpoint does not generate duplicate attempts (`idempotency_key` works).
- [ ] Cron endpoint correctly validates `X-Cron-Secret`.
- [ ] Partial failure processes the rest of the batch safely.
- [ ] Employer verification integrates correctly.
- [ ] Demo mode works.
- [ ] Frontend works.
- [ ] Full regression suite passes.

## 17. Risks
- **Concurrency in Demo Mode:** In-memory updates to `demo_data.json` might encounter race conditions if the cron endpoint is spammed. We will mitigate this with synchronous loop execution.
- **Clock drift:** Using system time for `next_due_at` requires strict timezone handling (UTC everywhere).

## 18. Explicit Non-Goals
- Real SMS / WhatsApp Twilio integrations.
- Recruitment messaging or job matching.
- Modifying the existing LMS/Course/Job abstractions (which were removed in Phase 1).
- Complex retry logic for failed SMS sends (if an attempt fails, it waits for the next stage).
