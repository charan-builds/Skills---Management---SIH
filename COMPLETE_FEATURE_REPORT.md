# Skilling Impact Intelligence
## Complete Product & Feature Architecture Report

---

## 1. Product Overview

The **Skilling Impact Intelligence System** is an end-to-end decision-support and talent matching ecosystem built to bridge the gap between vocational training programmes, candidate skill acquisition, and employer hiring requirements.

The system connects three key stakeholders:
1. **State Skilling Directors & Administrators**: Macro-level intelligence on programme completion rates, 3-way skill gap matrices, curriculum intervention simulators, and longitudinal employment verification.
2. **Enterprise Employers**: AI-assisted candidate discovery, skill-based candidate matching, job vacancy management, interview outreach, and post-hire retention tracking.
3. **Student Trainees**: AI career readiness diagnostics, personalized skill growth pathways with interactive micro-assessments, explore jobs with 1-click applications, and digital portfolio management.

---

## 2. System Architecture

```
                                    ┌────────────────────────┐
                                    │    State Directors     │
                                    │     (Admin Portal)     │
                                    └───────────┬────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
   ┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
   │    Programme Analytics    │  │    Skill Intelligence     │  │   Employment Outcomes     │
   │ • 5 Flagship Programmes   │  │ • Demand vs Supply Matrix │  │ • Placement Rates (78%)   │
   │ • 6-Stage Impact Chain    │  │ • AI Diagnostic Insights  │  │ • 3M/6M/12M Verification  │
   │ • Side-by-Side Comparison │  │ • What-If Scenario Sim    │  │ • Longitudinal Audit      │
   └─────────────┬─────────────┘  └─────────────┬─────────────┘  └─────────────┬─────────────┘
                 │                              │                              │
                 └──────────────────────────────┼──────────────────────────────┘
                                                │
                                                ▼
                                ┌───────────────────────────────┐
                                │   AI Matching & Labour Core   │
                                └───────────────┬───────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
   ┌───────────────────────────┐                                 ┌───────────────────────────┐
   │    Enterprise Employers   │                                 │     Student Trainees      │
   │     (Employer Portal)     │                                 │     (Trainee Portal)      │
   │ • 4 Active Enterprise Jobs│                                 │ • Career Readiness (88%)  │
   │ • AI Candidate Matching   │ ◀──────── Placement ─────────── │ • 4 Interactive Pathways  │
   │ • Shortlist & Outreach    │            & Feedback           │ • 1-Click Job Application │
   │ • Outcome Verification    │                                 │ • Verified Skill Profile  │
   └───────────────────────────┘                                 └───────────────────────────┘
```

---

## 3. AI / Intelligence Layer

The system incorporates a non-hallucinatory AI intelligence layer designed for deterministic scoring and policy recommendation:
- **3-Way Skill Alignment**: Cross-analyzes (1) Training Curricula Taught, (2) Candidate Demonstrated Competencies, and (3) Enterprise Vacancy Requirements.
- **Explainable Match Scoring**: Calculates multi-dimensional match vectors (Overall Match %, Skill Fit %, Location Alignment) with explicit positive matches (`✓`) and identified skill gaps (`△`).
- **Policy Diagnostic Engine**: Generates evidence-backed action items explaining *Why it matters*, *Recommended Action*, and *Projected Impact*.
- **What-If Policy Simulation**: Simulates the downstream employment boost, gap reduction, and estimated economic ROI when training hours are reallocated to high-demand skills.

---

## 4. Admin / Organization Portal

### 4.1 Executive Dashboard (`/`)
- **Top 10 Executive KPIs**: Total Trainees (500), Active Trainees (350), Certified Trainees (380), Training Completion Rate (86%), Assessment Pass Rate (82%), Job-Ready Trainees (290), Employment Rate (78%), 3M Retention (92%), 6M Retention (88%), 12M Retention (84%).
- **Trainee Progression Pipeline Funnel**: Enrolled (500) → Completed (430) → Certified (380) → Job-Ready (290) → Applications (210) → Shortlisted (120) → Hired (80) → Retained 6M+ (68).
- **System Alerts & Notifications Drawer**: Direct links to pending verifications and surge alerts.
- **Executive CSV & PDF Report Generator**: Instant export of state-wide skilling metrics.

### 4.2 Programme Performance & Explorer (`/programmes`)
- **Multi-View Interface**: Card Grid View, Performance Table View, and Side-by-Side Comparison Matrix (comparing up to 3 programmes across 8 dimensions).
- **Flagship Programme Registry**: Data Analytics Specialist, Cybersecurity Specialist, AI & Machine Learning Associate, Cloud Infrastructure & DevOps, Full Stack Web Development.

### 4.3 Longitudinal Programme Profile (`/programmes/:programmeId`)
- **6-Stage Longitudinal Impact Chain**: Training (480h) → Skills (+31% velocity) → Assessments (79% avg) → Certification (82%) → Employment (82%) → 12M Retention (86%).
- **Curriculum Skill Breakdown**: Core competencies mastered vs identified industry skill gaps.

### 4.4 Skill Gap Intelligence (`/skill-gaps`)
- **Demand vs Supply Visualizer**: Horizontal bar charts comparing employer openings against trained candidate volume.
- **Skill Gap Matrix Table**: Filterable matrix with explicit priority indicators (`VERY HIGH`, `HIGH`, `MODERATE`).
- **Skill Detail Panel / Modal**: Detailed breakdown of relevant roles, associated programmes, weak supporting skills, and AI strategic recommendations.

### 4.5 Trainee Progression & Explorer (`/trainees` & `/trainees/:id`)
- **Learner Registry**: Searchable candidate table with filters for Programme, District, Progression Stage, and Assessment Scores.

### 4.6 Employment Outcomes & Verification (`/outcomes`)
- **Placement Analytics**: Placements by Programme, Top Hiring Roles, and Top Skills associated with offers.
- **Outcome Verification Queue**: Fast deterministic verification modal allowing administrators to audit employer-submitted hiring data and 3M/6M/12M checkpoints.

### 4.7 What-If Policy & Curriculum Simulator (`/interventions`)
- **Interactive Workbench**: Select Programme, Target Skill, and Proficiency Delta (+10% to +25%) to simulate projected gap reduction and economic ROI.
- **Executive Action Queue**: Pre-populated policy intervention items with instant `[Approve & Adopt]` action state.

### 4.8 Admin Profile & Governance Settings (`/settings`)
- **Directorate Profile Credentials**: Editable administrator details, government email, and state node identifier.
- **System Health Monitor**: Live synchronization status of Lakehouse data nodes and AI matching core.

---

## 5. Employer Portal

### 5.1 Employer Executive Dashboard (`/employer-dashboard`)
- **Hiring Metric Cards**: Open Job Vacancies (4), Available Qualified Candidates (17), Shortlisted (6), Hired Trainees (3).
- **Recruitment Funnel**: Sourced (45) → Matched (24) → Shortlisted (6) → Contacted (4) → Hired (3) → 100% Retention.
- **AI Recommended Candidates**: Curated high-match talent cards with explainable AI rationale.
- **Workforce Skill Intelligence Matrix**: Real-time demand vs supply telemetry for Python, ML, SQL, Power BI, and SIEM.

### 5.2 Candidate Talent Pool (`/employer/candidates`)
- **Search & Multi-Filter Engine**: Search by name/skill, Programme filter, Location filter, Match threshold (90%+, 80%+, 70%+), Status filter, and Sort By options.
- **Interactive Candidate Cards**: Candidate name, Trainee ID, match percentage badge, verified skill chips, AI insight, `[Shortlist]` toggle, `[Contact]` button, and `[View Profile]`.
- **Candidate Outreach Modal**: Masked phone/email, invitation message composer, and instant feedback.

### 5.3 Candidate Profile & AI Fit Diagnostic (`/employer/candidates/:id`)
- **2-Column Diagnostic**: Match breakdown (94% Match), Verified Strong Matches (`✓`), Identified Gaps (`△`), and AI recommendation.
- **Interactive Previews**: `[View Resume]` modal, `[Skill Analysis]` modal, and `[Shortlist Candidate]` action.

### 5.4 Job-Candidate Matching View (`/employer/jobs/:jobId`)
- **Multi-Dimensional Matching**: Overall Match Score, Skill Match %, Location Match %, Matched Skills, and Missing Gaps.

### 5.5 Employment Outcome Verification (`/employer/verify-outcomes`)
- **Hiring Registry**: Pre-populated records for hired trainees (Priya Gupta, Anjali Joshi, Manoj Das, Rahul Verma) with 3M/6M/12M follow-up confirmations.

### 5.6 Organization Profile & Hiring Preferences (`/employer/profile`)
- **Enterprise Settings**: Company details, target skill tags, hiring volume targets, and persistence.

### 5.7 Integrations & API Gateway (`/employer/integrations`)
- **5 System Connectors**: State Skilling Platform, Enterprise ATS, HRIS Core, National Job Portal Gateway, AI Assessment Engine with live `[Sync Now]` triggers and API key management.

---

## 6. Trainee Portal

### 6.1 Overview & Insights (`/trainee-dashboard`)
- **Career Readiness Score**: 88% Role Readiness for target role (*Cybersecurity Analyst*).
- **3-Way Skill Match Breakdown**: Core matching competencies vs immediate development areas.
- **4 Action Cards**: Direct navigation to Explore Jobs, Improve Skills, My Applications, and Profile & Settings.

### 6.2 Explore Jobs (`/trainee/explore-jobs`)
- **Curated Vacancies**: 4 enterprise roles with calculated Match %, salary ranges, and work mode tags.
- **Job Details & Application Modal**: View responsibilities, matched skills, select resume, and submit application.

### 6.3 Improve Skills (`/trainee/improve-skills`)
- **4 AI Skill Growth Pathways**: Linux Kernel Hardening, SIEM Alert Triage, Network Traffic Analysis, Cryptographic Protocols.
- **Interactive Micro-Assessment Modal**: 3-question adaptive knowledge check with instant scoring and profile score updates!

### 6.4 My Applications (`/trainee/my-applications`)
- **Application Status Pipeline**: 5-stage progress indicator (Applied → Under Review → Technical Assessment → Interview Scheduled → Offer Extended).
- **Application Management**: View stage details, next steps, and withdraw application action.

### 6.5 Profile & Settings (`/trainee/profile`)
- **Profile Completeness Meter**: 85% Completeness with actionable guidance.
- **Editable Portfolio**: Education, Degree, Verified Skills tags, Experience records, Certifications, and instant save action.

---

## 7. Data Flow & Interconnection

```
[TRAINEE] ──> Enrolls in Programme ──> Master Skills ──> Passes Assessment ──> Certified
                                                                                   │
                                                                                   ▼
[EMPLOYER] ──> Posts Vacancy ──> AI Matches Candidates ──> Shortlist & Interview ──> Hired Trainee
                                                                                   │
                                                                                   ▼
[ADMIN]    ◀── Audit Outcome ◀── Verified 3M/6M/12M Retention ◀── Verify Outcome ──┘
   │
   ▼
Analyzes Skill Gaps & Demand ──> Simulates Policy ──> Expands Programme Capacity ──> New Trainees
```

---

## 8. API Endpoints Reference

| Method | Endpoint | Description | Used By |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Multi-role authentication (Admin, Employer, Trainee) | Login Page |
| `GET` | `/health` | Production service health check | Monitoring |
| `GET` | `/api/analytics/dashboard` | Executive KPI stats and employment trends | Admin Dashboard |
| `GET` | `/api/programmes` | Flagship programme registry | Programmes, Interventions |
| `GET` | `/api/programmes/{id}` | Programme detail and curriculum metadata | Programme Profile |
| `GET` | `/api/trainees` | Candidate registry with verified skills | Trainees Explorer |
| `GET` | `/api/trainees/{id}` | Trainee profile and outcomes timeline | Trainee Profile |
| `GET` | `/api/employers/{id}/dashboard` | Employer funnel, recommendations, and skill matrix | Employer Dashboard |
| `GET` | `/api/employers/{id}/candidates` | Searchable employer candidate pool | Candidates Explorer |
| `GET` | `/api/employers/{id}/candidates/{cid}` | Detailed candidate profile with 3-way match | Candidate Profile |
| `POST`| `/api/employers/{id}/shortlist` | Toggle candidate shortlist bookmark | Candidates, Profile |
| `POST`| `/api/employers/{id}/contact` | Send interview outreach request | Candidates, Profile |
| `GET` | `/api/employers/{id}/outcomes` | Hired trainee retention registry | Employer Verify Outcomes |
| `POST`| `/api/employers/{id}/outcomes/{tid}/verify` | Verify employment outcome checkpoint | Employer Verify Outcomes |
| `GET` | `/api/employers/{id}/profile` | Organization profile & hiring criteria | Employer Profile |
| `POST`| `/api/employers/{id}/profile` | Update organization hiring criteria | Employer Profile |
| `GET` | `/api/employers/{id}/integrations` | Connector status & API credentials | Employer Integrations |
| `POST`| `/api/ai/scenario` | What-if intervention simulator | Interventions |

---

## 9. Feature Matrix

| Portal | Feature Area | Status | Data Source | AI Utilized | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | Executive KPI Dashboard | Implemented | Centralized Matrix / API | No | 10 KPIs with trend indicators |
| **Admin** | Trainee Progression Funnel | Implemented | Centralized Matrix | No | 8-stage conversion tracking |
| **Admin** | Programme Explorer & Comparison | Implemented | Centralized Matrix / API | No | Side-by-side comparison mode |
| **Admin** | Longitudinal Programme Profile | Implemented | Centralized Matrix / API | Yes | 6-stage lifecycle analysis |
| **Admin** | Skill Gap Intelligence Center | Implemented | Centralized Matrix / API | Yes | Horizontal demand/supply bars |
| **Admin** | What-If Scenario Simulator | Implemented | Backend API / Embedded Fallback | Yes | Dynamic ROI & gap modeling |
| **Admin** | Employment Outcome Verification | Implemented | Centralized Matrix / API | No | Fast deterministic audit flow |
| **Admin** | Executive Report Generator | Implemented | Client CSV Generator | No | Instant report download |
| **Employer**| Executive KPI Dashboard | Implemented | Backend API / Embedded Fallback | Yes | Recruitment funnel & skill matrix |
| **Employer**| Candidate Talent Pool & Search | Implemented | Backend API / Embedded Fallback | Yes | Verified skills & AI reasoning |
| **Employer**| Candidate Profile & Match Diagnosis| Implemented | Backend API / Embedded Fallback | Yes | 2-column fit & gap analysis |
| **Employer**| Job Candidates Matching View | Implemented | Backend API / Embedded Fallback | Yes | Multi-dimensional scoring |
| **Employer**| Candidate Outreach Gateway | Implemented | Backend API / State | No | Masked contact & message composer |
| **Employer**| Outcome Verification Registry | Implemented | Backend API / State | No | 3M/6M/12M checkpoints |
| **Employer**| Organization Profile & Settings | Implemented | Backend API / State | No | Editable hiring criteria |
| **Employer**| Enterprise Connectors & API | Implemented | Backend API / State | No | 5 connectors with live sync |
| **Trainee** | Overview & Career Readiness | Implemented | Backend API / State | Yes | 88% readiness & gap breakdown |
| **Trainee** | Explore Jobs & 1-Click Apply | Implemented | Backend API / State | Yes | Curated roles & application modal |
| **Trainee** | Skill Growth & Interactive Quiz | Implemented | Backend API / State | Yes | 3-question adaptive quiz |
| **Trainee** | My Applications Pipeline | Implemented | Backend API / State | No | 5-stage tracking & withdraw |
| **Trainee** | Profile Completeness & Portfolio | Implemented | Backend API / State | No | Editable education, skills, certs |

---

## 10. Known Limitations

1. **Prototype In-Memory State**: In local demo mode, certain state updates (such as newly toggled bookmarks or updated candidate notes) are persisted within backend session memory or centralized client stores rather than persistent cloud database tables.
2. **Deterministic Fallbacks**: To ensure 100% test reliability during live demonstrations and offline testing, synthetic seed datasets are provided when live Firebase/BigQuery nodes are unreachable.
3. **Simulated External Connectors**: Integrations with third-party ATS (Workday, Greenhouse) and Job Gateways use realistic simulated response wrappers rather than live OAuth2 handshakes.
