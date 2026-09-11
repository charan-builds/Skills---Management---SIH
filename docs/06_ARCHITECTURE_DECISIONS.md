# Architecture Decisions

This document logs the major architectural decisions made during the development of Skilling Impact Intelligence, evaluating the reasoning, tradeoffs, and long-term implications.

---

### Decision 1: React + Vite for the Frontend

**Why we selected it**: 
React is the industry standard for component-driven UI development, allowing for rapid construction of the three distinct portal interfaces (Admin, Trainee, Employer) using reusable UI components (cards, charts, data grids). Vite was chosen over Create React App (CRA) or Webpack because it offers near-instant hot module replacement (HMR) and significantly faster build times.

**Problem solved**: 
Complex state management. The Admin dashboard requires complex, real-time cross-filtering (District + Programme + Cohort). React's state hooks allow this to happen cleanly on the client-side without full page reloads.

**Alternatives**: 
Angular, Vue, Next.js.

**Why alternatives were not selected**: 
Next.js (Server-Side Rendering) was unnecessary overhead since this platform is an authenticated, internal-tooling style dashboard where SEO is not a primary concern. Pure React (Single Page Application) is perfectly suited and cheaper to host.

**Prototype suitability**: 
Extremely high.

---

### Decision 2: FastAPI + Python for the Backend

**Why we selected it**: 
Python is the undisputed language of AI, Machine Learning, and data science. FastAPI is a modern, high-performance web framework for building APIs with Python 3.7+ based on standard Python type hints.

**Problem solved**: 
Bridging the gap between Web APIs and Data Science. We needed to run statistical models (Pandas/NumPy) and scoring algorithms in real-time when the dashboard requests data.

**Alternatives**: 
Node.js (Express), Django, Spring Boot (Java).

**Why alternatives were not selected**: 
Node.js struggles with heavy synchronous data processing and lacks native data-science libraries. Django is too heavy and monolithic for a simple REST API. FastAPI provides Node-like speed with native Python data-science access.

**Prototype suitability**: 
Perfect. It allows immediate execution of ML models in the same environment as the web server.

---

### Decision 3: Decoupled Repository Pattern & Demo Data

**Why we selected it**: 
Instead of tightly coupling the business logic to SQL queries, we built an abstraction layer (Repository). For the prototype, this repository loads high-fidelity JSON files into memory.

**Problem solved**: 
The "Cold Start" data problem. Evaluating a dashboard is impossible without thousands of records. Setting up, migrating, and maintaining a massive PostgreSQL database just for a prototype is costly and brittle. In-memory demo data allows immediate, zero-config evaluation by judges and stakeholders.

**Alternatives**: 
Live Cloud SQL (PostgreSQL), Firebase Firestore.

**Why alternatives were not selected**: 
A live database costs money and adds deployment complexity (VPC peering, connection pooling). 

**Scalability impact**: 
This is purely a prototype decision. Because of the Repository pattern, moving to production simply requires swapping the `DemoRepository` class with a `PostgresRepository` class. No business logic needs to change.

---

### Decision 4: Vercel + Render Deployment Split

**Why we selected it**: 
Vercel is strictly used to host the compiled React static files. Render is used to host the Dockerized Python FastAPI backend.

**Problem solved**: 
Optimized hosting. Static files need a global CDN (Vercel). Python APIs need a persistent container with RAM for Pandas/NumPy (Render).

**Alternatives**: 
Hosting both on an AWS EC2 instance, or using Heroku.

**Why alternatives were not selected**: 
EC2 requires manual Linux administration, Nginx configuration, and SSL cert management. Vercel and Render provide automated CI/CD directly from GitHub, free SSL, and zero-downtime deployments on their free/hobby tiers.

**Cost impact**: 
Extremely low. Both platforms offer generous free tiers suitable for prototyping and pilot testing.
