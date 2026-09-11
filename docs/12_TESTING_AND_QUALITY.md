# Testing and Quality Assurance

The Skilling Impact Intelligence platform maintains a robust automated testing suite on the backend and enforces strict code quality standards on the frontend.

## 1. Backend Testing

### 1.1 Test Suite
- **Framework**: `pytest`.
- **Test Directory**: `Backend/tests/`.
- **Current Coverage**: The test suite executes 10 core integration tests across the API architecture.

### 1.2 Core Verified Areas
- **CORS Configuration** (`test_cors.py`): Explicitly verifies that Preflight `OPTIONS` requests from allowed origins (Vercel preview, Vercel production, localhost) are permitted, and unlisted origins are rejected. This was a critical fix applied at `commit a61f5db`.
- **Authentication Router** (`test_auth.py`): Verifies the mock login endpoints.
- **Analytics Router** (`test_analytics.py`): Ensures the intelligence and KPI dashboards return valid JSON and correctly handle query parameters (District, Course).
- **Trainee Router** (`test_trainees.py`): Ensures trainee lists and specific profiles can be fetched.

### 1.3 How to Run
To manually execute the backend tests:
```bash
cd Backend
pytest
```

## 2. Frontend Testing & Quality

### 2.1 Code Quality Enforcement
- **Linter**: ESLint is configured to enforce strict code quality.
- **Framework integration**: The Vite configuration heavily relies on `eslint-plugin-react-hooks` to ensure useEffect dependencies are complete, preventing stale closures and memory leaks (a critical fix applied during the Dashboard Flicker resolution at `commit d26060f`).

### 2.2 Functional Regression Testing
During development, the following critical user flows were subjected to strict manual functional regression testing:
1. **The Flicker Regression**: Confirmed that switching Admin filters displays a deliberate loading state rather than flashing previous dataset artifacts.
2. **The Filter Cross-Dependency**: Confirmed that selecting "District A" and "Programme B" correctly intersects the dataset, rather than functioning as an "OR" statement.
3. **The Routing Issue**: Fixed a regression where clicking a trainee row in the Admin portal did not correctly route to the specific trainee ID.

### 2.3 How to Run
To verify frontend code quality:
```bash
cd Frontend
npm run lint
npm run build
```
*(The build step serves as a secondary validation layer, failing if TypeScript/React errors exist in production mode).*
