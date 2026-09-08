# PHASE 2: PRODUCT ARCHITECTURE SPECIFICATION

## 1. Product Vision
The **Skilling Impact Intelligence Platform** is a government-oriented ecosystem that tracks the lifecycle of trainees from training to employment. It maps verifiable employment outcomes, identifies precise skill gaps against industry requirements, recommends targeted upskilling, and surfaces high-level aggregated intelligence so the government can execute actionable, data-driven interventions.

## 2. Scope
The platform will facilitate:
- **Employment Outcome Tracking:** Gathering and persisting verifiable employment statuses, maintaining a full history of records.
- **Trainee Consent:** Capturing and respecting explicit consent for data tracking and follow-ups with an auditable history.
- **Follow-up & Escalation:** An auditable, scheduled protocol for tracking outcomes post-training.
- **Skill Gap Intelligence:** Identifying missing skills by comparing verified trainee competencies against relevant industry requirements.
- **Recommended Upskilling:** Directing trainees to targeted training based strictly on identified skill gaps, without fabricating recommendations.
- **Government Analytics:** Providing actionable dashboards to interpret outcome rates, retention, wage progression, and training effectiveness based on the zero-fabrication principle.

## 3. Explicitly Excluded Features
The product is **NOT** a job portal, ATS, recruitment platform, resume platform, social network, or full LMS. We explicitly exclude:
- Candidate shortlisting, pipelines, interviews, or ATS mechanics.
- Job applications, job search, or "1-click apply" mechanisms.
- Resume builders, profile optimizers, or portfolio showcases.
- Course catalogs, video hosting, gamification (points/badges), or learning communities.
- Social networking, messaging, or generic career advice.

## 4. User Roles
- **Trainee:** Views their own training progress, verified skills, identified skill gaps, targeted upskilling recommendations, employment outcome, and consent settings.
- **Employer:** Verifies employment outcomes and provides high-level skill-demand feedback. Strictly barred from recruitment, candidate pipelines, ATS features, or job marketplaces.
- **Admin (Government):** Accesses aggregated intelligence on training effectiveness, outcome rates, retention, and systemic skill gaps to drive policy interventions. Resolves conflicting employment data.

## 5. Information Architecture
- **Admin Portal:** Dashboard (High-level trends) → Impact Intelligence (Why is it happening?) → Interventions (Actionable policy steps) → Trainees (Aggregated overview) → Programmes (Performance comparison).
- **Trainee Portal:** Overview (Training & Outcome) → Skill Gaps (Analysis) → Upskilling (Recommendations) → Profile & Consent Settings.
- **Employer Portal:** Dashboard (Workforce snapshot) → Outcome Verification (Confirm employment details) → Skill Feedback (Demand insights). *Boundary: Functionality remains strictly limited to verification and skill-demand feedback.*

## 6. Trainee Journey
1. **Training:** Completes certified skilling programme.
2. **Employment:** Secures a placement or remains seeking.
3. **Follow-up:** Receives automated outcome tracking requests (Day 0/7/14/21), respecting their explicitly audited consent history.
4. **Skill Gaps:** Platform compares their profile to target industry benchmarks.
5. **Recommendations:** Receives targeted upskilling recommendations to bridge identified gaps, if available.
6. **Progress:** Trainee updates their outcome/skills; cycle continues.

## 7. Employer Journey
1. **Dashboard:** Overviews verified employees from state programmes.
2. **Outcome Verification:** Receives requests to verify employment status, salary, and joining date for recent hires.
3. **Skill Feedback:** Flags systemic missing competencies in recent hires (e.g., "Missing advanced Excel").

## 8. Admin Journey
1. **Analytics:** Observes that Cohort X has low placement rates.
2. **Impact Intelligence:** Discovers that Cohort X lacks a critical skill demanded by local employers.
3. **Intervention:** Recommends or provisions an upskilling programme to bridge the gap.
4. **Follow-up:** Monitors resolution via ongoing outcome tracking and conflict resolution between trainee self-reporting and employer verifications.

## 9. Data Model

### `Trainee`
- **Purpose:** Core user record.
- **Fields:** `id`, `personal_info`, `skills`, `target_role`.
- **Target Role Boundary:** `target_role` is purely an industry/skill benchmark pathway for gap calculation. It MUST NOT create job matching, job search, shortlisting, or recruitment.
- **Relationships:** 1:N `ConsentRecord`, 1:N `EmploymentHistory`, 1:N `SkillGap`.
- **Reusability:** Extends existing Trainee schemas.

### `ConsentRecord` (Auditable History)
- **Purpose:** Tracks the historical ledger of trainee permission for data usage/follow-ups.
- **Fields:** `trainee_id`, `status` (`GIVEN`, `REVOKED`, `NOT_GIVEN`), `effective_timestamp`, `version`, `source`.
- **Current State Derivation:** The active consent is dynamically derived from the latest `effective_timestamp` record for the trainee.
- **Follow-up Interaction:** Follow-ups evaluate the currently derived active consent before executing any escalation.

### `EmploymentHistory` & Derived Current Outcome
- **Purpose:** Supports 1:N historical employment records for a trainee, avoiding single mutable overwrite models.
- **Fields:** `trainee_id`, `status` (`EMPLOYED`, `SELF_EMPLOYED`, `APPRENTICESHIP`, `SEEKING_EMPLOYMENT`, `UNKNOWN`), `employer`, `role`, `salary`, `joining_date`, `timestamp`, `verification_state` (`SELF_REPORTED`, `EMPLOYER_VERIFIED`, `ADMIN_VERIFIED`, `CONFLICTING`, `UNVERIFIED`).
- **Conflict Resolution:** If trainee and employer reports differ, the record state becomes `CONFLICTING`. Evidence is not silently overwritten; Admins resolve `CONFLICTING` states.
- **Current State Derivation:** The trainee's "current employment outcome" is dynamically derived from the most recent valid history record.

### `FollowUp` & `FollowUpAttempt` (Audit Trail)
- **Purpose:** Tracks the escalation state machine with a clear 1:N conceptual relationship.
- **`FollowUp` Fields:** `trainee_id`, `status` (`RESOLVED`, `UNRESOLVED`, `PENDING`), `created_at`, `closed_at`.
- **`FollowUpAttempt` Fields:** `follow_up_id`, `stage` (0, 7, 14, 21), `timestamp`, `method`, `actor_or_source`, `result`, `notes`.
- **Rule:** Do not store the entire audit trail only as an opaque array.

### `SkillGap`
- **Purpose:** Deterministic intelligence mapping missing skills against benchmarks.
- **Fields:** `trainee_id`, `target_role`, `skill`, `current_proficiency`, `required_proficiency`, `gap_size` (`required_proficiency` - `current_proficiency`), `priority` (CRITICAL, HIGH, MEDIUM, LOW), `benchmark_source`.

### `UpskillingRecommendation`
- **Purpose:** Actionable training suggestion.
- **Fields:** `gap_id`, `state` (`NO_BENCHMARK`, `NO_MATCHING_PROGRAMME`, `RECOMMENDATION_AVAILABLE`), `recommended_programme`, `provider`, `expected_impact`.

### `GovernmentInsight` & `Intervention`
- **Purpose:** Aggregated metrics and actionable policy steps.
- **Fields:** `metric`, `value`, `cohort`, `suggested_action`.

## 10. API Contract (Proposed)

### Outcomes & Consent
- `GET /api/trainees/{id}/outcome-history` - Fetch historical employment records.
- `GET /api/trainees/{id}/outcome-current` - Derive current confirmed outcome.
- `POST /api/trainees/{id}/outcome` - Append a new outcome record.
- `GET /api/trainees/{id}/consent-history` - Fetch consent audit trail.
- `POST /api/trainees/{id}/consent` - Append new consent state.

### Follow-ups
- `GET /api/follow-ups/pending` - Fetch trainees due for follow-up.
- `POST /api/follow-ups/{id}/attempt` - Record an escalation attempt.

### Intelligence
- `GET /api/trainees/{id}/skill-gaps` - Calculate & return skill gaps dynamically.
- `GET /api/trainees/{id}/recommendations` - Return upskilling suggestions based on gaps.
- `GET /api/analytics/outcomes` - Government aggregated outcome rates.
- `GET /api/analytics/skill-gaps` - Government systemic skill gap trends.

### Employer
- `GET /api/employers/{id}/verifications` - Pending verifications.
- `POST /api/employers/{id}/verify` - Confirm trainee outcome (updates history with `EMPLOYER_VERIFIED` or flags `CONFLICTING`).

## 11. Follow-up State Machine
- **Trigger:** Trainee completes programme.
- **Day 0:** Automated SMS/App notification. If response → append `EmploymentHistory` → mark FollowUp `RESOLVED`.
- **Day 7:** Secondary contact (Training Centre). If response → `RESOLVED`.
- **Day 14:** Employer verification requested (if employed). If response → `RESOLVED`.
- **Day 21:** Assisted Call-Centre escalation.
- **Termination:** If no response at Day 21, mark `FollowUp` as `UNRESOLVED`. The trainee's derived current `EmploymentOutcome` remains the last confirmed state.

## 12. Zero-Fabrication Principle
Whenever required evidence/data is unavailable, the system MUST report that limitation instead of inventing a value, benchmark, recommendation, or outcome. 
- If no target role benchmark exists, `SkillGap` calculation returns `NO_BENCHMARK`.
- If no upskilling maps to a gap, recommendation returns `NO_MATCHING_PROGRAMME`.
- If no response is received, do not invent an outcome status.

## 13. Skill-Gap & Recommendation Algorithm
- **Input:** Trainee's verified skills + `target_role` benchmark requirements.
- **Calculation:** Find skills in the benchmark where `required_proficiency` > `current_proficiency`. The delta is the `gap_size`.
- **Recommendation Logic:** Map `skill` to available `TrainingProgramme`s that teach that specific skill. If mapping is successful, output `RECOMMENDATION_AVAILABLE`. If no programme matches, output `NO_MATCHING_PROGRAMME`.

## 14. Government Analytics Definitions
- **Employment Outcome Rate:** (Trainees dynamically derived as EMPLOYED, SELF_EMPLOYED, APPRENTICESHIP) / (Total certified trainees).
- **Retention:** Continuous employment over a defined period (e.g., V1 Metric: 6 months), allowing for employer/role changes, so long as there is no continuous break exceeding 30 days.
- **Wage Progression:** Average delta between initial joining salary and current salary at 12 months.
- **Skill-Gap Prevalence:** Frequency of a specific missing skill across a cohort.

## 15. Priority Model (Skill Gaps & Interventions)
- **CRITICAL:** High employer demand + High prevalence of gap + Blocks employment.
- **HIGH:** High prevalence + Impacts wage progression.
- **MEDIUM:** Standard technical skill improvement.
- **LOW:** "Nice to have" soft skills or secondary industry tools.

## 16. Data Flows
- **FLOW A (Outcome):** Training completion → Consent check (derive active) → Follow-up Trigger → Trainee/Employer Response → Append `EmploymentHistory` (flag conflicts if necessary).
- **FLOW B (Skilling):** Trainee Skills + Benchmark → Gap Analysis (`required` - `current`) → Priority Calculation → Upskilling Recommendation (obeying Zero-Fabrication).
- **FLOW C (Intelligence):** Derived Outcomes + Gaps → Aggregation Engine → Government Dashboard → Actionable Interventions.

## 17. Authorization Model
- **Trainee:** Read/Write own consent history and personal data. Read own outcomes/gaps/recommendations.
- **Employer:** Read pending verifications for their company. Write verifications. Write anonymous skill feedback.
- **Admin:** Read aggregated, anonymized data globally. Resolve conflicting employment verifications. Write system interventions.

## 18. Demo Data Strategy
- `demo_data.json` will be updated to reflect auditable timelines: trainees with consent histories, trainees in Day 7/14 follow-up states, trainees with unresolved follow-ups but retaining a confirmed historical outcome, conflicting employer vs trainee reports, and diverse skill gaps driving recommendations.

## 19. Low-Cost Architecture Justification
- **Frontend (Vite + React) & Backend (FastAPI):** Retained. Highly performant, requires minimal compute.
- **Database (Firestore / JSON Prototype):** Retained. Avoids expensive managed SQL databases for the prototype phase.
- **State Machine:** Eliminated Kafka/Airflow; implemented via simple cron/scheduled endpoint (`/api/cron/evaluate-followups`).

## 20. Cron Security (`/api/cron/evaluate-followups`)
- **Authentication:** Protected via secret API token validated in middleware.
- **Authorization:** Only system-level authenticated callers can execute.
- **Idempotency:** Re-running the endpoint on the same day must not create duplicate follow-up attempts.
- **Duplicate Protection:** Transactional checks ensure attempt stages are written once per period.
- **Logging:** Full audit trace of execution success/failure and affected records.
- **Failure Handling / Partial Execution:** If a batch fails midway, state is rolled back or cleanly tracked so the next run resumes correctly.

## 21. Deployment Architecture
- **Frontend:** Vercel (Free tier, edge caching).
- **Backend:** Render (Free/Hobby tier, Dockerized FastAPI).
- **Database:** Firebase/Firestore (Generous free tier).

## 22. Failure / Edge-Case Handling
- **No Response:** Derived outcome defaults to last valid historical record. `FollowUp` marked `UNRESOLVED`.
- **No Consent:** Follow-up bypassed completely.
- **Conflicting Info:** `EmploymentHistory` marked `CONFLICTING`. Requires Admin resolution.
- **No Matching Role Data:** `NO_BENCHMARK` explicitly reported.
- **No Matching Training:** `NO_MATCHING_PROGRAMME` explicitly reported.

## 23. Implementation Phases
1. **PHASE 2B:** Employment Outcome + Consent models (Auditable history) & basic APIs.
2. **PHASE 2C:** Follow-up + Escalation logic (Secure cron endpoint + State machine).
3. **PHASE 2D:** Skill Gap Intelligence (Deterministic proficiency calculation).
4. **PHASE 2E:** Recommended Upskilling (Mapping gaps to training with Zero-Fabrication).
5. **PHASE 2F:** Government Analytics (Aggregating new data).
6. **PHASE 2G:** Cross-portal UX integration.
7. **PHASE 2H:** Testing + deployment verification.

## 24. Acceptance Criteria
- **Outcomes:** `EmploymentHistory` supports multiple records; derived state logic works correctly; conflicts are tracked.
- **Consent:** Consent changes create new history records; active consent correctly gates automated follow-ups.
- **Follow-up:** Attempt history (1:N) is fully auditable; unresolved escalation does NOT erase previous employment data.
- **Intelligence:** Recommendations are directly traceable to a calculated skill gap; `NO_BENCHMARK` prevents hallucination.
- **Analytics:** Dashboards successfully aggregate the new outcome derived states and retention definitions.
- **Cron:** Scheduled job is secure, idempotent, and gracefully handles partial failures.

## 25. Architecture Freeze Before Implementation
**CRITICAL RULE:** Phase 2B implementation must begin ONLY after this Architecture Specification document has been fully reviewed and approved. No code changes, schema definitions, or API modifications may commence until this freeze is lifted.

## 26. Testing Strategy
- **Unit Tests:** For skill-gap algorithm (proficiency deltas), priority calculation, history derivation, and state machine transitions.
- **Integration Tests:** For the secure follow-up cron endpoint to ensure idempotency, partial execution handling, and correct history appending.
- **E2E Tests:** Browser smoke tests for the new Trainee/Admin UX flows.

## 27. Known Limitations
- Relying on a basic cron endpoint for state transitions means if the server is asleep (Render free tier), cron triggers might be delayed.
- Demo data will use hardcoded industry benchmarks rather than a live external API.

## 28. Future Expansion Boundaries
- Integration with National IDs for automated employment verification (e.g., EPFO integration).
- Machine Learning models for predictive skill gap analysis based on macroeconomic trends.
