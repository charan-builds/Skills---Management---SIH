# Frequently Asked Questions (FAQ)

### 1. How is this different from existing government skilling dashboards?
Existing dashboards primarily track *inputs* and *outputs* (e.g., Funds allocated, Trainees enrolled, Trainees certified). Skilling Impact Intelligence tracks *outcomes* (e.g., Trainees employed, Wages increased) and actively computes *intelligence* (e.g., Why are trainees in District A failing to get hired?). It acts as a decision-support engine rather than just a visualization tool.

### 2. Can employers see Trainee PII (Names, Emails) immediately?
No. To prevent bias and preserve privacy, the Employer matching portal only displays the trainee's anonymized skills and their match percentage relative to the job. Employers can only access PII if the trainee explicitly opts-in by applying for the job.

### 3. What happens if the AI makes an incorrect prediction?
The AI Priority Scoring is designed as a *decision-support* tool, not an automated execution engine. If the AI flags a cohort as "High Risk", an Administrator still manually reviews the data before deciding to allocate funds for an intervention. Human-in-the-loop is maintained.

### 4. Why are the data edits not saving when I refresh the page?
The prototype is currently running in "Demo Mode", utilizing an in-memory database. This ensures that every judge or reviewer experiences the platform in a pristine state. Persistent data saving will be enabled upon connecting a production database (like PostgreSQL or Firestore).

### 5. How are the job "Match Percentages" calculated?
The backend utilizes a TF-IDF (Term Frequency-Inverse Document Frequency) algorithm to convert the Trainee's certified skills and the Employer's requested skills into mathematical vectors. It then calculates the Cosine Similarity between them, returning a highly accurate overlap score.

### 6. Can this platform scale to millions of users?
Yes. The architecture relies on FastAPI (asynchronous Python) and React (Client-side rendering). By keeping the backend entirely stateless, it can be horizontally scaled behind a load balancer infinitely. The only constraint is the database layer, which is abstracted to allow easy migration to scalable cloud databases.
