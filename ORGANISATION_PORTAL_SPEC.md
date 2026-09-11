# ORGANISATION / EMPLOYER PORTAL SPECIFICATION
## Comprehensive Frontend-First Product & Architectural Reference
### Skilling Outcomes & Impact Intelligence Platform

---

## 1. Executive Summary & Product Boundary

The **Organisation / Employer Portal** provides enterprise employers, industrial partners, and healthcare/logistics entities with an authoritative, authenticated portal to attest, verify, and monitor skilling outcomes.

### Strict Product Boundaries (Section 1)
This portal is strictly designed for **employment verification, longitudinal workforce status maintenance, wage attestation, job role confirmation, apprenticeship validation, curriculum skill-gap feedback, and HR/ATS employment data synchronization**.

It is **NOT**:
- A recruitment marketplace or hiring board
- A job vacancy publishing system
- A candidate application tracker (ATS for recruiting)
- An interview scheduling or candidate pipeline manager

All integration touchpoints with corporate HRIS/ATS systems are exclusively for **employment outcome reconciliation and retention verification**.

---

## 2. Multi-Tenant Architectural Model & Data Privacy

The platform enforces strict tenant boundary isolation:
1. **Tenant Segregation (Section 4 & 42):**
   - Each employer operates under a distinct `organization_id` (e.g., `EMP-DEMO-001` for Tata Consultancy Services, `EMP-002` for Infosys BPM, `EMP-003` for Mahindra & Mahindra).
   - Employer A can never view, query, or receive verification claims, employee rosters, feedback records, or API credentials belonging to Employer B.
2. **Read-Only Governance Badges (Section 3 & 5):**
   - State verification status (`Verified`, `Pending`, `Rejected`) is strictly governed by State Skilling Administrators.
   - Employers cannot unilaterally alter their own attestation standing.
3. **Candidate Privacy Safeguards (Section 9 & 15):**
   - Employers only have visibility into authorized employment attributes: Candidate ID, Display Name, Claimed Role, Joining Date, Employment Type, and Trainee-reported Wage.
   - Personally identifiable sensitive demographics (Aadhaar, parents' identity, caste, home address, personal telephone) are strictly suppressed from employer views.

---

## 3. Screen-by-Screen Specification

### 3.1. Employer Login & Registration (`/employer/login`)
- **Dual Tab Interface:**
  - *Authorised Organisation Login:* Quick persona selector for active demonstration entities (TCS, Infosys, Mahindra, Apollo Hospitals, Reliance Clean Energy, and New Horizon Logistics [Pending]), plus manual ID/credential entry.
  - *Register New Organisation:* Onboarding form capturing Organisation Legal Name, Registration / GSTIN, Industry Sector, Headquarters Location, Authorised Representative Name, Corporate Email, Phone, and primary HRIS system.
- **State Machine Transition:**
  - Upon submission, new entities enter the `Pending` state. The registration is immediately visible in the Admin registry (`/admin/employers`) for state attestation.

### 3.2. Employer Dashboard (`/employer` & `/employer/dashboard`)
- **Key Performance Indicators (KPI Grid):**
  - Pending Verification Requests count
  - Verified Employment Records
  - Current Verified Active Workforce
  - Longitudinal 6-Month Retention Benchmark (e.g., 84.6%)
- **Visual Analytics:**
  - *Workforce Status Breakdown Donut:* Real-time SVG visualization segmenting Currently Employed vs. Resigned vs. Terminated vs. Contract Completed.
  - *Verification Activity Donut:* Interactive SVG chart displaying Pending vs. Confirmed vs. Rejected vs. Correction Requested records. Clickable slices filter the inbox.
  - *Skills We Need (Ranked Gaps):* Horizontal bar chart displaying the most acute workplace competency deficiencies reported by this employer.
  - *Chronological Activity Stream:* Real-time audit log derived directly from mock state events.

### 3.3. Verification Inbox (`/employer/verifications`)
- **Tabular Roster & Omni-Search:**
  - Filters: Status (`All`, `Pending`, `Confirmed`, `Rejected`, `Correction Requested`), Type (`All`, `Employment`, `Apprenticeship`).
  - Search: Full-text search across trainee names, claimed roles, and IDs.
- **Claim Review Drawer:**
  - Detailed side drawer presenting candidate declarations, course credentials, and employment parameters.
  - Three definitive governance actions:
    1. `Confirm Employment` $\rightarrow$ transitions claim to `Confirmed` and trainee status to `Verified`.
    2. `Reject Claim` $\rightarrow$ opens modal requiring a formal rejection reason (e.g., "Candidate never worked here", "Incorrect joining date").
    3. `Request Correction` $\rightarrow$ opens modal requiring an employer note specifying required candidate revisions.

### 3.4. Verified Workforce (`/employer/workforce` & `/employer/outcomes`)
- **Active Workforce Roster:**
  - Displays all attested employees linked to the authenticated enterprise.
  - Columns: Trainee ID & Name, Claimed vs Confirmed Job Role, Joining Date, Employment Status, Wage Status, Attestation Badge, and Action buttons.
- **Employee Detail Drawer:**
  - Comprehensive view of employment parameters, verification history, apprenticeship attributes, and audit timestamps.
- **Ongoing Employment Lifecycle Management:**
  - Modal allowing updates to `Currently Employed`, `Resigned`, `Terminated`, or `Contract Completed`.
  - Departure dates and standardized exit reasons are captured, feeding Admin longitudinal retention analytics.
- **Wage Confirmation Action:**
  - Employer chooses `Confirmed`, `Different` (with custom wage entry), or `Cannot Disclose` (respecting corporate payroll nondisclosure).
- **Job Role Confirmation Action:**
  - Attests whether the trainee's claimed title matches corporate bands (`Confirmed` or `Not Confirmed` with title override).

### 3.5. Skills We Need / Skill Gap Feedback (`/employer/feedback`)
- **Feedback Submission Form:**
  - Report missing workplace skills, specify affected job roles, rate curriculum relevance (1 to 5 stars), and input qualitative observations.
  - Stored strictly as separate `EMPLOYER_FEEDBACK` without modifying trainee grade evidence.
- **Aggregated Skills We Need Card:**
  - Highlights recurring skill deficiencies across the organization's workforce.
- **Multi-Source Evidence Fusion Model:**
  - Visual architecture diagram illustrating how Trainee Self-Reported Gaps and Employer Workplace Deficits fuse into Admin Policy Intelligence.
- **Feedback History Log:**
  - Traceable log of past submitted employer skill reports.

### 3.6. Employment Data Integration Hub (`/employer/integrations`)
- **Integration Summary Cards:**
  - Connected Systems, Records Received, Automatically Verified, Manual Review Required, and Auto Verification Rate.
- **Connected Systems Table:**
  - Gateway status (`Connected`, `Syncing`, `Attention Required`), type, and last synchronization timestamp.
  - Prominent `Simulation / Demo Integration` banner ensuring full transparency.
- **Today's Verification Activity Donut:**
  - SVG donut chart displaying proportional reconciliation between auto-verified and manual review records.
- **Automated Matching Engine:**
  - 5-point deterministic correlation: Trainee ID, Employer Entity, Candidate Name, Employment Status, and Joining Date.
  - Displays clear field-by-field match checkmarks $\checkmark$ or discrepancy highlights.
- **Verification Exceptions Tab (`/employer/integrations/exceptions`):**
  - Identifies data conflicts (e.g., date mismatch, role mismatch).
  - Actions: `Confirm / Override`, `Reject Claim`, `Request Correction`.
- **Sync Now Engine:**
  - Real simulated batch reconciliation updating store timestamps and creating audit log entries.
- **API Settings & Credentials (Collapsible):**
  - Masked API keys (`••••••••••••••••`), webhook callback URLs, and connection handshake tester.
- **Activity Log:**
  - Chronological table documenting automated batch reconciliations and webhook executions.

### 3.7. Organisation Profile (`/employer/profile`)
- Displays state registry attributes: Organization ID, Legal Name, GSTIN, Registration Date, and Admin Attestation Date.
- Prominent read-only state verification badge (`Verified Organisation`, `Verification Pending`, or `Verification Rejected`).
- Form allowing updates to corporate representative contact information, operating locations, and primary HRIS system.
