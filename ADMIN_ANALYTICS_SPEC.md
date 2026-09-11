# Skilling Impact Intelligence Platform — Admin Analytics & Metric Specification

**Document Version:** 2.0 (Authoritative Technical Specification)  
**Standard:** National Skilling Framework • Impact Intelligence  
**Dataset Reference:** 800 Relational Longitudinal Trainees  
**Architecture:** `UI -> FilterContext -> platformService.js -> mockStore.js -> Relational Records`  

---

## 1. Core Analytics Principles & Architectural Invariants

1. **Deterministic Traceability:** Every metric displayed on the Admin portal derives from the filtered subset of the 800 relational trainees.
2. **Zero ≠ No Data:** 
   - When a denominator is valid and positive, a zero numerator produces a mathematically legitimate `0%`.
   - When the filtered scope produces zero records, the platform displays an explicit **No Data State** (`"No data available for selected scope"`).
3. **DPDP Privacy Protection ($N < 5$ Threshold):**
   - When a specific intersection of filters yields fewer than 5 records ($1 \le N < 5$), microdata and sensitive wage curves are suppressed under an **Insufficient Data State** to protect trainee privacy.
4. **Error Resilience:** Service exceptions or network failures render an **Error State** with an interactive **Retry** action that re-executes the scoped query.
5. **Interactive Drilldown Mandate:** Every analytical card, funnel stage, and chart bar supports drilldown into the underlying candidate cohort filtered strictly under the current active scope.

---

## 2. Global Analytical Filter Bar (Section 9 & 10)

The Global Filter Bar resides at the top of the Admin layout and dictates the analytical scope across all subordinate views.

| Dimension | Filter Key | Data Type | Options | Default |
| :--- | :--- | :--- | :--- | :--- |
| **Cohort** | `cohort` | String | `All Cohorts`, `2024-Q1`, `2023-Q4`, `2023-Q3`, `2023-Q2` | `""` (All) |
| **Programme** | `course` | String | `All Programmes`, 5 accredited courses | `""` (All) |
| **Provider** | `provider` | String | `All Providers`, 5 vocational training partners | `""` (All) |
| **District** | `district` | String | `All Districts`, 6 administrative districts | `""` (All) |
| **Gender** | `gender` | String | `All Genders`, `Female`, `Male`, `Other` | `""` (All) |
| **Age Group** | `ageGroup` | String | `All Ages`, `18-21`, `22-25`, `26-30`, `31+` | `""` (All) |
| **Category** | `category` | String | `All Categories`, `General`, `OBC`, `SC`, `ST` | `""` (All) |

- **State Indication:**
  - Active Scope Badge: Displays exact count and percentage of state population:  
    `"{N} / 800 Trainees in Scope ({Pct}%)"`
  - Quick Reset: `Clear All Filters ({count})` restores the global population.
  - Intersection Semantics: Evaluated as a strict logical `AND` across all active dimensions.

---

## 3. Detailed Metric & Visualization Specifications

### 3.1 Executive KPI Section (Section 12.1)
- **Route:** `/admin`
- **Method:** `platformService.getAdminDashboard(filters)`

| Metric Card | Source Entity | Formula / Calculation | Drilldown Behavior | Supported States |
| :--- | :--- | :--- | :--- | :--- |
| **Total Trained** | `trainees` | $N_{\text{scoped}}$ | Opens candidate list for all scoped trainees | Loading, Available, No Data, Insufficient Data, Error |
| **Certified** | `trainees` | $\sum (\text{certified} == \text{true})$ | Shows certified trainees with assessment scores | Loading, Available, No Data, Insufficient Data, Error |
| **Placed** | `employment_records` | $\sum (\text{status} \in \{\text{'EMPLOYED'}, \text{'APPRENTICESHIP'}\})$ | Shows formally placed candidates with employer names | Loading, Available, No Data, Insufficient Data, Error |
| **Employment Rate** | `employment_records` | $\frac{\text{Employed} + \text{SelfEmployed} + \text{Apprentices}}{N_{\text{scoped}}} \times 100$ | Opens economically engaged candidate cohort | Loading, Available, No Data, Insufficient Data, Error |
| **Self-Employed** | `employment_records` | $\sum (\text{status} == \text{'SELF_EMPLOYED'})$ | Shows entrepreneurial candidates with trade titles | Loading, Available, No Data, Insufficient Data, Error |
| **Apprentices** | `employment_records` | $\sum (\text{status} == \text{'APPRENTICESHIP'})$ | Shows industrial contract trainees with host company | Loading, Available, No Data, Insufficient Data, Error |
| **Unemployed** | `employment_records` | $\sum (\text{status} == \text{'UNEMPLOYED'})$ | Opens candidate roster seeking placement assistance | Loading, Available, No Data, Insufficient Data, Error |
| **6M Retention** | `retention_records` | $\frac{\sum (\text{retention\_6m} == \text{'Retained'})}{N_{\text{eligible\_6m}}} \times 100$ | Shows candidates sustained in employment at 6 months | Loading, Available, No Data, Insufficient Data, Error |
| **Average Wage** | `wage_history` | $\frac{\sum \text{current\_wage}}{N_{\text{wage\_positive}}}$ | Shows wage earner distribution and starting vs current | Loading, Available, No Data, Insufficient Data, Error |
| **Follow-up Rate** | `follow_up_records` | $\frac{\sum (\text{status} == \text{'Completed'})}{N_{\text{scheduled\_followups}}} \times 100$ | Shows verified post-placement outreach records | Loading, Available, No Data, Insufficient Data, Error |

---

### 3.2 Outcome Funnel (Section 12.2)
- **Route:** `/admin`
- **Method:** `platformService.getOutcomeFunnel(filters)`
- **Funnel Stages:**
  1. **Stage 1 (Trained):** Total scoped cohort size ($100\%$).
  2. **Stage 2 (Certified):** Passed assessment and certified ($\% \text{ of Stage 1}$).
  3. **Stage 3 (Placed - Formal Job):** Formal payroll employment ($\% \text{ of Stage 1}$).
  4. **Stage 4 (Self-Employed):** Independent trade / entrepreneurial venture ($\% \text{ of Stage 1}$).
  5. **Stage 5 (Apprenticeship):** Dual-education and NATS contracts ($\% \text{ of Stage 1}$).
  6. **Stage 6 (Unemployed / Seeking):** Certified but unabsorbed ($\% \text{ of Stage 1}$).
- **Interactivity:** Clicking any stage card opens a slide-over **Drilldown Inspection Drawer** populated with the candidates in that exact stage under current filters, complete with live search.

---

### 3.3 Longitudinal Employment Outcome Tracking (Section 13)
- **Route:** `/admin/employment`
- **Method:** `platformService.getLongitudinalTracking(filters)`
- **Chart Type:** Multi-series Smoothed Line Chart with Data Points.
- **Checkpoints:**
  - Day 1 (Immediate Placement Velocity)
  - 3 Months Post-Joining
  - 6 Months Post-Joining (Critical State Milestone)
  - 12 Months Post-Joining (Sustained Employment)
- **Metrics Computed:**
  - `Employment Rate %`: $\frac{\text{Employed}(t)}{N_{\text{scoped}}} \times 100$
  - `Formal Retention %`: $\frac{\text{Retained}(t)}{N_{\text{placed}}} \times 100$
- **Data States:**
  - Suppressed if $N < 5$ (Insufficient Data).
  - Empty curve if $N = 0$ (No Data).

---

### 3.4 Wage Progression Analytics (Section 14)
- **Route:** `/admin/employment`
- **Method:** `platformService.getWageProgression(filters)`
- **Chart Type:** Clustered Bar / Progression Line Chart.
- **Observations:**
  - Day 1 (Starting Wage): Mean starting salary across placed cohort.
  - 3-Month Checkpoint: Average verified monthly wage.
  - 6-Month Checkpoint: Average verified monthly wage + percentage increment.
  - 12-Month Checkpoint: Average verified monthly wage + cumulative wage growth.
- **Traceability:** Computed from `wage_history` records linked to verified EPFO / Form 16 logs.

---

### 3.5 Retention Benchmarks (Section 14 & 28)
- **Route:** `/admin/employment`
- **Method:** `platformService.getRetentionMetrics(filters)`
- **Indicators:**
  - `3M Retention Rate`: Benchmark comparison against 70% National Target.
  - `6M Retention Rate`: Benchmark comparison against 60% Key Funding Target.
  - `12M Retention Rate`: Sustained longitudinal career trajectory.

---

### 3.6 Skill Gap Analysis (Section 15)
- **Route:** `/admin/skill-gaps` (Tab 1)
- **Method:** `platformService.getSkillGaps(filters)`
- **Data Sources:** Dual aggregation of Trainee Self-Reports + Employer Evaluation Feedback.
- **Chart Type:** Horizontal Ranked Bar Chart (Frequency of Citations).
- **Columns in Ranked Table:**
  - Skill Deficit Title
  - Total Affected Trainees
  - Trainee Citations
  - Employer Citations
  - Severity Ratio
  - Affected Programmes
- **Drilldown:** Clicking any skill bar or table row opens the **Affected Programme & Candidate Breakdown Modal**, showing affected courses, citations, and anonymized trainee rosters.

---

### 3.7 Demand vs Supply Intelligence (Section 16)
- **Route:** `/admin/skill-gaps` (Tab 2)
- **Method:** `platformService.getDemandVsSupply(filters)`
- **Columns:**
  - Evaluated Skill Competency
  - Annual Vocational Supply ($S$)
  - Industrial Employer Demand ($D$)
  - Net Market Gap ($\Delta = D - S$)
  - Priority Classification (`Critical Shortage`, `Moderate Shortage`, `Balanced`, `Oversupply`)
  - Strategic Recommended Action

---

### 3.8 Curriculum → Skill Mapping (Section 17)
- **Route:** `/admin/skill-gaps` (Tab 3)
- **Method:** `platformService.getCurriculumMapping(filters)`
- **Hierarchy:** `Programme -> Instructional Module -> Core Competency -> Target Score -> Observed Score -> Delta`.
- **Interactivity:** Programme selector filters the syllabus hierarchy in real time, highlighting modules requiring pedagogical review.

---

### 3.9 Training Relevance Quadrant Analysis (Section 18)
- **Route:** `/admin/skill-gaps` (Tab 4)
- **Method:** `platformService.getTrainingRelevance(filters)`
- **Quadrant Classifications:**
  1. **Optimal Value:** High Placement ($\ge 70\%$) + High Skill Relevance ($\ge 75\%$).
  2. **Technical Excellence / Low Placement:** Low Placement ($< 70\%$) + High Skill Relevance ($\ge 75\%$) (Requires employer linkages).
  3. **High Placement / Low Technical Relevance:** High Placement ($\ge 70\%$) + Low Skill Relevance ($< 75\%$) (Curriculum misalignment risk).
  4. **Critical Redesign:** Low Placement ($< 70\%$) + Low Skill Relevance ($< 75\%$).

---

### 3.10 Non-Placement Analysis (Section 19)
- **Route:** `/admin/outcomes`
- **Method:** `platformService.getNonPlacementReasons(filters)`
- **Root-Cause Categories:**
  - Location / Transport Constraints
  - Wage Expectation Mismatch
  - Pursuing Higher Education
  - Family / Personal Constraints
  - Technical Interview Skill Deficit
  - Medical / Health Reasons
- **Drilldown:** Single-click on any category bar or pill immediately filters and displays candidate dossiers matching that specific blocker under active scope.

---

### 3.11 Post-Placement Attrition Drivers (Section 20)
- **Route:** `/admin/outcomes`
- **Method:** `platformService.getAttritionReasons(filters)`
- **Root-Cause Categories:**
  - Better Opportunity / Lateral Move
  - Low Initial Compensation
  - Workplace Skill Expectation Mismatch
  - Relocation / Transport Issues
  - Working Conditions / Shift Timings
  - Fixed-Term Contract Expiration
  - Personal Reasons
- **Drilldown:** Single-click drilldown inspects attrited candidates, showing previous employer, resignation checkpoint, and contact notes.

---

### 3.12 Provider Accountability Table (Section 21)
- **Route:** `/admin/providers`
- **Method:** `platformService.getProviderAccountability(filters)`
- **Columns (All Sortable Ascending / Descending):**
  - Provider Name & Model
  - Total Trainees Enrolled in Scope
  - Completion Rate (%)
  - Certification Pass Rate (%)
  - Placement Velocity (%)
  - 6-Month Sustained Retention (%)
  - Average Wage Growth (%)
- **Actions:**
  - `Inspect Dossier`: Opens full provider evaluation modal.
  - `Set as Scope`: Directly sets global provider filter to this training organization.

---

### 3.13 District Analytics (Section 22)
- **Route:** `/admin/districts`
- **Method:** `platformService.getDistrictAnalytics(filters)`
- **Presentations:**
  1. Regional Performance Cards Grid (Geographic cluster cards with placement and retention).
  2. Comprehensive District Table with Top Identified Local Skill Gap.
- **Drilldown:** Clicking any district card filters and displays candidate dossiers within that geographic region.

---

### 3.14 Cohort Comparison Matrix (Section 23)
- **Route:** `/admin/cohorts`
- **Method:** `platformService.getCohortAnalytics(filters)`
- **Comparison Visualizations:**
  1. Multi-metric Clustered Bar Chart (Placement vs Completion vs Retention).
  2. Cross-cohort Longitudinal Trend Chart.
  3. Comprehensive Comparative Data Table.

---

### 3.15 Programme Evaluation (Section 24)
- **Route:** `/admin/programmes/:programmeId`
- **Method:** `platformService.getProgrammeEvaluation(programmeId, filters)`
- **360-Degree Views:**
  - Enrolment & Completion KPIs
  - 6-Stage Longitudinal Funnel
  - 12-Month Wage Progression Line Curve
  - Top 3 Critical Missing Competencies
  - Primary Non-Placement Causes
  - Post-Placement Attrition Causes

---

### 3.16 Employer Verification Oversight (Section 25)
- **Route:** `/admin/employers`
- **Method:** `platformService.getEmployerRegistrations()`
- **Features:**
  - Review queue of corporate onboarding requests.
  - Interactive Review Modal with GST, EPFO Registration, and HR representative details.
  - State Mutation Actions: `Approve` and `Reject` update reactive state in `mockStore`.

---

### 3.17 Government Compliance Reports & Data Export (Section 26)
- **Route:** `/admin/reports`
- **Method:** Synchronized dynamically with active global filter state.
- **Features:**
  - Current Analytical Scope Manifest: Summarizes all 7 filter parameters.
  - Real-time Microdata Preview Table.
  - Formats: One-click export to **CSV** and **JSON** formatted for official audit submission.

---

### 3.18 Evidence-Linked Policy Interventions (Section 33)
- **Route:** `/admin/interventions`
- **Method:** Surfaced when skill gap citations, placement deficits, or retention anomalies exceed critical thresholds.
- **Actions:** `Adopt Intervention`, `Review Rationale`, `Dismiss`.

---

## 4. Analytical Data State Matrix

| State | Condition | Visual Representation | User Action |
| :--- | :--- | :--- | :--- |
| **1. Loading** | Async request in flight | Smooth skeleton / spinning indicator | None (Brief auto-resolve) |
| **2. Available** | $N \ge 5$ records match filters | Full interactive charts, KPIs, and tables | Filter, drill down, sort, export |
| **3. No Data** | $N = 0$ records match filters | Informative empty alert (`"No records found for selected scope"`) | Reset or adjust filters |
| **4. Insufficient Data** | $1 \le N < 5$ records | DPDP privacy alert (`"Sample size below privacy threshold (N < 5)"`) | Broaden scope to view microdata |
| **5. Error** | Network/service failure | Error alert with red badge and description | Click `"Retry"` to re-fetch |
