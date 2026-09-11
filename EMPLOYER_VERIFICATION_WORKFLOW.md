# EMPLOYER VERIFICATION WORKFLOW SPECIFICATION
## Comprehensive End-to-End Governance & Lifecycle Documentation
### Skilling Outcomes & Impact Intelligence Platform

---

## 1. Workflow Architecture & Lifecycle Overview

The verification workflow bridges Trainee declarations, Employer authoritative validations, and State Skilling Admin oversight.

```
       TRAINEE PORTAL                  ORGANISATION PORTAL                  ADMIN PANEL
       ==============                  ===================                  ===========
              |                                 |                                |
  [Trainee Declares Employment]                 |                                |
              |                                 |                                |
              +-------- (Generates Claim) ----->|                                |
                                                |                                |
                                     [Review Trainee Claim]                      |
                                                |                                |
                        +-----------------------+-----------------------+        |
                        |                       |                       |        |
                        v                       v                       v        |
               [Confirm Employment]       [Reject Claim]      [Request Correction]
                        |                       |                       |        |
                        v                       v                       v        |
               Status: Confirmed        Status: Rejected      Status: Correction |
                        |                       |                       |        |
                        +-----------+-----------+                       |        |
                                    |                                   |        |
                                    v                                   |        |
                         [Shared Mock Store (v3)]                       |        |
                                    |                                   |        |
                                    +---------------------------------->+        |
                                    |                     [Admin Analytics Update]
                                    v                                            |
                      [Trainee Receives Attestation]                             |
                                    ^                                            |
                                    |                                            |
                                    +--- (Trainee Resubmits Updated Claim) <-----+
```

---

## 2. Employer Registration & State Attestation (Sections 3–5)

1. **Self-Registration (`/employer/login`):**
   - Organisation submits legal entity metadata:
     - Organisation Legal Name
     - Registration Number / GSTIN
     - Sector & Industry Category
     - Headquarter District / State
     - Authorised Corporate Representative (Name, Email, Phone)
     - Enterprise HRIS / ATS Gateway type
   - Initial State: `verification_status = "Pending"`
2. **Admin Verification Review (`/admin/employers`):**
   - State Administrators audit corporate credentials, verify GSTIN authenticity, and approve or reject registration.
   - Outcome: Transitions employer status to `Verified` (or `Rejected`).
3. **Read-Only Status Badge (Section 5):**
   - In both topbar and profile, employers display an unmodifiable status badge:
     - `Verified Organisation` (Green shield check)
     - `Verification Pending Admin Review` (Amber clock)
     - `Verification Rejected` (Red X)
   - Badge is strictly read-only for the employer and change-managed solely by Administrators.

---

## 3. Verification Inbox & Claim Review (Sections 8–9)

1. **Inbox Roster (`/employer/verifications`):**
   - Organised roster presenting all candidate claims targeting the authenticated enterprise.
   - Omni-search filters across candidate names, trainee IDs, and claimed job designations.
   - Status filters: `All`, `Pending`, `Confirmed`, `Rejected`, `Correction Requested`.
2. **Authorised Data Display:**
   - Displays authorized attributes: Trainee ID, Display Name, Claimed Role, Joining Date, Engagement Type (Full-time / Apprenticeship), and Trainee-reported Wage.
   - Strict candidate privacy suppression: Demographic personal data (Aadhaar, parents, caste, personal phone) is shielded.

---

## 4. Attestation Decisions & State Transitions (Sections 10–13)

### 4.1. Confirm Employment (Section 10)
- **Trigger:** Employer clicks `Confirm Employment` in claim detail drawer.
- **State Mutations:**
  - `verification.status` $\rightarrow$ `Confirmed`
  - `verification.verified_at` $\rightarrow$ current timestamp
  - Linked `trainee.employment.verification_status` $\rightarrow$ `Verified`
  - Appends timeline event to trainee record: `Employer Verified Employment`.
  - Appends event to `employer_activities`: `CLAIM_CONFIRMED`.
- **Downstream Synchronization:**
  - Trainee immediately sees green `Verified` badge in Trainee Portal.
  - Admin Placement & Verified Outcome metrics recalculate dynamically.

### 4.2. Reject Claim (Section 11)
- **Trigger:** Employer clicks `Reject Claim`.
- **Reason Requirement:** Modal mandates selecting or providing a formal rejection reason:
  - *Candidate never worked here*
  - *Incorrect employment details*
  - *Incorrect joining date*
  - *Incorrect role*
  - *Other specified discrepancies*
- **State Mutations:**
  - `verification.status` $\rightarrow$ `Rejected`
  - `trainee.employment.verification_status` $\rightarrow$ `Rejected`
  - Trainee employment record is marked `UNEMPLOYED`. Record is NOT deleted (maintains longitudinal auditability).
  - Appends event to `employer_activities`: `CLAIM_REJECTED`.

### 4.3. Request Correction & Resubmission (Section 12 & 48)
- **Trigger:** Employer clicks `Request Correction`.
- **Employer Note:** Employer provides specific guidance (e.g., *"Joining date is incorrect; please adjust to 18-May-2023"*).
- **State Mutations:**
  - `verification.status` $\rightarrow$ `Correction Requested`
  - `trainee.employment.verification_status` $\rightarrow$ `Correction Requested`
  - Employer note stored in `trainee.employment.employer_remarks`.
- **Resubmission Flow:**
  - Trainee logs into Trainee Portal, views employer's note.
  - Trainee corrects the date or role and clicks `Resubmit for Verification`.
  - Claim transitions back to `Pending` in the employer's inbox.
  - Employer reviews the revised claim and proceeds with confirmation.

---

## 5. Traceability & Verification History (Section 13)

- All confirmation, rejection, and correction events are recorded in the central event log.
- History view documents:
  - Trainee identifier & original claim
  - Employer decision timestamp
  - Specific decision reason / correction remarks
  - Current attestation status
