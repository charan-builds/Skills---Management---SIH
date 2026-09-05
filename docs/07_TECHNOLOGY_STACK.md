# Technology Stack & Inventory

This document provides a comprehensive inventory of the technologies actively utilized in the Skilling Impact Intelligence repository, evaluating their purpose, suitability, and cost implications.

---

## 1. Frontend Technologies

### React 19
- **What it is**: A JavaScript library for building user interfaces based on components.
- **Where it is used**: Powers the entire frontend application (Admin, Trainee, and Employer portals).
- **Why it was selected**: Unmatched ecosystem, rapid development speed, and strict component modularity.
- **Problem it solves**: Managing complex, dynamic UI state (e.g., cross-filtering dashboards) without page reloads.
- **Alternatives**: Vue.js, Angular, Vanilla JS.
- **Suitability for this prototype**: Perfect. React allows for high-fidelity interactive dashboards.

### Vite
- **What it is**: A modern frontend build tool that significantly improves the development experience.
- **Where it is used**: Local development server and production bundler for the React app.
- **Why it was selected**: Near-instant server start and Hot Module Replacement (HMR).
- **Problem it solves**: Slow Webpack compile times common in large React applications.
- **Suitability for this prototype**: Perfect. Enhances developer velocity.

### React Router DOM
- **What it is**: The standard routing library for React.
- **Where it is used**: Maps URLs (e.g., `/admin/dashboard`, `/login`) to specific React components.
- **Problem it solves**: Enables Single Page Application (SPA) navigation without full browser refreshes.

### Lucide React
- **What it is**: An open-source icon library.
- **Where it is used**: UI iconography across the application.
- **Why it was selected**: Clean, consistent design that integrates natively with React.

---

## 2. Backend Technologies

### FastAPI (Python)
- **What it is**: A modern, fast web framework for building APIs with Python.
- **Where it is used**: The core backend server routing HTTP requests to business logic.
- **Why it was selected**: High performance (comparable to Node.js) while allowing seamless integration with Python's data science ecosystem.
- **Problem it solves**: Provides a robust, type-safe API layer that can rapidly serialize/deserialize JSON.
- **Alternatives**: Flask, Django, Express (Node.js).
- **Suitability for this prototype**: Perfect. Allows AI/ML scripts to run natively behind the web server.

### Pydantic
- **What it is**: Data validation and settings management using Python type annotations.
- **Where it is used**: Validating incoming API requests and structuring API responses in FastAPI.
- **Problem it solves**: Prevents malformed data from crashing the application and auto-generates OpenAPI documentation.

### Pandas & NumPy
- **What it is**: Standard Python libraries for data manipulation and numerical computing.
- **Where it is used**: In the `ai/` and business logic modules to aggregate mock data, calculate KPIs, and compute cohort risk scores.
- **Problem it solves**: SQL databases are slow at complex statistical aggregation; Pandas handles this in memory instantly.

### Scikit-learn & SciPy
- **What it is**: Machine learning libraries for Python.
- **Where it is used**: Driving the backend algorithms for skill matching, outcome priority classification, and trainee recommendations.

---

## 3. Infrastructure & Deployment Technologies

### Vercel
- **What it is**: A cloud platform for static frontend frameworks.
- **Where it is used**: Hosts the compiled React frontend.
- **Why it was selected**: Automatic GitHub CI/CD, Edge CDN, and zero-config deployment.
- **Cost implications**: Free for hobby/prototype use.

### Render
- **What it is**: A unified cloud to build and run apps and websites.
- **Where it is used**: Hosts the Python FastAPI backend via Docker.
- **Why it was selected**: Native Docker support and a generous free tier for web services.
- **Cost implications**: Free for prototype use (spins down on inactivity).

### Docker
- **What it is**: A platform for developing, shipping, and running applications in containers.
- **Where it is used**: The `Dockerfile` packages the FastAPI backend into a standardized container.
- **Problem it solves**: "It works on my machine" syndrome. Ensures the backend runs identically on local machines and Render servers.

---

## 4. Authentication (Configured)

### Firebase
- **What it is**: Google's app development platform.
- **Where it is used**: Configured for user authentication (JWT).
- **Limitations in Prototype**: While the Firebase SDK is present, the prototype currently utilizes a "Demo Mode" bypass to allow judges and reviewers instant access without creating real accounts.
