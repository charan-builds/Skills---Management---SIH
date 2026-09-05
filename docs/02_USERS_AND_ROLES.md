# Users and Roles

The Skilling Impact Intelligence platform implements Role-Based Access Control (RBAC) to serve three distinct types of users, each with tailored interfaces and capabilities.

## 1. Administrator (Admin / Programme Manager)

**Purpose**: To gain high-level oversight of skilling initiatives, monitor outcomes, identify localized bottlenecks, and intervene based on AI-driven intelligence.
**Login Route**: `/login` (Selects 'Admin' mock auth flow)
**Default Dashboard**: `/admin/dashboard`

**Available Pages & Features**:
- **Admin Dashboard**: Core KPIs (Total Trainees, Placed, In Training), placement rate charts, and the primary District/Programme/Cohort filtering mechanism.
- **Impact Intelligence**: AI-scored cohort risk analysis, priority flagging (High/Medium/Low), and natural language intervention recommendations.
- **Trainee Management**: List of all system trainees with options to Add, Edit, or Import via CSV.
- **Trainee Profile (View)**: Detailed drill-down into a specific trainee’s skills, demographics, and outcomes.

**Data Visibility**:
Administrators can see aggregate data across all districts and programmes, and can drill down to individual trainee PII (Personally Identifiable Information) and skill records.

## 2. Trainee

**Purpose**: To empower individuals with agency over their employability by providing visibility into their skill profiles, suggesting skill improvements, and matching them to open jobs.
**Login Route**: `/login` (Selects 'Trainee' mock auth flow)
**Default Dashboard**: `/trainee/dashboard`

**Available Pages & Features**:
- **Trainee Dashboard**: Overview of their current skill competency matrix, recent applications, and top recommendations.
- **My Profile**: Granular view of certified skills vs. self-assessed skills.
- **Explore Jobs**: An AI-matched feed of open employer requisitions sorted by "Match %".
- **Improve Skills**: Recommended courses and certifications specifically tailored to bridge the gap between their current profile and their target jobs.

**Data Visibility**:
Trainees can ONLY see their own PII and their own skill profiles. They cannot see aggregate cohort data or other trainees' profiles.

## 3. Employer

**Purpose**: To find pre-vetted, highly matched candidates based on granular skill requirements rather than generic degree filters, reducing time-to-hire.
**Login Route**: `/login` (Selects 'Employer' mock auth flow)
**Default Dashboard**: `/employer/dashboard`

**Available Pages & Features**:
- **Employer Dashboard**: Overview of open job requisitions, total matched candidates, and recent applications.
- **Find Candidates**: A search and matching interface where employers can view anonymized or fully-visible trainee profiles that match specific skill requirements.
- **View Details**: Drill-down into a candidate's specific skill gap analysis relative to the employer's job posting.

**Data Visibility**:
Employers can see trainee profiles that have opted-in or applied to their jobs. They have access to the skill matching scores but do not have access to administrative intelligence or aggregate skilling program health.

---

## Permissions Matrix

| Feature | Admin | Trainee | Employer |
| :--- | :---: | :---: | :---: |
| **View Aggregate KPIs** | 🟢 Yes | 🔴 No | 🔴 No |
| **Apply District/Cohort Filters** | 🟢 Yes | 🔴 No | 🔴 No |
| **View Impact Intelligence (Risk Scores)** | 🟢 Yes | 🔴 No | 🔴 No |
| **Add/Edit Trainee Records** | 🟢 Yes | 🔴 No | 🔴 No |
| **View Own Skill Profile** | 🔴 No | 🟢 Yes | 🔴 No |
| **Explore Matched Jobs** | 🔴 No | 🟢 Yes | 🔴 No |
| **View Candidate Matches** | 🔴 No | 🔴 No | 🟢 Yes |
| **View Individual Trainee Details** | 🟢 Yes | 🟢 (Self Only) | 🟢 (Applicants Only) |

*(🟢 = Full Access | 🔴 = No Access)*
