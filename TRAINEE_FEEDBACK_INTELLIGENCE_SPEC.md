# TRAINEE FEEDBACK & EVIDENCE SYNTHESIS SPECIFICATION
## MULTI-SOURCE EVIDENCE FUSION: CANDIDATE, EMPLOYER & CURRICULAR INTELLIGENCE

---

## 1. THE EVIDENCE SYNTHESIS FORMULA (SECTION 29 & 56)

A central innovation of the platform is the systematic synthesis of four distinct evidence streams to produce high-confidence skill intelligence without relying on opaque "black box" algorithms.

```
       TRAINEE FEEDBACK                   EMPLOYER FEEDBACK
(Self-perceived curriculum gaps)     (Workplace task demands & gaps)
               │                                    │
               └─────────────────┬──────────────────┘
                                 │
                                 ▼
                     VERIFIED COURSEWORK EVIDENCE
                     (Assessment scores & modules)
                                 │
                                 ▼
                    TARGET ROLE BENCHMARK RUBRIC
                     (National occupational spec)
                                 │
                                 ▼
                 SYNTHESIZED SKILL INTELLIGENCE
                                 │
          ┌──────────────────────┴──────────────────────┐
          ▼                                             ▼
  TRAINEE PORTAL                                  ADMIN PANEL
• Personalized Skill Recommendations            • Curriculum Revision Priorities
• Bridge Module Suggestions                     • Provider Efficacy Metrics
• Gap Priority Matrix                           • Systemic Industry Deficits
```

---

## 2. THE FOUR INDEPENDENT EVIDENCE STREAMS

### Stream 1: Trainee Perceived Skill Feedback
- **Source**: Submitted via `/trainee/feedback`.
- **Nature**: Subjective citizen reflection on training deficiencies.
- **Fields Captured**:
  - Programme ID / Name
  - Perceived Missing Skill (e.g., *Kubernetes*, *Terraform*, *Cloud Cost Governance*)
  - Gap Categorization (*Missing entirely from syllabus*, *Insufficient hands-on lab practice*, *Outdated toolchain*)
  - Trainee Qualitative Reflection
  - Timestamp
- **Storage Isolation**: Saved to `trainee.skill_feedback_history`. Crucially, this **never overwrites** verified assessment scores. It is designated as *Trainee-Perceived*.

### Stream 2: Employer Workplace Feedback
- **Source**: Enterprise quarterly feedback and automated HRIS/verification webhooks.
- **Nature**: Practical assessment of candidate on-the-job capability.
- **Fields Captured**:
  - Employer Enterprise ID & Name
  - Observed Workplace Skill Shortage (e.g., *Container orchestration required for production deployments*)
  - Severity Rating (*Critical blocker*, *Secondary improvement need*)
  - Timestamp
- **Storage Isolation**: Stored independently in `employer_feedback` repository.

### Stream 3: Verified Assessment Evidence
- **Source**: Official training provider assessment records and NSQF module outcomes.
- **Nature**: Objective, accredited academic/vocational evaluation.
- **Fields Captured**:
  - Completed modules with percentage mastery
  - Practical lab scores
  - Examination pass status
- **Storage Isolation**: Embedded in `trainee.verified_skills` and `trainee.training_history`.

### Stream 4: Target Role Benchmark Rubrics
- **Source**: National Occupational Standards (NOS) and industry skill matrices.
- **Nature**: Explicit competency expectations for a specific occupational title.
- **Fields Captured**:
  - Required skills and mandatory proficiency thresholds (e.g., *Docker: Advanced*, *SQL: Intermediate*).

---

## 3. REAL-WORLD EVIDENCE AGGREGATION SCENARIOS

### Scenario A: High-Confidence Observed Gap (Kubernetes / IaC)
1. **Trainee Action**: Enrolled in *Cloud Infrastructure & DevOps*. Trainee completes training and enters workplace. Trainee submits feedback: *"Curriculum lacked practical Kubernetes cluster deployment."*
2. **Employer Action**: Partner employer (TCS) submits retention check-in: *"Candidate excels at Linux administration, but requires external container orchestration training."*
3. **Synthesis Engine**:
   - Compares Trainee Feedback (*Kubernetes*) with Employer Feedback (*Kubernetes*).
   - Verifies against Target Role (*Cloud Support Engineer* benchmark requires Container Orchestration at Advanced level).
   - Identifies that verified coursework only covered basic Docker engine.
4. **Intelligence Outcome**:
   - **Trainee Portal**: Promotes *Kubernetes & Container Orchestration* to **High Priority Gap**. Recommends bridge module: *Advanced Kubernetes Orchestration*.
   - **Admin Panel**: Aggregates with 42 other trainees from the same provider. Flags *PRG-001 (Cloud Infrastructure)* for curricular review to add 20 hours of Kubernetes labs.

### Scenario B: Low-Confidence Isolated Feedback
1. **Trainee Action**: Trainee reports *"Programme should have taught Rust programming."*
2. **Synthesis Engine**:
   - Checks Employer Feedback: 0 employers reported Rust as a required skill for this cohort.
   - Checks Target Role Benchmark (*Cloud Support Engineer*): Rust is not in the required rubric.
3. **Intelligence Outcome**:
   - Designated as **Low Priority / Exploratory Interest**.
   - Not flagged as a vocational curriculum defect.

---

## 4. FEEDBACK PROCESSING STATUS LIFECYCLE

Feedback entries progress through a transparent, three-stage status pipeline:

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────────────────┐
│    SUBMITTED     │ ───> │  UNDER ANALYSIS  │ ───> │ INCLUDED IN SKILL INTEL    │
│ Feedback logged  │       │ Correlated with  │       │ Integrated into gap priority │
│ to store         │       │ benchmarks & emp │       │ & administrative analytics   │
└──────────────────┘       └──────────────────┘       └──────────────────────────────┘
```

- **Statutory Integrity**: The portal never implies that an individual government officer manually inspected the feedback unless formal human review occurred. Status reflects algorithmic evidence indexing.

---

## 5. CROSS-PANEL SYNCHRONIZATION SUMMARY

| Event Origin | Store Mutation | Trainee Portal Impact | Admin Panel Impact |
| :--- | :--- | :--- | :--- |
| Trainee reports missing skill | Appended to `skill_feedback_history` | Gap item appears with "Under Analysis" status | Systemic skill gap metric increments |
| Employer verifies placement | Updates `employment.verification_status` | Verification badge flips to "Verified by Employer" | District placement KPI reflects verified outcome |
| Trainee logs wage increase | Appends point to `wage_history` | SVG line chart instantly re-renders | Average cohort wage uplift recomputes |
| Trainee revokes follow-up consent | Sets `consent.status = "DECLINED"` | Follow-Up surveys locked; privacy banner shown | Trainee excluded from active survey sample |
