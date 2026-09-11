# TRAINEE PORTAL SPECIFICATION
## SKILLING OUTCOMES & PERSONAL SKILL INTELLIGENCE PLATFORM
### ARCHITECTURAL & INTERFACE SPECIFICATION (SECTIONS 1–62)

---

## 1. PRODUCT DEFINITION & SCOPE BOUNDARIES

The **Trainee Portal** is an individual-centric intelligence interface designed to give citizens complete visibility over their vocational training credentials, verified skill evidence, employment status, longitudinal retention, wage progression, and career skill benchmarks.

### What the Trainee Portal Is:
- A **personal intelligence dashboard** answering:
  1. *What training did I complete?*
  2. *What verified skills do I currently have?*
  3. *How strong is the evidence for those skills?*
  4. *What skills are missing for my desired career trajectory?*
  5. *What has happened across my longitudinal employment journey?*
  6. *How has my wage evolved over time?*
  7. *Am I still retained at 3M, 6M, and 12M intervals?*
  8. *What evidence-based recommendations does the intelligence engine provide?*
- A **citizen data rights & consent portal** ensuring statutory compliance with personal data protection and outcome tracking authorizations.
- An **evidence-backed skill gap analyzer** that links vocational coursework, employer feedback, and trainee perception to occupational benchmarks.

### Explicit Scope Boundaries (Strict Exclusions):
- **NOT a Job Portal / Vacancy Marketplace**: Contains no job listings, employer contact forms, or vacancies.
- **NOT an Applicant Tracking System (ATS)**: Contains no "Apply" buttons, interview schedules, candidate pipelines, shortlists, or offer letters.
- **NOT an LMS / Quiz Engine**: Does not administer generic multiple-choice quizzes or flashcards; skill assessments are derived from authoritative certification records and workplace feedback.
- **Occupational Target Roles as Benchmarks Only**: Roles such as *Data Engineer* or *Cloud Support Engineer* exist solely as occupational competence rubrics to answer *"What skills would I need for this target role?"*.

---

## 2. SYSTEM ARCHITECTURE & STATE MANAGEMENT

```
┌─────────────────────────────────────────────────────────────┐
│                      Trainee Portal UI                      │
│   (/trainee/dashboard, /skills, /skill-goals, /outcomes)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   platformService (Facade)                  │
│       • getTraineeSkillsIntelligence(traineeId)             │
│       • getTargetRoleBenchmark(roleId, traineeId)           │
│       • logWageProgression(traineeId, wageData)             │
│       • updateTraineeConsent(traineeId, status)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    mockStore (Local Store)                  │
│   • Reactive pub/sub listener network                       │
│   • Multi-panel synchronization (Admin / Employer / Trainee)│
│   • Coherent relational mock database (~800 trainees)       │
└─────────────────────────────────────────────────────────────┘
```

- **Identity Consistency**: Every screen resolves against `localStorage.getItem("traineeId") || "TR-0001"`. The trainee persona switcher in the portal navigation enables instantaneous cross-persona evaluation without state corruption.
- **Data States Supported**: Every view implements the 5 canonical data states via `<DataStateWrapper>`:
  1. `LOADING`: Visual skeleton / spinner.
  2. `DATA`: Coherent longitudinal data visualization.
  3. `NO DATA`: Explicit empty indicator (e.g. *"No wage data available"*).
  4. `INSUFFICIENT DATA`: Notice when sample or evidence density is below diagnostic threshold.
  5. `ERROR`: Diagnostic retry card with clear recovery actions.
- **Zero vs. No Data**: `₹0` wage is rendered as a valid financial declaration; absent records show *"No wage data available"*.

---

## 3. SCREEN & INTERACTION INVENTORY

### 3.1. Dashboard (`/trainee/dashboard` & `/trainee`)
- **Header**: Citizen welcome, Candidate ID, enrolled Programme, accredited Training Provider, and real-time Follow-Up Consent badge.
- **Quadrant 1: My Current Status**:
  - Training & Certification card (status, merit percentage, completion date).
  - Current Employment card (job role, employer, placement status, verification badge).
  - Current Wage card (latest recorded monthly income, growth metric).
  - Retention Checkpoint card (current retention window, e.g. 6M Retained).
- **Quadrant 2: My Skill Status & Readiness**:
  - Highlights strong evidence-backed skills vs. priority improvement areas.
  - Displays selected target role readiness score and quick-navigation to benchmark planner.
- **Quadrant 3: Recent Progress Timeline**:
  - Chronological vertical timeline: Enrollment $\rightarrow$ Assessment $\rightarrow$ Placement $\rightarrow$ Follow-Up $\rightarrow$ Retention Verification.
- **Quadrant 4: Important Actions (Action Center)**:
  - 6 real, non-dead interactive action triggers:
    1. *Complete Follow-Up*: Navigates to `/trainee/follow-ups`.
    2. *Update Employment*: Navigates to `/trainee/employment`.
    3. *Log Wage Milestone*: Opens Wage Update modal.
    4. *Review Skill Gaps*: Navigates to `/trainee/skills`.
    5. *Target Role Goals*: Navigates to `/trainee/skill-goals`.
    6. *Training Relevance Feedback*: Navigates to `/trainee/feedback`.

### 3.2. Privacy & Citizen Consent (`/trainee/consent`)
- **Statutory Notice**: Clear disclosure of outcome tracking purpose, anonymized government aggregation, and survey schedules.
- **Consent Preference Toggle**:
  - Toggle between **Accepted** (`GIVEN`) and **Declined** (`DECLINED`).
  - Records statutory timestamp and updates persistent store.
- **Follow-Up Restriction Enforcement**: If consent is revoked/declined, access to outcome follow-ups is locked with an explicit explanation banner.

### 3.3. Training History & Certification (`/trainee/training`)
- **Authoritative Coursework Card**: Enrolled curriculum, NSQF alignment, cohort ID, training provider details, and certified status.
- **Curriculum Modules Breakdown**: Lists evaluated modules with verified competency ratings.
- **Interactive Certificate Preview Modal**:
  - Displays high-fidelity government-styled Certificate of Completion with trainee name, provider, completion date, and credential ID.
  - Clearly identifies simulation/demo credential via prominent watermark.
- **Working SVG Certificate Generator**: Generates and downloads a real `Certificate_{id}.svg` file directly to the client machine.

### 3.4. Employment Status Declaration (`/trainee/employment`)
- **Multi-Status Switcher**:
  1. `Employed`: Employer name, job title, joining date, work location, monthly wage.
  2. `Self-Employed`: Business entity name, enterprise sector, estimated monthly income, establishment date.
  3. `Apprentice`: Sponsoring organization, apprenticeship trade role, start date, monthly stipend.
  4. `Unemployed`: Approved non-placement categorization dropdown (e.g. *Lack of required skills*, *Pursuing higher education*, *Relocation constraints*).
- **Employer Verification Status**:
  - Reflects real-time state (`Verified`, `Pending Verification`, `Correction Required`, `Rejected`).
  - Displays employer verification notes and provides resubmission workflow if correction is required.

### 3.5. Longitudinal Employment Journey (`/trainee/employment-journey`)
- **Prominent Last 6 Months Activity Log**: Chronological sequence of recent workplace milestones (job entry, wage increments, verification attestation, follow-up submissions).
- **Interactive Longitudinal Journey Timeline**: Clickable milestone nodes from training commencement through current employment.
- **Milestone Event Inspector**: Displays deep metadata dossier upon clicking any milestone.

### 3.6. Personal Outcomes & Wage Progression (`/trainee/outcomes`)
- **"Where Am I Now?" Summary Card**: High-level outcome overview (Training, Certification, Employment, Retention, Wage Growth, Skill Relevance).
- **Interactive Wage Progression Chart**: Pure SVG multi-point line chart illustrating starting wage, 3M wage, 6M wage, 12M wage, and current wage.
- **Log Wage Milestone Modal**: Reactive form allowing instant wage updates that immediately re-render charts and store records.
- **3M, 6M, 12M Retention Progression Checkpoints**: Structured cards indicating retention status, employer stability, and skill relevance across time.

### 3.7. My Skills & Evidence Portfolio (`/trainee/skills`)
- **Grounded AI Evidence Insights Banner**: Plain-language synthesis of skill strength and improvement opportunities without fake AI claims.
- **Verified Skills Section**: Separates evidence-backed skills derived from training curriculum assessments and employer feedback.
- **Skills to Improve (Gap Analysis)**: Prioritized gaps with evidence breakdown, rationale, and recommended bridge courses.

### 3.8. Target Role Skill Intelligence (`/trainee/skill-goals`)
- **Occupational Target Role Selector**: Dropdown of industry-standard benchmark roles (*Junior Data Analyst*, *Data Engineer*, *Cloud Support Engineer*, *Full Stack Web Developer*, *EV Specialist*, *Healthcare Technician*).
- **Benchmark Coverage Metric**: Displays transparent fraction (e.g., `4 / 6 skills supported`).
- **Career Transition Pathway**: Visual comparison of current role versus target role requirements.
- **Skill Requirements Comparison Matrix Table**: Tabular breakdown of required skills, target proficiency, current evidence level, status, and gap priority.
- **Evidence-Based Bridge Course Modules**: Curriculum recommendations to close identified gaps.

### 3.9. Follow-Up Center (`/trainee/follow-ups`)
- **Milestone Check-in Cards**: 3-Month, 6-Month, and 12-Month follow-up surveys.
- **Outcome-Focused Survey Modal**: Captures employment continuity, employer changes, current wage, skill utility, and training relevance.
- **Consent Restriction Protection**: Automatically restricts check-in access if consent was revoked in privacy settings.

### 3.10. Trainee Feedback & Evidence Synthesis (`/trainee/feedback`)
- **Training Relevance Survey**: Evaluates vocational utility (`Yes`, `Partially`, `No`) and captures missing skill topics.
- **Missing Skill Gap Report Form**: Trainee submits perceived curricular gaps. Stored as `TRAINEE_PERCEIVED` feedback without overwriting verified assessment data.
- **Section 29 Evidence Synthesis Workflow**: Visual diagram illustrating how trainee feedback, employer feedback, and target role benchmarks combine into actionable intelligence.
- **Feedback Processing Status Tracker**: Displays real-time status (`Submitted`, `Under Analysis`, `Included in Skill Intelligence`).

---

## 4. VERIFICATION & TEST SUMMARY

- **Playwright Test Suite**: `Frontend/run_trainee_acceptance.cjs`
- **Results**: **41 Tests Passed, 0 Failed (100% Success Rate)**
- **Build Status**: Vite Production Bundle compiled cleanly in 1.27s with 0 errors.
