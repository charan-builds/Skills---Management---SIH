# Limitations

This document outlines the current limitations of the Skilling Impact Intelligence platform. Because the platform is evaluated as a prototype, these limitations are intentional constraints rather than software bugs.

## 1. Data Persistence
- **Limitation**: The system currently utilizes an in-memory `DemoRepository` driven by local JSON files.
- **Impact**: Any modifications made in the UI (e.g., adding a trainee, applying for a job, changing a filter) are stored in React state or ephemeral backend memory. Upon refreshing the page or restarting the server, the data resets to its baseline.
- **Resolution Path**: Implement the `FirestoreRepository` or `PostgresRepository` subclass to connect the backend to a persistent database.

## 2. Authentication Bypass
- **Limitation**: The `/login` flow simulates authentication. Clicking a role instantly issues a valid JWT without verifying a password against an identity provider.
- **Impact**: The system is not secure against unauthorized access in its current state.
- **Resolution Path**: Remove the bypass in the frontend login component and enforce Firebase Auth `signInWithEmailAndPassword` before calling the backend.

## 3. Machine Learning "Cold Start"
- **Limitation**: The Random Forest models used for Priority Scoring require historical training data. Currently, they operate on a static pre-trained mock dataset.
- **Impact**: If deployed to a brand new skilling initiative with zero historical placement data, the AI will not be able to generate accurate predictions.
- **Resolution Path**: The platform must run in "Data Collection Mode" for the first cohort cycle, relying on heuristic rules rather than ML until enough outcome data is gathered.

## 4. Mobile Responsiveness
- **Limitation**: While the application utilizes CSS Flexbox and Grid, complex data tables (e.g., the Admin Trainee Roster) are heavily optimized for Desktop viewports.
- **Impact**: Viewing the Admin dashboard on a mobile device requires horizontal scrolling.
- **Resolution Path**: Implement dedicated mobile breakpoints to stack table columns into card views on smaller screens.
