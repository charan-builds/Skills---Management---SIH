# Phase 2I Backend Write Path Audit

This document enumerates every production write path discovered across the backend repository using Firestore mutation methods (`.set`, `.add`, `.update`, `.delete`).

| File | Line | Collection | Operation | Authorization | Intended Behavior |
|---|---|---|---|---|---|
| `repository.py` | 106 | `programmes` | `.set()` | Admin | Create a new programme |
| `repository.py` | 122 | `programmes` | `.delete()` | Admin | Delete a programme |
| `repository.py` | 230 | `trainees` | `.set()` | Admin | Create a new trainee |
| `repository.py` | 288 | `trainees` | `.update()` | Admin | Update a trainee |
| `repository.py` | 336 | `trainees` | `.update()` | Admin / Self | Update outcome / consent |
| `repository.py` | 498 | `employers` | `.update()` | Employer | Update employer profile |
| `repository.py` | 547 | `employer_verifications` | `.set()` | Admin / Employer | Create verification request |
| `repository.py` | 588 | `employer_verifications` | `.update()` | Employer | Approve/Reject verification |
| `repository.py` | 646 | `trainees` | `.update()` | System | Mark trainee as Hired upon approval |
| `repository.py` | 688 | `employer_feedback` | `.set()` | Employer | Submit feedback |
| `repository.py` | 752 | `interventions` | `.set()` | Admin | Record a new intervention |
| `repository.py` | 797 | `skill_master` | `.set()` | Admin | Add a new tracked skill |
| `repository.py` | 847 | `skill_assessments` | `.set()` | Trainee | Submit a skill assessment |
| `repository.py` | 920 | `follow_ups` | `.set()` | System / Admin | Create followup tracker |
| `repository.py` | 938 | `follow_ups` | `.update()` | Admin | Cancel / Update followup |
| `repository.py` | 971 | `follow_up_attempts` | `.set()` | Admin | Log contact attempt |
| `auth_repo.py` | 82 | `trainees` | `.set()` | Any | Register a new trainee |
| `ml_telemetry.py` | 87 | `ai_inference_logs` | `.set()` | System | Audit AI model inputs/outputs |

## Observations
- All write paths are correctly isolated from read operations.
- The authorization layer is enforced at the router level via `Depends(get_admin_user)` and `Depends(get_current_user)`.
- Test isolation is now enforced via `conftest.py`, blocking any test mutations from reaching these paths on the production Firestore instance.
