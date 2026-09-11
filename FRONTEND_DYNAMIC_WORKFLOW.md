# Frontend Dynamic Workflow Specification: Skilling Impact Intelligence Platform

## Overview

The **Skilling Impact Intelligence Platform** enforces a strict unidirectional reactive cycle:
```
 USER ACTION ───► STATE MUTATION ───► DERIVED RECALCULATION ───► UI NOTIFICATION / RERENDER
      ▲                                                                     │
      └───────────────────────── USER FEEDBACK ─────────────────────────────┘
```
Every user interaction (form submission, verification review, status transition, filter change, wage log, or assisted outreach) executes through the `PlatformService` adapter, mutates the relational singleton `MockStore`, recalculates all affected derived metrics in memory, updates `localStorage`, and broadcasts changes to subscribing components.

---

## 1. Universal Dynamic Lifecycle Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. USER INITIATES ACTION                                              │
│    • Trainee submits employment or logs wage increment                │
│    • Employer confirms verification claim or changes worker status     │
│    • Admin applies global filter or resolves assisted outreach         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. ASYNC SERVICE ADAPTER INVOCATION                                    │
│    • `platformService.submitEmploymentStatus(traineeId, data)`         │
│    • `platformService.reviewVerificationClaim(claimId, decision)`      │
│    • `platformService.updateWorkforceStatus(empId, traineeId, status)` │
│    • `platformService.resolveAssistedFollowup(traineeId, fuId, data)`  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. RELATIONAL IN-MEMORY MUTATION (`mockStore.js`)                      │
│    • Targets specific entity by permanent identifier (`TR-XXXX`)       │
│    • Appends longitudinal event (`timeline_events`)                    │
│    • Creates or updates relational verification claim (`VCL-XXXXXX`)   │
│    • Synchronizes two-way relations (e.g. Trainee <-> Employer)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. DETERMINISTIC DERIVED RECALCULATION                                 │
│    • Aggregations recomputed over active 800-trainee dataset:          │
│      - Placement Rate (% placed in verified work)                      │
│      - Retention Rate (3M, 6M, 12M active longitudinal status)         │
│      - Wage Progression (Mean starting vs. current monthly wage)       │
│      - Attrition Distribution (Aggregated exit reasons)                │
│      - Skill Gap Prioritization (Merged employer + trainee notices)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 5. COMPONENT NOTIFICATION & UI RE-RENDER                               │
│    • `mockStore.notify()` broadcasts updated state snapshot            │
│    • Active UI views pull freshly recalculated metrics                 │
│    • Toast notifications and status badges dynamically update          │
│    • Zero page reloads required                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Portal-Specific Dynamic Workflows

### 2.1 Trainee Portal Dynamic Workflows

#### Workflow T1: Employment Status Claim & Verification Request
1. **Trigger**: Trainee navigates to `/trainee/employment` and clicks `Employed`.
2. **Input Fields**: Selects Employer (`Tata Consultancy Services`), enters Job Role (`Junior Cloud Associate`), Monthly Wage (`₹28,000`), Joining Date, and attaches Offer Letter.
3. **Action**: Clicks `Submit Employment Status`.
4. **Mutations**:
   - `trainee.employment.status` $\rightarrow$ `"EMPLOYED"`
   - `trainee.employment.verification_status` $\rightarrow$ `"Pending Employer Confirmation"`
   - New `VerificationClaim` object generated with status `"Pending"` and appended to `mockStore.state.verification_claims`.
   - `trainee.timeline_events` appends `"Submitted Employment Verification Claim"`.
5. **UI Updates**:
   - Trainee view instantly displays an amber pending badge: `"Pending Employer Confirmation"`.
   - Employer inbox for `Tata Consultancy Services` increments its pending counter by +1.

#### Workflow T2: Wage Progression Milestone Logging
1. **Trigger**: Trainee navigates to `/trainee/outcomes` and clicks `Log Wage Increment`.
2. **Input Fields**: Submits new monthly gross wage (`₹36,000`), effective date, and remarks.
3. **Mutations**:
   - `trainee.employment.current_wage` $\rightarrow$ `36000`
   - `trainee.wage_history` appends `{ id: WAG-..., monthly_wage: 36000, recorded_by: "Trainee Submission" }`.
   - `trainee.wage_metrics.growth_percentage` dynamically recalculates from baseline.
4. **UI Updates**:
   - Trainee outcomes chart displays new upward data point.
   - Admin Macro Wage Growth dashboard incorporates the new salary into state-wide averages.

#### Workflow T3: Skill Gap & Curriculum Relevance Reporting
1. **Trigger**: Trainee navigates to `/trainee/feedback`.
2. **Input**: Selects course relevance (`"Partially Relevant"`), enters missing industry skill (`"Kubernetes Production Clustering"`), and enters contextual explanation.
3. **Mutations**:
   - `trainee.feedback_history` appends observation.
   - `mockStore.state.skill_intelligence_queue` records feedback event from role `"trainee"`.
4. **UI Updates**:
   - Trainee receives confirmation banner.
   - Admin `/admin/skill-gaps` merges the skill into the aggregate ranking table.

---

### 2.2 Organisation / Employer Portal Dynamic Workflows

#### Workflow E1: Multi-Tenant Claim Review (Confirm, Reject, or Request Correction)
1. **Trigger**: Employer officer logs into `/employer/verifications`.
2. **Context**: View is strictly scoped to `organizationId: "EMP-DEMO-001"` (e.g. Tata Consultancy Services).
3. **Decision Paths**:
   - **Path A (Confirm)**: Clicks `Review Claim` $\rightarrow$ clicks `Confirm Employment`.
     - *State Change*: `claim.status` $\rightarrow$ `"Confirmed"`, `trainee.employment.verification_status` $\rightarrow$ `"Confirmed"`.
     - *Workforce Update*: Trainee automatically added to Employer's active `/employer/workforce` roster.
   - **Path B (Request Correction)**: Clicks `Review Claim` $\rightarrow$ selects `Request Correction` $\rightarrow$ enters remark: `"Please attach revised salary annexure"`.
     - *State Change*: `claim.status` $\rightarrow$ `"Correction Requested"`, `trainee.employment.verification_status` $\rightarrow$ `"Correction Requested"`.
     - *Trainee Notification*: Trainee portal displays warning alert banner with the exact employer remark and re-opens the form for submission.
   - **Path C (Reject)**: Clicks `Review Claim` $\rightarrow$ selects `Reject Claim` $\rightarrow$ enters reason: `"Candidate not found in HR payroll records"`.
     - *State Change*: `claim.status` $\rightarrow$ `"Rejected"`, `trainee.employment.verification_status` $\rightarrow$ `"Rejected"`.

#### Workflow E2: Workforce Roster Lifecycle Transition (Resigned / Exited)
1. **Trigger**: Employer navigates to `/employer/workforce`, locates employee, and clicks `Edit Status`.
2. **Input**: Selects status `"Resigned"` and exit reason `"Better salary / compensation package"`.
3. **Mutations**:
   - `trainee.employment.status` $\rightarrow$ `"UNEMPLOYED"`
   - `trainee.employment.attrition_reason` $\rightarrow$ `"Better salary / compensation package"`
   - `trainee.retention.is_active` $\rightarrow$ `false`
   - `trainee.retention.retained_6m` $\rightarrow$ `"Left Employment"`
4. **UI Updates**:
   - Employee marked as inactive/exited on employer roster.
   - Admin `/admin/why-attrition` immediately reflects the new resignation and aggregates the attrition reason into the primary breakdown chart.

---

### 2.3 Admin / Government Portal Dynamic Workflows

#### Workflow A1: Universal Global Filter Cascading
1. **Trigger**: Admin selects any filter dropdown in the global navigation bar:
   - Programme: `PMKVY 4.0`
   - District: `Pune`
   - Provider: `Centum Learning`
   - Cohort: `2024-Q1`
2. **Cascade Logic**:
   - Filters operate via strict mathematical intersection ($\bigcap$).
   - If selected district has zero providers for that program, the Provider dropdown dynamically cascades to show only eligible providers.
3. **Recalculation**:
   - Population filters from 800 down to matched subset $N_{\text{sub}}$.
   - Funnel stages, 3M/6M/12M retention curves, wage distributions, and district maps re-aggregate in real time.
   - If $N_{\text{sub}} < 5$, cell suppression triggers automatically.

#### Workflow A2: Government Assisted Follow-Up Desk (Section 17, 54)
1. **Trigger**: Admin navigates to `/admin/follow-ups` and filters by `Needs Assistance`.
2. **Action**: Clicks `Assisted Follow-Up` on candidate `TR-0042`.
3. **Input in Modal**:
   - Channel: `Government Call Center (Telephone Agent)`
   - Contact Result: `Candidate Reached (Capture Outcome)`
   - Employment Status: `Yes (Employed)`
   - Current Wage: `₹28,000`
   - Notes: `"Contacted via alternate guardian phone number. Employed at local auto plant."`
4. **Mutations**:
   - Milestone `follow_up.status` $\rightarrow$ `"Completed"`
   - `follow_up.completed_date` $\rightarrow$ Today's ISO date
   - `trainee.employment.status` $\rightarrow$ `"EMPLOYED"`
   - `trainee.employment.current_wage` $\rightarrow$ `28000`
   - `trainee.retention.retained_6m` $\rightarrow$ `"Retained"`
5. **UI Updates**:
   - Trainee moves out of `Needs Assistance` queue into `Completed`.
   - Trainee longitudinal profile timeline records `"Assisted Follow-Up Resolution"`.
   - Global retention metrics update immediately.
