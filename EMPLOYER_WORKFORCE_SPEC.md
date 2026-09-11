# EMPLOYER WORKFORCE SPECIFICATION
## Verified Workforce Roster, Lifecycle Management & Outcome Attestation
### Skilling Outcomes & Impact Intelligence Platform

---

## 1. Scope & Product Boundary (Sections 14–20)

The **Verified Workforce Roster** (`/employer/workforce` and `/employer/outcomes`) provides employers with an authoritative, auditable registry of all skilling graduates currently or historically employed by their organization.

### Multi-Tenant Isolation
Only graduates whose employment claims have been attested by the logged-in employer (or matched via corporate HRIS/ATS) appear in this roster. Employer A cannot view or inspect employees belonging to Employer B.

---

## 2. Workforce Roster Table Schema (Section 14)

| Field / Column | Description | Supported Values |
|---|---|---|
| **Trainee / Candidate** | Unique State Trainee ID and Candidate Legal Name | e.g., `TR-0001` (Arjun Kadam) |
| **Job Role** | Attested corporate designation (Confirmed vs Claimed) | e.g., Cloud Systems Associate |
| **Joining Date** | Date candidate commenced active employment | e.g., `2023-05-01` |
| **Employment Status** | Current longitudinal employment lifecycle standing | `Currently Employed`, `Resigned`, `Terminated`, `Contract Completed` |
| **Wage Status** | Status of corporate wage attestation response | `Confirmed`, `Different`, `Cannot Disclose`, `Pending` |
| **Role Attestation** | Corporate confirmation of candidate job title | `Confirmed`, `Not Confirmed` |
| **Verification Status** | State attestation badge | `Verified ✓` |
| **Actions** | Interactive detail drawer and inline lifecycle management | View Details, Edit Status, Confirm Wage |

---

## 3. Employee Detail Drawer (Section 15)

Clicking any row or the `View` button launches the side drawer presenting authoritative, employer-authorized records:
- **Trainee Display & ID:** Verified candidate identifier and name.
- **Job Role Context:** Claimed title vs confirmed corporate band designation.
- **Engagement Duration:** Joining date and duration of tenure.
- **Wage Attestation:** Trainee self-declared wage (e.g. ₹28,000/mo) and employer response.
- **Apprenticeship Attributes:** Where applicable, displays approved trade, monthly stipend, and duration.
- **Audit & Attestation Trail:** Historical events detailing claim receipt, employer attestation, and lifecycle updates.

### Strict Privacy Safeguard
Sensitive personal records (e.g., Aadhaar number, caste, parents' identities, private personal contact numbers, and home addresses) are strictly withheld from the employer view.

---

## 4. Ongoing Employment Lifecycle Management (Sections 16 & 17)

Employers have operational authority to update the status of attested employees over time:

### Supported Status Transitions
1. `Currently Employed` (Active member of workforce)
2. `Resigned` (Voluntary departure)
3. `Terminated` (Involuntary departure)
4. `Contract Completed` (Concluded fixed-term contract or apprenticeship)

### Attrition Data Capture
When selecting `Resigned`, `Terminated`, or `Contract Completed`, the system requires:
- **Effective Departure Date:** Date employment ceased.
- **Departure Reason Category:**
  - *Career progression / higher wage offer*
  - *Contract / assignment completed*
  - *Relocation to hometown / different district*
  - *Skill mismatch or performance attrition*
  - *Pursuing higher technical education*
  - *Personal / family circumstances*
- **Optional Context Remarks:** Qualitative context notes.

### Downstream System Synchronization
- Mutates `trainee.employment.status` to `UNEMPLOYED`.
- Updates longitudinal retention metric (`retention_6m` $\rightarrow$ `Left Employment`).
- Appends an attrition event to the candidate's career timeline.
- Updates Admin state-wide retention analytics and employer 6-month retention rate.

---

## 5. Wage Confirmation Workflow (Section 18)

Addresses trainee self-reported income while strictly respecting corporate compensation disclosure policies:
- **Trainee-Reported Wage:** Displays declared salary (e.g., ₹28,000 / month).
- **Employer Choices:**
  1. `Confirmed`: Validates that trainee declaration aligns with corporate payroll.
  2. `Different`: Employer enters corrected monthly amount or salary range.
  3. `Cannot Disclose`: Records confirmation without forcing disclosure of confidential exact compensation figures.

---

## 6. Job Role Attestation Workflow (Section 19)

- Displays candidate's self-declared job title.
- Choices:
  1. `Confirmed`: Candidate title accurately represents organizational role.
  2. `Not Confirmed`: Employer provides the precise corporate band or designation (e.g., "Technical Support Associate" instead of "Systems Support Analyst").
- Feeds Training Relevance Analytics to evaluate whether skilling courses produce graduates suited for specific target roles.

---

## 7. Apprenticeship Verification (Section 20)

- Distinct engagement badge for Apprenticeship trainees.
- Captures trade designation, monthly stipend amount, and contractual duration (e.g., 12 months).
- Reconciles against National Apprenticeship Promotion Scheme (NAPS) standards.
