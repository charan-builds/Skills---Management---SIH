# TRAINEE SKILL INTELLIGENCE SPECIFICATION
## EVIDENCE-BASED COMPETENCY MAPPING, GAP ANALYSIS & OCCUPATIONAL BENCHMARKING

---

## 1. PURPOSE & DESIGN PRINCIPLE

The **Trainee Skill Intelligence Engine** translates vocational training outcomes, workplace performance attestation, and candidate feedback into a transparent competency model. 

It strictly adheres to the principle of **evidence traceability**:
1. **Never fabricate proficiency scores**: A skill is only rated if explicit evidence exists.
2. **Clear provenance separation**: Verified assessment evidence is strictly distinguished from trainee self-reports and employer sentiment.
3. **Occupational benchmarks as guideposts**: Target roles represent competency standards, not vacancies or job ads.

---

## 2. CANONICAL EVIDENCE STATES (SECTION 45)

Every skill assessment, target role readiness evaluation, and recommendation is governed by one of four explicit evidence states:

| Evidence State | Trigger Condition | UI Manifestation |
| :--- | :--- | :--- |
| `EVIDENCE_AVAILABLE` | Rigorous coursework assessment or employer attestation exists with sufficient samples. | Full proficiency rating, confidence level badge, and detailed evidence dossier. |
| `INSUFFICIENT_SKILL_EVIDENCE` | Trainee has only self-reported the skill or evidence is limited to single low-fidelity data point. | Displayed with amber alert: *"Some evidence exists, but not enough for a reliable assessment."* |
| `NO_EVIDENCE` | Skill is required by role or curriculum but no assessment, attestation, or feedback exists. | Displayed as unverified gap with notice: *"No reliable skill evidence exists."* |
| `NO_BENCHMARK` | Trainee has selected an occupational role that has no defined national competency standard. | Displays notice: *"Target role benchmark is unavailable."* Prevents fake percentage generation. |

---

## 3. MULTI-STREAM EVIDENCE ARCHITECTURE

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ Stream A: Verified Assessment   │   │ Stream B: Employer Feedback     │
│ • NSQF Curriculum Modules       │   │ • 3M/6M Retention Reviews       │
│ • Accredited Provider Scores    │   │ • Workplace Task Relevance      │
│ • Practical Examination Results │   │ • Competency Attestation        │
└────────────────┬────────────────┘   └────────────────┬────────────────┘
                 │                                     │
                 ▼                                     ▼
         ┌─────────────────────────────────────────────────────┐
         │             SKILL INTELLIGENCE ENGINE               │
         │  • Multi-source Evidence Normalization              │
         │  • Weighted Provenance Score (Assessment: 60%,      │
         │    Employer: 30%, Self-Report: 10%)                 │
         │  • Dynamic Gap Detection against Target Benchmarks  │
         └─────────────────────────┬───────────────────────────┘
                                   │
                                   ▲
                 ┌─────────────────┴───────────────────┐
                 │ Stream C: Trainee Feedback          │
                 │ • Self-Perceived Training Gaps      │
                 │ • Curriculum Omission Reports       │
                 │ • Training Relevance Reflections    │
                 └─────────────────────────────────────┘
```

### Provenance Classification:
- **Verified / Evidence-Backed Skills**:
  - Direct output of completed coursework modules and examination rubrics.
  - Examples: *Linux System Administration*, *Docker & Containerization*, *Python Automation*, *SQL Analytics*.
- **Trainee-Perceived Skill Gaps**:
  - Citizen submissions indicating missing topics or practical deficits in training.
  - Stored under `trainee.skill_feedback_history`. Never silently alters or overwrites verified records.
- **Employer Skill Feedback**:
  - Derived from periodic employer follow-ups and enterprise integration feeds.
  - Serves as external validation of workplace competence.

---

## 4. OCCUPATIONAL TARGET ROLE BENCHMARK CATALOG

Target roles function exclusively as skill benchmarks. The platform provides 6 industry-calibrated occupational rubrics:

### 1. Junior Data Analyst (`ROLE-JDA`)
- **Sector**: Information Technology / Analytics (NSQF Level 5)
- **Target Skills**: Python (Advanced), SQL (Advanced), Data Cleaning (Advanced), Power BI / Visualization (Intermediate), Statistical Inference (Intermediate).
- **Core Progression Pathway**: Baseline vocational entry into data management.

### 2. Data Engineer (`ROLE-DE`)
- **Sector**: Information Technology / Cloud & Big Data (NSQF Level 6)
- **Target Skills**: Python (Advanced), SQL (Advanced), Data Pipelines & ETL (Advanced), Apache Spark (Intermediate), Cloud Architecture (Intermediate), Distributed Systems (Intermediate).
- **Bridge Course**: *Advanced Big Data Pipelines & Cloud Infrastructure*.

### 3. Cloud Support Engineer (`ROLE-CSE`)
- **Sector**: Cloud & DevOps (NSQF Level 5)
- **Target Skills**: Linux Administration (Advanced), Networking & Security (Advanced), AWS/GCP Core Services (Advanced), Docker (Intermediate), Terraform (Intermediate), Scripting (Intermediate).
- **Bridge Course**: *Cloud Operations & Infrastructure as Code*.

### 4. Full Stack Web Developer (`ROLE-FSD`)
- **Sector**: Software Development (NSQF Level 6)
- **Target Skills**: JavaScript / TypeScript (Advanced), React (Advanced), Node.js / Express (Advanced), SQL & NoSQL (Advanced), REST APIs (Advanced), Git & CI/CD (Intermediate).
- **Bridge Course**: *Enterprise Full Stack Engineering*.

### 5. EV Maintenance Specialist (`ROLE-EVM`)
- **Sector**: Automotive / Electric Mobility (NSQF Level 5)
- **Target Skills**: High Voltage Electrical Safety (Advanced), Battery Management Systems (Advanced), CAN-bus Diagnostics (Intermediate), Electric Motor Maintenance (Intermediate), Schematics (Intermediate).
- **Bridge Course**: *High-Voltage Powertrain Diagnostics*.

### 6. Healthcare Diagnostic Technician (`ROLE-HDT`)
- **Sector**: Healthcare & Life Sciences (NSQF Level 5)
- **Target Skills**: Medical Equipment Calibration (Advanced), Patient Vital Monitoring (Advanced), Infection Control Protocols (Advanced), Digital Health Records (Intermediate), Diagnostic Imaging Prep (Intermediate).
- **Bridge Course**: *Advanced Biomedical Equipment Handling*.

---

## 5. SKILL MATCH & READINESS CALCULATION

### Readiness Formula:
$$\text{Coverage Count} = \sum_{s \in \text{BenchmarkSkills}} \mathbb{I}(\text{TraineeStatus}(s) = \text{"Supported"})$$
$$\text{Readiness Metric} = \frac{\text{Supported Skills}}{\text{Total Required Skills}}$$

### Strict Computation Safeguards:
1. If no benchmark exists for the selected role: return status `NO_BENCHMARK`.
2. If trainee has no verified coursework or assessment data: return status `NO_EVIDENCE`.
3. If fewer than 2 evidence data points exist: return status `INSUFFICIENT_SKILL_EVIDENCE`.
4. Readiness percentage is never rendered in isolation; it is always displayed alongside the explicit itemized comparison table.

---

## 6. EVIDENCE-BASED RECOMMENDATIONS ENGINE

Recommendations are generated dynamically by correlating identified skill gaps with verified coursework modules and employer demand:

```json
{
  "recommendations": [
    {
      "skill": "Terraform & Infrastructure as Code",
      "priority": "High",
      "reason": "Required for target role Cloud Support Engineer and highlighted by 3 partner employers.",
      "related_module": "PRG-001-MOD-04: Declarative Infrastructure Orchestration",
      "evidence_sources": [
        "Occupational Benchmark: Cloud Support Engineer",
        "Employer Outcome Feedback (TCS, Infosys)",
        "Trainee Self-Identified Deficit"
      ]
    }
  ]
}
```

### Absence of "Fake AI":
- Recommendations use transparent heuristic deduction rather than mysterious predictive labels.
- The interface explicitly attributes *why* an action is recommended:
  *"Based on your available skill evidence and the selected role benchmark, Terraform is a priority gap because it is required at Advanced level but your coursework only reached Fundamentals."*
