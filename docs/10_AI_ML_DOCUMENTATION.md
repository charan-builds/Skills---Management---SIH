# AI / ML Documentation

The Skilling Impact Intelligence platform integrates deeply with Machine Learning and Artificial Intelligence algorithms. These algorithms provide decision-support systems for administrators, trainees, and employers.

## 1. Skill Matching Engine

- **Model/Algorithm**: TF-IDF Vectorization & Cosine Similarity (`scikit-learn`).
- **Input Features**: Trainee's certified skills (array of strings) vs. Employer Job's required skills (array of strings).
- **Preprocessing**: Skills are lowercased, stripped of whitespace, and mapped against a standardized `master_skill_list`.
- **Inference logic**: 
  - Represents both the trainee and the job as sparse TF-IDF vectors.
  - Computes the Cosine Similarity between the two vectors.
  - Generates a `match_percentage` (e.g., 85%).
- **Where used**: Trainee "Explore Jobs" portal and Employer "Find Candidates" portal.
- **Why selected**: Extremely fast deterministic matching. Does not require GPU inference, keeping costs minimal. Generates highly interpretable scores.
- **Classification**: Statistical Analytics / Rule-Based Intelligence.

## 2. Retention Prediction Model

- **Model/Algorithm**: RandomForestClassifier (`scikit-learn`).
- **Input Features**: Demographics, previous education, commuting distance, programme difficulty, and initial assessment scores.
- **Training**: Pre-trained on historical skilling datasets (represented in the prototype via `ml_retention.py`).
- **Inference logic**: Outputs a probability score representing the likelihood a trainee will complete the programme versus drop out.
- **Where used**: "Impact Intelligence" Admin Dashboard (Aggregated at the cohort level).
- **Why selected**: Random Forests handle non-linear relationships well (e.g., age vs. completion rate) and are robust to outliers without needing massive neural networks.
- **Classification**: Machine Learning.

## 3. Salary Prediction Engine (Outcome Modeling)

- **Model/Algorithm**: RandomForestRegressor & GradientBoostingRegressor (`scikit-learn`).
- **Input Features**: Trainee skills, programme completion status, district economy index, and industry.
- **Inference logic**: Predicts a continuous salary output indicating the expected placement wage.
- **Where used**: Underpins the "Priority Scoring" for cohorts. If predicted salaries drop below the baseline investment cost, the cohort is flagged.
- **Why selected**: Gradient Boosting models typically win Kaggle competitions for tabular data and handle missing/categorical data exceptionally well.
- **Classification**: Machine Learning.

## 4. Cohort Priority Scoring & Interventions

- **Algorithm**: Heuristic Ensemble / Rule-Based Logic (in `decision_engine.py`).
- **Input Features**: Aggregated outputs from the Retention and Salary ML models, plus real-time placement statistics.
- **Inference logic**: 
  - If Placement < 50% OR Dropout Risk > 30% -> `High Risk`.
  - Generates natural language recommendation strings mapped to specific failure modes (e.g., if the skill gap for 'Python' is high, output: "Deploy targeted Python bootcamp").
- **Where used**: Admin "Impact Intelligence" dashboard.
- **Classification**: Heuristic / Rule-based Intelligence.

## Limitations

- **Demo Constraints**: The current prototype executes these models using pre-compiled weights and/or deterministic mock calculations mapped to the frontend demo state. 
- **Cold Start Problem**: In a real-world scenario, the ML models would suffer from a cold start if historical placement data is unavailable. The system relies on the assumption that a state/national body has at least 1-2 years of historical skilling data to pre-train the Random Forest models before going live.
