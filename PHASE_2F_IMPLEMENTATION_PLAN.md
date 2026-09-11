# PHASE_2F_IMPLEMENTATION_PLAN.md

## 1. Repository Audit
The current repository implements rudimentary admin dashboards with significant architectural conflicts against the hardened Phase 2 bounds. 
- **Analytics endpoints**: `/api/analytics/dashboard` and `/api/analytics/skill-gaps` exist.
- **Analytics services**: `RetentionIntelligenceEngine` is used for retention.
- **Components**: `Dashboard.jsx`, `SkillGaps.jsx`, `ImpactIntelligence` components.
- **Exports**: Handled entirely on the frontend (React CSV generation) with no backend validation.
- **Privacy Controls**: Admin role `get_admin_user` protects the route, but no minimum cohort thresholds prevent isolating individuals.
- **Individual Exposure**: Dashboard exposes explicit `Trainee ID` in the pending follow-ups section.

## 2. Existing Analytics
- **Employment Rate**: Calculated as `Employed + Self-Employed + Apprentice / Certified`.
- **Retention Rate**: Leverages `RetentionIntelligenceEngine` securely.
- **Wage Progression**: Calculates simple average of all employment history vs a hardcoded baseline (`15000.0`).
- **Skill Gaps**: Evaluates raw employer feedback and compares `skills_required_in_job` to `skills_taught`.

## 3. Conflicts Found
1. **Skill Gap Logic**: `analytics.py` and `SkillGaps.jsx` completely ignore the deterministic Phase 2D `SkillGapService`. They manually calculate gaps using raw employer feedback, violating the verified evidence rule.
2. **Frontend Mock Data**: `SkillGaps.jsx` contains massive blocks of hallucinated fallback data (e.g., `avg_proficiency: 75`, `priority: "High"`), violating the Zero Fabrication boundary.
3. **Frontend Exports**: `Dashboard.jsx` generates CSVs directly in the browser, bypassing backend authorization and privacy checks.
4. **Hardcoded Wage Baselines**: Wage progression is compared against an arbitrary `15000.0` rather than the trainee's verified pre-training wage or a legitimate dynamic baseline.
5. **No Minimum Cohort Threshold**: Filtering down to a single person (e.g. 1 Trainee in a specific cohort/district combination) allows their outcome, wage, and retention to be mathematically exposed.

## 4. Authoritative Metric Definitions
- **Total Trained**: All registered trainees in the filtered cohort.
- **Total Certified**: Trainees with `status == "Certified"`.
- **Employment Rate**: `(Employed + Self-Employed + Apprentice) / Total Certified`. Null if `Total Certified == 0`.
- **Employment Status**: Extracted from the most recent verified placement record. Unresolved follow-ups do NOT erase historical verified employment.
- **Retention**: Follows the `RetentionIntelligenceEngine` strict rules (3m, 6m, 12m checkpoints with valid denominators).
- **Wage Progression**: Average wage of current cohort minus baseline wage (derived from entry records or dynamic cohort average, NEVER hardcoded), divided by baseline. Min sample size required.
- **Skill Gaps**: Aggregated strictly from the Phase 2D `calculate_skill_gaps` verified engine.

## 5. Data Sources
- **Trainee Collection**: For demographic, status, and baseline data.
- **Placement Records / Outcomes**: For employment, wage, and retention checkpoints.
- **Skill Assessments**: The sole verified source for current proficiency.
- **Job / Benchmark Roles**: For required proficiency.
- **Programmes**: For skills taught and metadata.

## 6. Privacy Model
- **Admin Authorization**: All endpoints protected by `get_admin_user`.
- **Minimum Cohort Threshold**: Analytics logic must suppress (return `INSUFFICIENT_DATA`) for any metric where the denominator < 5 trainees, to prevent PII derivation.
- **No Individual Exposure**: Remove `Trainee ID` from aggregate dashboards unless explicitly part of an authorized drill-down context with specific purpose (e.g. case management, which is technically Phase 2A/2B).

## 7. API Design
Refactor existing endpoints and introduce formal contracts:
- `GET /api/analytics/overview` (Key KPIs: Employment, Retention, Wages)
- `GET /api/analytics/skill-gaps` (Refactored to consume Phase 2D outputs)
- `GET /api/analytics/programmes` (Programme evaluation)
- **Filters supported**: `district`, `course_name`, `provider`, `cohort`, `date_from`, `date_to`.
- **States**: Return `null` or explicit constants (`INSUFFICIENT_DATA`) rather than `0` when evidence is missing.

## 8. Frontend Design
- Remove all fallback/mock data from `SkillGaps.jsx` and `Dashboard.jsx`.
- Implement safe rendering for `null` or `INSUFFICIENT_DATA` (e.g. rendering "Not Enough Data" instead of "0%").
- Dashboard charts and tables must reflect exact backend aggregation logic.
- Remove frontend CSV generation.

## 9. Export Design
- New Endpoint: `GET /api/analytics/export` returning an Excel/CSV stream.
- Protected by `get_admin_user`.
- Applies the exact same Minimum Cohort Threshold (suppressing cells with < 5 trainees).
- Logs export requests to an audit log.

## 10. Test Matrix
1. **Empty dataset**: Returns nulls/safely.
2. **Normal dataset**: Correct metrics calculated.
3. **Small cohort/privacy case**: Denominator < 5 returns `INSUFFICIENT_DATA`.
4. **Missing wage data**: Wage progression evaluates safely.
5. **Phase 2D regression**: Skill gap aggregation matches Phase 2D verified outputs.
6. **Frontend export disabled**: Verified API handles export.
7. **Export authorization**: Unauthorized users receive 403/401.

## 11. Acceptance Criteria
- **Zero Fabrication**: Frontend mock data is deleted. No hardcoded baselines.
- **Privacy**: Cohorts < 5 do not expose averages or rates.
- **Phase 2D Integration**: Skill gap analytics are fundamentally bound to `SkillGapService` outputs.
- **Historical Employment**: Unresolved follow-ups do not overwrite past verified placements.
- **Secure Export**: Exports are backend-driven and audited.
- **No Legacy Conflicts**: `calculate_3way_skill_gap` logic and old employer feedback interpolations are purged.

## 12. Planned Files to Change
- `Backend/app/routers/analytics.py`
- `Backend/app/services/analytics_service.py` (NEW - moving logic out of router)
- `Backend/app/schemas/analytics.py`
- `Frontend/src/pages/Dashboard.jsx`
- `Frontend/src/pages/SkillGaps.jsx`
- `Backend/tests/test_analytics.py` (NEW - robust testing for the 24 scenarios)
- `Backend/tests/test_api.py`

## 13. Risks/Unknowns
- The shift to strict Minimum Cohort Thresholds (N >= 5) might cause dashboards to appear "empty" in small demo environments or early deployments. We must ensure UI clearly communicates *why* the data is suppressed.
- Calculating Phase 2D skill gaps aggregately across thousands of trainees could be computationally heavy. Caching or batch-processing may be necessary for `GET /api/analytics/skill-gaps`.

## 14. Confirmation
**NO CODE WAS CHANGED.** This is the culmination of Stage 1 Planning and Architecture for Phase 2F.
