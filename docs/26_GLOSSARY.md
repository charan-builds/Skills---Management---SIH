# Glossary of Terms

This document defines specific terminology used throughout the Skilling Impact Intelligence platform and its documentation.

- **AI/ML**: Artificial Intelligence / Machine Learning. The backend logic used to compute Risk Scores and Job Match Percentages.
- **CDP (Chrome DevTools Protocol)**: The WebSocket interface used for automated browser testing (Playwright).
- **Cohort**: A specific group of Trainees enrolled in the same Programme in the same District during the same timeframe.
- **Demo Mode**: The current operational state of the prototype, which bypasses strict Firebase authentication and utilizes in-memory JSON data to allow rapid evaluation without database configuration.
- **FastAPI**: The asynchronous Python framework powering the backend REST API.
- **JWT (JSON Web Token)**: The secure cryptographic token issued by the backend upon login to verify user identity and roles.
- **KPI**: Key Performance Indicator. Examples include "Total Placed", "Placement Rate", and "Dropout Rate".
- **Outcome Metrics**: Data representing what happens *after* a program concludes (e.g., Employment, Salary). This is the core focus of the platform, as opposed to Output Metrics (e.g., Enrollment numbers).
- **PII (Personally Identifiable Information)**: Sensitive trainee data (names, contact details) that is strictly decoupled from Employer views until explicit opt-in.
- **Priority Score**: An AI-computed metric (High/Medium/Low Risk) indicating the likelihood a specific Cohort will fail to achieve baseline placement metrics.
- **RBAC (Role-Based Access Control)**: The security paradigm ensuring Administrators, Trainees, and Employers can only access their specific portals and data.
- **Repository Pattern**: A software engineering design pattern utilized in the backend to abstract data fetching (e.g., `DemoRepository` vs. `PostgresRepository`), allowing zero-friction database upgrades.
- **SPA (Single Page Application)**: A web application (like this React frontend) that loads a single HTML document and dynamically updates the body content via JavaScript, preventing slow page reloads.
- **TF-IDF (Term Frequency-Inverse Document Frequency)**: The natural language processing algorithm used by the backend to mathematically match Trainee skills to Job requirements.
- **Vite**: The rapid build tool and development server powering the React frontend environment.
