# Problem Statement and Objectives

## 1. Problem Statement

The modern skilling and vocational training ecosystem faces a critical "last-mile" problem: connecting trained individuals with sustainable employment. Despite significant government and private investment in skilling programs, several core visibility and intelligence problems persist:

### 1.1 The Trainee Visibility Problem
Trainees often complete programs without a clear understanding of their objective competency levels relative to market demand. They lack personalized, data-driven guidance on what adjacent skills to acquire to become highly employable. 

### 1.2 The Skill-Gap Problem
Administrators and training providers track enrollment and completion rates (output metrics), but struggle to track objective skill gaps and employability rates (outcome metrics). They cannot easily answer: *“What specific skills do our Data Analytics graduates in Hyderabad lack that employers in that district are demanding?”*

### 1.3 The Employer Matching Problem
Employers face a deluge of applications with generic certifications. They lack a mechanism to filter candidates based on verified, granular skill assessments rather than just degree titles. The friction in finding the right candidate leads to unfilled vacancies despite a large pool of trained individuals.

### 1.4 The District & Cohort Analysis Problem
Without real-time intelligence, administrators cannot detect underperforming districts or cohorts until long after a program has concluded. There is a lack of actionable intelligence to intervene mid-program (e.g., deploying additional resources to a specific district falling behind in a specific skill).

### 1.5 Why Dashboards Are Insufficient
Traditional dashboards are passive. They show historical data but do not provide **decision support**. They do not flag at-risk cohorts, recommend interventions, or match candidates to jobs. Active, AI-driven intelligence is required.

---

## 2. Project Objectives

The primary objective of Skilling Impact Intelligence is to transform passive skilling data into active, actionable intelligence.

### Objective 1: Implement AI-Driven Priority Scoring
- **Why it exists**: Administrators need to know *where* to focus their limited attention and resources.
- **User**: Administrators.
- **Feature solving it**: Impact Intelligence Dashboard (Priority classification: High/Medium/Low Risk).
- **Technical implementation**: Backend AI scoring algorithm evaluating placement rates, skill gaps, and dropout metrics.
- **Expected outcome**: Immediate identification of underperforming cohorts.
- **Current implementation status**: Fully implemented (Mock/Demo scoring algorithm via FastAPI).

### Objective 2: Enable Granular Cohort & District Filtering
- **Why it exists**: Skilling outcomes are highly localized. National or state-level averages hide district-level failures.
- **User**: Administrators.
- **Feature solving it**: Multi-dimensional filtering (District, Programme, Cohort) on the Admin Dashboard.
- **Technical implementation**: React/Vite frontend state management passing filter parameters to the API, returning dynamically filtered KPIs.
- **Expected outcome**: Ability to drill down into specific localized bottlenecks.
- **Current implementation status**: Fully implemented.

### Objective 3: Create a Trainee Intelligence Portal
- **Why it exists**: Trainees need agency and visibility into their own employability.
- **User**: Trainees.
- **Feature solving it**: Trainee Dashboard (Skill profile, Explore Jobs, Improve Skills).
- **Technical implementation**: Dedicated React portal fetching personalized trainee mock data and calculating job match percentages.
- **Expected outcome**: Trainees apply to highly relevant jobs and take recommended courses to fill skill gaps.
- **Current implementation status**: Fully implemented.

### Objective 4: Facilitate Employer Skill-Based Matching
- **Why it exists**: Employers need to find candidates based on actual competencies, not just proximity or degrees.
- **User**: Employers.
- **Feature solving it**: Employer Portal (Candidate matching, View Details).
- **Technical implementation**: Backend matching algorithm returning candidates sorted by skill alignment to specific job requisitions.
- **Expected outcome**: Reduced time-to-hire and higher quality candidate pipelines.
- **Current implementation status**: Implemented (Employer view/Candidate list functionality).
