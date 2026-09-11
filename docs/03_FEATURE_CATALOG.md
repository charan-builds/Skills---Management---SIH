# Feature Catalog

This document catalogs every major user-facing feature implemented in the Skilling Impact Intelligence platform.

## 1. Authentication & Routing

### 1.1 Login Page
- **Purpose**: Authenticate users into their respective portals.
- **Target user**: All users (Admin, Trainee, Employer).
- **User problem**: Securely accessing personalized intelligence.
- **How accessed**: Base route (`/login`).
- **Implementation**: The UI contains a form simulating login. Currently, it acts as a mock/demo router that authenticates users instantly and redirects them to their respective default dashboards based on selection.
- **Current implementation status**: Implemented (Demo Mode / Mock Auth). 

---

## 2. Administrator Features

### 2.1 Admin Dashboard
- **Purpose**: High-level overview of skilling KPIs.
- **Target user**: Administrators.
- **User problem**: Lack of aggregate visibility into total trained vs. placed metrics.
- **How accessed**: `/admin/dashboard`.
- **Frontend implementation**: React dashboard utilizing interactive charts (e.g., placement funnels) and summary KPI cards.
- **Data source**: Mock JSON data mapped via internal state.
- **Current implementation status**: Fully Implemented.

### 2.2 Global Dashboard Filtering
- **Purpose**: Isolate data by localized variables.
- **Target user**: Administrators.
- **User problem**: National averages obscure local failures.
- **How accessed**: Top-level dropdowns on the Admin Dashboard.
- **Workflow**: User selects a `District`, `Programme`, or `Cohort`. The UI updates instantly.
- **Frontend implementation**: React context/state filters the visible dataset passed down to the KPI and chart components.
- **Current implementation status**: Fully Implemented.

### 2.3 Impact Intelligence & Risk Scoring
- **Purpose**: AI-driven evaluation of cohort health.
- **Target user**: Administrators.
- **How accessed**: `/admin/intelligence`.
- **Implementation**: Computes a priority score (High/Medium/Low) based on completion and placement metrics. Generates natural language intervention recommendations (e.g., "Deploy additional resources to Hyderabad Data Analytics cohort").
- **Current implementation status**: Fully Implemented.

### 2.4 Trainee Management (CRUD)
- **Purpose**: Manage the central trainee roster.
- **Target user**: Administrators.
- **How accessed**: `/admin/trainees`.
- **Implementation**: Data grid showing all trainees. Features an "Add Trainee" form, an "Edit Trainee" modal, and a "CSV Import" mock flow.
- **Current implementation status**: Fully Implemented (Mock persistence).

### 2.5 View Trainee Profile
- **Purpose**: Deep-dive into a specific individual's skill gaps and outcomes.
- **Target user**: Administrators.
- **How accessed**: Clicking "View Profile" from the Trainee Management roster.
- **Implementation**: Dedicated route (`/admin/trainees/:id`) displaying the full demographic and skill matrix for a single trainee.
- **Current implementation status**: Fully Implemented.

---

## 3. Trainee Features

### 3.1 Trainee Dashboard
- **Purpose**: Central hub for individual employability.
- **Target user**: Trainees.
- **How accessed**: `/trainee/dashboard`.
- **Implementation**: Displays the trainee's current skill competencies, recently saved jobs, and top skill improvement recommendations.
- **Current implementation status**: Fully Implemented.

### 3.2 Explore Jobs (AI Matching)
- **Purpose**: Find relevant employment opportunities.
- **Target user**: Trainees.
- **How accessed**: `/trainee/explore`.
- **Implementation**: A job board that natively sorts open requisitions by a "Match %". The match percentage is computed by comparing the trainee's known skill array against the job's required skills.
- **Current implementation status**: Fully Implemented.

### 3.3 Job Details & Apply Workflow
- **Purpose**: View specific requisition requirements and submit an application.
- **Target user**: Trainees.
- **How accessed**: Clicking a job card from "Explore Jobs".
- **Implementation**: Displays the skill gap (skills the trainee possesses vs. lacks). Includes an "Apply Now" button that logs the application mock state.
- **Current implementation status**: Fully Implemented.

---

## 4. Employer Features

### 4.1 Employer Dashboard
- **Purpose**: Overview of open requisitions and applicant flow.
- **Target user**: Employers.
- **How accessed**: `/employer/dashboard`.
- **Implementation**: Summary metrics of open jobs and total matched candidates.
- **Current implementation status**: Fully Implemented.

### 4.2 Candidate Matching
- **Purpose**: Source talent based on verified skills rather than degree titles.
- **Target user**: Employers.
- **How accessed**: `/employer/candidates`.
- **Implementation**: A list of trainees sorted by their skill alignment to the employer's specific active job postings. Clicking "View Details" reveals the exact skill overlap.
- **Current implementation status**: Fully Implemented.
