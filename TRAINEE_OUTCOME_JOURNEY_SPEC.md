# TRAINEE OUTCOME JOURNEY SPECIFICATION
## LONGITUDINAL TRAJECTORY, RETENTION WINDOWS & WAGE PROGRESSION

---

## 1. LONGITUDINAL JOURNEY MODEL

Vocational skilling efficacy cannot be judged solely at the moment of programme completion. The **Longitudinal Outcome Model** tracks a candidate across a minimum 12-month continuum following formal certification.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Month 0–3   │ ──> │   Month 3    │ ──> │   Month 6    │ ──> │   Month 12   │
│  Vocational  │     │ 3M Follow-Up │     │ 6M Follow-Up │     │12M Follow-Up │
│  Placement   │     │ & Attestation│     │& Retention Pt│     │& Sustained Pt│
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. KEY TRAJECTORY COMPONENTS

### 2.1. Training Baseline
- **Enrolled Programme**: Authoritative vocational curriculum aligned to National Skills Qualification Framework (NSQF).
- **Accredited Provider**: Institutional training partner executing the syllabus.
- **Competency Outcome**: Formal assessment score and certified completion credential.

### 2.2. Employment Placement
- **Initial Placement**: Job role, employer name, joining date, and baseline starting wage.
- **Alternative Pathways**:
  - *Self-Employed*: Business entity registration, enterprise sector, estimated monthly revenue.
  - *Apprenticeship*: Sponsoring firm, trade specialization, monthly statutory stipend.
  - *Unemployed / Seeking*: Formally recorded non-placement classification (e.g. location mismatch, skill gap, higher study).

### 2.3. Multi-Job Career Transitions (Job Changes)
- When a candidate changes employers:
  - Previous employer record is marked as concluded with formal end date.
  - Attrition reason is categorized (*Better opportunity*, *Compensation increase*, *Skill mismatch*, *Relocation*).
  - New employment record is appended to `trainee.employment_history`.
  - The longitudinal timeline renders a distinct **"Employer Transition"** milestone.

---

## 3. RETENTION WINDOW TRACKING (3M, 6M, 12M)

Retention is verified at three statutory follow-up gates:

| Checkpoint | Retention Criteria | Data Validated | Statuses Possible |
| :--- | :--- | :--- | :--- |
| **3-Month Check** | Active in continuous employment or apprentice role for $\ge 90$ days. | Employer stability, initial wage validation, employer attestation. | `Retained`, `Changed Employer`, `Unemployed`, `Overdue` |
| **6-Month Check** | Continuous employment $\ge 180$ days; evaluates mid-term stability. | Wage revision, role promotion, training relevance evaluation. | `Retained`, `Changed Employer`, `Unemployed`, `Pending` |
| **12-Month Check**| Long-term career sustainability $\ge 365$ days. | Annual wage growth percentage, advanced skill demand, career growth. | `Retained`, `Changed Employer`, `Unemployed`, `Upcoming` |

---

## 4. WAGE PROGRESSION & INCOME GROWTH

### Historical Data Points:
- **Baseline Starting Wage**: Documented upon initial job joining.
- **3-Month Wage**: Captured during first quarterly check-in.
- **6-Month Wage**: Evaluates initial wage adjustment.
- **12-Month Wage**: Demonstrates sustained wage uplift.
- **Current Wage**: Active declared monthly compensation.

### Visual Representation:
- Rendered via a dedicated, responsive **SVG Line Chart** showing exact data points, grid lines, and progression trend.
- Displays computed summary metrics:
  - **Starting Wage**: e.g., ₹22,000
  - **Current Wage**: e.g., ₹28,500
  - **Absolute Increase**: e.g., +₹6,500
  - **Percentage Growth**: e.g., +29.5%

### Zero vs. No Data Rigor:
- **Zero Income (`₹0`)**: Represents an explicit declaration of no earnings (e.g. unpaid family business or voluntary study).
- **Missing Wage Data**: Explicitly rendered as *"No wage data available"* rather than falsifying a zero.

---

## 5. "LAST 6 MONTHS" RECENT ACTIVITY LOG

The Trainee Portal features an explicit, dedicated **Last 6 Months** activity section within `/trainee/employment-journey`:

```
┌──────────────────────────────────────────────────────────────────┐
│                   LAST 6 MONTHS ACTIVITY LOG                     │
├──────────────────────────────────────────────────────────────────┤
│ • 2026-08-14: Follow-up Check-in Completed (6-Month Milestone)   │
│ • 2026-07-01: Employer Attestation Verified by CloudSys Ltd      │
│ • 2026-05-15: Wage Milestone Increment Logged (+₹3,500/month)    │
│ • 2026-03-20: Trainee Reported Missing Skill: Terraform IaC      │
└──────────────────────────────────────────────────────────────────┘
```

- **Dynamic Event Aggregation**: Events are computed in real time from:
  1. Employment start dates & job role transitions.
  2. Wage update timestamps.
  3. Follow-up survey submission records.
  4. Employer verification updates.
  5. Trainee feedback entries.
- **Chronological Sorting**: Most recent events appear first, providing immediate clarity on recent career trajectory.

---

## 6. PERSONAL OUTCOME SCORECARD ("WHERE AM I NOW?")

A concise, citizen-friendly summary card synthesizing current longitudinal standing:

```
┌──────────────────────────────────────────────────────────────────┐
│                       WHERE AM I NOW?                            │
├──────────────────────────────────────────────────────────────────┤
│ Training:           ✓ Completed (Cloud Infrastructure & DevOps)  │
│ Certification:      ✓ Certified (Merit Pass, 88%)                │
│ Employment:         ✓ Employed (Cloud Associate, Tata Tech)      │
│ Retention Window:   ✓ 6-Month Verified Retained                  │
│ Wage Progression:   ↑ +29.5% Over Baseline                       │
│ Skill Relevance:      Partially Relevant (Needs IaC Exposure)    │
│ Priority Next Step:   Acquire Terraform & Container Orchestration│
└──────────────────────────────────────────────────────────────────┘
```
