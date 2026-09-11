# PHASE_2D_IMPLEMENTATION_PLAN.md

## 1. Executive Summary
Phase 2D introduces deterministic Skill Gap Identification and Targeted Recommended Upskilling. The platform will compare a trainee's verified skill evidence against an occupational benchmark (the target role) to identify skill gaps, prioritize them deterministically, and map them to existing training programmes. True to the strict product boundaries, this is purely an intelligence and upskilling capability. We explicitly enforce the **ZERO FABRICATION RULE**: the system will not invent proficiencies, hallucinate gaps, or simulate generic labour-market statistics. It will also firmly prohibit the reintroduction of job portal, ATS, candidate matching, or recruitment workflows.

## 2. Repository Audit
An audit of the current repository state (including the uncommitted Phase 2D working tree from previous execution) reveals:
- **Backend**: `SkillAssessmentBase` accurately tracks verifiable evidence. `JobBase` serves as the occupational benchmark. `ProgrammeBase` tracks skills taught and target levels. The `calculate_3way_skill_gap` legacy engine has been removed. A clean `SkillGapService` exists.
- **Frontend**: `TraineeSkillGaps` and `TraineeRecommendations` have been constructed as clinical intelligence dashboards avoiding LMS/Course Marketplace terminology.
- **Data**: Synthetic demo data is configured to exhibit states of verified gaps, insufficient evidence, missing benchmarks, and missing recommendations.

## 3. Existing vs Missing Capabilities
- **Trainee Target Role Benchmark**: EXISTS AND CORRECT
- **Deterministic Gap Engine**: EXISTS AND CORRECT (Implemented via `SkillGapService`)
- **Legacy Job Matching (`calculate_3way_skill_gap`)**: MUST BE REMOVED (And has been fully purged)
- **Null / Missing Evidence State Handling**: EXISTS AND CORRECT (Outputs explicit states rather than hallucinated fallback scores)
- **Programme Recommendation Mapping**: EXISTS AND CORRECT 
- **Frontend Clinical UI**: EXISTS AND CORRECT 

## 4. Architecture
The architecture centers entirely around the `SkillGapService` acting as the single, authoritative deterministic engine. 
**Flow:**
`Trainee` → `JobBase` (Benchmark) → `SkillAssessmentBase` (Verified Evidence) → `SkillGapService` → `ProgrammeBase` (Recommendation Mapping) → UI.
There are no async queues, LLMs, or secondary pipelines utilized for the core gap algorithm.

## 5. Data Model
- **Trainee Evidence**: `SkillAssessmentBase.proficiency_score` (verified) vs `TraineeBase.skills` (unverified text strings).
- **Occupational Benchmark**: `JobBase.skills_required` (which specifies `required_level` and `importance`).
- **Programme Skills**: `ProgrammeBase.skills_taught_structured` (specifies `target_level`).
- **New Structures**: `SkillGapBase` (using `Optional[int]` for gap/proficiency to support explicit missing states) and `UpskillingRecommendation`.

## 6. Algorithm
The Skill Gap Engine operates strictly as follows for each skill in the benchmark:
1. `required_proficiency` = Benchmark requirement.
2. Locate `verified_current_proficiency` from the Trainee's `SkillAssessmentBase` using exact `skill_id` match.
3. **If verified evidence exists:** `gap_size = required_proficiency - verified_current_proficiency`. If `gap_size <= 0`, no gap is emitted.
4. **If no assessment exists but the skill exists in the unverified trainee profile:** Set `gap_size` = `None` and `evidence_state` = `INSUFFICIENT_SKILL_EVIDENCE`.
5. **If skill is completely absent:** Set `gap_size` = `None` and `evidence_state` = `NO_EVIDENCE`.
**CRITICAL:** At no point will the engine fall back to fabricating a baseline score (e.g., 20/100). The state is preserved explicitly.

## 7. Priority Model
Deterministic V1 priority relies on `gap_size` and benchmark `importance` (0.0 - 1.0) without simulating external labour market demand.
- **CRITICAL**: `gap_size >= 40` AND `importance >= 0.8`
- **HIGH**: `gap_size >= 20` AND `importance >= 0.6`
- **MEDIUM**: `gap_size > 0` AND `importance >= 0.4`
- **LOW**: All other verified gaps > 0.
- Unverified gaps (`NO_EVIDENCE`, `INSUFFICIENT_SKILL_EVIDENCE`) defer to `UNKNOWN` priority.

## 8. Recommendation Engine
1. Iterate through `SkillGap`s. 
2. Match against `ProgrammeBase.skills_taught_structured` via `skill_id`.
3. Evaluate if `Programme.target_level >= required_proficiency`.
4. Emit `RECOMMENDATION_AVAILABLE`.
5. If no target role exists, state is `NO_BENCHMARK`.
6. If no programme teaches the skill at the required level, state is `NO_MATCHING_PROGRAMME`.

## 9. API Contracts
- `GET /api/trainees/{trainee_id}/skill-gaps`
  - Auth: Trainee Token matching ID.
  - Returns `SkillGapResponse` mapping benchmarks to gap calculations.
- `GET /api/trainees/{trainee_id}/recommendations`
  - Auth: Trainee Token matching ID.
  - Returns `UpskillingRecommendationResponse` mapping gaps to programmes.
- Employer access to individual trainees is strictly returning 403 Forbidden.

## 10. Frontend UX
The UI provides two distinct views:
1. **Skill Gaps**: Analytical presentation of "Current vs Required" proficiencies. Explicit rendering of "Not Assessed" when `NO_EVIDENCE` is present.
2. **Recommended Upskilling**: A targeted, prescriptive mapping showing which programme addresses which specific skill gap.
- **Prohibited UI**: "Apply Now", "Job Match", "Candidate Search", "Course Marketplace". 

## 11. Admin Integration Boundary
The individual deterministic data created in Phase 2D will serve as the structured bedrock for future Admin Aggregations (Phase 2F). Admin dashboards will query these structured outputs (e.g., aggregating the most frequent `NO_MATCHING_PROGRAMME` states to advise government program creation) without violating individual trainee privacy boundaries.

## 12. Security
- Trainee isolation enforced via `ensure_trainee_access` dependency.
- Employers completely blinded from viewing individualized granular assessment gap data.
- Read-only queries for gaps ensure benchmark and programme configurations cannot be tampered with by the end-user.

## 13. Performance
The engine relies on standard dictionary indexing of `SkillAssessmentBase` arrays and `ProgrammeBase` catalogs in-memory. Given the bounded nature of an individual's skill profile, the calculation runs in O(N) time with minimal database operations. No heavyweight infrastructure (Kafka, ES) is needed.

## 14. Demo-Data Strategy
Synthetic data ensures complete coverage of all logical branches:
1. Trainee with verified positive gap.
2. Trainee matching benchmark exactly (zero gap).
3. Trainee with `NO_EVIDENCE`.
4. Trainee with `NO_BENCHMARK`.
5. Target skill pointing to `NO_MATCHING_PROGRAMME`.
6. Target skill mapping to `RECOMMENDATION_AVAILABLE`.

## 15. Test Strategy
Extensive Pytest implementation covers:
- Core `SkillGapService` gap extraction and nullability propagation.
- All priority brackets.
- Missing and Insufficient evidence edge cases.
- Missing target role degradation.
- No matching programme degradation.
- API Route Trainee isolation and authorization controls.

## 16. Removed-Feature Regression Checks
Search executed across the repository validating zero instances of:
- `calculate_3way_skill_gap`
- `match_trainee_to_job`
- Candidate matching logic
- ATS pipelines
- Resume tracking

## 17. Exact Files to Modify
- `Backend/app/schemas/trainee.py`
- `Backend/app/schemas/skill.py`
- `Backend/app/services/skill_gap_service.py` (New)
- `Backend/app/routers/trainees.py`
- `Backend/app/routers/skills.py`
- `Backend/app/routers/jobs.py`
- `Backend/app/firebase/repository.py`
- `Backend/tests/test_skill_gaps.py` (New)
- `Backend/seed_demo_data.py`
- `Backend/generate_json_demo.py`
- `Frontend/src/pages/Trainee/TraineeSkillGaps.jsx` (New)
- `Frontend/src/pages/Trainee/TraineeRecommendations.jsx` (New)
- `Frontend/src/App.jsx`
- `Frontend/src/pages/Trainee/TraineeLayout.jsx`

## 18. Exact Files Not to Modify
- Phase 2A Outcome telemetry tracking.
- Phase 2B Consent enforcement logic.
- Phase 2C Escalation logic (`test_phase2c_followup.py`).
- Shared analytical logic disconnected from individualized skill gap tracking.

## 19. Implementation Sequence
*(Note: As audited, the implementation is already staged in the uncommitted Git working tree)*
1. Refactor Schemas (support explicit nullability for states).
2. Clean out legacy job matching artifacts.
3. Build `SkillGapService` engine.
4. Implement API routes.
5. Apply security authorization boundaries.
6. Build frontend clinical intelligence pages.
7. Execute integration tests.

## 20. Acceptance Criteria
- Deterministic output without fallback 20/100 scoring.
- Exact tracking of missing evidence explicitly (Zero fabrication).
- Elimination of all ATS / Job Board logic.
- Recommendations solely trace back to specific calculated gaps.

## 21. Risks
- Misalignment in synthetic demo data preventing valid recommendations from surfacing to the frontend. (Mitigated by explicit deterministic linking in `seed_demo_data.py`).

## 22. Rollback Strategy
- Immediate `git reset --hard` / `git checkout` on the target branch since database schemas only involve optional non-breaking field additions.
