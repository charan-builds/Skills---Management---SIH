# Admin Trainee Intelligence Specification

## 1. Executive Overview & Architecture
The Trainee Intelligence system shifts the Admin experience from pure aggregate metrics to an **end-to-end outcome surveillance and individual longitudinal evaluation system**. Every individual record forms the deterministic foundation for every aggregate calculation across programmes, providers, districts, and cohorts.

```
       [Authoritative Relational Dataset (~800 Trainees)]
                              │
       ┌──────────────────────┴──────────────────────┐
       ▼                                             ▼
[Trainee Directory (/admin/trainees)]     [Trainee Profile (/admin/trainees/:id)]
  • Global & Column Search                  • Outcome Summary Matrix
  • Multidimensional Filters                • Longitudinal Journey Timeline
  • Privacy-Safe Identity                   • Last 6 Months Activity Stream
  • Sorting & Pagination                    • Multi-Job Employment History
                                            • Income & Wage Progression Chart
                                            • Follow-Up & Retention History
                                            • Skills & Competency Matrix
```

---

## 2. Trainee Directory Screen (`/admin/trainees`)

### 2.1 Navigation & Permissions
- **Visible Navigation Label**: `Trainees`
- **Route**: `/admin/trainees`
- **Access Level**: Government Officer / Admin Role with data minimization protections.

### 2.2 Table Columns & Data Attributes
| Column | Data Source | Formatter / Representation | Privacy Rule |
| :--- | :--- | :--- | :--- |
| **Trainee ID** | `trainee.id` | Monospace badge (e.g. `TR-0042`) | Permanent public key |
| **Candidate Identity** | `trainee.name`, `gender`, `age`, `category` | Avatar circle + Full Name + Demographics pill | City/District only; house address suppressed |
| **Programme & Provider** | `trainee.programme_name`, `provider_name` | Primary title with secondary subtitle | Public program record |
| **District & Cohort** | `trainee.district`, `trainee.cohort` | District badge + Cohort year/quarter | Public demographic segment |
| **Current Outcome** | `trainee.employment.status` | Categorical badge (`Employed`, `Self-Employed`, `Apprentice`, `Unemployed`) | Derived outcome status |
| **Employer & Role** | `trainee.employment.employer_name`, `job_role` | Corporate partner name & assigned title | Verified ATS/HRIS record |
| **Latest Wage** | `trainee.employment.current_wage` | Currency string `₹XX,XXX` + `%` increment pill | Verified compensation |
| **Retention Status** | `trainee.retention.retention_6m` | `Retained` (green) or `Exited` (red) badge | 6-month longitudinal check |
| **Risk Status** | `trainee.risk_indicator` | Pill (`Optimal Impact`, `Stable Retention`, `Moderate Skill Gap`, `High Attention`) | Algorithmic risk evaluation |
| **Actions** | Direct navigation | "View Profile" button linking to `/admin/trainees/:id` | Open detailed profile |

### 2.3 Search & Filtering Capabilities
1. **Omni-Search Bar**:
   - Substring match across Trainee ID, candidate name, programme, provider, district, employer name, and job role.
2. **Dedicated Quick Filters**:
   - **Current Outcome**: Employed, Self-Employed, Apprenticeship, Unemployed.
   - **Training Status**: Completed, Dropped Out.
   - **Retention Status**: 6M Retained, Left Employment.
   - **Risk Status**: High Attention Needed, Moderate Skill Gap, Stable Retention, Optimal Impact.
3. **Global Filter Synchrony**:
   - Strictly inherits all global filters (District, Programme, Provider, Cohort, Gender, Age Group, Category) set in the top bar.

### 2.4 Privacy Safeguards
- **Contact Masking**: Emails are masked (e.g., `ro***@example.com`), and phone numbers are obscured (`+91 98** ***42`).
- **Physical Address**: Granular apartment or street addresses are suppressed in tabular views; only municipal districts are shown.

---

## 3. Comprehensive Trainee Profile Screen (`/admin/trainees/:traineeId`)

### 3.1 Header Summary & Status Badges
Displays the core identity and longitudinal status of the candidate:
- **Trainee ID & Name**: Prominent heading with gender, category, and age indicators.
- **Programme & Provider Metadata**: Duration in weeks, accredited training partner, district center.
- **Outcome & Verification Badges**:
  - `TRAINING: COMPLETED` or `TRAINING: DROPPED OUT`
  - `CERTIFIED` (with credential certificate ID) or `UNCERTIFIED`
  - `OUTCOME: EMPLOYED / SELF-EMPLOYED / APPRENTICE / UNEMPLOYED`
  - `VERIFICATION: CONFIRMED` (via Workday/ATS telemetry) or `PENDING`
  - `6M CHECKPOINT: RETAINED` or `EXITED`

### 3.2 Concise Outcome Summary Matrix
At the top of the profile, an 8-card analytical summary presents key indicators:
1. **Training Course**: `✓ Completed` (with score %) or `✗ Dropped Out`
2. **Certification**: `✓ Certified` (with certificate ID)
3. **First Outcome**: Placed / Employed / Self-Employed / Seeking Placement
4. **Current Outcome**: Employed / Self-Employed / Apprentice / Unemployed
5. **6M Retention**: `✓ 6M Retained` (telemetry confirmed) or `Left Employment`
6. **Wage Progression**: `₹Starting → ₹Current (+Growth %)`
7. **Skill Relevance**: `Highly Relevant` / `Partially Relevant` / `Low Relevance` (rated /5)
8. **Attention Area**: Diagnostic deficit flag (e.g. `Kubernetes & Containerization Deficiency`) or `None (Optimal)`

---

## 4. Visual Longitudinal Timeline
An interactive horizontal/vertical milestone flow capturing the trainee's journey:
```
TRAINING START ──► TRAINING COMPLETED ──► CERTIFIED ──► JOB JOINED
                                                             │
CURRENT STATUS ◄── 12M CHECK-IN ◄── WAGE INCREMENT ◄── 6M CHECK-IN ◄── 3M CHECK-IN
```
- **Clickable Nodes**: Clicking any milestone node (e.g., `3-Month Check-in` or `Wage Increment`) displays an expanded **Event Details Dossier** containing:
  - Precise calendar timestamp
  - Telemetry verification authority (e.g. Workday HCM, BambooHR, or State Field Verification)
  - Specific wage record at that checkpoint
  - Milestone status (`Completed`, `Retained`, `Verified`, `Increment`, `Attrited`)

---

## 5. "Last 6 Months" Activity Stream
A reverse-chronological log detailing candidate events over the preceding half-year:
- **Employer Verification Confirmed**: Timestamped corporate payroll confirmation.
- **Wage Update Recorded**: Merit salary enhancements with percentage increases.
- **Longitudinal Follow-Up Check-in**: Verification of role stability, job title, and daily task relevance.
- **Competency Review Recorded**: Formal feedback notes submitted by employer HR or technical mentors.

---

## 6. Employment History & Multi-Job Progression
Tracks career transitions rather than assuming a single static job:
- **Multi-Job Sequences (Job 1 → Job 2)**:
  - In cases where a trainee changed employers, the system renders:
    - **Job 1**: Initial placement employer, role, start date, exit date, starting wage, final wage, exit reason (e.g., "Better opportunity elsewhere").
    - **Job 2**: Lateral transition employer, current role, joining date, enhanced salary, verified active status.
- **Single Retained Job**: Full chronological continuity from placement to present.
- **Self-Employed & Apprentices**: Displays enterprise revenue, client base, or industrial contract duration.
- **Unemployed Candidates**: Displays placement pipeline history, job interviews attended, and barrier notes.

---

## 7. Income & Wage Progression
- **Interactive Line Chart**: Plots compensation across stages:
  - `Starting (Day 1)` → `3-Month Checkpoint` → `6-Month Increment` → `12-Month Checkpoint` → `Current`
- **Headline Metrics**:
  - `Initial Wage`: Baseline starting salary
  - `Current Wage`: Current verified monthly CTC
  - `Absolute Increase`: Net monthly earnings expansion in ₹
  - `Growth %`: Relative percentage enhancement
- **Data State Handling**: If a trainee is unplaced or pursuing education, the component gracefully displays `"No wage data available"` without throwing errors or generating fabricated values.

---

## 8. Follow-Up & Retention Verification
- **Follow-Up Records**: Structured inspection cards for 3-Month, 6-Month, and 12-Month follow-ups detailing due dates, completion dates, operational status, and verification notes.
- **Attrition Diagnosis**: If a trainee departed employment, displays a dedicated callout containing the verified exit reason (e.g. *Low initial compensation*, *Location relocation constraints*, *Role mismatch*).

---

## 9. Skills & Competency Matrix
- **Four-Way Skill Classification**:
  1. `Skills Taught`: Official curriculum modules covered during the training course.
  2. `Skills Used in Job`: Specific technical competencies actively exercised in current employment.
  3. `Skills Relevant`: Competencies confirmed mutually relevant by candidate and employer.
  4. `Missing Competencies`: Competency gaps flagged during employer reviews.
- **Competency Assessment Matrix**:
  - Detailed audit table comparing `Target Proficiency` against `Observed Score`, status (`Aligned` vs `Deficit`), and employer priority (`High Urgency`).
