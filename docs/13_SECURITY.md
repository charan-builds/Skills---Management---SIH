# Security Posture

This document evaluates the security implementation of the Skilling Impact Intelligence platform. Because this is currently evaluated as a prototype, several production security features are bypassed for demonstration ease, but the architectural foundation for strict security is present.

## 1. Authentication (Current vs. Production)

### Current Implementation (Demo Mode)
- **Mechanism**: The `/login` endpoint currently accepts a role selection (Admin, Trainee, Employer) without validating a password.
- **Token Generation**: It issues a signed JSON Web Token (JWT) mapping the user to a mock `user_id` and `role`.
- **Purpose**: To allow hackathon judges and rapid evaluators to test the three distinct portals without creating complex test accounts.

### Production Path (Firebase Auth)
- **Mechanism**: The frontend is pre-configured with `firebase-config.js` and the backend utilizes `firebase-admin`.
- **Upgrade Path**: Before live deployment, the mock `/login` bypass must be disabled. The frontend will authenticate directly with Google Firebase, passing the returned JWT to the FastAPI backend. FastAPI's `verify_token` middleware will then validate the JWT signature against Firebase's public keys.

## 2. Authorization (RBAC)

- **Mechanism**: Role-Based Access Control is enforced on the frontend.
- **Frontend Guard**: The React router utilizes `ProtectedRoute` wrappers. If a user with the `Trainee` role attempts to access `/admin/dashboard`, the router intercepts the request and redirects them to the `Unauthorized` or `Login` page.
- **Backend Guard (Planned)**: Currently, the backend serves mock data freely. In production, FastAPI dependency injection (`Depends(get_current_user)`) must be applied to all API endpoints to ensure an Employer cannot query the `/api/analytics` admin endpoints, even if they bypass the frontend router.

## 3. Network & Infrastructure Security

### CORS (Cross-Origin Resource Sharing)
- **Implementation**: The backend explicitly defines an `allow_origins` array in `main.py`.
- **Security Benefit**: The API will reject requests originating from unauthorized domains. Currently, only `localhost`, specific Vercel preview URLs, and the production Vercel URL are permitted.
- **Risk Mitigation**: This prevents Cross-Site Request Forgery (CSRF) and blocks malicious third-party sites from querying the backend via a user's browser.

### Data Privacy (PII)
- **Current State**: The mock data contains highly realistic Personally Identifiable Information (PII) to demonstrate the platform.
- **Production Requirement**: When migrating to production (e.g., Firestore), all Trainee PII (Names, Contact Info) must be decoupled from the aggregated analytics tables. Employers should only see anonymized Trainee profiles until the Trainee explicitly clicks "Apply" on a job posting.
