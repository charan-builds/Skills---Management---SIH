# Multi-Model Unified Inference Engine & AI Scoring Report (Phase 7F)

## 1. System Architecture Overview
Phase 7F establishes a unified multi-model inference and decision-support layer ([ml_inference.py](file:///c:/Pictures/Documents/Cherry%20💗💗/Desktop/SmartFins/Charan/Skilling-Impact-Intelligence/Backend/app/ai/ml_inference.py)) connecting the three validated machine learning models developed across Phases 7A–7E:

```
                  ┌────────────────────────────────────────────────┐
                  │                 Trainee Input                  │
                  │ (programme_id, district, avg_score, assess_cnt)│
                  └───────────────────────┬────────────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │   Step 1: Employment Predictor  │
                         │   RandomForestClassifier (7C)   │
                         │     ──> P(is_employed)          │
                         └────────────────┬────────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    Step 2: Salary Baseline Model      │
                      │  GradientBoostingRegressor (7D)       │
                      │  ──> Expected Salary (Conditional)    │
                      └───────────────────┬───────────────────┘
                                          │
                        Placement Salary Known/Observed?
                                  /               \
                            YES  /                 \  NO
                                ▼                   ▼
             ┌─────────────────────────────┐   ┌───────────────────────────────┐
             │ Step 3: Retention Predictor │   │ State A: Pre-Employment       │
             │   LogisticRegression (7E)   │   │ Retention: UNAVAILABLE        │
             │   ──> P(retained_6m)        │   │ (Requires confirmed placement)│
             └──────────────┬──────────────┘   └───────────────┬───────────────┘
                            │                                  │
                            ▼                                  ▼
             ┌─────────────────────────────────────────────────────────────────┐
             │            Unified Decision-Support Trajectory                  │
             │      (Qualitative Category, Non-Causal Explanations,           │
             │            Uncertainty Flags, Model Provenance)                 │
             └─────────────────────────────────────────────────────────────────┘
```

---

## 2. Prediction-Point Differences
The three underlying models operate at distinct, asynchronous temporal prediction points:

| Model Pipeline | Prediction Point | Required Context | Temporal State |
| :--- | :--- | :--- | :--- |
| **Employment Model** | **Pre-Employment / Training** | In-training skill score, assessments, programme | Before job search/interview |
| **Salary Model** | **Placement-Intake Baseline** | Observable pre-hire attributes | Moment of initial offer |
| **Retention Model** | **Post-Placement / Pre-Retention** | Observed starting salary + training background | Day 1 to Month 6 of hire |

---

## 3. Employment Model Profile (Phase 7C)
- **Model Family**: `RandomForestClassifier(n_estimators=100, max_depth=5, min_samples_split=2, min_samples_leaf=1, max_features='sqrt')`
- **Development CV ROC-AUC**: **0.9160 ± 0.0125** (Train-CV Gap: $0.0210$)
- **Input Features**: `['programme_id', 'district', 'avg_skill_score', 'total_assessments']`
- **Output**: Calibrated class probability $P(\text{is\_employed})$ and binary classification.

---

## 4. Salary Model Profile (Phase 7D)
- **Model Family**: `GradientBoostingRegressor(learning_rate=0.01, max_depth=3, min_samples_split=10, n_estimators=50)`
- **Development CV RMSE**: **5,972.78 ± 762.12** (MAE: **4,552.25**)
- **Holdout Test RMSE**: **3,893.96** ($R^2 \approx -0.088$)
- **Input Features**: `['programme_id', 'district', 'avg_skill_score', 'total_assessments']`
- **Operational Status**: Baseline placement compensation estimate; flagged with explicit residual variance warning.

---

## 5. Retention Model Profile (Phase 7E)
- **Model Family**: `LogisticRegression(C=10.0, max_iter=1000)`
- **Development CV ROC-AUC**: **0.9202 ± 0.0237** (Holdout Test ROC-AUC: **0.9108**, Accuracy: **82.22%**)
- **Input Features**: `['programme_id', 'district', 'avg_skill_score', 'total_assessments', 'latest_salary']`
- **Operational Status**: Activated exclusively when `latest_salary` is provided.

---

## 6. Conditional Dependency Chain
The unified inference engine strictly models the conditional progression of trainee outcomes:
1. **Unconditional Pre-Employment Assessment**: Calculates $P(\text{employment})$ for all enrolled trainees.
2. **Conditional Salary Estimation**: Calculates expected compensation *conditional on securing employment*.
3. **Conditional Retention Assessment**: Retention $P(\text{retained\_6m})$ is evaluated *strictly conditional on placement and salary availability*. Unplaced candidates in training (State A) never receive an unconditional retention probability.

---

## 7. Input Schema Contract

### Safe Pre-Employment Fields (Mandatory)
- `programme_id` (string): Training curriculum identifier (e.g. `"PROG_001"`).
- `district` (string): Geographic location (e.g. `"North"`, `"South"`, `"East"`, `"West"`).
- `avg_skill_score` (float): Aggregate assessment score ($0.0 \le score \le 100.0$).
- `total_assessments` (int): Number of assessments completed ($assessments \ge 0$).

### Placement-Dependent Field (Optional)
- `latest_salary` (float): Confirmed starting/negotiated salary ($salary \ge 0.0$). Required for standalone `/predict/retention` and unlocks State B trajectory.

---

## 8. Leakage Boundary & Rejection Policy
The inference layer enforces an active rejection barrier against forbidden leakage variables:

| Forbidden Leakage Field | Reason for Strict Rejection |
| :--- | :--- |
| `retained_3m`, `retained_6m`, `retained_12m` | Downstream temporal retention outcomes |
| `employment_duration_days`, `max_duration_days` | Direct target derivation proxy |
| `wage_growth_amount`, `wage_growth_percentage` | Future compensation reviews post-hire |
| `employer_feedback`, `satisfaction_score`, `technical_deficiencies` | Post-placement supervisor evaluations |
| `latent_ability`, `quality_factor`, `target_job_id` | Synthetic generator-only hidden parameters |

*If any forbidden field is passed in a request payload, the validator actively raises a `400 Bad Request`.*

---

## 9. Output Schema Contract
A unified trajectory response structure:
```json
{
  "prediction_version": "Phase_7F_Unified_v1.0",
  "prediction_point": "pre_employment | post_placement",
  "employment": {
    "probability": 0.8245,
    "prediction": 1,
    "confidence_band": "HIGH_PROBABILITY"
  },
  "salary": {
    "available": true,
    "known_salary": null,
    "predicted_salary": 38450.00,
    "prediction_context": "conditional_on_placement",
    "warning": "Salary prediction has substantial residual uncertainty..."
  },
  "retention": {
    "available": false,
    "probability": null,
    "prediction": null,
    "confidence_band": "UNAVAILABLE_PRE_PLACEMENT",
    "reason": "Retention prediction requires confirmed placement salary and employment context."
  },
  "trajectory": {
    "stage": "In Training / Pre-Placement",
    "qualitative_category": "HIGH POTENTIAL",
    "summary": "High probability of placement and strong projected retention stability."
  },
  "explanations": [
    "Candidate average skill score (85.0) is positively associated with employment likelihood in this model.",
    "Training programme 'PROG_001' provides curriculum alignment context for employment prediction.",
    "Note: All explanations reflect model-derived statistical associations and do NOT imply direct causal effects."
  ],
  "warnings": [
    "These predictions are generated by models trained exclusively on synthetic experimental data...",
    "Salary prediction has substantial residual uncertainty..."
  ],
  "provenance": { ... }
}
```

---

## 10. Uncertainty Handling & Decision Bands
Probability estimates are categorized into transparent decision-support bands:
- **$P < 0.40$**: `LOW_PROBABILITY`
- **$0.40 \le P \le 0.60$**: `HIGH_UNCERTAINTY_REVIEW_RECOMMENDED` (Triggers `"HUMAN REVIEW"` trajectory advisory)
- **$P > 0.60$**: `HIGH_PROBABILITY`

---

## 11. Explainability Strategy
- Explanations are dynamically composed from validated model weights ($\beta$ in Logistic Regression, feature importances in Random Forest / Gradient Boosting).
- All explanations are non-causal: `"Programme PROG_013 is associated with higher retention likelihood in this model"` rather than `"Programme PROG_013 causes retention"`.

---

## 12. Model Provenance Tracking
Every response payload includes metadata identifying the exact model family, training phase, and benchmark metrics (`RandomForestClassifier_Phase_7C`, `GradientBoostingRegressor_Phase_7D`, `LogisticRegression_Phase_7E`).

---

## 13. REST API Endpoints

| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/predict/employment` | Pre-employment placement probability | Yes |
| `POST` | `/api/ai/predict/salary` | Baseline conditional salary estimate | Yes |
| `POST` | `/api/ai/predict/retention` | 6-month retention probability (requires salary) | Yes |
| `POST` | `/api/ai/predict/trajectory` | Full multi-stage conditional trajectory | Yes |

---

## 14. Input Validation & Error Handling
- Invalid types, negative assessments, out-of-range skill scores ($<0$ or $>100$), and missing required fields immediately return `400 Bad Request` with actionable diagnostic messages.
- Calling `/predict/retention` without `latest_salary` returns `400 Bad Request: Field 'latest_salary' is required for post-placement retention prediction.`

---

## 15. Test Suite Verification
All 9 unit and integration tests in [test_ai_ml_inference.py](file:///c:/Pictures/Documents/Cherry%20💗💗/Desktop/SmartFins/Charan/Skilling-Impact-Intelligence/Backend/tests/test_ai_ml_inference.py) pass:
- Model loading & pipeline caching verification
- Input validation & boundary checks
- Active leakage field rejection
- Pre-employment State (State A) and Post-Placement State (State B) trajectory inference
- Uncertainty decision band mapping
- FastAPI endpoint integration via TestClient

---

## 16. Synthetic-Data Limitations
> [!WARNING]
> **Synthetic Dataset Disclaimer**
> All models were trained on the Phase 6 synthetic dataset. While the data generator models realistic skilling dynamics, the model parameters must be re-calibrated and validated on genuine human administrative records before deployment in high-stakes operational environments.

---

## 17. Calibration Limitations
Model probabilities reflect standard logistic/forest outputs; empirical calibration (e.g. Platt scaling / Isotonic regression) has not yet been fitted on production validation partitions. Probabilities are treated as relative ranking signals and decision-support probability bands.

---

## 18. Salary Uncertainty Limitations
Salary regression exhibits high irreducible variance ($R^2 \approx -0.088$) due to unobserved employer and job vacancy attributes. It is explicitly exposed as a baseline estimate and never presented as guaranteed compensation.

---

## 19. Recommended Phase 7G (Production Readiness & Monitoring)
- **Phase 7G**: Production Observability, Model Health Drift Monitoring, and Frontend Intelligence Visualization.
