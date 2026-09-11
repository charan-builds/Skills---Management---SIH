# Performance Analysis

The Skilling Impact Intelligence platform is designed to be highly responsive. Performance can be categorized into measured (actual tests), observed (interactive usage), and theoretical (scale constraints).

## 1. Measured Performance

- **Frontend Build Time**: `Measured: ~1.00s`. The Vite bundler compiles the entire React application extremely rapidly, minimizing CI/CD pipeline durations on Vercel.
- **Frontend Bundle Size**: `Measured`. Initial tests indicate chunks (e.g., `index-[hash].js` around 750kB unminified/un-gzipped, ~173kB gzipped). Some chunks exceed 500kB, which is acceptable for an authenticated internal dashboard where initial load time is less critical than runtime interactivity.
- **Backend Test Suite**: `Measured: ~3.30s`. The Pytest suite executes 10 tests across API routers and CORS configuration in just over 3 seconds, indicating extremely fast startup and execution of the FastAPI layer.

## 2. Observed Performance

- **Filtering Behavior**: `Observed`. When selecting a District or Programme in the Admin Dashboard, the UI updates almost instantaneously. Because the dataset is currently in-memory/JSON based, latency is functionally zero.
- **API Response Times**: `Observed`. Local API responses generally resolve in under 50ms. Render production responses resolve in under 200ms depending on geographic routing.
- **Loading States**: `Observed`. The UI intentionally implements loading spinners (via `isLoading` state hooks) during data fetches to provide responsive visual feedback, preventing "flicker" when switching between large datasets.

## 3. Expected / Theoretical Constraints at Scale

- **In-Memory Data Constraint**: The current `DemoRepository` loads JSON data directly into RAM. At prototype scale (thousands of records), this is incredibly fast. However, at State or National scale (millions of records), this will consume too much RAM and crash the Render instance.
- **Mitigation**: Moving to a proper database (e.g., PostgreSQL with indexed columns on `district` and `programme_id`) will offload RAM usage to the DB engine.
- **ML Inference**: `RandomForest` scoring is currently fast. If the models are trained on massive datasets and inference is run on-the-fly for millions of rows, it could bottleneck the Python event loop.
- **Mitigation**: Offload heavy cohort risk scoring to a background task (e.g., Celery/Redis) or schedule it via a cron job, rather than computing it synchronously on every API `GET` request.
