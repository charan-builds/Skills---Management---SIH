# PHASE 2H STAGE D: DEFECT REMEDIATION PLAN

## 1. Defect Inventory & Affected Files

### Defect 1: Hardcoded Programme Analytics
- **Affected File:** `Frontend/src/pages/Programmes.jsx`
- **Affected UI Flows:** Programme Performance Center (Cards, Table, and Compare views).
- **Description:** The UI merges live data from `/api/programmes` with a static mock object or injects default fabricated metrics (e.g., `completion_rate: 0`, `certification_rate: 0`, `avg_assessment_score: 0`, `avg_skill_gain: "+0%"`, `health_status: "Fair"`).

### Defect 2: Fabricated "What-If" Interventions Simulator
- **Affected File:** `Frontend/src/pages/Interventions.jsx`
- **Affected UI Flows:** What-If Policy & Curriculum Simulator.
- **Description:** The `handleRunSimulation` function uses purely arbitrary frontend mathematics (e.g., `40 - Math.round(increaseAmount * 0.8)`) to generate quantitative predictions for `baseline_gap`, `estimated_roi`, and `projected_employment_boost` based on user slider inputs.

### Defect 3: Fallback Demo Trainees & Mock Attributes
- **Affected File:** `Frontend/src/pages/Trainees.jsx`
- **Affected UI Flows:** Trainee Registry & Skill Profile.
- **Description:** A large static array `demoTraineesList` is used to populate the table if the API returns empty, and is used to inject non-existent metrics like `assessment_score` into live trainee records.

### Defect 4: Orphaned/Mock Dashboard Views
- **Affected File:** `Frontend/src/pages/Dashboard.jsx`
- **Affected UI Flows:** Programme Health & Performance Summary (Table at bottom).
- **Description:** Attempts to display a programme scorecard expecting the same unsupported mock metrics (`completion_rate`, `avg_assessment_score`) as `Programmes.jsx`. (The state `programmes` is currently never populated from the API here).

## 2. Root Cause
The React frontend retains legacy UI structures designed during a pure-mock demo phase (e.g., Phase 1). The frontend attempts to force the live Firestore data to fit this visually dense, fully populated UI by inventing values where the backend API (rightfully) does not supply them, in direct violation of the Zero-Fabrication Principle.

## 3. Specification Evidence
According to `PHASE_2_PRODUCT_ARCHITECTURE.md`:
- **Section 12 (Zero-Fabrication Principle):** "Whenever required evidence/data is unavailable, the system MUST report that limitation instead of inventing a value, benchmark, recommendation, or outcome."
- **Section 14 (Government Analytics Definitions):** Explicitly limits the defined metrics to Employment Outcome Rate, Retention, Wage Progression, and Skill-Gap Prevalence.
- **Section 8 & 9 (Interventions):** Interventions are defined as "actionable policy steps" (e.g., "Recommend or provision an upskilling programme to bridge the gap") derived from `GovernmentInsight`. There is no specification for a quantitative, predictive "What-If" ROI simulator.
- **Section 9 (Trainee):** The Trainee data model does not include an "assessment_score" or "certification_rate".

## 4. Metric Mapping & Authoritative Sources

| Metric | UI Location | Authoritative Source (Backend) | Supported? |
| :--- | :--- | :--- | :--- |
| Enrolled Trainees | Programmes.jsx | `/api/programmes` -> `trainees` | Yes |
| Employment Rate | Programmes.jsx | `/api/programmes` -> `employment` | Yes |
| 12-Month Retention | Programmes.jsx | `/api/programmes` -> `retention` | Yes |
| Completion Rate | Programmes.jsx / Dashboard.jsx | *None* | **No** |
| Certification Rate | Programmes.jsx / Dashboard.jsx | *None* | **No** |
| Avg Assessment Score | Programmes.jsx / Dashboard.jsx / Trainees.jsx | *None* | **No** |
| Avg Skill Gain | Programmes.jsx | *None* | **No** |
| Health Status | Programmes.jsx / Dashboard.jsx | *None* | **No** |
| Projected ROI | Interventions.jsx | *None* | **No** |
| Employment Boost | Interventions.jsx | *None* | **No** |

## 5. Recommended Remediation
**Primary Approach: Option C (Removal of unsupported functionality) combined with Option A (Frontend-only correction).**

Do NOT invent backend APIs or database fields to support these legacy UI elements.

**Specific Actions:**
1. **Programmes.jsx**: 
   - Remove the `allProgrammes` static mock array.
   - Remove the fallback object injection in the `useEffect`.
   - Update the UI (Cards, Table, Compare) to exclusively display `name`, `provider`, `district`, `enrolled`, `employment_rate`, and `retention_12m`.
   - Remove visual elements referencing `health_status`, `completion_rate`, `certification_rate`, `avg_assessment_score`, and `avg_skill_gain`.
2. **Interventions.jsx**: 
   - Delete the "Interactive Intervention Scenario Builder" (the slider and `handleRunSimulation` logic) and the "Simulation Projected Impact Dashboard" entirely.
   - Retain ONLY the "Executive Policy Interventions Queue" which legitimately pulls `actions` from the backend (or wire it to do so if it currently relies on mocks).
3. **Trainees.jsx**: 
   - Delete `demoTraineesList`.
   - Map only authoritative fields from `/api/trainees` (`name`, `course_name`, `district`, `status`, `skills`, `outcome`).
   - Remove the `assessment_score` column and visual pill.
4. **Dashboard.jsx**:
   - Remove the "Programme Health & Performance Summary" table entirely, as it attempts to display unsupported metrics and is redundant to the `Programmes.jsx` view.

## 6. Proposed Acceptance Criteria
- All visual mentions of `completion_rate`, `certification_rate`, `assessment_score`, `skill_gain`, `health_status`, and `What-If ROI` are absent from the frontend.
- `Programmes.jsx` successfully renders using only authoritative `/api/programmes` data.
- `Trainees.jsx` successfully renders using only authoritative `/api/trainees` data.
- No `demoTraineesList` or static mock arrays exist in the React components.
- The UI gracefully displays empty states if the backend returns no data, without falling back to demo objects.

## 7. Regression Risks & Tests Required
- **Risk:** Removing fields from React components might cause `undefined` runtime errors in sorting, filtering, or mapping logic that previously relied on mock fields being present.
- **Tests Required:**
  - E2E flow test for `Programmes.jsx` (ensuring sort/filter works with only `employment_rate` and `enrolled`).
  - E2E flow test for `Trainees.jsx` (ensuring search/filter works without `assessment_score`).
  - Verify `Interventions.jsx` loads without crashing and accurately lists backend `actions`.
