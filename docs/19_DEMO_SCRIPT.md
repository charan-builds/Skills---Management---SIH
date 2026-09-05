# Demonstration Script

This script provides a guided walkthrough for presenting the Skilling Impact Intelligence platform to stakeholders or hackathon judges, ensuring all major technical and product innovations are highlighted.

## Preparation
1. Ensure the frontend is open at the Vercel deployment URL.
2. Ensure the backend is awake (Render free tier may take 30s to spin up on the very first request. Make a dummy request first).

---

## The Presentation

### Part 1: The Administrator Perspective (The Intelligence Problem)
**Action:** Go to `/login` and select `Admin`.
**Talking points:**
- *"Current government dashboards only show us how many people enrolled. Our platform shows us what happens next."*
- Show the **Dashboard**. Point out the Placement Funnel.
- *"National averages hide local failures. Let's drill down."*
- **Action:** Change the District filter to "Hyderabad" and Programme to "Data Analytics". Note the instant UI update.
- *"We can see Hyderabad is underperforming. But why? Let's ask the AI."*
- **Action:** Navigate to **Impact Intelligence**.
- *"The backend AI analyzes dropout rates and skill gaps, flagging this cohort as 'High Risk'. It specifically recommends a Python bootcamp because it detected that specific skill gap."*

### Part 2: The Trainee Perspective (The Agency Problem)
**Action:** Logout, go to `/login`, and select `Trainee`.
**Talking points:**
- *"Trainees need to know where they stand."*
- Show the **Trainee Dashboard**. Highlight the Skill Profile matrix.
- **Action:** Navigate to **Explore Jobs**.
- *"Instead of endless scrolling, our NLP matching engine instantly ranks jobs by skill overlap. The trainee sees a 90% match for 'Junior Data Analyst'."*
- **Action:** Click on the Job Details.
- *"It tells the trainee exactly what they are missing (e.g., 'Requires SQL'). They know exactly what to learn next to get hired."*

### Part 3: The Employer Perspective (The Sourcing Problem)
**Action:** Logout, go to `/login`, and select `Employer`.
**Talking points:**
- *"Employers are drowning in resumes from people who have certificates but lack actual competencies."*
- **Action:** Navigate to **Find Candidates**.
- *"Our employer portal flips the script. Instead of posting a job and waiting, the employer sees a pre-vetted list of trainees whose granular skills mathematically match the job requirement."*

## Conclusion
*"By connecting Administrators, Trainees, and Employers on a single AI-driven intelligence layer, we ensure skilling funds result in actual employment outcomes."*
