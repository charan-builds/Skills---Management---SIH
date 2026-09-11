# Frontend Data Architecture: Skilling Impact Intelligence Platform

## Executive Summary

The **Skilling Impact Intelligence Platform** operates on a **frontend-first, deterministic, relational data architecture**. Designed to operate reliably regardless of backend availability, the platform maintains a single source of truth within client-side memory and persistent storage (`localStorage`), accessed through an abstraction barrier consisting of:
1. **Canonical Schema Models** (`canonicalModel.js`)
2. **Reactive Shared In-Memory Store** (`mockStore.js`)
3. **Transparent Service Adapter** (`platformService.js`)
4. **Pure Derived Metric Selectors** (Zero static or hardcoded metrics)

This document specifies the internal data schemas, relational topology, identity constraints, reactive mutation lifecycle, and mathematical metric selectors that drive the platform across Trainee, Organisation/Employer, and Admin portals.

---

## 1. Architectural Overview & Component Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                            │
│                                                                         │
│   ┌──────────────────┐   ┌──────────────────────┐   ┌────────────────┐  │
│   │  Trainee Portal  │   │ Organisation Portal  │   │  Admin Portal  │  │
│   │ (Trainee Context)│   │  (Employer Tenant)   │   │(Longitudinal)  │  │
│   └─────────┬────────┘   └──────────┬───────────┘   └────────┬───────┘  │
└─────────────┼───────────────────────┼────────────────────────┼──────────┘
              │                       │                        │
              ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SERVICE ADAPTER LAYER                            │
│                     (Frontend/src/services/platformService.js)          │
│                                                                         │
│   • Asynchronous Promise-based interface matching future REST/GraphQL   │
│   • Simulated network boundaries (wait ticks)                           │
│   • Role-based tenant isolation & payload normalization                 │
│   • Strict input validation & error state handling                      │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       REACTIVE STATE MANAGER                            │
│                       (Frontend/src/services/mockStore.js)              │
│                                                                         │
│   • Singleton Store Instance (`MockStore`)                              │
│   • Deterministic PRNG Seeder (800 Trainees, 12 Employers, Programs)    │
│   • Pub/Sub Observer Pattern (`subscribe`, `notify`)                    │
│   • Cross-Tab Synchronization (`window.addEventListener('storage')`)    │
│   • LocalStorage Persistence (`sii_mock_store_v3`)                      │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CANONICAL DATA ENTITIES                          │
│                     (Frontend/src/services/canonicalModel.js)           │
│                                                                         │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────┐   │
│   │   Trainees   │   │  Employers   │   │Verifications │   │Feedback│   │
│   │  (TR-XXXX)   │   │  (EMP-XXXX)  │   │  (VCL-XXXX)  │   │(FB-XXX)│   │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └────┬───┘   │
│          │                  │                  │                │       │
│          ▼                  ▼                  ▼                ▼       │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────┐   │
│   │  Employment  │   │  Milestones  │   │ Wage Records │   │Skills  │   │
│   │  Contracts   │   │(3M, 6M, 12M) │   │  & Growth    │   │Evidence│   │
│   └──────────────┘   └──────────────┘   └──────────────┘   └────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Permanent Identifier (PID) Identity Scheme

To guarantee non-repudiation, longitudinal traceability, and referential integrity across all three portals, all primary keys conform to strict deterministic prefix conventions:

| Entity | ID Format | Generation Rule | Immutability Principle | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Trainee** | `TR-XXXX` | 4-digit zero-padded index (`TR-0001` to `TR-0800`) | Permanent citizen identifier. Never changes across jobs, programs, or outcomes. | `TR-0042` |
| **Employer** | `EMP-DEMO-XXX` | Fixed tenant slug or counter (`EMP-DEMO-001`) | Corporate enterprise identifier. Scopes workforce rosters and verification inboxes. | `EMP-DEMO-001` (TCS) |
| **Verification Claim** | `VCL-XXXXXX` | Prefix + random alphanumeric nonce | Unique per verification attempt; preserves historical audit trail even after rejection. | `VCL-9A2F4D` |
| **Follow-Up Checkpoint** | `FU-{TraineeID}-{Milestone}` | Composed from Trainee ID + Milestone | Unique per milestone event (3M, 6M, 12M). | `FU-TR-0001-6M` |
| **Wage Record** | `WAG-{TraineeID}-{Index}` | Composed from Trainee ID + Sequence | Sequential chronological increment event. | `WAG-TR-0001-02` |
| **Skill Feedback** | `SFB-{Timestamp}-{Hash}` | Microsecond timestamp + role prefix | Ingested into multi-source synthesis queue. | `SFB-174152-A9F` |

---

## 3. Canonical Relational Schemas

### 3.1 Trainee Entity (`TraineeRecord`)
```typescript
interface TraineeRecord {
  id: string;                       // Permanent ID (TR-XXXX)
  name: string;                     // Full legal candidate name
  gender: "Male" | "Female" | "Other";
  category: "General" | "OBC" | "SC" | "ST";
  phone: string;                    // Obfuscated / verified contact
  district: string;                 // Domicile / Training district
  state: string;                    // State jurisdiction (e.g. Maharashtra)
  
  // Training Context
  programme: string;                // e.g. "PMKVY 4.0", "DDU-GKY"
  provider: string;                 // Training Partner Name
  centre: string;                   // Training Centre Location
  sector: string;                   // Industry Sector (e.g. "IT-ITeS")
  course: string;                   // Specific Qualification Pack / Course
  cohort: string;                   // Cohort Year & Batch (e.g. "2024-Q1")
  training_status: "Completed" | "Certified" | "Dropped Out";
  enrolment_date: string;           // ISO YYYY-MM-DD
  completion_date: string;          // ISO YYYY-MM-DD
  assessment_score: number;         // 0 - 100
  certifications: Certification[];  // Issued verified credentials

  // Statutory Consent (Digital Personal Data Protection Act)
  statutory_consent: {
    granted: boolean;
    granted_at: string;             // ISO Timestamp
    consent_purpose: string[];      // ["Employment Verification", "Government Tracking"]
    can_revoke: boolean;
  };

  // Employment Lifecycle
  employment: {
    status: "EMPLOYED" | "SELF_EMPLOYED" | "APPRENTICESHIP" | "UNEMPLOYED";
    employer_id?: string;           // Foreign Key -> Employer.id
    employer_name?: string;
    job_role?: string;
    work_location?: string;
    starting_wage: number;          // Base INR monthly gross
    current_wage: number;           // Current INR monthly gross
    employment_type: "Full-Time" | "Contract" | "Apprenticeship";
    offer_letter_url?: string;
    joining_date?: string;
    verification_status: "Unverified" | "Pending Employer Confirmation" | "Correction Requested" | "Confirmed" | "Rejected";
    verification_claim_id?: string; // Foreign Key -> VerificationClaim.id
    employer_remarks?: string;
    attrition_reason?: string;      // Populated if status transitions to UNEMPLOYED
  };

  // Longitudinal Retention Checkpoints
  retention: {
    is_active: boolean;
    retained_3m: "Retained" | "Left Employment" | "In Progress";
    retained_6m: "Retained" | "Left Employment" | "In Progress";
    retained_12m: "Retained" | "Left Employment" | "In Progress";
    last_confirmed: string;
  };

  // Relational Sub-collections
  wage_history: WageHistoryItem[];
  follow_ups: FollowUpItem[];
  skills_evidence: SkillEvidenceItem[];
  feedback_history: TraineeFeedbackItem[];
  timeline_events: LongitudinalTimelineEvent[];
}
```

### 3.2 Employer & Verification Claim Entities
```typescript
interface EmployerRecord {
  id: string;                       // Primary Key (EMP-DEMO-001)
  name: string;                     // Enterprise Legal Entity Name
  industry: string;                 // Sector / Industry classification
  district: string;                 // Registered office district
  state: string;
  contact_person: string;
  contact_email: string;
  verified_employees_count: number;
  pending_verifications_count: number;
}

interface VerificationClaim {
  id: string;                       // Primary Key (VCL-XXXXXX)
  trainee_id: string;               // Foreign Key -> Trainee.id
  trainee_name: string;
  programme: string;
  employer_id: string;              // Foreign Key -> Employer.id
  employer_name: string;
  submitted_job_role: string;
  submitted_wage: number;
  submitted_joining_date: string;
  proof_document_name: string;
  status: "Pending" | "Confirmed" | "Correction Requested" | "Rejected";
  rejection_reason?: string;
  correction_remarks?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}
```

### 3.3 Longitudinal Timeline & Assisted Outreach Entities
```typescript
interface FollowUpItem {
  id: string;                       // FU-TR-0001-6M
  milestone: "3-Month" | "6-Month" | "12-Month";
  target_date: string;              // Deterministically derived from completion_date
  status: "Due" | "Upcoming" | "Completed" | "Missed" | "Needs Assistance";
  completed_date?: string;
  outreach_attempts: number;
  last_attempt_date?: string;
  last_attempt_channel?: "Government Call Center (Assisted)" | "In-Person Domicile" | "WhatsApp";
  notes?: string;
}

interface WageHistoryItem {
  id: string;
  effective_date: string;
  monthly_wage: number;
  recorded_by: "Trainee Submission" | "Employer Attestation" | "Assisted Verification";
  supporting_doc?: string;
}
```

---

## 4. Reactive State Store (`mockStore.js`) Architecture

### 4.1 In-Memory Persistence & Multi-Tab Synchronization
The platform utilizes an event-driven singleton pattern:
1. **Instantiation**: Checks `localStorage.getItem('sii_mock_store_v3')`. If absent or corrupted, invokes `generateDeterministicDataset()` producing exactly 800 trainees seeded with seed `0x511A`.
2. **Subscription Engine**: Components register callbacks via `mockStore.subscribe(listener)`. Every state-modifying method invokes `this.notify()`, triggering immediate rerenders across all active views without requiring page reloads.
3. **Cross-Tab Event Dispatch**: State updates emit `window.dispatchEvent(new StorageEvent('storage', ...))` enabling instant real-time synchronization between a Trainee view in Tab 1 and an Employer view in Tab 2.

```javascript
class MockStore {
  constructor() {
    this.listeners = new Set();
    this.init();
    window.addEventListener('storage', (e) => {
      if (e.key === 'sii_mock_store_v3') {
        this.reloadFromStorage();
        this.notify();
      }
    });
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.saveToStorage();
    this.listeners.forEach(fn => fn(this.state));
  }
}
```

---

## 5. Pure Derived Metric Selectors

To ensure zero hardcoded values, all dashboard figures, macro KPIs, and analytical distributions are computed using deterministic mathematical selectors:

### 5.1 Outcome Placement Rate ($\mathcal{P}$)
$$\mathcal{P} = \frac{N_{\text{EMPLOYED}} + N_{\text{SELF\_EMPLOYED}} + N_{\text{APPRENTICESHIP}}}{N_{\text{TOTAL\_FILTERED\_POPULATION}}} \times 100$$

### 5.2 6-Month Retention Rate ($\mathcal{R}_{6M}$)
$$\mathcal{R}_{6M} = \frac{\sum [t.\text{retention.retained\_6m} == \text{"Retained"}]}{\sum [t.\text{retention.retained\_6m} \in \{\text{"Retained"}, \text{"Left Employment"}\}]} \times 100$$

### 5.3 Average Monthly Wage Growth ($\bar{\Delta W}$)
$$\bar{\Delta W} = \frac{1}{|E_{\text{active}}|} \sum_{t \in E_{\text{active}}} \left( \frac{W_{\text{current}}(t) - W_{\text{starting}}(t)}{W_{\text{starting}}(t)} \right) \times 100$$

### 5.4 Multilateral Skill Gap Ranking
The skill gap priority score ($\mathcal{S}_{\text{gap}}$) fuses feedback from both employers and trainees:
$$\mathcal{S}_{\text{gap}}(k) = 2.0 \times \text{Count}_{\text{Employer}}(k) + 1.0 \times \text{Count}_{\text{Trainee}}(k)$$

---

## 6. Privacy Protection: $k$-Anonymity Cell Suppression ($N < 5$)

In strict compliance with statutory government data governance rules (Section 34, 48), any aggregated group, slice, or district drill-down containing fewer than 5 individuals ($N < 5$) suppresses granular metrics to prevent re-identification:

```javascript
export function applyPrivacyThreshold(count, metricValue) {
  if (count > 0 && count < 5) {
    return {
      suppressed: true,
      display: "< 5 (Suppressed for Privacy)",
      value: null
    };
  }
  return {
    suppressed: false,
    display: metricValue,
    value: metricValue
  };
}
```

---

## 7. Data Ingestion & State Reset Guarantees

- **State Reset Capability**: Admins or test drivers can trigger `platformService.resetDataset()` at any time.
- **Deterministic Re-seeding**: Always returns the store to the exact pristine baseline of 800 records with predictable sample profiles (`TR-0001` = Arjun Kadam, `EMP-DEMO-001` = Tata Consultancy Services).
- **Zero Leakage**: Local storage keys are cleanly namespaced under `sii_mock_store_v3`.
