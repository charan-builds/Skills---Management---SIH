# TRAINEE PORTAL SHOWCASE WORKFLOW
## END-TO-END DEMONSTRATION SCRIPT & DUAL-STORY SHOWCASE (SECTIONS 54–56)

---

## 1. SHOWCASE OBJECTIVES

The purpose of this walkthrough is to demonstrate that the **Trainee Portal** is a personal intelligence, skill progression, and longitudinal outcome portal.

This demonstration proves:
1. Every card, chart, and metric is derived dynamically from relational candidate records in `mockStore`.
2. All interactive actions trigger real state mutations with zero dead buttons.
3. Strict adherence to product boundaries (no job board, no recruitment pipeline, no generic quiz).
4. Full cross-panel synchronization between the Trainee Portal, Employer attestation, and Administrative policy analytics.

---

## 2. PRIMARY SHOWCASE: 17-STEP END-TO-END DEMO SCRIPT

### STEP 1: Candidate Access & Persona Selection
- Navigate to `http://localhost:5173/login`.
- Select **Trainee Portal** role.
- Candidate session initializes as **Priya Sharma** (`TR-0001`), enrolled in *Cloud Infrastructure & DevOps*.

### STEP 2: Citizen Privacy & Consent Screening
- Navigate to `/trainee/consent` (or encounter overlay if consent is pending).
- Observe statutory explanation of outcome follow-up surveys and data governance.

### STEP 3: Accept Follow-Up Participation Consent
- Click **"Accept & Authorize Follow-Ups"**.
- Notice the immediate transition to the green **"Follow-Up Consent Accepted"** status badge.
- Timestamp is persisted to candidate profile.
- *(Alternative demo test)*: Click **"Revoke / Decline"** and observe the banner: *"Follow-Up Participation is Restricted"*; re-click **"Accept"** to restore access.

### STEP 4: Trainee Intelligence Dashboard
- Navigate to `/trainee/dashboard`.
- Review the 4-quadrant layout:
  - **Quadrant 1 (My Current Status)**: Certified status (88% merit score), active employment (*Cloud Systems Associate* at *Tata Consultancy Services*), verified monthly wage (₹28,500), and 6-Month retention status.
  - **Quadrant 2 (My Skill Status & Readiness)**: Top verified skills (*Linux Administration*, *Docker & Containerization*) versus identified improvement areas.
  - **Quadrant 3 (Recent Progress Timeline)**: Linear career sequence from training completion through quarterly retention checks.
  - **Quadrant 4 (Important Actions)**: Direct action triggers for all primary workflows.

### STEP 5: Coursework & Certificate Credential Verification
- Navigate to `/trainee/training`.
- Inspect official NSQF curriculum details, cohort identifier, and module assessments.
- Click **"View Certificate"**:
  - Modal opens rendering an authoritative certificate preview with candidate name, accredited provider, completion date, and credential ID.
  - Demonstrates clear watermark: *"ACCREDITED SIMULATION CREDENTIAL"*.
- Click **"Download Certificate"**:
  - Browser immediately downloads a real `Certificate_CERT-TR0001.svg` vector artifact to local disk.
  - No dead buttons or placeholder alerts.

### STEP 6: Longitudinal Employment Journey & "Last 6 Months"
- Navigate to `/trainee/employment-journey`.
- Observe the **Last 6 Months Activity Log** prominently displaying the candidate's recent quarterly check-ins, employer verifications, and wage updates.
- Explore the interactive vertical timeline spine.
- Click any milestone node (e.g. *6-Month Follow-Up Check-in*) to inspect the deep metadata dossier in the **Milestone Event Inspector**.

### STEP 7: Personal Outcomes & Wage Progression
- Navigate to `/trainee/outcomes`.
- Review the **"Where Am I Now?"** high-level status summary card.
- Inspect the interactive **SVG Wage Progression Chart** showing baseline wage (₹22,000) evolving to 6M wage (₹28,500).
- Click **"Log Wage Increment"**:
  - Modal appears; enter new wage `₹32,000`.
  - Click **"Submit Wage Update"**.
  - Notice the chart immediately re-renders adding the new data point and recalculating the growth metric to `+45.5%`.

### STEP 8: My Skills & Evidence Portfolio
- Navigate to `/trainee/skills`.
- Review the **Grounded AI Evidence Insights** banner explaining skill standing based strictly on available evidence.
- Verify that **Verified Skills** (accredited modules & employer attestation) are cleanly separated from **Trainee-Reported Gaps**.

### STEP 9 & 10: Target Role Occupational Benchmarking
- Navigate to `/trainee/skill-goals`.
- In the benchmark selector dropdown, select **"Cloud Support Engineer"**.
- Observe dynamic updates:
  - **Benchmark Coverage**: Displays `4 / 6 skills supported`.
  - **Career Transition Pathway**: Visualizes current competence versus benchmark requirements.
  - **Skill Comparison Matrix**: Tabular breakdown showing status:
    - *Linux Administration*: Supported (Advanced) ✓
    - *Docker & Containers*: Supported (Intermediate) ✓
    - *Terraform & IaC*: **Skill Gap (High Priority)** ⚠
    - *Kubernetes Orchestration*: **Skill Gap (High Priority)** ⚠

### STEP 11: Recommended Improvements
- Scroll to **Recommended Skill Improvements** on `/trainee/skill-goals` or `/trainee/skills`.
- Inspect the evidence-based recommendation:
  - Skill: *Terraform & Infrastructure as Code*
  - Rationale: *"Required by occupational benchmark Cloud Support Engineer and requested by partner employers."*
  - Bridge Course: *PRG-001-MOD-04: Declarative Cloud Infrastructure*.

### STEP 12: Submitting Trainee Skill Feedback
- Navigate to `/trainee/feedback`.
- Fill the missing skill report form:
  - Programme: *Cloud Infrastructure & DevOps*
  - Missing Skill: *Kubernetes Cluster Orchestration*
  - Gap Type: *Missing in Training*
  - Comments: *"Production environments at TCS require hands-on Kubernetes deployment."*
- Click **"Submit Skill Feedback"**.

### STEP 13: Feedback Integration Verification
- Feedback list immediately renders the new entry with status **"Included in Skill Intelligence"**.
- The Section 29 Evidence Synthesis visual diagram highlights that this feedback is now actively weighted in the intelligence engine.

### STEP 14: Complete Outcome Follow-Up
- Navigate to `/trainee/follow-ups`.
- Click **"Complete Check-in"** on the 12-Month milestone.
- Confirm employment continuity, same employer, current wage, and high training relevance.
- Submit response; checkpoint status immediately flips to **"Completed"**.

### STEP 15: Employment Status Declaration
- Navigate to `/trainee/employment`.
- Toggle between status options (*Employed*, *Self-Employed*, *Apprentice*, *Unemployed*).
- Inspect the **Employer Verification Status** card indicating verification state and employer remarks.

### STEP 16: Return to Dashboard
- Navigate back to `/trainee/dashboard`.
- Verify that the new wage (₹32,000) and completed follow-up status are reflected across all dashboard cards.

### STEP 17: Administrative Cross-Panel Verification
- Switch persona or navigate to the **Admin / Government Panel** (`/analytics`).
- Confirm that the wage update and trainee skill feedback from `TR-0001` are dynamically integrated into aggregate placement, wage growth, and curriculum gap analytics.

---

## 3. SECOND SHOWCASE STORY: JOB SWITCH & CAREER PROGRESSION BENCHMARKING

### Scenario:
A trainee currently employed as a **Junior Data Analyst** seeks to understand what is required to advance into a **Data Engineer** role.

### The Trainee Experience:
1. Open `/trainee/skill-goals`.
2. Target Role Selector is set to **"Data Engineer"**.
3. **NOT A JOB BOARD**: No "Apply" button or job vacancies are shown. Instead, an occupational competence transition analysis is presented:
   - **Supported Skills (Already Possessed)**:
     - *Python Data Processing* (Verified from coursework, Merit)
     - *SQL & Relational Databases* (Verified, Advanced)
   - **Identified Gaps (Need Acquisition)**:
     - *Data Pipelines & ETL Architecture* (Missing, High Priority)
     - *Distributed Systems & Spark* (Missing, High Priority)
     - *Cloud Data Warehousing* (Missing, Medium Priority)
4. **Actionable Transition Plan**:
   - The platform outlines the exact curriculum bridge courses: *Advanced Big Data Pipelines & Cloud Infrastructure*.
   - Candidate gains transparent guidance on what competencies must be demonstrated to qualify for advancement.

---

## 4. THIRD SHOWCASE STORY: MULTI-SOURCE EVIDENCE FUSION (KUBERNETES GAP)

### Scenario:
Demonstrating how candidate feedback, employer attestation, and curriculum design synthesize into policy-level skilling intelligence.

1. **Step A (Candidate Voice)**:
   Candidate `TR-0001` submits feedback: *"Curriculum lacked practical Kubernetes cluster deployment."*
2. **Step B (Enterprise Voice)**:
   Partner enterprise (TCS) submits employer retention feedback: *"Candidate excels at Linux administration, but requires external container orchestration training."*
3. **Step C (Skill Intelligence Synthesis)**:
   - Synthesizer identifies dual-source reinforcement (*Trainee* + *Employer*).
   - Cross-checks *Cloud Support Engineer* benchmark requiring container orchestration.
   - Designates Kubernetes as a **Verified High-Priority Gap**.
4. **Step D (Dual Resolution)**:
   - **Trainee View**: Recommends bridge module: *Kubernetes Orchestration*.
   - **Government View**: Flags *PRG-001 (Cloud Infrastructure)* for curricular enhancement, prompting the state skilling mission to update syllabus standards.
