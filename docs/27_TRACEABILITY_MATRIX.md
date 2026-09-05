# Traceability Matrix

This document maps the core user requirements defined during project discovery to their specific technical implementations and verification statuses.

| Requirement ID | Business Objective | Technical Implementation | Status |
| :--- | :--- | :--- | :--- |
| **REQ-001** | Support 3 distinct user roles with strict separation of concerns. | React Router `ProtectedRoute` wrappers masking specific portal components. JWT role issuance on backend. | ✅ Verified |
| **REQ-002** | Admins must see aggregate state/national data. | `GET /api/analytics/dashboard` aggregates all trainee placement arrays into sum KPIs. | ✅ Verified |
| **REQ-003** | Admins must be able to drill down to specific districts and programmes. | Frontend React Context State manages `[district, course]` query parameters passed to the `/api/analytics` endpoints. | ✅ Verified |
| **REQ-004** | The system must automatically identify failing cohorts. | `decision_engine.py` consumes RandomForest Retention predictions and calculates a `Priority Score`. | ✅ Verified |
| **REQ-005** | Trainees must be able to view their individual skill gaps. | `GET /api/trainee-portal/dashboard` returns a personalized skill matrix payload. | ✅ Verified |
| **REQ-006** | Trainees must see jobs mapped to their specific skills. | `skill_intelligence.py` computes TF-IDF Cosine Similarity between trainee skills and job requirements. | ✅ Verified |
| **REQ-007** | Employers must be able to source candidates purely by skill relevance. | `GET /api/employers/candidates` executes the inverse of REQ-006, mapping open jobs to the global trainee pool. | ✅ Verified |
| **REQ-008** | The architecture must support rapid prototyping and evaluation. | `DemoRepository` bypasses complex SQL configuration, serving high-fidelity JSON mocks in-memory. | ✅ Verified |
| **REQ-009** | The architecture must scale to production without logic rewrites. | The strict implementation of the Repository Pattern ensures business/AI logic is decoupled from data storage. | ✅ Verified |
| **REQ-010** | The API must be secure against cross-site exploitation. | FastAPI `CORSMiddleware` strictly whitelists Vercel preview domains, Vercel production domains, and localhost. | ✅ Verified |
