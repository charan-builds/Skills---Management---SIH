# ORGANISATION SHOWCASE WORKFLOW
## 19-Step Complete Demonstration Script for Evaluators & Reviewers
### Skilling Outcomes & Impact Intelligence Platform

---

## Overview

This document specifies the exact, reproducible 19-step demonstration workflow for validating the **Organisation / Employer Portal**, demonstrating its real-time multi-tenant reactive integration with the Trainee Portal and State Admin Panel.

---

## Step-by-Step Demonstration Flow (Section 54)

### STEP 1: Login as Authorised Employer
1. Navigate to `http://localhost:5173/employer/login`.
2. Notice the dual-tab interface: *Authorised Organisation Login* and *Register New Organisation*.
3. Under *Deterministic Demo Orgs*, click the **Login →** button next to **Tata Consultancy Services** (`EMP-DEMO-001`).
4. System authenticates and immediately redirects to `/employer/dashboard`.

### STEP 2: Verify Dashboard Visualizations & Operational KPIs
1. Observe the topbar: Legal Name **Tata Consultancy Services**, sector Information Technology, and green **Verified Employer** badge (Section 5).
2. Review the 4-card KPI grid:
   - Pending Verification Requests
   - Verified Employment Records
   - Current Verified Workforce
   - Longitudinal 6-Month Retention Benchmark (84.6%)
3. Review the **Workforce Status Distribution** SVG donut (Currently Employed vs Resigned vs Terminated vs Contract Completed).
4. Review the **Claim Attestation Breakdown** SVG donut (Confirmed vs Pending vs Rejected vs Correction).
5. Inspect the **Skills We Need** ranked bar chart and the real-time **Recent Operational Activity Stream**.

### STEP 3: Navigate to Verification Inbox
1. Click **Verification Requests** in the sidebar (or topbar navigation).
2. URL loads `/employer/verifications`.
3. Observe the full candidate claims table, search bar, and status/type filter pills.

### STEP 4: Open a Pending Trainee Claim
1. Filter by `Pending Action` or locate candidate **Arjun Kadam** (`TR-0001`).
2. Click the row or click **Review Claim →**.
3. A detail drawer slides in from the right.

### STEP 5: Review Claim Parameters
1. Inspect candidate information:
   - Name: Arjun Kadam (ID: `TR-0001`)
   - Claimed Role: Cloud Systems Associate
   - Joining Date: `2023-05-01`
   - Engagement Type: Regular Full-time
   - Claimed Wage: ₹26,000 / month
2. Notice that private demographic records (Aadhaar, parents, personal address) are strictly suppressed.

### STEP 6: Execute "Confirm Employment"
1. In the claim drawer, click the green **Confirm Employment** button.
2. Confirm the action in the review dialog.
3. Observe claim status immediately updates to `Confirmed` with timestamp, and a success banner confirms state mutation.

### STEP 7: Cross-Panel Verification (Trainee Portal)
1. Open a new tab or navigate to `http://localhost:5173/trainee/dashboard` (authenticated as `TR-0001`).
2. Open **Employment Journey** or **Employment Status**.
3. **Verification:** The employment card now shows green status **"Verified ✓"** attested by Tata Consultancy Services!

### STEP 8: Cross-Panel Verification (Admin Panel)
1. Navigate to `http://localhost:5173/admin/outcomes` or `/admin/employment`.
2. **Verification:** The state-wide verified placement count has incremented dynamically, reflecting the new employer attestation.

### STEP 9: Return to Employer Portal — Verified Workforce Roster
1. Return to the employer window and click **Verified Workforce** in the sidebar (`/employer/workforce`).
2. Observe the active workforce roster displaying attested employees for Tata Consultancy Services.

### STEP 10: Select Employee & Update Lifecycle Status
1. Locate an active employee row and click **Edit** under Employment Status (or open employee detail).
2. Select **Resigned** from the lifecycle dropdown.
3. Form prompts for departure date and reason:
   - Departure Date: Today's date
   - Reason: *Career progression / higher wage offer*
   - Remarks: *"Accepted senior engineer position elsewhere."*
4. Click **Confirm Status Update**.
5. Observe status updates immediately to `Resigned`, and top workforce KPIs recalculate.

### STEP 11: Execute Wage Confirmation
1. In the workforce roster, click **Confirm Wage →** for an unverified wage row.
2. Modal displays the trainee's self-reported salary (₹28,000 / mo).
3. Select **Confirmed** (or **Cannot Disclose** to test corporate confidentiality policy).
4. Click **Submit Wage Response**. Status reflects confirmed.

### STEP 12: Execute Job Role Attestation
1. Click **Verify Role →** for a trainee row.
2. Modal presents trainee claimed title.
3. Select **Confirmed** (or **Not Confirmed** with corrected band title).
4. Click **Save Role Attestation**.

### STEP 13: Report Workplace Skill-Gap Feedback
1. Navigate to **Skills We Need** in the sidebar (`/employer/feedback`).
2. Review the **Multi-Source Evidence Fusion Model** diagram.
3. Under *Report Missing or Difficult Workplace Skill*:
   - Select Programme: *Cloud Infrastructure & DevOps (PRG-001)*
   - Role Context: *DevOps & Cloud Associate*
   - Skill Gap: Type or select *Kubernetes & Container Orchestration*
   - Curriculum Rating: 3 Stars
   - Comments: *"Candidates require stronger multi-node Kubernetes troubleshooting experience."*
4. Click **Submit Employer Skill Feedback**.
5. Observe feedback immediately appears in the *Feedback History Log* and updates the *Skills We Need* ranked intelligence card.

### STEP 14: Navigate to Employment Data Integration Hub
1. Click **Employment Data Integration** in the sidebar (`/employer/integrations`).
2. Observe the **Simulation / Demo Integration** transparent disclaimer.

### STEP 15: Review Integration Summary & Matching Engine
1. Review the summary metrics: Connected Systems, Records Received, Automatically Verified (87.5%), and Exceptions.
2. Inspect the **Today's Verification Activity** SVG donut.
3. Switch to the **Automated Matching Engine** tab.
4. Review the 5-point evaluation criteria table (Trainee ID, Employer, Name, Status, Date).
5. Compare rows with status **MATCH ✓** (5 checkmarks) vs. **MISMATCH** (discrepancy highlighted).

### STEP 16: Execute "Sync Now"
1. Click the blue **Sync Now** button at the top right.
2. Watch the animated sync spinner and progress state.
3. Success banner displays: *"Reconciliation complete! Updated 4 employment records."*
4. Last Sync timestamp updates to *"Just now"*.

### STEP 17: Inspect Verification Exception & Discrepancy
1. Switch to the **Verification Exceptions** tab (`/employer/integrations/exceptions`).
2. Review a mismatch record: Candidate Sneha Patil (`TR-0002`).
3. Discrepancy identified: **Joining Date Mismatch**
   - Declared Value: `10-May-2023`
   - Employer System Value: `18-May-2023`

### STEP 18: Resolve Verification Exception
1. Click **Review & Resolve**.
2. Review the discrepancy modal.
3. Click **Confirm / Override** to accept the claim despite the date difference (or input correction notes and click *Request Correction*).
4. Discrepancy is resolved; count decrements, and mockStore updates.

### STEP 19: Cross-Panel Verification in Admin Intelligence
1. Switch to the Admin Panel at `http://localhost:5173/admin/skill-gaps`.
2. **Verification:** The newly submitted employer feedback on *Kubernetes & Container Orchestration* is aggregated into the Admin Skill Gap and Policy Intervention matrix!
