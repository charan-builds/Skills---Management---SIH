# Phase 2I Test Isolation Incident Report

## Incident Description
During previous backend testing, the `test_add_trainee_employment` integration test bypassed mocked data and reached the real Firestore production instance. This resulted in an unintended mutation: an additional `employer_verifications` document was created.

## Root Cause
- The test suite initialized using `from app.main import app` and `load_dotenv()`.
- While `load_dotenv()` brought in environment variables, it used the default `override=False` behavior.
- The `ENABLE_DEMO_MODE` environment variable was either set to `false` in `.env` (pointing the app to real Firestore) or not explicitly forced to `true` for the test session.
- Consequently, `app.firebase.config` authenticated via `FIREBASE_SERVICE_ACCOUNT_JSON` or local credentials, and `app.firebase.repository` successfully invoked `.set()` on the real `employer_verifications` collection.

## Resolution
- Created `Backend/tests/conftest.py` with an `@pytest.fixture(autouse=True)` that utilizes `monkeypatch` to force `settings.ENABLE_DEMO_MODE = True`.
- Added global `os.environ` overrides at the top of `conftest.py` to strip out `FIREBASE_SERVICE_ACCOUNT_JSON`, nullifying any accidental real credential loads.
- Implemented a dedicated regression test (`Backend/tests/integration/test_isolation.py`) which explicitly proves that write-oriented tests hit the local dictionary mockup rather than the production database.

## Current State (Post-Incident)
- No further mutations are possible from the test suite.
- The single mutated document remains in the `employer_verifications` collection, resulting in a count of 10 instead of 9.
- This document has not been deleted to preserve the mandate against mutating production Firestore during Phase 2I.
