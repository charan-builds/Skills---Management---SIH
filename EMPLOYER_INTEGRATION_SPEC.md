# EMPLOYER INTEGRATION SPECIFICATION
## HR/ATS Employment Data Integration, 5-Point Matching Engine & Verification Exceptions
### Skilling Outcomes & Impact Intelligence Platform

---

## 1. Product Boundary & Intent (Section 25)

The **Employment Data Integration Hub** (`/employer/integrations` and `/employer/integrations/exceptions`) bridges corporate Human Resources Information Systems (HRIS), Applicant Tracking Systems (ATS), and enterprise payroll gateways directly into the Skilling Outcomes Platform.

### Boundary Enforcement
This integration is strictly for **employment outcome attestation, joining verification, and payroll/retention data synchronization**. It is NOT a recruiting ATS, hiring pipeline, or candidate sourcing tool.

---

## 2. Integration Summary & Status Dashboard (Section 26 & 28)

### Organization-Specific Metrics
- **Connected Systems:** Number of active HRIS gateways configured (e.g., Workday HCM, SAP SuccessFactors, BambooHR). If none configured, explicitly shows *"No integration connected"*.
- **Employment Records Received:** Total volume of corporate employment batch records ingested.
- **Automatically Verified:** Count of claims matching all 5 deterministic verification criteria.
- **Manual Review Required:** Count of records with discrepancies routed for human HR attestation.
- **Auto Verification Rate (%):** Proportion of automated matches (e.g., 87.5%).

### Today's Verification Activity Visualization
An interactive SVG donut visualization contrasts:
- `Automatically Verified` (Green slice)
- `Manual Review Required` (Amber slice)
Provides immediate operational visibility into daily reconciliation health.

---

## 3. Connected Systems & Simulation Transparency (Sections 27 & 58)

- **System Roster:**
  - Employer System (e.g. Workday HCM, SAP SuccessFactors)
  - Integration Type (REST API / Scheduled Batch Feed / Webhook)
  - Connection Status (`Connected`, `Syncing`, `Attention Required`, `Disconnected`)
  - Last Synchronization Timestamp
- **Simulation Disclaimer (Section 58):**
  - Displays a persistent, unambiguous banner:
    > **Simulation / Demo Integration:** Demonstrating deterministic 5-point automated matching between trainee declarations and enterprise HR feeds without live third-party ATS network dependencies.

---

## 4. Automated 5-Point Matching Engine (Sections 29 & 30)

Incoming trainee declarations are evaluated against organizational HR/ATS records using deterministic 5-point criteria:

| Criterion # | Matching Field | Acceptance Rule |
|---|---|---|
| **1** | **Trainee / National ID** | Exact alignment with State Skilling Unique Trainee ID |
| **2** | **Corporate Employer Entity** | Exact match on registered corporate entity & GSTIN |
| **3** | **Candidate Legal Name** | Exact token & phonetic match on full name |
| **4** | **Employment Status** | Active full-time, contract, or apprentice employment flag |
| **5** | **Joining Date** | Date of joining within corporate offer acceptance window |

### Deterministic Engine Outcomes (Section 32)
1. **MATCH $\rightarrow$ Auto Verified:** All 5 criteria pass $\rightarrow$ claim is automatically verified, trainee status updates to `Verified`, and event logged.
2. **MISMATCH $\rightarrow$ Manual Review:** Any criterion fails $\rightarrow$ claim is flagged as an exception and routed to the manual verification queue.

### Field-by-Field Evaluation View (Section 30)
In the Matching Engine view, records display explicit visual checkmarks $\checkmark$ or discrepancy highlights:
```
Employee ID       ✓
Employer          ✓
Name              ✓
Status            ✓
Joining Date      ✗ (Claimed: 10-May-2023 vs ATS: 18-May-2023)
```

---

## 5. Verification Exceptions & Discrepancy Resolution (Section 31)

Located at `/employer/integrations/exceptions` (or the Exceptions tab):
- **Exception Record Presentation:**
  - Displays Candidate Name and ID
  - Discrepancy Field (e.g., Joining Date, Role Designation)
  - Declared Candidate Value vs Employer System Value
- **Available HR Actions:**
  1. `Confirm / Override`: HR validates the employment despite the minor date/title discrepancy. Status transitions to `Confirmed`.
  2. `Reject Claim`: HR rejects the claim based on definitive ATS record conflict. Status transitions to `Rejected`.
  3. `Request Correction`: HR inputs a guidance note requesting the candidate amend declared values. Status transitions to `Correction Requested`.

All actions perform real state mutations in `mockStore` and update cross-panel records reactively.

---

## 6. Data Synchronization Engine (Sections 33 & 34)

- **Sync Now Button:**
  - Triggers an immediate mock synchronization batch.
  - Updates integration timestamps to *"Just now"*.
  - Increments records processed and logs reconciliation events in the audit trail.
- **Sync States Supported:**
  - `Not Connected`
  - `Ready`
  - `Syncing` (animated indicator)
  - `Completed`
  - `Completed with Issues`
  - `Failed`

---

## 7. API Security & Technical Credentials (Section 35)

Collapsible Technical Settings panel providing configuration fields:
- **API Base URL:** Enterprise endpoint (e.g., `https://api.workday.com/...`)
- **Client Application ID:** Unique client identifier
- **API Secret Key:** **Permanently masked (`••••••••••••••••`)** in UI, console logs, and reports.
- **Webhook Callback Endpoint:** State webhook destination URL.
- **Actions:**
  - `Test Connection`: Performs mutual TLS handshake simulation and schema validation.
  - `Save Configuration`: Encrypts and persists settings in mock state.

---

## 8. Integration Activity Log (Section 36)

Chronological audit ledger capturing all automated integration operations:
- Timestamp (e.g., `10:45 AM`)
- Operation Name (e.g., `Automated ATS Batch Reconcile`)
- Records Processed (e.g., `48 records`)
- Execution Status (`Completed`, `Completed with Exceptions`)
- Discrepancy / Exception Count
