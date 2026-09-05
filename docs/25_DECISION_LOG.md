# Decision Log

This document serves as an immutable log of significant technical and product decisions made during the development lifecycle.

| Date | Decision | Rationale | Tradeoffs |
| :--- | :--- | :--- | :--- |
| **Day 1** | Implement `DemoRepository` bypassing SQL | Prototype required instant evaluation without demanding Judges configure environment variables or DB connections. | Changes do not persist across server reboots. |
| **Day 2** | Split Frontend/Backend hosting (Vercel/Render) | Separating concerns allows Vercel to cache React assets globally on CDNs while keeping heavy Python ML dependencies in a dedicated Render container. | Requires managing two distinct deployment pipelines. |
| **Day 2** | Implement `mockAuth` Bypass | Evaluators need to test Admin, Trainee, and Employer workflows rapidly. Forcing them through Firebase email verification creates friction. | True JWT security is deactivated during the prototype evaluation phase. |
| **Day 3** | Resolve CORS Preflight Failure (`a61f5db`) | The frontend was failing to login because the Vercel branch-preview domain changed dynamically. We updated FastAPI `CORSMiddleware` to wildcard allow `*.vercel.app` for preview environments. | Mildly increases exposure to unauthorized Vercel apps, but is necessary for CI/CD previews. |
| **Day 3** | Fix React Filter Dependency (`d26060f`) | The Admin dashboard was rendering stale data when switching filters rapidly due to missing `useEffect` dependency arrays. We refactored the hook to explicitly track `[district, course]`. | Slightly more verbose React component code. |
