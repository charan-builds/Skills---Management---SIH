# Product Roadmap

This document outlines the proposed 12-month development roadmap for transitioning the Skilling Impact Intelligence platform from a high-fidelity prototype to a production-ready national deployment.

## Phase 1: Production Hardening (Months 1-3)
- **Database Migration**: Swap the `DemoRepository` for a `PostgresRepository`. Migrate the JSON data into a live PostgreSQL schema.
- **Authentication**: Disable the demo login router bypass. Enforce strict Firebase JWT validation on the backend API layer.
- **Cloud Infrastructure**: Deploy the backend to a managed Kubernetes cluster for robust auto-scaling.

## Phase 2: Feature Expansion (Months 4-6)
- **Live ML Training Pipeline**: Currently, the ML models are pre-trained. We will implement an Apache Airflow pipeline to retrain the Random Forest and Gradient Boosting models weekly as new Trainee outcome data flows into the database.
- **Employer ATS Integration**: Provide REST APIs allowing Employers to directly ingest matched candidates into their existing Applicant Tracking Systems (e.g., Workday, Greenhouse).

## Phase 3: Generative AI Integration (Months 7-9)
- **Resume Parsing**: Implement an LLM pipeline to allow Trainees to upload unstructured PDF resumes. The LLM will extract competencies and automatically map them to the platform's standardized `master_skill_list` to power the AI Matching engine.
- **Dynamic Curriculum Generation**: If the "Impact Intelligence" algorithm detects a recurring local skill gap (e.g., "SQL in Hyderabad"), an LLM agent will dynamically generate a draft syllabus and recommend it to local Programme Administrators.

## Phase 4: National Scale (Months 10-12)
- **Vector Database Migration**: Move the skill-matching algorithm from Scikit-Learn (in-memory) to a dedicated Vector Database (e.g., Pinecone or pgvector) to enable sub-second candidate sourcing at a scale of 10+ million trainees.
- **Mobile Application**: Wrap the React/Vite frontend into a React Native application or PWA, ensuring accessibility for trainees in low-bandwidth or mobile-only rural areas.
