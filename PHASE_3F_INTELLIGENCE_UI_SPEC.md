# Phase 3F Intelligence UI Specification

## 1. Objective
Build and restore a production-grade Impact Intelligence dashboard that correctly visualizes authoritative platform data without relying on hardcoded statistics, mock values, or placeholder charts. Ensure that the sync status truthfully reflects the dashboard's connectivity to the backend systems.

## 2. Root Cause Analysis
The dashboard was previously showing empty results ("Total Trainees = 0", "Insufficient Data", etc.) despite a valid production dataset of 45 authoritative baseline documents because:
1. **API Validation Crash (`/api/analytics/dashboard`)**: The Pydantic model `SkillGapBase` threw a `ValidationError` when computing `calculate_overview` because some role benchmark requirements lacked a `skill_name`, causing the analytics pipeline to return a 500 server error.
2. **Schema Strictness (`/api/trainees`)**: The `/api/trainees` endpoint returned a 500 error because FastAPI’s response validation encountered missing fields (`course_name`, `provider`, `status`, `outcome`) in the synthetic authoritative documents, violating the strict `TraineeBase` response schema. 

## 3. Implementation Plan
### 3.1. Backend Adjustments
1. **Skill Gap Service Resiliency:** Added defensive handling to `SkillGapService` in `app/services/skill_gap_service.py` to retrieve `skill_name` via `FirestoreRepository.get_skill` if it is missing in the benchmark requirements.
2. **Flexible API Models:** Modified `TraineeBase` and related models (`EmploymentHistorySchema`, `ConsentRecordSchema`) in `app/schemas/trainee.py` to mark missing synthetic dataset fields as `Optional`. This prevents Pydantic `ValidationError` crashes on valid synthetic data, allowing the frontend to receive all 45 trainee documents properly.

### 3.2. Frontend Integration
1. **Truthful Live Synchronization Indicator:** Modified `Dashboard.jsx` to dynamically render a "Live Data Synchronized" indicator only if both primary dashboard endpoints (`/api/analytics/dashboard` and `/api/trainees`) return successfully. It handles various states including "Loading Live Data...", "Data Unavailable", and "Connection Error".
2. **Functional Filtering:** The hardcoded, mockup dropdowns in `Dashboard.jsx` (Districts, Programmes, and Cohorts) were mismatched with the true dataset. These were corrected to exactly match the available baseline fields (e.g. Districts: `North`, `South`, `East`, `West`; Programmes: `IT Bootcamp`, `Data`, `Web`, `Safety`, `Hardware`, `General`). The Cohort filter was modified to remove nonexistent 2024-Q4 metrics, defaulting to "All Cohorts".

## 4. Security & Privacy Validations
- **Minimum Cohort Thresholds**: Retained the backend `MIN_COHORT_THRESHOLD` of 5. The dashboard now properly displays "Insufficient Data" when slicing data by restrictive filters that yield less than 5 trainees, respecting the privacy requirements.
- **No Mutations**: The fixes strictly enforce reads. No writes, destructive schema migrations, or mocked records were applied to the 120 production documents.
