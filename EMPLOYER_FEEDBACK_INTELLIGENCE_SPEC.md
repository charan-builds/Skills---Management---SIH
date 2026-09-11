# EMPLOYER FEEDBACK INTELLIGENCE SPECIFICATION
## Workplace Skill-Gap Feedback, Skills We Need & Cross-Panel Triangulation
### Skilling Outcomes & Impact Intelligence Platform

---

## 1. Scope & Objective (Sections 21–24 & 50)

The **Employer Skill-Gap Feedback & Intelligence** module (`/employer/feedback`) captures qualitative and quantitative demand-side intelligence regarding competencies missing in recent skilling graduates.

### Core Principle
This module establishes a feedback loop between industrial workplace expectations and state vocational curriculum designers, without directly modifying individual trainee verified grades or assessment transcripts.

---

## 2. Employer Skill Feedback Capture (Section 21)

Employers report skill shortages observed during employee onboarding and active project deployment:

### Input Parameters
- **Vocational Training Programme:** Linked curriculum or course (e.g., *Cloud Infrastructure & DevOps*, *Electric Vehicle Maintenance*).
- **Target Job Role Context:** Occupational band where gap is evident (e.g., *Cloud Systems Associate*, *Junior DevOps Engineer*).
- **Missing Competency / Skill Gap:** Specific missing capability (e.g., *Kubernetes Container Orchestration*, *Terraform IaC*, *Automated Testing*).
- **Curriculum Relevance Rating:** 1 to 5 star rating assessing overall training alignment.
- **Qualitative Observations:** Free-text feedback detailing operational deficiencies (e.g., *"Candidates understand theoretical container concepts but lack hands-on CLI debugging in multi-node clusters"*).

### Data Segregation (Section 21)
Stored strictly in `mockStore.state.employer_feedback` under type `EMPLOYER_FEEDBACK`.
- **Integrity Rule:** Does NOT overwrite or alter trainee assessment evidence or NSQF certified grades.

---

## 3. Feedback History & Traceability (Section 22)

Employers can review all previously submitted reports:
- Submitting date
- Targeted vocational programme
- Identified skill deficiency
- Job role context
- Curriculum rating & comments
- Central Skilling Intelligence status: `"Included in Central Skill Intelligence"`

---

## 4. Skills We Need: Aggregated Employer Intelligence (Section 23 & 40)

An aggregated, employer-facing dashboard view showing:
- **Ranked Competency Gaps:** Horizontal bar chart illustrating frequency of skill shortage reports across the organisation.
- **Affected Job Roles:** Occupational designations impacted by the gap.
- **Feedback Report Frequency:** Volume of hiring manager reports confirming the deficiency.

### Privacy Safeguards (Section 42)
Aggregations reflect solely the logged-in organization's observations. Broader cross-employer industry benchmarks require privacy aggregation thresholds and explicit labelling.

---

## 5. Multi-Source Evidence Fusion Model (Sections 24 & 50)

The platform implements a multi-source triangulation architecture where curriculum insights are synthesized from three distinct evidentiary pillars:

```
        TRAINEE VOICE                         EMPLOYER VOICE                    VERIFIED SYLLABUS
     (Perceived Deficits)                  (Workplace Shortages)               (Assessment Evidence)
              |                                      |                                   |
              |                                      |                                   |
              +-------------------+------------------+-----------------------------------+
                                  |
                                  v
                    [CENTRAL SKILL GAP INTELLIGENCE]
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
   [ADMIN POLICY INSIGHTS]                    [TRAINEE TARGET BENCHMARK]
(Curriculum Reform & Funding)                (Personal Bridge Course Recs)
```

### Triangulation Dynamics
1. **Converging Signal:** When trainees report *"Container networking was insufficient"* AND employers report *"Candidates lack hands-on Docker/K8s troubleshooting"*, the system assigns a **Critical Priority** flag in the Admin Skill Gap Analysis (`/admin/skill-gaps`).
2. **Distinct Evidence Provenance:** Trainee assessments continue to reflect verified exam performance, while the policy layer flags curriculum gaps for the next training cycle.
3. **Actionable Trainee Guidance:** The Trainee Target Role Benchmark surfaces targeted bridge courses to close the employer-observed gap.
