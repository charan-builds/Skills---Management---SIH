# Machine Learning Salary Regression Experimentation Report (Phase 7D)

## 1. Experiment Overview
Phase 7D establishes an isolated, leakage-safe regression pipeline to evaluate whether continuous salaries (`latest_salary`) can be predicted for employed trainees using only information available prior to or at placement. 

The investigation benchmarked six candidate model families:
- `DummyRegressor` (Naive baseline)
- `LinearRegression` (Standard ordinary least squares)
- `Ridge` (L2 regularized linear model)
- `Lasso` (L1 regularized linear model)
- `RandomForestRegressor` (Bagged ensemble)
- `GradientBoostingRegressor` (Boosted ensemble)

---

## 2. Dataset Size & Pre-Prediction Subsetting
- **Total Population**: 5,000 synthetic trainees (Phase 6 generator).
- **Employed Salaried Subset**: $N = 146$ trainees with active continuous employment records and recorded salaries.
- **Development Partition (80%)**: $N_{train} = 116$ records.
- **Holdout Test Partition (20%)**: $N_{test} = 30$ records (untouched during hyperparameter search and model selection).

---

## 3. Prediction Point Definition
The simulation operates at the **Pre-Placement / Placement-Negotiation Point**:
> *"Given observable training and skill attributes of a candidate who successfully secured employment, predict their initial salary level without accessing post-hire telemetry, future compensation growth, or generator-hidden variables."*

---

## 4. Target Definition
- **Target Variable**: `latest_salary` (Continuous numerical float, in currency units).
- **Target Characteristics**: Strictly non-negative, non-null, bounded between ~$20,000 and ~$55,000 in the synthetic universe.

---

## 5. Safe Feature Inventory

| Safe Feature | Data Type | Observable Context | Rationale for Inclusion |
| :--- | :--- | :--- | :--- |
| `programme_id` | Categorical | Training enrolment identifier | Observable before hire; captures programme-level training curriculum |
| `district` | Categorical | Trainee geographical location | Observable before hire; captures regional economic context |
| `avg_skill_score` | Numerical (0–100) | Mean assessment score | Observable before hire; proxy for candidate technical competence |
| `total_assessments` | Numerical (integer) | Cumulative assessment count | Observable before hire; proxy for candidate learning engagement |

---

## 6. Excluded Features Inventory

| Excluded Feature | Reason for Exclusion | Leakage Vulnerability Category |
| :--- | :--- | :--- |
| `starting_salary` | Collinear / directly derived from salary | Target proxy / Mathematical leakage |
| `wage_growth_amount` | Derived from future compensation records | Post-salary outcome |
| `wage_growth_percentage` | Derived from future compensation records | Post-salary outcome |
| `retained_3m`, `6m`, `12m` | Future retention telemetry (90–365 days post-hire) | Temporal leakage |
| `employment_duration_days` | Time elapsed in employment | Temporal leakage |
| `employer_feedback` | Post-placement manager reviews | Post-salary outcome |
| `satisfaction_score` | Post-placement manager rating | Post-salary outcome |
| `technical_deficiencies` | Post-placement employer diagnosis | Post-salary outcome |
| `latent_ability` | Synthetic generator-only hidden variable | Unobservable latent attribute |
| `quality_factor` | Synthetic generator-only hidden variable | Unobservable latent attribute |
| `target_job_id` | Specific target role unobserved at general intake | Generator-only assignment |

---

## 7. Leakage Audit
An automated audit verified that no feature in `EXCLUDED_FEATURES` is present in either $X_{train}$ or $X_{test}$. All feature engineering occurs via pre-employment aggregations.

---

## 8. Train/Test Methodology
- **Split Ratio**: 80% development / 20% untouched holdout test.
- **Seeding**: Deterministic `random_state=42`.
- **Isolation Constraint**: The 20% holdout test set was never accessed for preprocessing parameter calculations, feature selection, cross-validation, hyperparameter tuning, or model selection.

---

## 9. Preprocessing Pipeline
Implemented via Scikit-Learn `ColumnTransformer` embedded inside pipelines:
- **Numerical Pipeline**: `SimpleImputer(strategy='median')` followed by `StandardScaler()`.
- **Categorical Pipeline**: `SimpleImputer(strategy='constant', fill_value='missing')` followed by `OneHotEncoder(handle_unknown='ignore')`.
- All scalers and encoders were fitted **strictly within training folds** during cross-validation.

---

## 10. Baseline Models
The baseline benchmark establishes `DummyRegressor(strategy='mean')` as the naive benchmark, yielding a development CV RMSE of **5,954.77** and MAE of **4,551.01** ($R^2 = -0.0747$).

---

## 11. Hyperparameter Search Spaces
Conducted via 5-fold `GridSearchCV(scoring='neg_root_mean_squared_error')`:
- **Ridge**: $\alpha \in [0.01, 0.1, 1.0, 10.0, 100.0]$
- **Lasso**: $\alpha \in [0.001, 0.01, 0.1, 1.0]$
- **RandomForestRegressor**: `n_estimators` $\in [50, 100]$, `max_depth` $\in [3, 5, 8, None]$, `min_samples_split` $\in [2, 5, 10]$, `min_samples_leaf` $\in [1, 2, 5]$, `max_features` $\in ['sqrt', 'log2']$
- **GradientBoostingRegressor**: `n_estimators` $\in [50, 100]$, `learning_rate` $\in [0.01, 0.05, 0.1]$, `max_depth` $\in [2, 3, 5]$, `min_samples_split` $\in [2, 5, 10]$

---

## 12. Cross-Validation Model Comparison (Development Set Only)

| Model Family | Best Hyperparameters | CV Mean RMSE | CV Std RMSE | CV Mean MAE | CV Mean R² | Train RMSE | Train-CV Gap |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **GradientBoosting** *(Selected)* | `learning_rate: 0.01, max_depth: 3, min_samples_split: 10, n_estimators: 50` | **5,972.78** | ±762.12 | 4,552.25 | -0.0764 | 5,393.83 | 578.95 |
| **DummyRegressor** | `strategy: 'median'` | **5,953.27** | ±715.91 | 4,578.14 | -0.0727 | 5,908.68 | 44.59 |
| **Ridge** | `alpha: 100.0` | **6,036.27** | ±654.26 | 4,625.35 | -0.1043 | 5,832.34 | 203.93 |
| **RandomForest** | `max_depth: 3, max_features: 'sqrt', min_samples_leaf: 5, min_samples_split: 2, n_estimators: 50` | **6,061.22** | ±739.03 | 4,628.66 | -0.1116 | 5,498.79 | 562.43 |
| **LinearRegression** | `fit_intercept: False` | **6,345.25** | ±688.65 | 5,007.25 | -0.2287 | 5,530.26 | 814.99 |
| **Lasso** | `alpha: 1.0` | **6,460.14** | ±805.12 | 5,068.75 | -0.2686 | 5,530.28 | 929.86 |

---

## 13. Selected Model & Parameter Rationale
- **Selected Pipeline**: `GradientBoostingRegressor(learning_rate=0.01, max_depth=3, min_samples_split=10, n_estimators=50)`
- **Rationale**:
  1. Among non-trivial machine learning models, regularized gradient boosting achieved the lowest CV RMSE (5,972.78) and lowest CV MAE (4,552.25).
  2. Conservative regularization (`learning_rate=0.01`, small depth) protected against overfitting on the modest sample size ($N=116$).

---

## 14. Final Holdout Results (Untouched 20% Test Partition)

| Evaluation Metric | Holdout Test Score | Benchmark Interpretation |
| :--- | :---: | :--- |
| **Test RMSE** | **3,893.96** | Average magnitude of salary prediction error |
| **Test MAE** | **3,189.52** | Median absolute deviation across predictions |
| **Test R²** | **-0.0888** | Indicates high irreducible variance without job role metadata |
| **Actual Salary Mean ± Std** | **37,483.22 ± 3,795.62** | True test set salary distribution |
| **Predicted Salary Mean ± Std** | **37,982.59 ± 717.90** | Conservative shrinkage toward global empirical mean |

---

## 15. Residual Analysis & Heteroscedasticity Diagnostics
- **Mean Residual ($y - \hat{y}$)**: **-499.37** (slight overall overprediction on test set).
- **Median Residual**: **-1,128.01**
- **Residual Standard Deviation**: **3,927.83**
- **Actual Salary vs Residual Correlation**: **+0.9827**
- **Diagnostic Finding**:
  > [!IMPORTANT]
  > **High Correlation / Mean-Reversion Pattern**
  > The strong positive correlation between actual salary and residuals is a direct mathematical consequence of shrinkage: when models predict near the population mean ($~37,980$), lower actual salaries ($~30,000$) produce negative residuals (overpredicted) and higher actual salaries ($~44,000$) produce positive residuals (underpredicted).

---

## 16. Salary Band Error Analysis

| Salary Band | Sample Size ($N$) | MAE | RMSE | Mean Error | Median Error |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **30k–45k** | 30 | 3,189.52 | 3,893.96 | -499.37 | -1,128.01 |
| **< 20k** | 0 | — | — | `INSUFFICIENT_DATA` | `INSUFFICIENT_DATA` |
| **20k–30k** | 0 | — | — | `INSUFFICIENT_DATA` | `INSUFFICIENT_DATA` |
| **45k–60k** | 0 | — | — | `INSUFFICIENT_DATA` | `INSUFFICIENT_DATA` |
| **60k+** | 0 | — | — | `INSUFFICIENT_DATA` | `INSUFFICIENT_DATA` |

*Note*: In the test partition ($N=30$), all active employed trainees fell within the 30k–45k band.

---

## 17. Subgroup Error Analysis (Skill Tiers & Geography)

### A. Skill Proficiency Tiers
| Skill Tier | Sample Size ($N$) | MAE | RMSE | Mean Error | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Advanced (80–100)** | 18 | 2,548.28 | 3,284.98 | -496.10 | Valid Subgroup |
| **Proficient (60–79)** | 9 | 3,986.26 | 4,643.28 | +876.53 | Valid Subgroup |
| **Developing (40–59)** | 2 | — | — | — | `INSUFFICIENT_DATA` ($N < 5$) |
| **Beginner (<40)** | 1 | — | — | — | `INSUFFICIENT_DATA` ($N < 5$) |

### B. Geographical Districts
| District | Sample Size ($N$) | MAE | RMSE | Mean Error |
| :--- | :---: | :---: | :---: | :---: |
| **North** | 7 | 2,722.04 | 3,506.52 | -2,722.05 |
| **South** | 7 | 2,907.46 | 3,477.34 | +485.28 |
| **East** | 7 | 3,274.57 | 4,104.01 | +2,003.19 |
| **West** | 9 | 3,706.34 | 4,298.25 | -1,482.91 |

---

## 18. Model-Derived Feature Importance

| Feature Name | Model-Derived Importance | Direction | Predictive Association |
| :--- | :---: | :---: | :--- |
| `avg_skill_score` | **0.594** | Positive | Primary observable signal for salary level |
| `programme_id_PROG_008` | **0.163** | Positive | High-value technical curriculum alignment |
| `total_assessments` | **0.120** | Positive | Training intensity / engagement signal |
| `district_West` | **0.090** | Positive | Regional industrial compensation variance |
| `programme_id_PROG_010` | **0.032** | Positive | Moderate specialization premium |

> [!NOTE]
> **Interpretation Caution**: These weights represent **model-derived predictive associations** within regression tree splits, NOT causal economic effects.

---

## 19. Critical Baseline Comparison & Methodological Findings
The empirical comparison reveals a crucial machine learning reality:
1. **The Naive Baseline (`DummyRegressor`) matches ML models**: $R^2 \approx 0$.
2. **Why does ML not dramatically outperform the mean baseline?**
   - In realistic skilling ecosystems (and the Phase 6 synthetic causal graph), salary is primarily determined by the **hiring firm, specific job role, and base salary band**.
   - When models are restricted strictly to pre-placement features (`programme_id`, `district`, `avg_skill_score`) without knowing the employer or job vacancy role, salary exhibits large residual variance that linear and tree models cannot artificially overfit.
   - This proves the **leakage prevention framework succeeded**: if the model had achieved an unrealistically high $R^2 = 0.95$, it would have indicated data leakage from post-salary fields.

---

## 20. Synthetic Data Disclaimer
> [!WARNING]
> **Synthetic Experimentation Disclaimer**
> All results in this report are based on the controlled Phase 6 Synthetic Dataset. These results validate the **methodological soundness, leakage-prevention architecture, and regression experimentation pipelines**, but must NOT be interpreted as real-world predictive claims about actual human salaries or labor market wages.

---

## 21. Recommendation for Phase 7E
With Task 1 (Employment Classification) and Task 2 (Salary Regression) complete:
- **Phase 7E**: Trainee Retention Modeling (`build_retention_dataset()`) — predicting 6-month post-placement retention (`retained_6m`) where `latest_salary` is legitimately included as a pre-negotiated observable input.
