# Admin Outcome Diagnosis & Analysis Workspace Specification

## 1. Executive Summary & Purpose
The **Outcome Analysis Workspace** (`/admin/outcomes`) transforms the Admin platform from a simple static reporting dashboard into a comprehensive **Outcome Intelligence and Diagnostic Workspace**.

Rather than displaying isolated bar charts, the workspace guides the administrator through an analytical sequence:
1. **Macro Population Metrics**: Headline KPIs dynamically aggregated across the active filter scope.
2. **Progression Funnel**: Conversion rates from training enrollment to verified long-term employment.
3. **Categorical Destination Split**: Donut distribution of employment, self-employment, apprenticeships, and unemployment.
4. **Longitudinal Trajectory**: Line charts mapping 3M, 6M, and 12M retention against state benchmarks.
5. **Non-Placement Root Cause Diagnosis ("Why People Don't Get Jobs")**: Interactive Donut chart and drilldown panels explaining barriers preventing certified candidates from entering employment.
6. **Attrition Pattern Analysis ("Why People Leave Jobs")**: Interactive Donut chart and drilldown panels explaining why candidates depart initial corporate roles.
7. **Evidence-Grounded Outcome Diagnosis**: Analytical breakdowns highlighting associated factors, observed patterns, and potential contributing factors.

---

## 2. Headline Summary KPIs (Section 16)
All headline metrics are computed in real time from the filtered subset of the 800 relational trainees:
- **Total Trained**: Count of enrolled and participating candidates in scope.
- **Certified Pass**: Number of candidates who completed assessments with passing score ($\ge 65\%$).
- **Placed (Employed)**: Candidates engaged in formal corporate employment.
- **Self-Employed**: Candidates running independent enterprises or contracting practices.
- **Apprentices**: Candidates under structured apprenticeship contracts.
- **Unemployed**: Candidates actively seeking placement or experiencing employment barriers.
- **Employment Rate**: Total engaged ($\text{Employed} + \text{Self-Employed} + \text{Apprentices}$) divided by Total Trained.
- **3M / 6M / 12M Retention**: Verified retention percentages derived from follow-up records.
- **Average Wage & Wage Growth**: Mean current monthly earnings and percentage increment from starting wage.

---

## 3. Visualization Architecture (Section 17 & 35)
The workspace employs diverse visualization techniques tailored to the specific analytical question:

| Visualization | Primary Purpose | Key Parameters |
| :--- | :--- | :--- |
| **6-Stage Funnel** | Shows pipeline conversion throughput | Trained $\rightarrow$ Certified $\rightarrow$ Placed $\rightarrow$ Self-Employed $\rightarrow$ Apprentice $\rightarrow$ Unemployed |
| **Donut Chart** | Categorical distribution of current outcomes | `innerRadius={65}`, `outerRadius={95}` with hover tooltips and legend |
| **Longitudinal Line** | 3M $\rightarrow$ 6M $\rightarrow$ 12M retention curve | Solid observed trend line plotted against dashed benchmark line |
| **Interactive Donut** | Root cause distributions for non-placement and attrition | Clickable segments that update diagnostic detail panels |
| **Diagnostic Cards** | Associated factors and observed patterns | Formatted policy briefs with severity indicators |

---

## 4. "Why People Don't Get Jobs" (Section 21 & 22)

### 4.1 Categorical Breakdown
Categories derived from the approved specification:
1. `Skills`: Deficits in hands-on technical tools or practical lab competencies.
2. `Jobs/availability`: Local industrial absorption deficit in district.
3. `Location`: Relocation or commute constraints.
4. `Salary`: Compensation offered falls below reservation wage.
5. `Experience`: Employer demands prior internship or project experience.
6. `Education`: Candidate chose to pursue higher studies or competitive exams.
7. `Other`: Personal or domestic circumstances.

### 4.2 Interactive Drilldown Mechanics
When the administrator clicks a category (e.g., **Location**):
1. **Scope Preservation**: Analysis is computed strictly within the active global filter (e.g., if filtered to *Data Analytics* in *Pune*, only candidates matching both criteria are included).
2. **Metrics Displayed**:
   - Total affected candidate count
   - Percentage of the unplaced cohort
   - Breakdown by top affected programmes
   - Breakdown by top affected districts
   - Breakdown by affected cohorts
3. **"WHY THIS AREA MAY BE LAGGING" (Evidence-Derived Analysis)**:
   - Dynamic analytical synthesis grounded in telemetry. Example:
     > *"Relocation constraints are observed disproportionately in Tier-2 districts within Cloud Infrastructure. 68% of candidates in this group report lack of regional hostel subsidies and entry-level commute support."*
4. **Anonymized Candidate Dossiers**:
   - Sample candidate records displaying ID, candidate name, programme, district, and exact recorded barrier.

---

## 5. "Why People Leave Jobs" (Section 24 & 25)

### 5.1 Categorical Breakdown
Categories capturing post-placement departure drivers:
1. `Salary`: Low initial compensation or delayed increments.
2. `Better Opportunity`: Lateral transitions securing higher wages elsewhere.
3. `Role Mismatch`: Assignment to non-technical or clerical tasks.
4. `Work Conditions`: Working hours, shifts, or workplace environment.
5. `Relocation`: Transport or housing challenges.
6. `Contract End`: Conclusion of fixed-term apprenticeship or contract.
7. `Personal`: Family or domestic relocation.

### 5.2 Interactive Pattern Analysis
When the administrator clicks a factor (e.g., **Salary**):
1. **Comparative Wage & Retention Telemetry**:
   - Compares the exit salary against the platform average wage.
2. **Distribution Breakdowns**:
   - Concentration by programme, training provider, district, and cohort.
3. **"WHAT PATTERN ARE WE SEEING?" (Derived Telemetry Findings)**:
   - Evaluates whether exits represent positive career mobility or premature attrition:
     > *"Salary-related exits are concentrated in Cloud Infrastructure and Pune. Average exit salary of ₹24,200 is 18% lower than retained peers in the same domain."*
4. **Sample Exit Records**:
   - Candidate records with employer names, departure dates, and recorded drivers.

---

## 6. Analytical Outcome Diagnosis (Section 23 & 26)
For major lagging programmes or sectors, the system synthesizes a standardized diagnostic brief:
- **Observation**: Key quantitative divergence (e.g., placement below state benchmark, elevated attrition at month 4).
- **Key Associated Factors**: Empirically correlated signals identified across curriculum assessments, employer reviews, and exit interviews.
- **Observed Pattern**: Geographic, temporal, or operational clusters where the issue is concentrated.
- **Potential Contributing Factors**: Grounded institutional factors without unsupported causal claims (e.g., *"Disparity between subsidized apprenticeship stipend and market technician wages"*).
- **Severity Rating**: `High Priority`, `Moderate Priority`, or `Optimal Impact`.

---

## 7. Individual-to-Aggregate Relational Coherence (Section 38)
Every calculation in the workspace adheres to the **single source of truth** rule:
$$\text{Platform Total} = \sum \text{Programme Totals} = \sum \text{Provider Totals} = \sum \text{Individual Trainee Records}$$

No disconnected numbers, hardcoded mock arrays, or random values on re-render are permitted. All views strictly evaluate the filtered array of trainees provided by `mockStore`.
