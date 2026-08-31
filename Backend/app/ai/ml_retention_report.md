# Machine Learning Trainee Retention Prediction Experimentation Report (Phase 7E)

## 1. Experiment Overview
Phase 7E establishes a rigorous, leakage-safe machine learning classification pipeline to predict 6-month post-placement trainee retention (`retained_6m`). The investigation systematically benchmarked five candidate model families:
- `DummyClassifier` (Naive baseline)
- `LogisticRegression` (Linear probabilistic baseline)
- `DecisionTreeClassifier` (Interpretable tree baseline)
- `RandomForestClassifier` (Bagged ensemble)
- `GradientBoostingClassifier` (Sequential boosting ensemble)

---

## 2. Dataset Size & Class Distribution
- **Total Population**: 5,000 synthetic trainees (Phase 6 generator).
- **Placed Trainees Subset**: $N = 896$ trainees with completed placement records and initial negotiated salaries.
- **Development Partition (80%)**: $N_{train} = 716$ (395 non-retained / 321 retained; 44.8% positive rate).
- **Holdout Test Partition (20%)**: $N_{test} = 180$ (99 non-retained / 81 retained; 45.0% positive rate).

---

## 3. Prediction Point Definition
The simulation operates at the **Post-Placement / Pre-Retention Point**:
> *"Given observable training credentials, geographic location, and the pre-negotiated starting compensation level at the moment of job placement, predict whether the trainee will remain retained in employment at the 6-month milestone ($180+$ days) prior to observing post-hire manager reviews or future wage trajectory."*

---

## 4. Target Definition
- **Target Variable**: `retained_6m`
- **Type**: Binary integer classification ($1 = \text{Retained} \ge 180 \text{ days}, 0 = \text{Departed} < 180 \text{ days}$).
- **Target Integrity**: Non-negative, zero missing values, balanced representation ($~45\%$ positive prevalence).

---

## 5. Safe Feature Inventory

| Safe Feature | Data Type | Observable Context | Rationale for Inclusion |
| :--- | :--- | :--- | :--- |
| `programme_id` | Categorical | Training programme identifier | Captures curriculum quality, domain specialization, and industry alignment |
| `district` | Categorical | Trainee geographical location | Captures regional employment dynamics and local commuting/market friction |
| `avg_skill_score` | Numerical (0–100) | Mean assessment score | Proxy for candidate competency and job readiness |
| `total_assessments` | Numerical (integer) | Cumulative assessment count | Proxy for learner perseverance and engagement |
| `latest_salary` | Numerical (currency) | Initial negotiated compensation | **Legitimate at prediction point**: salary is finalized at placement prior to retention |

---

## 6. Leakage Exclusions Inventory

| Excluded Feature | Reason for Exclusion | Leakage Vulnerability Category |
| :--- | :--- | :--- |
| `retained_3m` | Temporal precedence / intermediate retention milestone | Downstream temporal leakage |
| `retained_12m` | Occurs 6 months after the target milestone | Post-prediction leakage |
| `employment_duration_days` | Directly derives target ($duration \ge 180$) | Target proxy / Mathematical leakage |
| `max_duration_days` | Directly derives target | Target proxy / Mathematical leakage |
| `wage_growth_amount` | Derived from future tenure compensation reviews | Post-prediction leakage |
| `wage_growth_percentage` | Derived from future tenure compensation reviews | Post-prediction leakage |
| `employer_feedback` | Collected during periodic manager reviews | Post-placement outcome |
| `satisfaction_score` | Collected during post-hire check-ins | Post-placement outcome |
| `technical_deficiencies` | Diagnosed on the job by supervisors | Post-placement outcome |
| `latent_ability` | Synthetic generator-only hidden variable | Unobservable latent variable |
| `quality_factor` | Synthetic generator-only hidden variable | Unobservable latent variable |
| `target_job_id` | Synthetic assignment variable | Generator-only assignment |

---

## 7. Leakage Audit
An automated audit confirmed that zero features in `EXCLUDED_FEATURES` are present in either $X_{train}$ or $X_{test}$. `latest_salary` is explicitly retained as an observable pre-retention input.

---

## 8. Train/Test Methodology
- **Split Ratio**: 80% development / 20% untouched holdout test with stratification on `retained_6m`.
- **Seeding**: Deterministic `random_state=42`.
- **Quarantine Invariant**: The 20% holdout test set was never accessed for preprocessing parameter estimation, cross-validation, hyperparameter tuning, or model ranking.

---

## 9. Preprocessing Pipeline
Constructed with Scikit-Learn `ColumnTransformer` embedded inside pipelines:
- **Numerical Pipeline**: `SimpleImputer(strategy='median')` followed by `StandardScaler()`.
- **Categorical Pipeline**: `SimpleImputer(strategy='constant', fill_value='missing')` followed by `OneHotEncoder(handle_unknown='ignore')`.
- All scalers and encoders were fitted **strictly within training folds** during cross-validation.

---

## 10. Baseline Model
The baseline benchmark establishes `DummyClassifier(strategy='prior')` as the naive benchmark, yielding a development CV ROC-AUC of **0.5000**, Accuracy of **0.5517**, and F1 of **0.0000**.

---

## 11. Hyperparameter Search Spaces
Conducted via 5-fold `StratifiedKFold` `GridSearchCV(scoring='roc_auc')`:
- **LogisticRegression**: $C \in [0.01, 0.1, 1.0, 10.0]$
- **DecisionTreeClassifier**: `max_depth` $\in [3, 5, 8]$, `min_samples_split` $\in [2, 10]$, `min_samples_leaf` $\in [1, 5]$, `criterion` $\in ['gini', 'entropy']$
- **RandomForestClassifier**: `n_estimators` $\in [50, 100]$, `max_depth` $\in [3, 5, 8]$, `min_samples_split` $\in [2, 5]$, `min_samples_leaf` $\in [1, 4]$, `max_features` $\in ['sqrt', 'log2']$
- **GradientBoostingClassifier**: `n_estimators` $\in [50, 100]$, `learning_rate` $\in [0.01, 0.05, 0.1]$, `max_depth` $\in [2, 3, 5]$, `min_samples_split` $\in [2, 5]$

---

## 12. Cross-Validation Model Comparison (Development Set Only)

| Model Family | Best Hyperparameters | CV Mean ROC-AUC | CV Std ROC-AUC | CV Mean F1 | CV Mean Accuracy | Train ROC-AUC | Train-CV Gap |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **LogisticRegression** *(Selected)* | `C: 10.0` | **0.9202** | ±0.0237 | **0.8330** | **0.8534** | 0.9300 | 0.0098 |
| **RandomForest** | `max_depth: 8, max_features: 'sqrt', min_samples_leaf: 4, min_samples_split: 2, n_estimators: 50` | **0.9194** | ±0.0215 | 0.8313 | 0.8492 | 0.9589 | 0.0395 |
| **GradientBoosting** | `learning_rate: 0.05, max_depth: 2, min_samples_split: 2, n_estimators: 100` | **0.9127** | ±0.0240 | 0.8262 | 0.8450 | 0.9445 | 0.0318 |
| **DecisionTree** | `criterion: 'entropy', max_depth: 5, min_samples_leaf: 5, min_samples_split: 2` | **0.8865** | ±0.0338 | 0.8257 | 0.8436 | 0.9436 | 0.0571 |
| **DummyClassifier** | `strategy: 'prior'` | **0.5000** | ±0.0000 | 0.0000 | 0.5517 | 0.5000 | 0.0000 |

---

## 13. Selected Model & Parameter Rationale
- **Selected Pipeline**: `LogisticRegression(C=10.0, max_iter=1000)`
- **Rationale**:
  1. Achieved the highest development-set CV ROC-AUC (**0.9202**) and highest CV F1 (**0.8330**).
  2. Demonstrated exceptional model stability with a minimal overfitting gap ($\Delta = 0.0098 \ll 0.08$).
  3. Superior parsimony and direct linear interpretability over complex tree ensembles.

---

## 14. Final Holdout Results (Untouched 20% Test Partition)

| Evaluation Metric | Holdout Test Score | Benchmark Performance |
| :--- | :---: | :--- |
| **Test ROC-AUC** | **0.9108** | Strong discriminative ability between retained and non-retained |
| **Test Accuracy** | **0.8222** (82.2%) | Outperforms naive majority baseline (55.0%) by +27.2 percentage points |
| **Test Precision** | **0.7816** (78.2%) | High precision on positive retention predictions |
| **Test Recall** | **0.8395** (84.0%) | Captures 84% of all truly retained candidates |
| **Test F1-Score** | **0.8095** | Strong harmonic balance between precision and recall |

---

## 15. Confusion Matrix Analysis ($N_{test} = 180$)

```
                  Predicted Negative (0)    Predicted Positive (1)
Actual Negative (0)         80 (TN)                   19 (FP)
Actual Positive (1)         13 (FN)                   68 (TP)
```

- **True Positives (TP)**: 68
- **True Negatives (TN)**: 80
- **False Positives (FP)**: 19 (Predicted retained, but departed early)
- **False Negatives (FN)**: 13 (Predicted to depart, but remained retained)
- **Total Validated**: $TP + TN + FP + FN = 180 = N_{test}$
- **Overall Error Rate**: $32 / 180 = 17.78\%$

---

## 16. Probability & Uncertainty Analysis
- **Predicted Probability Range**: $[0.0008, 0.9966]$ (Mean: 0.4791, Median: 0.4612)
- **Borderline Zone ($0.40 \le P(y=1) \le 0.60$)**:
  - **Borderline Cases**: 17 trainees (9.44% of test cohort)
  - **Borderline Error Rate**: **52.94%** (as expected, uncertainty increases near decision boundary)

---

## 17. Error Analysis: Subgroups & Feature Slices

### A. Salary Bands
| Salary Band | Sample Size ($N$) | Error Count | Error Rate | Subgroup Accuracy |
| :--- | :---: | :---: | :---: | :---: |
| **< 20k** | 26 | 0 | 0.00% | 100.0% |
| **20k–30k** | 63 | 10 | 15.87% | 84.13% |
| **30k–45k** | 87 | 22 | 25.29% | 74.71% |
| **45k–60k** | 4 | — | — | `INSUFFICIENT_DATA` ($N < 5$) |

### B. Skill Proficiency Tiers
| Skill Tier | Sample Size ($N$) | Error Count | Error Rate | Subgroup Accuracy |
| :--- | :---: | :---: | :---: | :---: |
| **Beginner (<40)** | 5 | 0 | 0.00% | 100.0% |
| **Developing (40–59)** | 25 | 3 | 12.00% | 88.00% |
| **Proficient (60–79)** | 70 | 10 | 14.29% | 85.71% |
| **Advanced (80–100)** | 80 | 19 | 23.75% | 76.25% |

### C. Geographical Districts
| District | Sample Size ($N$) | Error Count | Error Rate | Subgroup Accuracy |
| :--- | :---: | :---: | :---: | :---: |
| **West** | 47 | 5 | 10.64% | 89.36% |
| **East** | 58 | 10 | 17.24% | 82.76% |
| **North** | 34 | 6 | 17.65% | 82.35% |
| **South** | 41 | 11 | 26.83% | 73.17% |

---

## 18. Model-Derived Feature Importance

| Feature Name | Coefficient ($\beta$) | Absolute Weight | Direction | Predictive Association |
| :--- | :---: | :---: | :---: | :--- |
| `programme_id_PROG_009` | **-3.045** | 3.045 | Negative | Associated with lower post-placement retention |
| `programme_id_PROG_013` | **+2.190** | 2.190 | Positive | Associated with high 6-month retention rate |
| `programme_id_PROG_014` | **+2.140** | 2.140 | Positive | Strong technical retention retention signal |
| `latest_salary` | **+1.437** | 1.437 | Positive | Higher starting compensation strongly associates with retention |
| `programme_id_PROG_005` | **+1.396** | 1.396 | Positive | Moderate positive retention association |
| `programme_id_PROG_011` | **-1.380** | 1.380 | Negative | Moderate negative retention association |
| `programme_id_PROG_015` | **+1.326** | 1.326 | Positive | Positive retention curriculum |
| `programme_id_PROG_001` | **-1.239** | 1.239 | Negative | Lower long-term retention |

> [!NOTE]
> **Interpretation Caution**: These weights represent **model-derived predictive coefficients**, NOT causal guarantees. For instance, higher salary is correlated with retention, but external factors like workplace culture and candidate alternatives remain unobserved.

---

## 19. Critical Baseline Comparison & Key Findings
1. **ML Meaningfully Outperforms Baseline**: `LogisticRegression` achieves **ROC-AUC = 0.9108** and **Accuracy = 82.22%**, drastically surpassing the naive baseline (ROC-AUC = 0.5000, Accuracy = 55.17%).
2. **Predictive Validity of Starting Salary**: Including pre-negotiated starting salary (`latest_salary`) provides a powerful, legitimate predictive signal ($\beta = +1.437$) without causing leakage.
3. **Curriculum Alignment Impact**: Specific training programmes (`PROG_013`, `PROG_014` vs `PROG_009`) show substantial variance in retention, highlighting programme quality and role matching differences.

---

## 20. Methodological Limitations
1. **Unobserved Employer Attributes**: Company size, work culture, commute times, and direct manager quality are unobserved.
2. **Static Pre-Retention Snapshot**: Candidate life changes between placement and month 6 cannot be tracked prior to occurrence.

---

## 21. Synthetic Data Disclaimer
> [!WARNING]
> **Synthetic Experimentation Disclaimer**
> All results in this report are based on the controlled Phase 6 Synthetic Dataset. These results validate the **retention classification architecture, leakage-prevention safeguards, and evaluation pipelines**, but must NOT be interpreted as real-world predictive claims about actual employee retention rates.

---

## 22. Recommendation for Phase 7F
With Phase 7B (Employment Classification), Phase 7D (Salary Regression), and Phase 7E (Retention Prediction) fully complete:
- **Phase 7F — Multi-Model Integration & AI Decision Engine**: Unify all three validated ML models into an end-to-end, multi-stage prediction pipeline with calibrated scoring and explainable decision telemetry.
